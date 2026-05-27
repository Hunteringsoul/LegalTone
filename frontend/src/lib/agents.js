export const AGENT_LIST = [
  { id: "legal_score", label: "Score" },
  { id: "recommendations", label: "Recs" },
  { id: "summary", label: "Summary" },
  { id: "tone_analysis", label: "Tone" },
  { id: "risk_analysis", label: "Risk" },
  { id: "clause_analysis", label: "Clause" },
];

export const INITIAL_AGENT_STATUS = Object.fromEntries(
  AGENT_LIST.map((a) => [a.id, "idle"])
);

export const STATUS_LABELS = {
  idle: "Idle",
  offline: "Offline",
  ready: "Ready",
  running: "Running",
  done: "Done",
  error: "Error",
};
