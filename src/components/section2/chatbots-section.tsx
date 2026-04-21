import { memo } from "react";

import { ChatbotEntry } from "@/types/domain";

interface ChatbotsSectionProps {
  chatbots: ChatbotEntry[];
  highlightedSlugs: Set<string>;
  visibleCount: number;
  totalCount: number;
  animateRows: boolean;
}

function ChatbotsSectionImpl({
  chatbots,
  highlightedSlugs,
  visibleCount,
  totalCount,
  animateRows,
}: ChatbotsSectionProps) {
  return (
    <section id="top-free-chatbots" className="perf-section scroll-mt-24 fade-rise">
      <div className="mb-6 border-b border-border pb-4">
        <p className="section-label">Section 1 · Public Utility</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
              Top Free Chatbots
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              Ranked editorially for free-tier capability, friction, and practical daily use.
            </p>
          </div>
          <div className="chip">March 2026 ranking baseline</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="chip chip-strong">{visibleCount} shown</span>
          <span className="chip">{totalCount} total</span>
        </div>
      </div>

      {chatbots.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center paper-panel">
          <p className="font-serif text-3xl tracking-tight text-foreground">No chatbot matches this filter.</p>
          <p className="mt-2 text-sm text-muted">
            Try switching use-case to <span className="font-semibold text-foreground">All</span> or clearing active chips.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface paper-panel">
          {chatbots.map((chatbot) => {
            const highlighted = highlightedSlugs.has(chatbot.slug);
            const isTopThree = chatbot.rank <= 3;

            return (
              <article
                key={chatbot.id}
                className={`group grid gap-4 border-b border-border px-4 py-4 transition last:border-b-0 md:grid-cols-[72px_1fr_auto] md:items-center md:px-6 ${
                  highlighted ? "bg-accent-soft/60" : "hover:bg-surface-alt/70"
                } ${animateRows ? "pulse-row" : ""}`}
              >
                <div className="flex items-center gap-2 md:block">
                  <p className="font-mono text-2xl font-semibold text-foreground md:text-[30px]">
                    {String(chatbot.rank).padStart(2, "0")}
                  </p>
                  {isTopThree && <span className="chip chip-signal">Top tier</span>}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{chatbot.name}</h3>
                    <span className="chip">{chatbot.provider}</span>
                    <span className="chip chip-accent">{chatbot.bestFor}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="chip chip-strong">Model: {chatbot.freeModel}</span>
                    <span className="chip">Context: {chatbot.context}</span>
                    <span className="chip">Signup: {chatbot.signup}</span>
                    <span className={`chip ${chatbot.webSearch ? "chip-accent" : ""}`}>
                      Web: {chatbot.webSearch ? "yes" : "no"}
                    </span>
                  </div>

                  <p className="mt-3 border-l-2 border-border-strong pl-3 text-xs leading-relaxed text-muted md:text-sm">
                    {chatbot.limit}
                  </p>
                </div>

                <div className="flex items-center md:justify-end">
                  <a
                    href={chatbot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border-strong bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition hover:border-accent hover:text-accent"
                  >
                    Open
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const ChatbotsSection = memo(ChatbotsSectionImpl);

export default ChatbotsSection;
