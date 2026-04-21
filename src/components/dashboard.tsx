"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";

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
  const timerRegistry = useRef<Set<number>>(new Set());

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
    triggerAnimation(setAnimateModelRows, modelAnimTimer, timerRegistry.current);
  }, []);

  const triggerChatbotRefresh = useCallback(() => {
    triggerAnimation(setAnimateChatbotRows, chatbotAnimTimer, timerRegistry.current);
  }, []);

  const applyHighlights = useCallback((modelSlugs: string[], chatbotSlugs: string[]) => {
    setModelHighlights(new Set(modelSlugs));
    setChatbotHighlights(new Set(chatbotSlugs));
  }, []);

  useEffect(() => {
    const timers = timerRegistry.current;

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  return (
    <div className="editorial-shell">
      <header className="sticky top-0 z-20 border-b border-border-strong bg-surface/90 backdrop-blur-md">
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

      <main id="top" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <section className="perf-section fade-rise mb-10 grid gap-5 border-b border-border-strong pb-8 md:mb-11 md:grid-cols-[1.3fr_0.7fr] md:pb-10">
          <div>
            <p className="section-label">My AI Stack · Editorial Dashboard</p>
            <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.92] tracking-tight text-foreground md:text-7xl">
              Pick the right AI faster, with less noise.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
              Start with the best free chatbots, then evaluate your API models with compact filters and an
              AI-assisted suggestion lab.
            </p>
          </div>

          <aside className="hero-note">
            <p className="hero-note-label">Flow</p>
            <ol className="hero-note-list">
              <li>Scan top free chatbots</li>
              <li>Narrow your API stack</li>
              <li>Run a 2-pick suggestion</li>
            </ol>
          </aside>
        </section>

        <div className="space-y-11">
          <ChatbotsSection
            chatbots={filteredChatbots}
            highlightedSlugs={chatbotHighlights}
            visibleCount={filteredChatbots.length}
            totalCount={initialChatbots.length}
            animateRows={animateChatbotRows}
            controls={
              <div className="section-controls">
                <FilterRail
                  label="Use case"
                  value={chatbotFilter}
                  onChange={(value) => {
                    setChatbotFilter(value as ChatbotFilter);
                    triggerChatbotRefresh();
                  }}
                  options={[
                    { value: "all", label: "All" },
                    { value: "coding", label: "Coding" },
                    { value: "research", label: "Research" },
                    { value: "long-context", label: "Long-context" },
                    { value: "no-signup", label: "No-signup" },
                  ]}
                />
                {chatbotFilter !== "all" && (
                  <button
                    type="button"
                    className="filter-reset"
                    onClick={() => {
                      setChatbotFilter("all");
                      triggerChatbotRefresh();
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            }
          />

          <ModelsSection
            models={filteredModels}
            highlightedSlugs={modelHighlights}
            visibleCount={filteredModels.length}
            totalCount={initialModels.length}
            animateRows={animateModelRows}
            controls={
              <div className="space-y-3">
                <div className="grid gap-3 xl:grid-cols-3">
                  <FilterRail
                    label="Task"
                    value={modelTask}
                    onChange={(value) => {
                      setModelTask(value as ModelTaskFilter);
                      triggerModelRefresh();
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
                  <FilterRail
                    label="Source"
                    value={modelSource}
                    onChange={(value) => {
                      setModelSource(value as ModelSourceFilter);
                      triggerModelRefresh();
                    }}
                    options={[
                      { value: "all", label: "All" },
                      { value: "paid", label: "Paid" },
                      { value: "free_api", label: "Free API" },
                    ]}
                  />
                  <FilterRail
                    label="Sort"
                    value={modelSort}
                    onChange={(value) => {
                      setModelSort(value as ModelSort);
                      triggerModelRefresh();
                    }}
                    options={[
                      { value: "speed", label: "Speed" },
                      { value: "context", label: "Context" },
                      { value: "name", label: "Name" },
                    ]}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Active</span>
                  {modelTask !== "all" && (
                    <ActiveToken
                      label={`Task ${modelTask}`}
                      onClick={() => {
                        setModelTask("all");
                        triggerModelRefresh();
                      }}
                    />
                  )}
                  {modelSource !== "all" && (
                    <ActiveToken
                      label={`Source ${modelSource}`}
                      onClick={() => {
                        setModelSource("all");
                        triggerModelRefresh();
                      }}
                    />
                  )}
                  {modelSort !== "speed" && (
                    <ActiveToken
                      label={`Sort ${modelSort}`}
                      onClick={() => {
                        setModelSort("speed");
                        triggerModelRefresh();
                      }}
                    />
                  )}
                  {modelTask === "all" && modelSource === "all" && modelSort === "speed" && (
                    <span className="text-xs text-muted">None</span>
                  )}
                </div>
              </div>
            }
          />

          <SuggestSection onApplyHighlights={applyHighlights} />
        </div>
      </main>
    </div>
  );
}

function triggerAnimation(
  setState: (value: boolean) => void,
  timerRef: MutableRefObject<number | null>,
  timerRegistry: Set<number>,
) {
  setState(false);
  if (timerRef.current) {
    window.clearTimeout(timerRef.current);
    timerRegistry.delete(timerRef.current);
  }

  timerRef.current = createManagedTimeout(() => {
    setState(true);
    timerRef.current = createManagedTimeout(() => setState(false), 360, timerRegistry);
  }, 16, timerRegistry);
}

function createManagedTimeout(callback: () => void, delayMs: number, timerRegistry: Set<number>) {
  const timerId = window.setTimeout(() => {
    timerRegistry.delete(timerId);
    callback();
  }, delayMs);
  timerRegistry.add(timerId);
  return timerId;
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

function FilterRail({
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
    <div className="filter-rail">
      <span className="filter-label">{label}</span>
      <div className="filter-pills" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`filter-pill ${value === option.value ? "filter-pill-active" : ""}`}
            role="radio"
            aria-checked={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActiveToken({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="filter-token"
      onClick={onClick}
    >
      {label} x
    </button>
  );
}
