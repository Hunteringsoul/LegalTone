import { X, Sparkles } from "lucide-react";
import UploadBox from "./UploadBox";

function Sidebar({
  onDocumentUploaded,
  onAnalyse,
  restoredDocument,
  analysing,
  open,
  onClose,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,100vw)] flex-col border-r border-[var(--color-border)] bg-[var(--color-ink-elevated)]/98 backdrop-blur-xl transition-transform duration-300 safe-pt xl:relative xl:z-auto xl:w-72 xl:max-w-xs xl:translate-x-0 xl:bg-[var(--color-ink-elevated)]/90 2xl:w-80 ${
          open ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] p-4 sm:p-5 xl:p-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-dim)]">
                Legal Intelligence
              </span>
            </div>
            <h1 className="font-display mt-2 text-xl font-semibold leading-tight text-[var(--color-parchment)] sm:text-2xl xl:text-3xl">
              LegalTone
              <span className="text-[var(--color-gold)]"> AI</span>
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-parchment-muted)] sm:text-sm">
              Multi-agent copilot for agreements, tone, risk, and clauses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-touch min-w-touch flex shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-ink-muted)] xl:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-[var(--color-gold)]" />
          </button>
        </div>

        <div className="scrollbar-refined flex-1 overflow-y-auto p-4 sm:p-5 xl:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-parchment-muted)]">
            Document
          </p>
          <UploadBox
            onUploaded={(doc) => {
              onDocumentUploaded(doc);
              onClose?.();
            }}
            onAnalyse={() => {
              onAnalyse();
              onClose?.();
            }}
            restoredDocument={restoredDocument}
            analysing={analysing}
          />
        </div>

        <div className="safe-pb border-t border-[var(--color-border)] p-3 sm:p-4">
          <p className="text-center text-[10px] text-[var(--color-parchment-muted)]/60 sm:text-[11px]">
            Not legal advice · For analysis only
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
