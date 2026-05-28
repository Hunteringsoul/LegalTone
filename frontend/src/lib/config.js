const API_BASE = "https://legaltone-backenddd.onrender.com";
const API_ORIGIN = "https://legaltone-backenddd.onrender.com";

function resolveBackendUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  const value = String(pathOrUrl).trim();
  if (!value) return null;

  try {
    const asUrl = new URL(value);
    if (asUrl.origin === API_ORIGIN) return asUrl.toString();
    return new URL(asUrl.pathname + asUrl.search + asUrl.hash, API_BASE).toString();
  } catch {
    const slashPath = value.startsWith("/") ? value : `/${value}`;
    return new URL(slashPath, API_BASE).toString();
  }
}

export { API_BASE, resolveBackendUrl };
