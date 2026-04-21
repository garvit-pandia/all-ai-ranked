"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import ModelsSection from "@/components/section1/models-section";
import ChatbotsSection from "@/components/section2/chatbots-section";
import SuggestSection from "@/components/section3/suggest-section";
import { ChatbotEntry, ModelEntry } from "@/types/domain";

type ModelTaskFilter =
  | "all"
  | "coding"
  | "reasoning"
  | "writing"
  | "speed"
  | "multimodal"
  | "long-context";

type ModelSourceFilter = "all" | "paid" | "free_api";
type ModelSort = "speed" | "context" | "name";

type ChatbotFilter = "all" | "coding" | "research" | "long-context" | "no-signup";

interface DashboardProps {
  initialModels: ModelEntry[];
  initialChatbots: ChatbotEntry[];
}

export default function Dashboard({ initialModels, initialChatbots }: DashboardProps) {
  const [modelTask, setModelTask] = useState<ModelTaskFilter>("all");
  const [modelSource, setModelSource] = useState<ModelSourceFilter>("all");
  const [modelSort, setModelSort] = useState<ModelSort>("speed");
  const [chatbotFilter, setChatbotFilter] = useState<ChatbotFilter>("all");

  const [modelHighlights, setModelHighlights] = useState<Set<string>>(new Set());
  const [chatbotHighlights, setChatbotHighlights] = useState<Set<string>>(new Set());
  const [animateModelRows, setAnimateModelRows] = useState(false);
  const [animateChatbotRows, setAnimateChatbotRows] = useState(false);

  const modelAnimTimer = useRef<number | null>(null);
  const chatbotAnimTimer = useRef<number | null>(null);

  const filteredModels = useMemo(() => {
    const byTask = initialModels.filter((model) => {
      if (modelTask === "all") return true;
      return model.tags.includes(modelTask);
    });

    const bySource = byTask.filter((model) => {
      if (modelSource === "all") return true;
      return model.source === modelSource;
    });

    return [...bySource].sort((a, b) => {
      if (modelSort === "name") return a.name.localeCompare(b.name);
      if (modelSort === "speed") return b.speed - a.speed || a.name.localeCompare(b.name);
      return parseContextToTokens(b.context) - parseContextToTokens(a.context);
    });
  }, [initialModels, modelTask, modelSource, modelSort]);

  const filteredChatbots = useMemo(() => {
    return initialChatbots.filter((chatbot) => {
      if (chatbotFilter === "all") return true;
      return chatbot.tags.includes(chatbotFilter);
    });
  }, [chatbotFilter, initialChatbots]);

  const triggerModelRefresh = useCallback(() => {
    triggerAnimation(setAnimateModelRows, modelAnimTimer);
  }, []);

  const triggerChatbotRefresh = useCallback(() => {
    triggerAnimation(setAnimateChatbotRows, chatbotAnimTimer);
  }, []);

  const applyHighlights = useCallback((modelSlugs: string[], chatbotSlugs: string[]) => {
    setModelHighlights(new Set(modelSlugs));
    setChatbotHighlights(new Set(chatbotSlugs));
  }, []);

  return (
    <div className="editorial-shell">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <a href="#top" className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            My AI Stack · 2026
          </a>
          <nav className="flex items-center gap-2 text-xs text-muted md:gap-4 md:text-sm">
            <a href="#top-free-chatbots" className="rounded-full px-2 py-1 transition hover:bg-surface-alt hover:text-foreground">
              Top Free Chatbots
            </a>
            <a href="#my-api-stack" className="rounded-full px-2 py-1 transition hover:bg-surface-alt hover:text-foreground">
              My API Stack
            </a>
            <a href="#suggest" className="rounded-full px-2 py-1 transition hover:bg-surface-alt hover:text-foreground">
              Suggest
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-6xl px-4 py-7 md:px-6 md:py-9">
        <section className="perf-section fade-rise mb-8 border-b border-border pb-7 md:mb-9 md:pb-9">
          <p className="section-label">My AI Stack · Editorial Dashboard</p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl">
            Practical model choices for real tasks, not hype.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
            Public free chatbots first, then your personal model inventory. Scan,
            filter, and decide fast with transparent trade-offs.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">Editorial data journal</span>
            <span className="chip chip-accent">Speed-focused interactions</span>
            <span className="chip chip-signal">Light mode only</span>
          </div>
        </section>

        <section className="perf-section fade-rise-delay mb-10 rounded-2xl border border-border bg-surface px-4 py-4 md:px-6 paper-panel">
          <div className="grid gap-3 md:grid-cols-2">
            <FilterLine
              label="Top free chatbots"
              value={chatbotFilter}
              onChange={(value) => {
                setChatbotFilter(value as ChatbotFilter);
                triggerChatbotRefresh();
                scrollToSection("top-free-chatbots");
              }}
              options={[
                { value: "all", label: "All" },
                { value: "coding", label: "Coding" },
                { value: "research", label: "Research" },
                { value: "long-context", label: "Long-context" },
                { value: "no-signup", label: "No-signup" },
              ]}
            />

            <FilterLine
              label="My API stack · task"
              value={modelTask}
              onChange={(value) => {
                setModelTask(value as ModelTaskFilter);
                triggerModelRefresh();
                scrollToSection("my-api-stack");
              }}
              options={[
                { value: "all", label: "All" },
                { value: "coding", label: "Coding" },
                { value: "reasoning", label: "Reasoning" },
                { value: "writing", label: "Writing" },
                { value: "speed", label: "Speed" },
                { value: "multimodal", label: "Multimodal" },
                { value: "long-context", label: "Long-context" },
              ]}
            />

            <FilterLine
              label="My API stack · source"
              value={modelSource}
              onChange={(value) => {
                setModelSource(value as ModelSourceFilter);
                triggerModelRefresh();
                scrollToSection("my-api-stack");
              }}
              options={[
                { value: "all", label: "All" },
                { value: "paid", label: "Paid" },
                { value: "free_api", label: "Free API" },
              ]}
            />

            <FilterLine
              label="My API stack · sort"
              value={modelSort}
              onChange={(value) => {
                setModelSort(value as ModelSort);
                triggerModelRefresh();
                scrollToSection("my-api-stack");
              }}
              options={[
                { value: "speed", label: "Speed" },
                { value: "context", label: "Context" },
                { value: "name", label: "Name" },
              ]}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              Active filters
            </span>

            {chatbotFilter !== "all" && (
              <ActiveChip
                label={`Chatbots: ${chatbotFilter}`}
                onClick={() => {
                  setChatbotFilter("all");
                  triggerChatbotRefresh();
                  scrollToSection("top-free-chatbots");
                }}
              />
            )}

            {modelTask !== "all" && (
              <ActiveChip
                label={`Task: ${modelTask}`}
                onClick={() => {
                  setModelTask("all");
                  triggerModelRefresh();
                  scrollToSection("my-api-stack");
                }}
              />
            )}

            {modelSource !== "all" && (
              <ActiveChip
                label={`Source: ${modelSource}`}
                onClick={() => {
                  setModelSource("all");
                  triggerModelRefresh();
                  scrollToSection("my-api-stack");
                }}
              />
            )}

            {modelSort !== "speed" && (
              <ActiveChip
                label={`Sort: ${modelSort}`}
                onClick={() => {
                  setModelSort("speed");
                  triggerModelRefresh();
                  scrollToSection("my-api-stack");
                }}
              />
            )}

            {chatbotFilter === "all" &&
              modelTask === "all" &&
              modelSource === "all" &&
              modelSort === "speed" && (
                <span className="text-xs text-muted">None</span>
              )}
          </div>
        </section>

        <div className="space-y-11">
          <ChatbotsSection
            chatbots={filteredChatbots}
            highlightedSlugs={chatbotHighlights}
            visibleCount={filteredChatbots.length}
            totalCount={initialChatbots.length}
            animateRows={animateChatbotRows}
          />

          <ModelsSection
            models={filteredModels}
            highlightedSlugs={modelHighlights}
            visibleCount={filteredModels.length}
            totalCount={initialModels.length}
            animateRows={animateModelRows}
          />

          <SuggestSection onApplyHighlights={applyHighlights} />
        </div>
      </main>
    </div>
  );
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function triggerAnimation(
  setState: (value: boolean) => void,
  timerRef: React.MutableRefObject<number | null>,
) {
  setState(false);
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
  }
  window.setTimeout(() => {
    setState(true);
    timerRef.current = window.setTimeout(() => setState(false), 360);
  }, 16);
}

function parseContextToTokens(value: string): number {
  const normalized = value.trim().toUpperCase();
  if (normalized.includes("1M")) return 1_000_000;
  if (normalized.includes("256K")) return 256_000;
  if (normalized.includes("200K")) return 200_000;
  if (normalized.includes("128K")) return 128_000;
  if (normalized.includes("32K")) return 32_000;
  if (normalized.includes("8K")) return 8_000;
  return 50_000;
}

function FilterLine({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt px-3 py-2">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground outline-none transition focus:border-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActiveChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="chip chip-accent cursor-pointer transition hover:border-accent hover:text-accent"
      onClick={onClick}
    >
      {label} ×
    </button>
  );
}
