import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PdfPageViewport {
  width: number;
  height: number;
}

interface PdfPageRenderTask {
  promise: Promise<void>;
  cancel: () => void;
}

interface PdfPageObject {
  getViewport: (options: { scale: number }) => PdfPageViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfPageViewport;
  }) => PdfPageRenderTask;
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageObject>;
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: {
        workerSrc: string;
      };
      getDocument: (url: string) => {
        promise: Promise<PdfDocument>;
      };
    };
  }
}

interface PdfPreviewerProps {
  url: string;
  name: string;
}

export function PdfPreviewer({ url, name }: PdfPreviewerProps) {
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);

  // 1. Load PDF.js Script from CDN dynamically
  useEffect(() => {
    let active = true;

    const loadLibrary = async () => {
      if (window.pdfjsLib) {
        initPdf();
        return;
      }

      // Check if already appending script
      let script = document.getElementById("pdfjs-script") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "pdfjs-script";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.body.appendChild(script);
      }

      const onLoad = () => {
        if (active) initPdf();
      };

      script.addEventListener("load", onLoad);
      return () => {
        script.removeEventListener("load", onLoad);
      };
    };

    const initPdf = async () => {
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) return;
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (active) {
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading PDF via pdfjs:", err);
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLibrary();

    return () => {
      active = false;
    };
  }, [url]);

  // Adjust scale based on container width
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    // Calculate a good scale to fit width: standard PDF page width is around 600px
    const newScale = Math.min(Math.max((width - 32) / 600, 0.5), 2.0);
    setScale(newScale);
  }, [numPages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-300">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Preparing document viewer...</p>
      </div>
    );
  }

  if (!pdfDoc) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl w-full">
        <p className="text-sm font-bold text-white mb-2">Unable to display PDF</p>
        <p className="text-xs text-slate-400 mb-4">
          You can open the document in a new tab instead.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all inline-block"
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-h-[70vh] overflow-y-auto space-y-4 p-2 bg-slate-950/40 rounded-xl scrollbar-thin"
    >
      {Array.from({ length: numPages }, (_, i) => (
        <PdfPage key={i + 1} pdfDoc={pdfDoc} pageNumber={i + 1} scale={scale} />
      ))}
    </div>
  );
}

// Single PDF page rendering component
function PdfPage({
  pdfDoc,
  pageNumber,
  scale,
}: {
  pdfDoc: PdfDocument;
  pageNumber: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<PdfPageRenderTask | null>(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Support high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        // Cancel previous rendering if any
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (err: unknown) {
        const error = err as { name?: string; message?: string };
        if (error.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, error.message || error);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-700/50">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      <span className="text-[11px] font-bold text-slate-400 mt-2 select-none">
        Page {pageNumber} of {pdfDoc.numPages}
      </span>
    </div>
  );
}
