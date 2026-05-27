import { motion } from "framer-motion";
import { FileSearch, Send, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import AgentCard from "./AgentCard";
import LegalScorePanel from "./LegalScorePanel";
import RecommendationPanel from "./RecommendationPanel";
import { FileText, MessageSquare, ShieldAlert, Scale } from "lucide-react";
const agentSections = [
  { key: "summary", title: "Executive Summary", variant: "summary", icon: <FileText className="h-5 w-5" strokeWidth={1.5} /> },
  { key: "tone_analysis", title: "Tone Analysis", variant: "tone", icon: <MessageSquare className="h-5 w-5" strokeWidth={1.5} /> },
  { key: "risk_analysis", title: "Risk Analysis", variant: "risk", icon: <ShieldAlert className="h-5 w-5" strokeWidth={1.5} /> },
  { key: "clause_analysis", title: "Clause Analysis", variant: "clause", icon: <Scale className="h-5 w-5" strokeWidth={1.5} /> },
];

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full flex-col items-center justify-center px-4 py-8 text-center sm:px-8"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-ink-muted)]">
        <FileSearch className="h-9 w-9 text-[var(--color-gold)]" strokeWidth={1.25} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-[var(--color-parchment)] sm:text-3xl">
        Chat with your agreement
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-parchment-muted)] sm:text-[15px]">
        Upload a document, then ask questions in the chat. Click{" "}
        <strong className="text-[var(--color-gold)]">Analyse</strong> in the sidebar
        for a full multi-agent report with AI Legal Score, recommendations, summary, tone, risk, and clauses.
      </p>
    </motion.div>
  );
}

function ChatWindow({
  messages,
  response,
  showAgentCards,
  chatLoading,
  analysing,
  query,
  onQueryChange,
  onSend,
  activeHighlight,
  onSourceClick,
}) {
  const hasAgentOutput =
    showAgentCards &&
    response &&
    agentSections.some((s) => {
      const text = response[s.key];
      return typeof text === "string" && text.trim().length > 0;
    });

  const chatMessages = messages.filter(
    (msg) =>
      !(
        msg.role === "user" &&
        msg.content === "Run full agreement analysis"
      ) &&
      !(
        msg.role === "assistant" &&
        msg.content.startsWith("Full analysis complete")
      )
  );

  const hasScoreContent =
    typeof response?.legal_score === "string" &&
    response.legal_score.trim().length > 0;

  const hasRecsContent =
    typeof response?.recommendations === "string" &&
    response.recommendations.trim().length > 0;

  const showResults =
    hasAgentOutput || hasScoreContent || hasRecsContent || analysing;
  const showEmpty =
    chatMessages.length === 0 && !showResults && !chatLoading && !analysing;
  const inputDisabled = chatLoading || analysing;
  const showChatSection = chatMessages.length > 0 || chatLoading;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-refined scroll-pad-bottom flex-1 overflow-y-auto overflow-x-hidden">
        {showEmpty && <EmptyState />}

        {!showEmpty && (
          <div className="mx-auto w-full max-w-3xl px-3 py-4 xs:px-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
            {showResults && (
              <section className="space-y-4 sm:space-y-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-gold-dim)]">
                  Analysis report
                </p>

                {(analysing || hasScoreContent) && (
                  <LegalScorePanel
                    content={response?.legal_score}
                    loading={analysing && !hasScoreContent}
                  />
                )}

                {agentSections.map((section, index) => {
                  const content = response?.[section.key];
                  const hasContent =
                    typeof content === "string" && content.trim().length > 0;

                  if (!hasContent && !analysing) return null;

                  return (
                    <AgentCard
                      key={section.key}
                      title={section.title}
                      content={hasContent ? content : null}
                      loading={analysing && !hasContent}
                      variant={section.variant}
                      icon={section.icon}
                      index={index}
                    />
                  );
                })}

                {(analysing || hasRecsContent) && (
                  <RecommendationPanel
                    content={response?.recommendations}
                    loading={analysing && !hasRecsContent}
                  />
                )}

                {response?.sources?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-parchment-muted)]">
                      Sources
                    </p>
                    {response.sources.map((source, index) => {
                      const isActive =
                        activeHighlight &&
                        source.page &&
                        Number(activeHighlight.page) === Number(source.page) &&
                        activeHighlight.text === source.text;

                      return (
                        <button
                          type="button"
                          key={index}
                          onClick={() => onSourceClick?.(source)}
                          className={`w-full rounded-xl border p-3 text-left text-sm transition-all ${
                            isActive
                              ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10"
                              : "border-[var(--color-border)] bg-[var(--color-ink-muted)]/50 hover:border-[var(--color-gold-dim)]"
                          }`}
                        >
                          <div className="mb-1 text-[var(--color-gold)]">
                            {source.source}
                            {source.page ? ` · Page ${source.page}` : ""}
                            {source.page ? " (click to highlight)" : ""}
                          </div>
                          <div className="text-[var(--color-parchment-muted)]">
                            {source.text}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {showChatSection && (
              <section
                className={`${showResults ? "mt-8 border-t border-[var(--color-border)] pt-6 sm:mt-10 sm:pt-8" : ""}`}
              >
                {showResults && (
                  <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-parchment-muted)]">
                    Questions & answers
                  </p>
                )}

                {chatMessages.map((msg, index) => (
                  <MessageBubble key={index} role={msg.role} content={msg.content} />
                ))}

                {chatLoading && (
                  <div className="mb-6 flex items-center gap-2 text-[var(--color-parchment-muted)]">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--color-gold)]" />
                    <span className="text-sm">Thinking…</span>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      <div className="safe-pb shrink-0 border-t border-[var(--color-border)] bg-[var(--color-ink-elevated)]/80 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4 md:px-8 md:py-5">
        <div className="mx-auto flex w-full max-w-3xl gap-2 sm:gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your agreement…"
            disabled={inputDisabled}
            className="min-h-touch min-w-0 flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-ink-muted)] px-3 py-2.5 text-base text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-parchment-muted)]/50 focus:border-[var(--color-gold-dim)] disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm md:px-5 md:py-3.5 md:text-[15px]"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!query.trim() || inputDisabled}
            className="min-h-touch min-w-touch flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dim)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-0 sm:px-6 sm:py-3.5"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
