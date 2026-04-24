import { memo } from "react";
import type { ReactNode } from "react";

import { ChatbotEntry } from "@/types/domain";

interface ChatbotsSectionProps {
  chatbots: ChatbotEntry[];
  highlightedSlugs: Set<string>;
  visibleCount: number;
  totalCount: number;
  animateRows: boolean;
  controls?: ReactNode;
}

function ChatbotsSectionImpl({
  chatbots,
  highlightedSlugs,
  visibleCount,
  totalCount,
  animateRows,
  controls,
}: ChatbotsSectionProps) {
  const [leader, ...rest] = chatbots;

  return (
    <section id="top-free-chatbots" className="perf-section scroll-mt-24 fade-rise">
      <div className="mb-6 border-b border-border-strong pb-5">
        <p className="section-label">Section 1 · Public Utility</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-4xl leading-none tracking-tight text-foreground md:text-5xl">
              Top Free Chatbots
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              Ranked for practical free-tier quality, reliability, and daily usefulness.
            </p>
          </div>
          <div className="chip chip-strong">March 2026 ranking baseline</div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="chip chip-strong">{visibleCount} shown</span>
          <span className="chip">{totalCount} total</span>
        </div>
        {controls && <div className="mt-4">{controls}</div>}
      </div>

      {chatbots.length === 0 ? (
        <div className="empty-panel">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="font-serif text-3xl tracking-tight text-foreground">No chatbot matches this filter.</p>
          <p className="mt-2 text-sm text-muted">
            Try switching the use-case back to <span className="font-semibold text-foreground">All</span>.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="rank-table">
          {leader && (
            <article
              key={leader.id}
              className={`rank-lead ${highlightedSlugs.has(leader.slug) ? "rank-lead-highlight" : ""}`}
            >
              <div className="rank-lead-no">#{leader.rank}</div>
              <div>
                <p className="section-label">Top pick</p>
                <h3 className="rank-lead-title" title={leader.name}>{leader.name}</h3>
                <p className="rank-lead-subline">
                  {leader.provider} · {leader.bestFor} · {leader.freeModel}
                </p>
                <p className="rank-lead-limit">{leader.limit}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="chip chip-accent">Context {leader.context}</span>
                  <span className="chip">Signup {leader.signup}</span>
                  <span className="chip">Web {leader.webSearch ? "yes" : "no"}</span>
                </div>
              </div>
              <div className="rank-lead-action">
                <a
                  href={leader.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outline-button"
                >
                  Open
                </a>
              </div>
            </article>
          )}

          {rest.map((chatbot, index) => {
            const highlighted = highlightedSlugs.has(chatbot.slug);
            const isTopThree = chatbot.rank <= 3;

            return (
              <article
                key={chatbot.id}
                className={`rank-row ${highlighted ? "rank-row-highlight" : ""} ${animateRows ? "rank-row-animate" : ""}`}
                style={{ animationDelay: `${index * 32}ms` }}
              >
                <div className="rank-cell rank-cell-no">{String(chatbot.rank).padStart(2, "0")}</div>

                <div className="rank-cell">
                  <h3 className="rank-name" title={chatbot.name}>{chatbot.name}</h3>
                  <p className="rank-meta">
                    {chatbot.provider} · {chatbot.bestFor}
                  </p>
                  <p className="rank-limit">{chatbot.limit}</p>
                </div>

                <div className="rank-cell rank-cell-details">
                  <p>{chatbot.freeModel}</p>
                  <p>{chatbot.context}</p>
                  <p>{chatbot.signup}</p>
                  <p>{chatbot.webSearch ? "Web" : "No web"}</p>
                </div>

                <div className="rank-cell rank-cell-action">
                  {isTopThree && <span className="chip chip-signal">Top tier</span>}
                  <a
                    href={chatbot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-button"
                  >
                    Open
                  </a>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      )}
    </section>
  );
}

const ChatbotsSection = memo(ChatbotsSectionImpl);

export default ChatbotsSection;
