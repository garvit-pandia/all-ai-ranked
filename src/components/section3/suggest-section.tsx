"use client";

import { useState } from "react";

import { SuggestResponse } from "@/types/domain";

interface SuggestSectionProps {
  onApplyHighlights: (modelSlugs: string[], chatbotSlugs: string[]) => void;
}

export default function SuggestSection({ onApplyHighlights }: SuggestSectionProps) {
  const [suggestInput, setSuggestInput] = useState("");
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestData, setSuggestData] = useState<SuggestResponse | null>(null);

  async function onSuggest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const task = suggestInput.trim();
    if (!task) {
      setSuggestError("Please describe your task first.");
      return;
    }

    setLoadingSuggest(true);
    setSuggestError(null);

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error(`Suggest request failed (${response.status}).`);
      }

      const result = (await response.json()) as SuggestResponse;
      setSuggestData(result);

      const modelSlugs: string[] = [];
      const chatbotSlugs: string[] = [];

      for (const pick of result.picks) {
        if (pick.source === "model") {
          modelSlugs.push(pick.slug);
        }
        if (pick.source === "chatbot") {
          chatbotSlugs.push(pick.slug);
        }
      }

      onApplyHighlights(modelSlugs, chatbotSlugs);
    } catch (error) {
      setSuggestError(error instanceof Error ? error.message : "Suggest failed.");
    } finally {
      setLoadingSuggest(false);
    }
  }

  return (
    <section id="suggest" className="perf-section scroll-mt-24 rounded-2xl border border-border bg-surface px-4 py-5 md:px-6 md:py-6 paper-panel">
      <p className="section-label">Section 3 · Suggest</p>
      <h2 className="mt-2 font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
        Get Two Best Picks
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        Describe your task and get practical recommendations across both the public ranking and your personal stack.
      </p>

      <form onSubmit={onSuggest} className="mt-5 space-y-3">
        <textarea
          value={suggestInput}
          onChange={(event) => setSuggestInput(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-border bg-surface-alt p-3 text-sm text-foreground outline-none transition focus:border-accent"
          placeholder="Describe what you want to do..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loadingSuggest}
            className="rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition hover:border-accent hover:text-accent disabled:opacity-65"
          >
            {loadingSuggest ? "Analyzing" : "Suggest best options"}
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            Scans both sections and highlights matching rows
          </p>
        </div>
      </form>

      {suggestError && (
        <p className="mt-3 rounded-xl border border-warn/30 bg-[#f8f1e5] px-3 py-2 text-sm text-warn">
          {suggestError}
        </p>
      )}

      {suggestData && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Engine: {suggestData.usedModel}
            {suggestData.fallback ? " (fallback mode)" : ""}
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {suggestData.picks.map((pick, index) => (
              <article
                key={`${pick.source}-${pick.slug}`}
                className="rounded-xl border border-border bg-surface-alt px-3 py-3"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                  Pick {index + 1} · {pick.source}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {pick.name}
                </h3>
                <p className="text-sm text-muted">{pick.provider}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pick.reason}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
