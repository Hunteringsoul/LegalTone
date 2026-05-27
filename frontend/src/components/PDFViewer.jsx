import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  buildHighlightTokens,
  highlightTextAsHtml,
} from "../lib/pdfHighlight";
import { useContainerWidth } from "../hooks/useViewport";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PDFViewer({ file, highlightedPage, highlightText }) {
  const containerRef = useRef(null);
  const pageWidth = useContainerWidth(containerRef, {
    max: 620,
    padding: 24,
    min: 240,
  });
  const [numPages, setNumPages] = useState(null);
  const pageRefs = useRef({});

  const page =
    highlightedPage != null ? Number(highlightedPage) : null;

  const tokens = useMemo(
    () => buildHighlightTokens(highlightText),
    [highlightText]
  );

  const highlighting = Boolean(page && tokens.length);

  const makeTextRenderer = useCallback(
    (pageNumber) =>
      ({ str }) =>
        highlightTextAsHtml(str, tokens, pageNumber, page),
    [tokens, page]
  );

  useEffect(() => {
    if (!page || !numPages) return;

    const el = pageRefs.current[page];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [page, numPages, highlightText]);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[var(--color-parchment-muted)] sm:p-6">
        Upload a PDF to preview it here.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="scrollbar-refined h-full overflow-x-hidden overflow-y-auto bg-[#050816] p-2 sm:p-4"
    >
      {page && (
        <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-200 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">
          Page {page}
          {highlighting && (
            <span className="hidden xs:inline"> · matching cited text</span>
          )}
        </div>
      )}

      <Document
        file={file}
        onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
        loading={
          <div className="py-8 text-center text-sm text-slate-400">
            Loading document…
          </div>
        }
        error={
          <div className="py-8 text-center text-sm text-rose-300">
            Could not load PDF.
          </div>
        }
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => {
            const pageNumber = index + 1;
            const isActivePage = page === pageNumber;

            return (
              <div
                key={pageNumber}
                ref={(el) => {
                  pageRefs.current[pageNumber] = el;
                }}
                className={`mx-auto mb-4 max-w-full overflow-hidden rounded-xl border-2 transition-all duration-300 sm:mb-6 sm:rounded-2xl ${
                  isActivePage
                    ? "border-amber-400 bg-amber-500/5 shadow-[0_0_35px_rgba(251,191,36,0.2)] ring-2 ring-amber-400/30"
                    : "border-slate-800"
                }`}
              >
                {isActivePage && (
                  <div className="bg-amber-400 px-2 py-1 text-center text-[10px] font-semibold text-black sm:px-3 sm:text-xs">
                    Cited · Page {pageNumber}
                  </div>
                )}

                <Page
                  pageNumber={pageNumber}
                  width={pageWidth}
                  renderTextLayer
                  renderAnnotationLayer={false}
                  customTextRenderer={
                    highlighting && isActivePage
                      ? makeTextRenderer(pageNumber)
                      : undefined
                  }
                />
              </div>
            );
          })}
      </Document>
    </div>
  );
}

export default PDFViewer;
