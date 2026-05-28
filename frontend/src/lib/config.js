const DEFAULT_API_BASE = "https://legaltone-backenddd.onrender.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function isLocalHost(hostname) {
  return LOCAL_HOSTS.has((hostname || "").toLowerCase());
}

function normalizeApiBase(rawBase) {
  const trimmed = rawBase?.trim();
  if (!trimmed) return DEFAULT_API_BASE;

  try {
    const parsed = new URL(trimmed);
    const runningInBrowser = typeof window !== "undefined";
    const appHost = runningInBrowser ? window.location.hostname : "";

    // Never use localhost backend on deployed frontend.
    if (!isLocalHost(appHost) && isLocalHost(parsed.hostname)) {
      return DEFAULT_API_BASE;
    }

    return parsed.origin;
  } catch {
    return DEFAULT_API_BASE;
  }
}

// Hard-lock production backend target to avoid bad env/cached localhost values.
const API_BASE = normalizeApiBase(DEFAULT_API_BASE);

function resolveBackendUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  const value = String(pathOrUrl).trim();
  if (!value) return null;

  try {
    const asUrl = new URL(value);
    if (isLocalHost(asUrl.hostname)) {
      return new URL(asUrl.pathname + asUrl.search + asUrl.hash, API_BASE).toString();
    }
    return asUrl.toString();
  } catch {
    const slashPath = value.startsWith("/") ? value : `/${value}`;
    return new URL(slashPath, API_BASE).toString();
  }
}

export { API_BASE, resolveBackendUrl };
