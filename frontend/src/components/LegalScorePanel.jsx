import { motion } from "framer-motion";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { parseLegalScore, scoreColor, parseAgentError } from "../lib/parseAgentJson";

const COLOR_MAP = {
  emerald: {
    ring: "stroke-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    bar: "bg-emerald-400",
  },
  gold: {
    ring: "stroke-[var(--color-gold)]",
    text: "text-[var(--color-gold-glow)]",
    bg: "bg-[var(--color-gold)]/10",
    border: "border-[var(--color-gold)]/30",
    bar: "bg-[var(--color-gold)]",
  },
  amber: {
    ring: "stroke-amber-400",
    text: "text-amber-200",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    bar: "bg-amber-400",
  },
  rose: {
    ring: "stroke-rose-400",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    bar: "bg-rose-400",
  },
};

function ScoreRing({ score, loading }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = loading ? 0 : (score / 100) * circumference;
  const tone = scoreColor(score);
  const colors = COLOR_MAP[tone];

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-36 sm:w-36">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={colors.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="relative text-center">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-gold)]" />
        ) : (
          <>
            <p className={`font-display text-3xl font-bold sm:text-4xl ${colors.text}`}>
              {score}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-parchment-muted)]">
              / 100
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function DimensionBar({ label, score, note }) {
  const tone = scoreColor(score);
  const colors = COLOR_MAP[tone];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--color-parchment-muted)]">{label}</span>
        <span className={`text-xs font-semibold ${colors.text}`}>{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-ink-muted)]">
        <motion.div
          className={`h-full rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {note && (
        <p className="mt-1 text-[11px] leading-snug text-[var(--color-parchment-muted)]/80">
          {note}
        </p>
      )}
    </div>
  );
}

function LegalScorePanel({ content, loading = false }) {
  if (loading) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden rounded-2xl border border-[var(--color-gold)]/25"
      >
        <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:gap-8 sm:p-8">
          <ScoreRing score={0} loading />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-dim)]">
              AI Legal Score
            </p>
            <p className="font-display mt-1 text-2xl font-semibold text-[var(--color-parchment)]">
              Calculating score…
            </p>
            <p className="mt-2 text-sm text-[var(--color-parchment-muted)]">
              Evaluating risk, fairness, completeness, and clarity.
            </p>
          </div>
        </div>
      </motion.article>
    );
  }

  const agentError = content ? parseAgentError(content) : null;
  if (agentError) {
    return (
      <article className="glass-panel rounded-2xl border border-rose-500/30 p-6">
        <p className="text-sm font-semibold text-rose-300">{agentError.title}</p>
        <p className="mt-2 text-sm text-[var(--color-parchment-muted)]">
          {agentError.message}
        </p>
      </article>
    );
  }

  const score = parseLegalScore(content);
  if (!score || score.error) return null;

  const tone = scoreColor(score.overall);
  const colors = COLOR_MAP[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel overflow-hidden rounded-2xl border ${colors.border}`}
    >
      <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4 md:px-8">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--color-gold)]" strokeWidth={1.5} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold-dim)]">
            AI Legal Score
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-8 sm:p-6 md:p-8">
        <div className="flex flex-col items-center gap-3">
          <ScoreRing score={score.overall} loading={false} />
          <div className={`rounded-full border px-4 py-1 text-sm font-semibold ${colors.bg} ${colors.border} ${colors.text}`}>
            {score.grade}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className={`font-display text-xl font-semibold sm:text-2xl md:text-3xl ${colors.text}`}>
            {score.label}
          </h2>
          {score.summary && (
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-parchment-muted)]">
              {score.summary}
            </p>
          )}

          {score.dimensions.length > 0 && (
            <div className="mt-6 space-y-4">
              {score.dimensions.map((dim) => (
                <DimensionBar
                  key={dim.key}
                  label={dim.label}
                  score={dim.score}
                  note={dim.note}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {(score.highlights?.length > 0 || score.concerns?.length > 0) && (
        <div className="grid gap-4 border-t border-[var(--color-border)] p-4 sm:grid-cols-2 sm:p-6 md:p-8">
          {score.highlights?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Strengths
              </p>
              <ul className="space-y-1.5">
                {score.highlights.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--color-parchment-muted)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {score.concerns?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-400/90">
                <AlertTriangle className="h-3.5 w-3.5" />
                Concerns
              </p>
              <ul className="space-y-1.5">
                {score.concerns.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--color-parchment-muted)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="border-t border-[var(--color-border)] px-6 py-3 text-center text-[10px] text-[var(--color-parchment-muted)]/50 sm:px-8">
        AI-generated assessment · Not legal advice
      </p>
    </motion.article>
  );
}

export default LegalScorePanel;
