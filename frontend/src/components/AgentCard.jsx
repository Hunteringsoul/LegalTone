import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import FormattedAgentContent from "./FormattedAgentContent";

const accentStyles = {
  summary: {
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
    border: "border-amber-500/20",
  },
  tone: {
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
    border: "border-sky-500/20",
  },
  risk: {
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
    border: "border-rose-500/20",
  },
  clause: {
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
  },
};

function AgentCard({ title, icon, content, loading = false, variant = "summary", index = 0 }) {
  const accent = accentStyles[variant] ?? accentStyles.summary;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel overflow-hidden rounded-xl border sm:rounded-2xl ${accent.border}`}
    >
      <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${accent.iconBg}`}
        >
          <span className={accent.iconColor}>{icon}</span>
        </div>
        <h2 className="font-display min-w-0 flex-1 text-lg font-semibold tracking-tight text-[var(--color-parchment)] sm:text-xl">
          {title}
        </h2>
        {loading && (
          <Loader2 className="ml-auto h-4 w-4 shrink-0 animate-spin text-[var(--color-gold)]" />
        )}
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {loading ? (
          <span className="text-[15px] text-[var(--color-parchment-muted)]/60">Analyzing…</span>
        ) : (
          <FormattedAgentContent content={content} variant={variant} />
        )}
      </div>
    </motion.article>
  );
}

export default AgentCard;
