import {
  parseAgentContent,
  formatLabel,
  normalizeToneData,
  normalizeClauseData,
  normalizeSummaryData,
  parseAgentError,
} from "../lib/parseAgentJson";
import { AlertCircle, Clock } from "lucide-react";

function displayValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return JSON.stringify(value);
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default:
      "border-[var(--color-border)] bg-[var(--color-ink-muted)] text-[var(--color-parchment)]",
    gold: "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/15 text-[var(--color-gold-glow)]",
    sky: "border-sky-500/30 bg-sky-500/15 text-sky-300",
    risk: "border-rose-500/30 bg-rose-500/15 text-rose-300",
    low: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    high: "border-rose-500/30 bg-rose-500/15 text-rose-300",
    warn: "border-amber-500/30 bg-amber-500/15 text-amber-200",
    clause: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${tones[tone] ?? tones.default}`}
    >
      {children}
    </span>
  );
}

function Field({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
        {label}
      </p>
      <p className="text-[15px] leading-relaxed text-[var(--color-parchment)]">
        {displayValue(value)}
      </p>
    </div>
  );
}

function BulletList({ title, items, emptyLabel }) {
  if (!items?.length) {
    if (!emptyLabel) return null;
    return (
      <p className="text-sm italic text-[var(--color-parchment-muted)]/70">{emptyLabel}</p>
    );
  }
  return (
    <div className="mb-4 last:mb-0">
      {title && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
          {title}
        </p>
      )}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-[15px] leading-relaxed text-[var(--color-parchment-muted)]"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-gold)]" />
            <span>{displayValue(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChipList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      {title && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
          {title}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Badge key={i}>{displayValue(item)}</Badge>
        ))}
      </div>
    </div>
  );
}

function riskBadgeTone(level) {
  const l = String(level || "").toLowerCase();
  if (l.includes("high") || l.includes("critical")) return "high";
  if (l.includes("low") || l.includes("minimal")) return "low";
  return "gold";
}

function levelBadgeTone(level) {
  const l = String(level || "").toLowerCase();
  if (l.includes("high") || l.includes("risk") || l.includes("aggressive")) return "high";
  if (l.includes("low") || l.includes("minimal")) return "low";
  if (l.includes("moderate") || l.includes("neutral") || l.includes("balanced")) return "gold";
  return "default";
}

function sentimentBadgeTone(sentiment) {
  const s = String(sentiment || "").toLowerCase();
  if (s.includes("negative")) return "risk";
  if (s.includes("positive")) return "low";
  if (s.includes("mixed")) return "warn";
  return "sky";
}

function clauseTypeTone(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("risk")) return "risk";
  if (t.includes("missing")) return "warn";
  if (t.includes("protect")) return "sky";
  return "clause";
}

function ScoreRow({ label, value }) {
  if (!value) return null;
  const tone = levelBadgeTone(value);
  const width =
    tone === "high" ? "w-full" : tone === "low" ? "w-1/3" : "w-2/3";

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[var(--color-parchment-muted)]">
          {label}
        </span>
        <Badge tone={tone}>{displayValue(value)}</Badge>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-ink-muted)]">
        <div
          className={`h-full rounded-full transition-all ${
            tone === "high"
              ? "bg-rose-400/80"
              : tone === "low"
                ? "bg-emerald-400/80"
                : "bg-[var(--color-gold)]/80"
          } ${width}`}
        />
      </div>
    </div>
  );
}

function ClauseCard({ clause, index }) {
  const title = clause.title ?? clause.name ?? `Clause ${index + 1}`;
  const type = clause.type ?? "standard";
  const importance = clause.importance ?? clause.risk ?? null;

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-muted)]/60 p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-[var(--color-parchment)]">
          {title}
          {clause.section && (
            <span className="ml-2 text-sm font-normal text-[var(--color-parchment-muted)]">
              § {clause.section}
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={clauseTypeTone(type)}>{displayValue(type)}</Badge>
          {importance && (
            <Badge tone={levelBadgeTone(importance)}>{displayValue(importance)}</Badge>
          )}
        </div>
      </div>

      {clause.excerpt && (
        <blockquote className="mb-3 border-l-2 border-[var(--color-gold)]/50 pl-3 text-sm italic leading-relaxed text-[var(--color-parchment-muted)]">
          {displayValue(clause.excerpt)}
        </blockquote>
      )}

      {clause.note && (
        <p className="text-sm leading-relaxed text-[var(--color-parchment)]">
          {displayValue(clause.note)}
        </p>
      )}
    </article>
  );
}

function MissingClauseCard({ item, index }) {
  const title = item.title ?? item.name ?? `Gap ${index + 1}`;
  return (
    <article className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
      <h3 className="font-display text-base font-semibold text-amber-200">{title}</h3>
      {item.note && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-parchment-muted)]">
          {displayValue(item.note)}
        </p>
      )}
    </article>
  );
}

function AgentErrorView({ error }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-rose-300">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-semibold">{error.title}</p>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-parchment-muted)]">
        {error.message}
      </p>
      {error.retryAfter && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-200/90">
          <Clock className="h-3.5 w-3.5" />
          Retry in about {error.retryAfter}
        </p>
      )}
    </div>
  );
}

function SummaryView({ data }) {
  const summary = normalizeSummaryData(data);
  if (!summary) return <GenericView data={data} />;

  return (
    <>
      {summary.agreement_type && (
        <div className="mb-4">
          <Badge tone="gold">{summary.agreement_type}</Badge>
        </div>
      )}
      <Field label="Executive summary" value={summary.overview} />
      <ChipList title="Parties" items={summary.parties} />
      <BulletList title="Key points" items={summary.key_points} />
    </>
  );
}

function ToneView({ data }) {
  const tone = normalizeToneData(data);
  if (!tone) return <GenericView data={data} />;

  const scoreEntries = Object.entries(tone.scores ?? {}).filter(([, v]) => v);

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {tone.overall_tone && <Badge tone="gold">{tone.overall_tone}</Badge>}
        {tone.sentiment && (
          <Badge tone={sentimentBadgeTone(tone.sentiment)}>
            Sentiment: {tone.sentiment}
          </Badge>
        )}
      </div>

      {tone.summary && <Field label="Overview" value={tone.summary} />}

      {scoreEntries.length > 0 && (
        <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-muted)]/40 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
            Tone scores
          </p>
          {scoreEntries.map(([key, value]) => (
            <ScoreRow key={key} label={formatLabel(key)} value={value} />
          ))}
        </div>
      )}

      <BulletList title="Observations" items={tone.observations} />
      <BulletList
        title="Tone concerns"
        items={tone.concerns}
        emptyLabel={tone.concerns?.length ? undefined : null}
      />
    </>
  );
}

function RiskView({ data }) {
  return (
    <>
      {data.risk_level && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
            Risk level
          </p>
          <Badge tone={riskBadgeTone(data.risk_level)}>{data.risk_level}</Badge>
        </div>
      )}
      <Field label="Overview" value={data.answer ?? data.summary} />
      <BulletList title="Key risks" items={data.key_risks} />
      <BulletList title="Recommendations" items={data.recommendations} />
    </>
  );
}

function ClauseView({ data }) {
  const clause = normalizeClauseData(data);
  if (!clause) return <GenericView data={data} />;

  return (
    <>
      {clause.summary && <Field label="Overview" value={clause.summary} />}

      {clause.clauses?.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
            Relevant clauses ({clause.clauses.length})
          </p>
          <div className="space-y-3">
            {clause.clauses.map((item, i) => (
              <ClauseCard key={i} clause={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {clause.missing_or_weak?.length > 0 && (
        <div className="mb-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
            Missing or weak clauses
          </p>
          <div className="space-y-3">
            {clause.missing_or_weak.map((item, i) => (
              <MissingClauseCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      <BulletList title="Recommendations" items={clause.recommendations} />
    </>
  );
}

function GenericView({ data }) {
  return Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) {
      return <BulletList key={key} title={formatLabel(key)} items={value} />;
    }
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key} className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-parchment-muted)]">
            {formatLabel(key)}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-[var(--color-ink-muted)] p-3 text-xs text-[var(--color-parchment-muted)]">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    }
    return <Field key={key} label={formatLabel(key)} value={value} />;
  });
}

const VIEW_BY_VARIANT = {
  summary: SummaryView,
  tone: ToneView,
  risk: RiskView,
  clause: ClauseView,
};

function FormattedAgentContent({ content, variant = "summary" }) {
  const agentError = parseAgentError(content);
  if (agentError) {
    return <AgentErrorView error={agentError} />;
  }

  const data = parseAgentContent(content);

  if (!data) {
    return (
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-parchment-muted)]">
        {content}
      </p>
    );
  }

  const View = VIEW_BY_VARIANT[variant] ?? GenericView;
  return (
    <div className="space-y-1">
      <View data={data} />
    </div>
  );
}

export default FormattedAgentContent;
