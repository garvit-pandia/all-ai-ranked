import "server-only";

import { ChatbotEntry, ModelEntry, SuggestPick, SuggestResponse } from "@/types/domain";

interface Candidate {
  source: "model" | "chatbot";
  slug: string;
  name: string;
  provider: string;
  score: number;
  reason: string;
}

export async function suggestBestPicks({
  task,
  models,
  chatbots,
}: {
  task: string;
  models: ModelEntry[];
  chatbots: ChatbotEntry[];
}): Promise<SuggestResponse> {
  const deterministic = rankDeterministically(task, models, chatbots);

  const apiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL ?? "gemini-3-flash";
  if (!apiKey) {
    return {
      picks: deterministic,
      usedModel: `${geminiModel} (deterministic fallback)`,
      fallback: true,
    };
  }

  try {
    const aiPicks = await askGeminiForPicks({
      apiKey,
      geminiModel,
      task,
      models,
      chatbots,
    });

    if (aiPicks.length === 2) {
      return {
        picks: aiPicks,
        usedModel: geminiModel,
        fallback: false,
      };
    }
  } catch {
    // Fall through to deterministic result.
  }

  return {
    picks: deterministic,
    usedModel: `${geminiModel} (deterministic fallback)`,
    fallback: true,
  };
}

async function askGeminiForPicks({
  apiKey,
  geminiModel,
  task,
  models,
  chatbots,
}: {
  apiKey: string;
  geminiModel: string;
  task: string;
  models: ModelEntry[];
  chatbots: ChatbotEntry[];
}): Promise<SuggestPick[]> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const modelContext = models.slice(0, 20).map((item) => ({
    source: "model",
    slug: item.slug,
    name: item.name,
    provider: item.provider,
    context: item.context,
    speed: item.speed,
    tags: item.tags,
  }));

  const chatbotContext = chatbots.slice(0, 10).map((item) => ({
    source: "chatbot",
    slug: item.slug,
    name: item.name,
    provider: item.provider,
    context: item.context,
    bestFor: item.bestFor,
    signup: item.signup,
    webSearch: item.webSearch,
    tags: item.tags,
  }));

  const prompt = [
    "You are ranking assistant for an AI model selector dashboard.",
    `Task: ${task}`,
    "Choose exactly 2 picks from the candidates.",
    "Rules:",
    "- Return strict JSON only.",
    "- JSON shape: {\"picks\":[{\"source\":\"model|chatbot\",\"slug\":\"...\",\"reason\":\"one sentence\"},{...}]}",
    "- Keep each reason under 22 words.",
    "- Picks must be from provided slugs.",
    "Candidates:",
    JSON.stringify([...modelContext, ...chatbotContext]),
  ].join("\n");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No Gemini content returned");
  }

  const parsed = safeJsonParse(text) as {
    picks?: Array<{
      source?: "model" | "chatbot";
      slug?: string;
      reason?: string;
    }>;
  };

  if (!parsed.picks || parsed.picks.length < 2) {
    throw new Error("Gemini returned invalid picks");
  }

  const modelBySlug = new Map(models.map((item) => [item.slug, item]));
  const chatbotBySlug = new Map(chatbots.map((item) => [item.slug, item]));

  const picks: SuggestPick[] = [];
  for (const rawPick of parsed.picks.slice(0, 2)) {
    if (!rawPick.source || !rawPick.slug || !rawPick.reason) continue;

    if (rawPick.source === "model") {
      const match = modelBySlug.get(rawPick.slug);
      if (!match) continue;
      picks.push({
        source: "model",
        slug: match.slug,
        name: match.name,
        provider: match.provider,
        reason: rawPick.reason,
      });
    } else {
      const match = chatbotBySlug.get(rawPick.slug);
      if (!match) continue;
      picks.push({
        source: "chatbot",
        slug: match.slug,
        name: match.name,
        provider: match.provider,
        reason: rawPick.reason,
        url: match.url,
      });
    }
  }

  if (picks.length < 2) {
    throw new Error("Gemini picks could not be matched");
  }

  return picks;
}

function rankDeterministically(
  task: string,
  models: ModelEntry[],
  chatbots: ChatbotEntry[],
): SuggestPick[] {
  const normalizedTask = task.toLowerCase();

  const modelCandidates: Candidate[] = models
    .filter((item) => item.status !== "retired")
    .map((item) => {
      const score = scoreByTags(normalizedTask, item.tags) + scoreByContext(normalizedTask, item.context) + item.speed;
      return {
        source: "model",
        slug: item.slug,
        name: item.name,
        provider: item.provider,
        score,
        reason: `${item.name} balances ${item.tags.slice(0, 2).join(" and ")} for this task.`,
      };
    });

  const chatbotCandidates: Candidate[] = chatbots.map((item) => {
    const score =
      scoreByTags(normalizedTask, item.tags) +
      scoreByContext(normalizedTask, item.context) +
      (item.signup === "none" ? 2 : 0) +
      (item.webSearch ? 1 : 0) +
      Math.max(0, 11 - item.rank);
    return {
      source: "chatbot",
      slug: item.slug,
      name: item.name,
      provider: item.provider,
      score,
      reason: `${item.name} is strong for ${item.bestFor.toLowerCase()} with practical free-tier access.`,
    };
  });

  modelCandidates.sort((a, b) => b.score - a.score);
  chatbotCandidates.sort((a, b) => b.score - a.score);

  const first = pickTopCombined([...modelCandidates, ...chatbotCandidates]);
  const secondPool = [...modelCandidates, ...chatbotCandidates].filter(
    (item) => item.slug !== first.slug || item.source !== first.source,
  );
  const second = pickTopCombined(secondPool, first.source === "model" ? "chatbot" : "model");

  return [first, second].map((item) => ({
    source: item.source,
    slug: item.slug,
    name: item.name,
    provider: item.provider,
    reason: item.reason,
  }));
}

function pickTopCombined(
  candidates: Candidate[],
  preferredSource?: "model" | "chatbot",
): Candidate {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  if (!preferredSource) return sorted[0];
  const preferred = sorted.find((item) => item.source === preferredSource);
  return preferred ?? sorted[0];
}

function scoreByTags(task: string, tags: string[]): number {
  const tagWeights: Record<string, number> = {
    coding: keywordMatch(task, ["code", "coding", "debug", "algorithm", "program"]) ? 4 : 0,
    reasoning: keywordMatch(task, ["reason", "logic", "plan", "analysis", "compare"]) ? 4 : 0,
    writing: keywordMatch(task, ["write", "essay", "email", "post", "rewrite"]) ? 4 : 0,
    speed: keywordMatch(task, ["fast", "quick", "instant", "short", "urgent"]) ? 4 : 0,
    multimodal: keywordMatch(task, ["image", "photo", "pdf", "vision", "video"]) ? 4 : 0,
    "long-context": keywordMatch(task, ["long", "document", "100 pages", "report", "context"]) ? 4 : 0,
    research: keywordMatch(task, ["research", "sources", "citations", "news", "web"]) ? 4 : 0,
    "no-signup": keywordMatch(task, ["no signup", "without account", "anonymous"]) ? 4 : 0,
  };

  return tags.reduce((acc, tag) => acc + (tagWeights[tag] ?? 0), 0);
}

function scoreByContext(task: string, context: string): number {
  const isLongTask = keywordMatch(task, ["long", "document", "report", "transcript", "book"]);
  if (isLongTask && context.includes("1M")) return 4;
  if (isLongTask && context.includes("200K")) return 3;
  if (isLongTask && context.includes("128K")) return 2;
  return 0;
}

function keywordMatch(task: string, words: string[]): boolean {
  return words.some((word) => task.includes(word));
}

function safeJsonParse(value: string) {
  const direct = tryParse(value);
  if (direct) return direct;

  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON found in response");
  }

  const sliced = value.slice(start, end + 1);
  const parsed = tryParse(sliced);
  if (!parsed) {
    throw new Error("Could not parse JSON payload");
  }
  return parsed;
}

function tryParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
