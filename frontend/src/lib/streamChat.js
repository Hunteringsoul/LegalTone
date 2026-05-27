const EMPTY_RESPONSE = {
  legal_score: "",
  recommendations: "",
  summary: "",
  tone_analysis: "",
  risk_analysis: "",
  clause_analysis: "",
  sources: [],
};

/**
 * Parse NDJSON stream from /stream_chat.
 * Lines: status events, then agent results with content.
 */
export async function consumeAgentStream(response, onUpdate, onAgentStatus) {
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const merged = { ...EMPTY_RESPONSE };

  const applyLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parsed = JSON.parse(trimmed);

    if (parsed.type === "status" && parsed.agent && parsed.status) {
      onAgentStatus?.(parsed.agent, parsed.status);
      return;
    }

    if (parsed.agent && parsed.content !== undefined) {
      merged[parsed.agent] = parsed.content;
      if (parsed.sources?.length) {
        merged.sources = parsed.sources;
      }
      onUpdate({ ...merged });
      return;
    }

    if (parsed.summary !== undefined || parsed.tone_analysis !== undefined) {
      Object.assign(merged, parsed);
      onUpdate({ ...merged });
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      try {
        applyLine(line);
      } catch {
        // skip malformed partial lines
      }
    }
  }

  if (buffer.trim()) {
    try {
      applyLine(buffer);
    } catch {
      // ignore trailing garbage
    }
  }

  return merged;
}

export { EMPTY_RESPONSE };
