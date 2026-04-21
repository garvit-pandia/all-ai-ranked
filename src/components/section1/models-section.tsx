import { memo } from "react";
import type { ReactNode } from "react";

import { ModelEntry } from "@/types/domain";

interface ModelsSectionProps {
  models: ModelEntry[];
  highlightedSlugs: Set<string>;
  visibleCount: number;
  totalCount: number;
  animateRows: boolean;
  controls?: ReactNode;
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
  controls,
}: ModelsSectionProps) {
  return (
    <section id="my-api-stack" className="perf-section scroll-mt-24 fade-rise-delay">
      <div className="mb-6 border-b border-border-strong pb-5">
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
        {controls && <div className="mt-4">{controls}</div>}
      </div>

      {models.length === 0 ? (
        <div className="empty-panel">
          <p className="font-serif text-3xl tracking-tight text-foreground">No model matches this filter.</p>
          <p className="mt-2 text-sm text-muted">
            Clear active chips or switch source/task to <span className="font-semibold text-foreground">All</span>.
          </p>
        </div>
      ) : (
        <div className="model-table">
          <div className="model-head" aria-hidden>
            <span>Model</span>
            <span>Provider</span>
            <span>Source</span>
            <span>Speed</span>
            <span>Context</span>
            <span>Tags</span>
          </div>

          {models.map((model, index) => {
            const highlighted = highlightedSlugs.has(model.slug);

            return (
              <article
                key={model.id}
                className={`model-row ${highlighted ? "model-row-highlight" : ""} ${animateRows ? "model-row-animate" : ""}`}
                style={{ animationDelay: `${index * 24}ms` }}
              >
                <div className="model-primary">
                  <h3 className="model-name">{model.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {model.isNew2026 && <span className="chip chip-signal">New 2026</span>}
                    {model.status !== "active" && <span className="chip">{model.status}</span>}
                    {model.note && <span className="chip">note</span>}
                  </div>
                </div>

                <div className="model-provider">{model.provider}</div>
                <div className="model-source">{sourceLabel[model.source]}</div>
                <div className="model-speed">{renderSpeed(model.speed)}</div>
                <div className="model-context">{model.context}</div>

                <div className="model-tags">
                  {model.tags.map((tag) => (
                    <span key={tag} className="chip chip-accent">
                      {tag}
                    </span>
                  ))}
                </div>

                {model.note && (
                  <p className="model-note" role="note">
                    {model.note}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function renderSpeed(speed: number) {
  return `${"*".repeat(speed)}${".".repeat(5 - speed)}`;
}

const ModelsSection = memo(ModelsSectionImpl);

export default ModelsSection;
