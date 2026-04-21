import "server-only";

import { createClient } from "@supabase/supabase-js";

import { chatbotsSeed, modelsSeed } from "@/lib/data/seed";
import { ChatbotEntry, ModelEntry } from "@/types/domain";

interface ProviderRow {
  id: string;
  name: string;
}

interface ModelRow {
  id: string;
  slug: string;
  name: string;
  provider_id: string;
  source: "paid" | "free_api";
  context_window: string;
  speed_score: number;
  cost_label: string;
  capability_tags: string[] | null;
  is_new_2026: boolean;
  status: "active" | "retired" | "unverified";
  note: string | null;
}

interface ChatbotRow {
  id: string;
  slug: string;
  rank: number;
  name: string;
  provider_id: string;
  best_for: string;
  free_model_name: string;
  context_window: string;
  signup_required: "none" | "email" | "phone";
  web_search_free: boolean;
  limit_note: string;
  url: string;
  use_case_tags: string[] | null;
}

export async function getDashboardData(): Promise<{
  models: ModelEntry[];
  chatbots: ChatbotEntry[];
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      models: modelsSeed,
      chatbots: chatbotsSeed,
    };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [providersRes, modelsRes, chatbotsRes] = await Promise.all([
      supabase.from("providers").select("id,name"),
      supabase.from("models").select(
        "id,slug,name,provider_id,source,context_window,speed_score,cost_label,capability_tags,is_new_2026,status,note",
      ),
      supabase
        .from("chatbots")
        .select(
          "id,slug,rank,name,provider_id,best_for,free_model_name,context_window,signup_required,web_search_free,limit_note,url,use_case_tags",
        )
        .order("rank", { ascending: true }),
    ]);

    if (providersRes.error || modelsRes.error || chatbotsRes.error) {
      return {
        models: modelsSeed,
        chatbots: chatbotsSeed,
      };
    }

    const providerMap = new Map(
      ((providersRes.data ?? []) as ProviderRow[]).map((item) => [item.id, item.name]),
    );

    const models = ((modelsRes.data ?? []) as ModelRow[]).map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      provider: providerMap.get(item.provider_id) ?? "Unknown",
      source: item.source,
      context: item.context_window,
      speed: clampSpeed(item.speed_score),
      costLabel: item.cost_label,
      tags: normalizeTags(item.capability_tags),
      isNew2026: item.is_new_2026,
      status: item.status,
      note: item.note ?? undefined,
    } satisfies ModelEntry));

    const chatbots = ((chatbotsRes.data ?? []) as ChatbotRow[]).map((item) => ({
      id: item.id,
      slug: item.slug,
      rank: item.rank,
      name: item.name,
      provider: providerMap.get(item.provider_id) ?? "Unknown",
      bestFor: item.best_for,
      freeModel: item.free_model_name,
      context: item.context_window,
      signup: item.signup_required,
      webSearch: item.web_search_free,
      limit: item.limit_note,
      url: item.url,
      tags: normalizeTags(item.use_case_tags),
    } satisfies ChatbotEntry));

    if (models.length === 0 || chatbots.length === 0) {
      return {
        models: modelsSeed,
        chatbots: chatbotsSeed,
      };
    }

    return { models, chatbots };
  } catch {
    return {
      models: modelsSeed,
      chatbots: chatbotsSeed,
    };
  }
}

function normalizeTags(tags: string[] | null) {
  if (!tags) {
    return [];
  }
  return tags.filter(Boolean) as ModelEntry["tags"];
}

function clampSpeed(value: number): ModelEntry["speed"] {
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 5;
}
