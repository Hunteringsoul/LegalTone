const STORAGE_KEY = "legalTone_session";

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Could not save session", e);
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function verifyFileExists(fileUrl) {
  if (!fileUrl) return false;
  try {
    const res = await fetch(fileUrl, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export function hasAnalysis(response) {
  if (!response) return false;
  return [
    "legal_score",
    "recommendations",
    "summary",
    "tone_analysis",
    "risk_analysis",
    "clause_analysis",
  ].some(
    (key) => typeof response[key] === "string" && response[key].trim().length > 0
  );
}
