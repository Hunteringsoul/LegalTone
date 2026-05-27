import { Scale, Menu, FileText, X, Loader2 } from "lucide-react";
import AgentStatusBar from "./AgentStatusBar";

function TopBar({
  documentName,
  isAnalyzing,
  agentStatuses,
  onMenuClick,
  showPdfPanel,
  mobilePdfOpen,
  onTogglePdf,
}) {
  return (
    <header className="glass-panel shrink-0 border-b border-[var(--color-border)] safe-pt">
      <div className="flex min-h-[3.25rem] items-center justify-between gap-2 px-3 py-2 sm:min-h-16 sm:px-5 sm:py-0 lg:px-6 xl:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="min-h-touch min-w-touch flex shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-ink-muted)] xl:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-[var(--color-gold)]" />
          </button>

          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-ink-muted)] sm:flex">
            <Scale className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-parchment-muted)] xs:block sm:text-xs sm:tracking-[0.2em]">
              Workspace
            </p>
            <p className="truncate text-xs font-medium text-[var(--color-parchment)] sm:text-sm">
              {documentName ?? "No document loaded"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showPdfPanel && (
            <button
              type="button"
              onClick={onTogglePdf}
              className="min-h-touch flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-ink-muted)] px-2.5 py-2 text-[11px] font-medium text-[var(--color-parchment-muted)] sm:px-3 sm:text-xs xl:hidden"
            >
              {mobilePdfOpen ? (
                <>
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden xs:inline">Close</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden xs:inline">PDF</span>
                </>
              )}
            </button>
          )}

          {isAnalyzing && (
            <>
              <div className="flex min-h-touch items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-ink-muted)] px-2.5 py-1.5 sm:hidden">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-gold)]" />
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-ink-muted)] px-3 py-1.5 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-gold)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                </span>
                <span className="text-xs font-medium text-[var(--color-gold-glow)]">
                  Analysing…
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <AgentStatusBar agentStatuses={agentStatuses} />
    </header>
  );
}

export default TopBar;
