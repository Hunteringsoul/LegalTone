import { useRef, useState } from "react";
import { FileUp, FileText, CheckCircle2, Sparkles } from "lucide-react";
import api from "../lib/api";

const API_BASE = "http://127.0.0.1:8000";

function UploadBox({ onUploaded, onAnalyse, restoredDocument, analysing }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(Boolean(restoredDocument?.name));
  const [dragOver, setDragOver] = useState(false);

  const displayName = file?.name ?? restoredDocument?.name;
  const canAnalyse = uploaded || Boolean(restoredDocument?.name);

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setUploaded(false);
  };

  const uploadFile = async () => {
    if (!file || uploading) return;

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploaded(true);

      const { file_name, file_url, is_pdf, stored_name } = res.data;
      const fullUrl = file_url ? `${API_BASE}${file_url}` : null;

      onUploaded?.({
        name: file_name,
        url: is_pdf ? fullUrl : null,
        isPdf: Boolean(is_pdf),
        storedName: stored_name,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mt-4 sm:mt-8">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`group min-h-touch w-full rounded-xl border border-dashed p-4 text-left transition-all duration-300 sm:rounded-2xl sm:p-6 ${
          dragOver
            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8"
            : "border-[var(--color-border-strong)] bg-[var(--color-ink-muted)]/50 hover:border-[var(--color-gold-dim)] hover:bg-[var(--color-ink-muted)]"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-ink)] transition-colors group-hover:border-[var(--color-gold-dim)]">
            <FileUp className="h-5 w-5 text-[var(--color-gold)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-parchment)]">
              Drop agreement here
            </p>
            <p className="mt-1 text-xs text-[var(--color-parchment-muted)]">
              PDF, DOCX, or TXT
            </p>
          </div>
        </div>
      </button>

      {displayName && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-ink-muted)] px-4 py-3">
          <FileText className="h-4 w-4 shrink-0 text-[var(--color-gold)]" strokeWidth={1.5} />
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-parchment-muted)]">
            {displayName}
          </span>
          {uploaded && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={uploadFile}
        disabled={!file || uploading}
        className="min-h-touch mt-3 w-full rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dim)] px-4 py-3 text-sm font-semibold tracking-wide text-[var(--color-ink)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {uploading ? "Uploading…" : uploaded ? "Upload again" : "Upload agreement"}
      </button>

      <button
        type="button"
        onClick={onAnalyse}
        disabled={!canAnalyse || analysing}
        className="min-h-touch mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-gold-glow)] transition-all hover:bg-[var(--color-gold)]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.5} />
        {analysing ? "Analysing…" : "Analyse"}
      </button>

      <p className="mt-2 text-center text-[11px] text-[var(--color-parchment-muted)]/70">
        Runs score, recommendations, summary, tone, risk & clause agents
      </p>
    </div>
  );
}

export default UploadBox;
