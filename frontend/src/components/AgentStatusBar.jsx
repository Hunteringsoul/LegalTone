import { AGENT_LIST, STATUS_LABELS } from "../lib/agents";

const statusStyles = {
  idle: {
    dot: "bg-slate-500",
    ring: "border-slate-700/60 bg-slate-900/40",
    text: "text-slate-400",
  },
  offline: {
    dot: "bg-slate-600",
    ring: "border-slate-700/60 bg-slate-900/40",
    text: "text-slate-500",
  },
  ready: {
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    ring: "border-emerald-500/25 bg-emerald-500/5",
    text: "text-emerald-300/90",
  },
  running: {
    dot: "bg-[var(--color-gold)] animate-pulse shadow-[0_0_10px_rgba(201,168,76,0.6)]",
    ring: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10",
    text: "text-[var(--color-gold-glow)]",
  },
  done: {
    dot: "bg-emerald-400",
    ring: "border-emerald-500/30 bg-emerald-500/10",
    text: "text-emerald-300",
  },
  error: {
    dot: "bg-rose-400",
    ring: "border-rose-500/30 bg-rose-500/10",
    text: "text-rose-300",
  },
};

function AgentStatusBar({ agentStatuses }) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-ink-elevated)]/95 px-2 py-2 sm:border-t-0 sm:px-4">
      <p className="mb-1.5 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--color-parchment-muted)] md:block">
        Agent status
      </p>
      <div className="scrollbar-refined -mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5 sm:gap-2 sm:pb-1">
        {AGENT_LIST.map(({ id, label }) => {
          const status = agentStatuses[id] ?? "idle";
          const styles = statusStyles[status] ?? statusStyles.idle;

          return (
            <div
              key={id}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 sm:gap-2 sm:px-2.5 sm:py-1.5 md:px-3 ${styles.ring}`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {status === "running" && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-gold)] opacity-50" />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${styles.dot}`} />
              </span>
              <span className="text-[11px] font-medium text-[var(--color-parchment)] sm:text-xs">
                {label}
              </span>
              <span
                className={`hidden text-[9px] font-medium uppercase tracking-wide sm:inline sm:text-[10px] ${styles.text}`}
              >
                {STATUS_LABELS[status] ?? status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgentStatusBar;
