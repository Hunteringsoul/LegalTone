/**
 * Extract and parse JSON from LLM agent responses (may include markdown fences).
 */
export function parseAgentContent(content) {
  if (!content || typeof content !== "string") return null;

  let text = content.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  const tryParse = (str) => {
    try {
      const parsed = JSON.parse(str);
      return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  };

  let parsed = tryParse(text);
  if (parsed) return parsed;

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    parsed = tryParse(text.slice(start, end + 1));
    if (parsed) return parsed;
  }

  return null;
}

export function formatLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Detect agent error strings and return a structured object for the UI. */
export function parseAgentError(content) {
  if (!content || typeof content !== "string") return null;

  const trimmed = content.trim();
  if (!trimmed.startsWith("Error:")) return null;

  const message = trimmed.slice(6).trim();
  const lower = message.toLowerCase();

  if (lower.includes("rate limit") || lower.includes("429")) {
    const retryMatch = message.match(/try again in about ([^.]+)/i);
    return {
      type: "rate_limit",
      title: "Groq rate limit reached",
      message:
        "You've hit the daily token limit for the AI model. Wait a few minutes and click Analyse again, or use a smaller model in your .env file.",
      retryAfter: retryMatch?.[1]?.trim() ?? null,
    };
  }

  if (lower.includes("groq_api_key") || lower.includes("api key")) {
    return {
      type: "auth",
      title: "API key missing",
      message: message,
    };
  }

  return {
    type: "generic",
    title: "Analysis failed",
    message,
  };
}

/** Normalize summary agent payloads — handles nested/malformed answer objects. */
export function normalizeSummaryData(data) {
  if (!data || typeof data !== "object") return null;

  let overview =
    data.executive_summary ?? data.summary ?? data.overview ?? null;
  let keyPoints = data.key_points ?? data.highlights ?? [];
  let parties = data.parties ?? [];

  const answer = data.answer;

  if (typeof answer === "string" && answer.trim()) {
    overview = overview ?? answer;
  } else if (answer && typeof answer === "object") {
    overview =
      overview ??
      answer.executive_summary ??
      answer.summary ??
      answer.overview ??
      null;

    if (!keyPoints?.length) {
      keyPoints = answer.key_points ?? answer.highlights ?? [];
    }
    if (!parties?.length) {
      parties = answer.parties ?? [];
    }
  }

  if (typeof overview === "object" && overview !== null) {
    overview = null;
  }

  if (!Array.isArray(keyPoints)) keyPoints = [];
  if (!Array.isArray(parties)) parties = [];

  return {
    agreement_type: data.agreement_type ?? null,
    overview: overview?.trim?.() ? overview.trim() : overview,
    parties,
    key_points: keyPoints,
  };
}

/** Normalize tone agent payloads to a consistent shape for the UI. */
export function normalizeToneData(data) {
  if (!data || typeof data !== "object") return null;

  const scores = data.scores ?? {};
  const legacyScores = {
    professionalism: data.professionalism ?? scores.professionalism,
    aggressiveness: data.aggressiveness ?? scores.aggressiveness,
    fairness: data.fairness ?? scores.fairness,
  };

  return {
    overall_tone: data.overall_tone ?? data.tone ?? null,
    sentiment: data.sentiment ?? null,
    scores: legacyScores,
    summary: data.summary ?? data.answer ?? null,
    observations: data.observations ?? data.notes ?? data.key_points ?? [],
    concerns: data.concerns ?? data.red_flags ?? [],
  };
}

/** Normalize clause agent payloads to a consistent shape for the UI. */
export function normalizeClauseData(data) {
  if (!data || typeof data !== "object") return null;

  let clauses = data.clauses ?? data.relevant_clauses ?? data.detected_clauses ?? [];

  if (Array.isArray(clauses) && clauses.length && typeof clauses[0] === "string") {
    clauses = clauses.map((text) => ({
      title: "Clause",
      excerpt: text,
      type: "standard",
      importance: "moderate",
    }));
  }

  let missing = data.missing_or_weak ?? data.missing_clauses ?? [];
  if (Array.isArray(missing) && missing.length && typeof missing[0] === "string") {
    missing = missing.map((text) => ({ title: text, note: "" }));
  }

  return {
    summary: data.summary ?? data.answer ?? null,
    clauses,
    missing_or_weak: missing,
    recommendations: data.recommendations ?? [],
  };
}

const DIMENSION_LABELS = {
  risk_exposure: "Risk exposure",
  fairness_balance: "Fairness & balance",
  clause_completeness: "Clause completeness",
  clarity_enforceability: "Clarity & enforceability",
};

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Parse and normalize the legal score agent payload. */
export function parseLegalScore(content) {
  if (!content || typeof content !== "string") return null;

  const error = parseAgentError(content);
  if (error) return { error };

  const data = parseAgentContent(content);
  if (!data) return null;

  const overall = clampScore(
    data.overall_score ?? data.score ?? data.legal_score
  );
  if (overall == null) return null;

  const rawDimensions = data.dimensions ?? data.subscores ?? {};
  const dimensions = Object.entries(DIMENSION_LABELS).map(([key, label]) => {
    const entry = rawDimensions[key] ?? rawDimensions[label];
    if (entry == null) return null;

    if (typeof entry === "number" || typeof entry === "string") {
      const score = clampScore(entry);
      return score != null ? { key, label, score, note: "" } : null;
    }

    const score = clampScore(entry.score ?? entry.value);
    if (score == null) return null;
    return {
      key,
      label: entry.label ?? label,
      score,
      note: entry.note ?? entry.summary ?? "",
    };
  }).filter(Boolean);

  return {
    overall,
    grade: data.grade ?? scoreToGrade(overall),
    label: data.label ?? data.rating ?? scoreToLabel(overall),
    summary: data.summary ?? data.answer ?? "",
    dimensions,
    highlights: data.highlights ?? data.strengths ?? [],
    concerns: data.concerns ?? data.weaknesses ?? [],
  };
}

function scoreToGrade(score) {
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D+";
  if (score >= 45) return "D";
  if (score >= 40) return "D-";
  return "F";
}

function scoreToLabel(score) {
  if (score >= 85) return "Favorable";
  if (score >= 70) return "Moderate — review key clauses";
  if (score >= 55) return "Elevated risk";
  return "High risk — seek counsel";
}

export function scoreColor(score) {
  if (score >= 85) return "emerald";
  if (score >= 70) return "gold";
  if (score >= 55) return "amber";
  return "rose";
}

const VERDICT_LABELS = {
  proceed: "Safe to proceed",
  proceed_with_changes: "Proceed with changes",
  negotiate: "Negotiate key terms",
  review_with_counsel: "Review with counsel",
  do_not_sign: "Do not sign as-is",
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/** Parse and normalize the recommendations agent payload. */
export function parseRecommendations(content) {
  if (!content || typeof content !== "string") return null;

  const error = parseAgentError(content);
  if (error) return { error };

  const data = parseAgentContent(content);
  if (!data) return null;

  const verdict = data.verdict ?? data.recommendation ?? data.overall ?? null;

  let actions = data.actions ?? data.recommendations ?? [];
  if (Array.isArray(actions) && actions.length && typeof actions[0] === "string") {
    actions = actions.map((text, i) => ({
      priority: i === 0 ? "high" : "medium",
      title: text,
      reason: "",
      clause_ref: "",
    }));
  }

  actions = actions
    .map((item) => ({
      priority: String(item.priority ?? "medium").toLowerCase(),
      title: item.title ?? item.action ?? item.name ?? "Recommendation",
      reason: item.reason ?? item.description ?? item.note ?? "",
      clause_ref: item.clause_ref ?? item.section ?? item.clause ?? "",
    }))
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
    );

  return {
    verdict,
    verdictLabel: VERDICT_LABELS[verdict] ?? formatLabel(String(verdict ?? "")),
    summary: data.summary ?? data.answer ?? data.overview ?? "",
    actions,
    negotiation_points:
      data.negotiation_points ?? data.negotiate ?? data.redlines ?? [],
    next_steps: data.next_steps ?? data.steps ?? [],
  };
}

export function verdictTone(verdict) {
  const v = String(verdict ?? "").toLowerCase();
  if (v.includes("do_not") || v.includes("reject")) return "rose";
  if (v.includes("counsel") || v.includes("negotiate")) return "amber";
  if (v.includes("changes")) return "gold";
  return "emerald";
}

export function priorityTone(priority) {
  const p = String(priority ?? "").toLowerCase();
  if (p === "high") return "rose";
  if (p === "low") return "sky";
  return "gold";
}
