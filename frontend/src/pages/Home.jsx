import { useState, useEffect, useCallback } from "react";

import { X } from "lucide-react";

import Sidebar from "../components/Sidebar";

import TopBar from "../components/TopBar";

import ChatWindow from "../components/ChatWindow";

import PDFViewer from "../components/PDFViewer";

import { consumeAgentStream, EMPTY_RESPONSE } from "../lib/streamChat";
import { API_BASE, resolveBackendUrl } from "../lib/config";

import { AGENT_LIST, INITIAL_AGENT_STATUS } from "../lib/agents";

import {

  loadSession,

  saveSession,

  verifyFileExists,

  hasAnalysis,

} from "../lib/sessionStorage";


const ANALYSE_QUERY =

  "Provide a comprehensive analysis of this agreement: AI legal score, actionable recommendations, executive summary, tone, legal risks, and key clauses.";



function setAllAgentStatus(setter, status) {

  setter(

    Object.fromEntries(AGENT_LIST.map((a) => [a.id, status]))

  );

}



function Home() {

  const [query, setQuery] = useState("");

  const [messages, setMessages] = useState([]);

  const [response, setResponse] = useState(null);

  const [chatLoading, setChatLoading] = useState(false);

  const [analysing, setAnalysing] = useState(false);

  const [error, setError] = useState(null);

  const [documentMeta, setDocumentMeta] = useState(null);

  const [highlight, setHighlight] = useState(null);

  const [sessionReady, setSessionReady] = useState(false);

  const [agentStatuses, setAgentStatuses] = useState(INITIAL_AGENT_STATUS);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [mobilePdfOpen, setMobilePdfOpen] = useState(false);



  const documentName = documentMeta?.name ?? null;

  const documentUrl = documentMeta?.url ?? null;

  const showPdfPanel = Boolean(documentMeta?.isPdf && documentMeta?.url);

  const loading = chatLoading || analysing;



  useEffect(() => {

    if (!sidebarOpen && !mobilePdfOpen) return undefined;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = prev;

    };

  }, [sidebarOpen, mobilePdfOpen]);



  const fetchBackendAgentStatus = useCallback(async () => {

    try {

      const res = await fetch(`${API_BASE}/agents/status`);

      if (!res.ok) throw new Error("offline");

      const data = await res.json();

      const next = { ...INITIAL_AGENT_STATUS };

      for (const agent of AGENT_LIST) {

        next[agent.id] = data.agents?.[agent.id] ?? "ready";

      }

      setAgentStatuses(next);

    } catch {

      setAllAgentStatus(setAgentStatuses, "offline");

    }

  }, []);



  useEffect(() => {

    async function restore() {

      await fetchBackendAgentStatus();



      const saved = loadSession();

      if (!saved) {

        setSessionReady(true);

        return;

      }



      if (saved.document?.name) {

        const url = resolveBackendUrl(saved.document.url);

        const fileOk = url ? await verifyFileExists(url) : false;

        if (fileOk || !url) {

          setDocumentMeta({ ...saved.document, url });

          setAllAgentStatus(setAgentStatuses, "ready");

        }

      }



      if (Array.isArray(saved.messages) && saved.messages.length > 0) {

        setMessages(saved.messages);

      }



      if (saved.response && hasAnalysis(saved.response)) {

        setResponse(saved.response);

        setAllAgentStatus(setAgentStatuses, "done");

      }



      if (saved.highlight) {

        setHighlight(saved.highlight);

      }



      setSessionReady(true);

    }



    restore();

  }, [fetchBackendAgentStatus]);



  useEffect(() => {

    if (!sessionReady) return;



    saveSession({

      document: documentMeta,

      messages,

      response: hasAnalysis(response) ? response : null,

      highlight,

    });

  }, [sessionReady, documentMeta, messages, response, highlight]);



  const handleAgentStatus = useCallback((agentId, status) => {

    setAgentStatuses((prev) => ({ ...prev, [agentId]: status }));

  }, []);



  const handleDocumentUploaded = useCallback((doc) => {

    setDocumentMeta(doc);

    setHighlight(null);

    setMessages([]);

    setResponse(null);

    setError(null);

    setMobilePdfOpen(false);

    setAllAgentStatus(setAgentStatuses, "ready");

  }, []);



  const applyHighlight = (source) => {

    if (!source?.page || Number(source.page) <= 0) return;

    setHighlight({

      page: Number(source.page),

      text: source.text || "",

    });

  };



  const handleStreamUpdate = (data) => {

    setResponse(data);

  };



  const handleSourceClick = (source) => {

    applyHighlight(source);

    if (showPdfPanel && window.innerWidth < 1280) {

      setMobilePdfOpen(true);

    }

  };



  const runFullAnalysis = async () => {

    if (!documentMeta || analysing) return;



    setError(null);

    setResponse({ ...EMPTY_RESPONSE });

    setHighlight(null);

    setAnalysing(true);

    setAllAgentStatus(setAgentStatuses, "running");



    try {

      const res = await fetch(`${API_BASE}/stream_chat`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ query: ANALYSE_QUERY }),

      });



      const final = await consumeAgentStream(

        res,

        handleStreamUpdate,

        handleAgentStatus

      );



      setResponse(final);

      if (final?.sources?.[0]) {

        applyHighlight(final.sources[0]);

      }

      setAllAgentStatus(setAgentStatuses, "done");

    } catch (err) {

      console.error(err);

      setError(

        err.message ||

          "Analysis failed. Check that the backend is running and a document is uploaded."

      );

      setResponse(null);

      setAllAgentStatus(setAgentStatuses, "error");

    } finally {

      setAnalysing(false);

    }

  };



  const sendMessage = async () => {

    const userQuery = query.trim();

    if (!userQuery || loading) return;



    if (!documentMeta) {

      setError("Upload a document first, then ask questions or click Analyse.");

      return;

    }



    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);

    setQuery("");

    setError(null);

    setChatLoading(true);



    try {

      const res = await fetch(`${API_BASE}/ask`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ query: userQuery }),

      });



      if (!res.ok) {

        const raw = await res.text().catch(() => "");

        let detail = raw;

        try {

          const parsed = JSON.parse(raw);

          detail = parsed.detail ?? raw;

        } catch {

          // keep raw text

        }

        throw new Error(

          typeof detail === "string"

            ? detail

            : `Request failed (${res.status})`

        );

      }



      const data = await res.json();



      setMessages((prev) => [

        ...prev,

        { role: "assistant", content: data.answer },

      ]);



      if (data.sources?.[0]) {

        applyHighlight(data.sources[0]);

      }

    } catch (err) {

      console.error(err);

      setError(

        err.message ||

          "Chat failed. Check that the backend is running and GROQ_API_KEY is set."

      );

    } finally {

      setChatLoading(false);

    }

  };



  if (!sessionReady) {

    return (

      <div className="bg-app flex h-screen-safe items-center justify-center px-4 text-sm text-[var(--color-parchment-muted)]">

        Restoring session…

      </div>

    );

  }



  return (

    <div className="bg-app flex h-screen-safe overflow-hidden xl:flex-row">

      <Sidebar

        onDocumentUploaded={handleDocumentUploaded}

        onAnalyse={runFullAnalysis}

        restoredDocument={documentMeta}

        analysing={analysing}

        open={sidebarOpen}

        onClose={() => setSidebarOpen(false)}

      />



      <main className="flex min-h-0 min-w-0 flex-1 flex-col">

        <TopBar

          documentName={documentName}

          isAnalyzing={loading}

          agentStatuses={agentStatuses}

          onMenuClick={() => setSidebarOpen(true)}

          showPdfPanel={showPdfPanel}

          mobilePdfOpen={mobilePdfOpen}

          onTogglePdf={() => setMobilePdfOpen((v) => !v)}

        />



        {error && (

          <div className="border-b border-rose-500/30 bg-rose-950/40 px-3 py-2.5 text-xs text-rose-300 sm:px-6 sm:py-3 sm:text-sm">

            {error}

          </div>

        )}



        <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">

            <ChatWindow

              messages={messages}

              response={response}

              showAgentCards={hasAnalysis(response) || analysing}

              chatLoading={chatLoading}

              analysing={analysing}

              query={query}

              onQueryChange={setQuery}

              onSend={sendMessage}

              activeHighlight={highlight}

              onSourceClick={handleSourceClick}

            />

          </div>



          {showPdfPanel && (

            <div

              className={`shrink-0 border-[var(--color-border)] bg-[var(--color-ink)] ${

                mobilePdfOpen

                  ? "fixed inset-0 z-30 flex min-h-0 flex-col safe-pt xl:relative xl:inset-auto xl:z-auto xl:flex xl:w-[min(44%,520px)] xl:border-l"

                  : "hidden xl:flex xl:min-h-0 xl:w-[min(44%,520px)] xl:flex-col xl:border-l"

              }`}

            >

              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-3 sm:px-4 xl:hidden">

                <p className="truncate text-sm font-medium text-[var(--color-parchment)]">

                  {documentName ?? "Document"}

                </p>

                <button

                  type="button"

                  onClick={() => setMobilePdfOpen(false)}

                  className="min-h-touch min-w-touch flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-ink-muted)]"

                  aria-label="Close PDF"

                >

                  <X className="h-4 w-4 text-[var(--color-gold)]" />

                </button>

              </div>



              <div className="min-h-0 flex-1">

                <PDFViewer

                  file={documentUrl}

                  highlightedPage={highlight?.page}

                  highlightText={highlight?.text}

                />

              </div>

            </div>

          )}

        </div>

      </main>

    </div>

  );

}



export default Home;


