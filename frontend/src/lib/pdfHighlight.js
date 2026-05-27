const STOPWORDS = new Set([
  "the", "and", "for", "that", "this", "with", "from", "shall", "will",
  "party", "parties", "agreement", "upon", "such", "any", "all", "not",
]);

export function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Significant tokens from a source snippet for PDF text-layer matching. */
export function buildHighlightTokens(sourceText) {
  if (!sourceText) return [];

  const normalized = normalizeText(sourceText);
  const tokens = normalized
    .split(" ")
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

  const unique = [...new Set(tokens)];

  return unique.sort((a, b) => b.length - a.length).slice(0, 40);
}

export function shouldHighlightTextItem(str, tokens, pageNumber, activePage) {
  if (!activePage || pageNumber !== activePage || !tokens.length) return false;

  const item = normalizeText(str);
  if (item.length < 4) return false;

  return tokens.some((token) => {
    if (token.length < 4) return false;
    if (item === token) return true;

    // PDF often splits words across spans — allow close prefix/suffix only
    const shorter = item.length < token.length ? item : token;
    const longer = item.length < token.length ? token : item;
    if (shorter.length < 5) return false;

    const overlap =
      longer.startsWith(shorter) || longer.endsWith(shorter);
    if (!overlap) return false;

    return shorter.length / longer.length >= 0.7;
  });
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** react-pdf customTextRenderer must return an HTML string, not JSX. */
export function highlightTextAsHtml(str, tokens, pageNumber, activePage) {
  if (!shouldHighlightTextItem(str, tokens, pageNumber, activePage)) {
    return str;
  }

  // Keep text transparent — canvas already renders the visible glyphs
  return `<mark class="pdf-text-highlight">${escapeHtml(str)}</mark>`;
}
