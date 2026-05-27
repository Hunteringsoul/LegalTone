import { motion } from "framer-motion";
import {
  Loader2,
  Lightbulb,
  ArrowRight,
  Handshake,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import {
  parseRecommendations,
  parseAgentError,
  verdictTone,
  priorityTone,
} from "../lib/parseAgentJson";

const TONE_STYLES = {
  emerald: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    border: "border-emerald-500/25",
    accent: "text-emerald-400",
  },
  gold: {
    badge: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold-glow)]",
    border: "border-[var(--color-gold)]/25",
    accent: "text-[var(--color-gold)]",
  },
  amber: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    border: "border-amber-500/25",
    accent: "text-amber-400",
  },
  rose: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    border: "border-rose-500/25",
    accent: "text-rose-400",
  },
  sky: {
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    border: "border-sky-500/25",
    accent: "text-sky-400",
  },
};

const PRIORITY_LABELS = {
  high: "High priority",
  medium: "Medium",
  low: "Low",
};

function ActionCard({ action, index }) {
  const tone = priorityTone(action.priority);
  const styles = TONE_STYLES[tone];

  return (
    <motion.article
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`rounded-xl border bg-[var(--color-ink-muted)]/50 p-4 ${styles.border}`}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-[var(--color-parchment)]">
          {action.title}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
        >
          {PRIORITY_LABELS[action.priority] ?? action.priority}
        </span>
      </div>

      {action.clause_ref && (
        <p className={`mb-2 text-xs font-medium ${styles.accent}`}>
          Ref: {action.clause_ref}
        </p>
      )}

      {action.reason && (
        <p className="text-sm leading-relaxed text-[var(--color-parchment-muted)]">
          {action.reason}
        </p>
      )}
    </motion.article>
  );
}

function BulletBlock({ title, icon: Icon, items, accentClass }) {
  if (!items?.length) return null;

  return (
    <div>
      <p
        className={`mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${accentClass}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-[var(--color-parchment-muted)]"
          >
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold-dim)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationPanel({ content, loading = false }) {
  if (loading) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-2xl border border-sky-500/20"
      >
        <div className="border-b border-[var(--color-border)] px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
              AI Recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-6 sm:p-8">
          <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
          <p className="text-sm text-[var(--color-parchment-muted)]">
            Generating actionable recommendations…
          </p>
        </div>
      </motion.article>
    );
  }

  const agentError = content ? parseAgentError(content) : null;
  if (agentError) {
    return (
      <article className="glass-panel rounded-2xl border border-rose-500/30 p-6">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-semibold">{agentError.title}</p>
        </div>
        <p className="mt-2 text-sm text-[var(--color-parchment-muted)]">
          {agentError.message}
        </p>
      </article>
    );
  }

  const recs = parseRecommendations(content);
  if (!recs || recs.error) return null;

  const tone = verdictTone(recs.verdict);
  const styles = TONE_STYLES[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel overflow-hidden rounded-2xl border ${styles.border}`}
    >
      <div className="border-b border-[var(--color-border)] px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400/80">
              AI Recommendations
            </p>
          </div>
          {recs.verdict && (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}
            >
              {recs.verdictLabel}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
        {recs.summary && (
          <p className="text-[15px] leading-relaxed text-[var(--color-parchment)]">
            {recs.summary}
          </p>
        )}

        {recs.actions.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
              Recommended actions
            </p>
            {recs.actions.map((action, i) => (
              <ActionCard key={i} action={action} index={i} />
            ))}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <BulletBlock
            title="Negotiation points"
            icon={Handshake}
            items={recs.negotiation_points}
            accentClass="text-[var(--color-gold)]"
          />
          <BulletBlock
            title="Next steps"
            icon={ListChecks}
            items={recs.next_steps}
            accentClass="text-sky-400/90"
          />
        </div>
      </div>

      <p className="border-t border-[var(--color-border)] px-6 py-3 text-center text-[10px] text-[var(--color-parchment-muted)]/50 sm:px-8">
        AI-generated guidance · Consult a qualified attorney before signing
      </p>
    </motion.article>
  );
}

export default RecommendationPanel;
