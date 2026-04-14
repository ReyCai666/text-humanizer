"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface PdfPreviewProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

export default function PdfPreview({ file, onTextExtracted, onClose }: PdfPreviewProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());

  // Load PDF.js
  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        if (cancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Extract text from all pages
        const texts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(" ");
          texts.push(pageText);
        }
        const fullText = texts.join("\n\n");
        setExtractedText(fullText);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load PDF. The file may be corrupted or password-protected.");
          setLoading(false);
        }
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [file]);

  // Render visible pages
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || renderedPages.has(pageNum)) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRefs.current[pageNum - 1];
      if (!canvas) return;

      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      setRenderedPages(prev => new Set(prev).add(pageNum));
    } catch (err) {
      console.error(`Failed to render page ${pageNum}:`, err);
    }
  }, [pdfDoc, scale, renderedPages]);

  // Render pages when they come into view
  useEffect(() => {
    if (!pdfDoc) return;
    // Render first 3 pages immediately, rest lazily
    const pagesToRender = Math.min(3, numPages);
    for (let i = 1; i <= pagesToRender; i++) {
      renderPage(i);
    }
  }, [pdfDoc, numPages, renderPage]);

  // Render more pages on scroll
  useEffect(() => {
    if (!containerRef.current || !pdfDoc) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.getAttribute("data-page") || "0");
            if (pageNum > 0) renderPage(pageNum);
          }
        });
      },
      { root: containerRef.current, threshold: 0.1 }
    );

    const pageDivs = containerRef.current.querySelectorAll("[data-page]");
    pageDivs.forEach(div => observer.observe(div));
    return () => observer.disconnect();
  }, [pdfDoc, numPages, renderPage]);

  function handleUseText() {
    onTextExtracted(extractedText);
  }

  function handleZoomIn() {
    setScale(s => Math.min(s + 0.2, 2.5));
    setRenderedPages(new Set()); // Re-render all
  }
  function handleZoomOut() {
    setScale(s => Math.max(s - 0.2, 0.6));
    setRenderedPages(new Set());
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-200">📄 {file.name}</span>
            <span className="text-xs text-slate-500">
              {numPages > 0 ? `${numPages} pages` : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button onClick={handleZoomOut} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400 transition-colors" title="Zoom out">−</button>
            <span className="text-xs text-slate-500 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-400 transition-colors" title="Zoom in">+</button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <button onClick={onClose} className="text-xs px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* PDF Pages */}
              <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i} data-page={i + 1} className="flex flex-col items-center">
                    <div className="text-[10px] text-slate-600 mb-1">Page {i + 1}</div>
                    <canvas
                      ref={el => { canvasRefs.current[i] = el; }}
                      className="rounded-lg shadow-lg border border-white/5 max-w-full"
                      style={{ background: "#fff" }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <span className="text-xs text-slate-500">
              {extractedText.split(/\s+/).length.toLocaleString()} words extracted
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseText}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all"
              >
                Use This Text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
