import { memo } from "react";

import { ModelEntry } from "@/types/domain";

interface ModelsSectionProps {
  models: ModelEntry[];
  highlightedSlugs: Set<string>;
  visibleCount: number;
  totalCount: number;
  animateRows: boolean;
}

const sourceLabel: Record<ModelEntry["source"], string> = {
  paid: "Paid",
  free_api: "Free API",
};

function ModelsSectionImpl({
  models,
  highlightedSlugs,
  visibleCount,
  totalCount,
  animateRows,
}: ModelsSectionProps) {
  return (
    <section id="my-api-stack" className="perf-section scroll-mt-24 fade-rise-delay">
      <div className="mb-6 border-b border-border pb-4">
        <p className="section-label">Section 2 · Personal Stack</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
              My API Stack
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              Subscription and free API models organized as a compact working list.
            </p>
          </div>
          <div className="chip">{totalCount} models tracked</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="chip chip-strong">{visibleCount} shown</span>
          <span className="chip">{totalCount} total</span>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center paper-panel">
          <p className="font-serif text-3xl tracking-tight text-foreground">No model matches this filter.</p>
          <p className="mt-2 text-sm text-muted">
            Clear active chips or switch source/task to <span className="font-semibold text-foreground">All</span>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface paper-panel">
          {models.map((model) => {
            const highlighted = highlightedSlugs.has(model.slug);

            return (
              <article
                key={model.id}
                className={`border-b border-border px-4 py-4 transition last:border-b-0 md:px-6 ${
                  highlighted ? "bg-accent-soft/60" : "hover:bg-surface-alt/70"
                } ${animateRows ? "pulse-row" : ""}`}
              >
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{model.name}</h3>
                    <span className="chip">{model.provider}</span>
                    <span className="chip chip-strong">{sourceLabel[model.source]}</span>
                    {model.isNew2026 && <span className="chip chip-signal">New 2026</span>}
                    {model.status !== "active" && <span className="chip">{model.status}</span>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="chip">Speed: {renderSpeed(model.speed)}</span>
                    <span className="chip">Context: {model.context}</span>
                    <span className="chip">Cost: {model.costLabel}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {model.tags.map((tag) => (
                      <span key={tag} className="chip chip-accent">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {model.note && (
                    <p className="border-l-2 border-warn pl-3 text-xs leading-relaxed text-muted md:text-sm">
                      {model.note}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function renderSpeed(speed: number) {
  return `${"●".repeat(speed)}${"○".repeat(5 - speed)}`;
}

const ModelsSection = memo(ModelsSectionImpl);

export default ModelsSection;
