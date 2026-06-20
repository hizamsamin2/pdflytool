let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  pdfjsLib = pdfjs;
  return pdfjs;
}

export interface FlipbookPage {
  pageNumber: number;
  imageDataUrl: string;
  width: number;
  height: number;
  text: string;
}

export interface FlipbookOutlineItem {
  title: string;
  pageNumber: number;
  level: number;
}

export interface Flipbook {
  pages: FlipbookPage[];
  outline: FlipbookOutlineItem[];
  pageCount: number;
}

export interface RenderProgress {
  current: number;
  total: number;
  message?: string;
}

const DEFAULT_SCALE = 1.5;

export async function pdfToFlipbook(
  file: File,
  onProgress?: (p: RenderProgress) => void,
  scale: number = DEFAULT_SCALE
): Promise<Flipbook> {
  const pdfjs = await getPdfjs();
  const buffer = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: FlipbookPage[] = [];
  let outline: FlipbookOutlineItem[] = [];

  try {
    const rawOutline: any = await pdf.getOutline();
    if (rawOutline && Array.isArray(rawOutline)) {
      outline = await flattenOutline(rawOutline, pdf, 0);
    }
  } catch {
    outline = [];
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);

    let text = "";
    try {
      const textContent = await page.getTextContent();
      text = textContent.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
    } catch {
      text = "";
    }

    pages.push({
      pageNumber: i,
      imageDataUrl,
      width: viewport.width,
      height: viewport.height,
      text,
    });

    onProgress?.({ current: i, total: pdf.numPages });
  }

  return { pages, outline, pageCount: pdf.numPages };
}

async function flattenOutline(
  items: any[],
  pdf: any,
  level: number
): Promise<FlipbookOutlineItem[]> {
  const result: FlipbookOutlineItem[] = [];
  for (const item of items) {
    let pageNumber = 1;
    try {
      if (item.dest) {
        const dest =
          typeof item.dest === "string"
            ? await pdf.getDestination(item.dest)
            : item.dest;
        if (dest && dest[0]) {
          const pageIndex = await pdf.getPageIndex(dest[0]);
          pageNumber = pageIndex + 1;
        }
      } else if (item.url) {
        pageNumber = 1;
      }
    } catch {
      pageNumber = 1;
    }
    result.push({ title: item.title || "(Untitled)", pageNumber, level });
    if (item.items && Array.isArray(item.items)) {
      const children = await flattenOutline(item.items, pdf, level + 1);
      result.push(...children);
    }
  }
  return result;
}

export async function searchFlipbook(
  flipbook: Flipbook,
  query: string
): Promise<{ pageNumber: number; snippet: string }[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: { pageNumber: number; snippet: string }[] = [];
  for (const page of flipbook.pages) {
    const text = page.text.toLowerCase();
    const idx = text.indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(page.text.length, idx + q.length + 60);
      const snippet = (start > 0 ? "..." : "") + page.text.slice(start, end) + (end < page.text.length ? "..." : "");
      results.push({ pageNumber: page.pageNumber, snippet });
    }
  }
  return results;
}

export async function buildStandaloneHtml(flipbook: Flipbook, title: string): Promise<Blob> {
  const css = STANDALONE_CSS;
  const js = STANDALONE_JS;
  const pagesJson = JSON.stringify(
    flipbook.pages.map((p) => ({
      pageNumber: p.pageNumber,
      imageDataUrl: p.imageDataUrl,
      width: p.width,
      height: p.height,
    }))
  );
  const outlineJson = JSON.stringify(flipbook.outline);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} — Flipbook</title>
<style>${css}</style>
</head>
<body>
<div class="flipbook-app">
  <header class="flipbook-header">
    <h1>${escapeHtml(title)}</h1>
    <div class="flipbook-controls">
      <button id="prev-btn" title="Previous (←)">‹</button>
      <span id="page-indicator">1 / ${flipbook.pageCount}</span>
      <button id="next-btn" title="Next (→)">›</button>
      <button id="zoom-btn" title="Zoom (Z)">⛶</button>
    </div>
  </header>
  <main id="flipbook-container"></main>
  <div id="search-overlay" class="search-overlay hidden">
    <input id="search-input" type="search" placeholder="Search in book..." />
    <div id="search-results"></div>
    <button id="search-close">✕</button>
  </div>
  <button id="search-btn" class="floating-btn" title="Search (S)">🔍</button>
</div>
<script>${js}</script>
<script>
  const PAGES = ${pagesJson};
  const OUTLINE = ${outlineJson};
  const TOTAL = PAGES.length;
  initFlipbook(PAGES, OUTLINE);
</script>
</body>
</html>`;

  return new Blob([html], { type: "text/html;charset=utf-8" });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STANDALONE_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a1a; color: #fff; overflow: hidden; }
.flipbook-app { display: flex; flex-direction: column; height: 100vh; }
.flipbook-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(0,0,0,0.8); border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10; }
.flipbook-header h1 { font-size: 16px; font-weight: 500; opacity: 0.9; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flipbook-controls { display: flex; align-items: center; gap: 8px; }
.flipbook-controls button { width: 36px; height: 36px; border: none; background: rgba(255,255,255,0.1); color: #fff; border-radius: 6px; cursor: pointer; font-size: 18px; transition: background 0.2s; }
.flipbook-controls button:hover { background: rgba(255,255,255,0.2); }
#page-indicator { min-width: 60px; text-align: center; font-variant-numeric: tabular-nums; font-size: 14px; }
#flipbook-container { flex: 1; position: relative; background: #1a1a1a; }
.page-flip-container { position: relative; width: 100%; height: 100%; }
.stf__block { background: #fff !important; }
.search-overlay { position: fixed; top: 60px; right: 16px; width: 320px; max-height: 70vh; background: rgba(20,20,20,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; z-index: 20; display: flex; flex-direction: column; }
.search-overlay.hidden { display: none; }
.search-overlay input { width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px; font-size: 14px; outline: none; }
.search-overlay input:focus { border-color: rgba(255,255,255,0.4); }
#search-results { flex: 1; overflow-y: auto; margin-top: 8px; font-size: 13px; }
.search-result { padding: 8px; border-radius: 4px; cursor: pointer; margin-bottom: 4px; }
.search-result:hover { background: rgba(255,255,255,0.08); }
.search-result .page-num { color: #888; font-size: 11px; }
.search-result .snippet { opacity: 0.85; margin-top: 2px; line-height: 1.4; }
.search-result mark { background: rgba(255,200,0,0.4); color: #fff; padding: 0 2px; border-radius: 2px; }
#search-close { position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: transparent; border: none; color: #888; cursor: pointer; font-size: 16px; }
.floating-btn { position: fixed; bottom: 16px; right: 16px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; cursor: pointer; font-size: 18px; backdrop-filter: blur(10px); z-index: 10; }
.floating-btn:hover { background: rgba(255,255,255,0.25); }
@media (max-width: 640px) { .flipbook-header h1 { display: none; } .search-overlay { left: 16px; right: 16px; width: auto; } }
`;

const STANDALONE_JS = `
let pageFlip = null;
let pages = [];
let currentPage = 1;

function initFlipbook(pagesData, outline) {
  pages = pagesData;
  const container = document.getElementById('flipbook-container');
  
  const firstImg = new Image();
  firstImg.onload = function() {
    const ratio = firstImg.naturalHeight / firstImg.naturalWidth;
    const targetWidth = Math.min(800, window.innerWidth - 40);
    const targetHeight = targetWidth * ratio;
    
    pageFlip = new St.PageFlip(container, {
      width: targetWidth,
      height: targetHeight,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 1200,
      minHeight: Math.floor(280 * ratio),
      maxHeight: Math.floor(1200 * ratio),
      showCover: false,
      mobileScrollSupport: true,
      flippingTime: 600,
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0.5,
      drawShadow: true,
      useMouseEvents: true
    });
    
    pageFlip.loadFromImages(pages.map(p => p.imageDataUrl));
    
    pageFlip.on('flip', (e) => {
      currentPage = e.data + 1;
      updateIndicator();
    });
    
    setupControls();
    setupSearch(outline);
    setupKeyboard();
    
    window.addEventListener('resize', () => {
      if (pageFlip) pageFlip.update();
    });
  };
  firstImg.src = pagesData[0].imageDataUrl;
}

function updateIndicator() {
  document.getElementById('page-indicator').textContent = currentPage + ' / ' + pages.length;
}

function setupControls() {
  document.getElementById('prev-btn').onclick = () => pageFlip.flipPrev();
  document.getElementById('next-btn').onclick = () => pageFlip.flipNext();
  document.getElementById('zoom-btn').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') pageFlip.flipPrev();
    else if (e.key === 'ArrowRight') pageFlip.flipNext();
    else if (e.key.toLowerCase() === 's') toggleSearch();
    else if (e.key.toLowerCase() === 'z') document.getElementById('zoom-btn').click();
  });
}

function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  overlay.classList.toggle('hidden');
  if (!overlay.classList.contains('hidden')) {
    document.getElementById('search-input').focus();
  }
}

function setupSearch(outline) {
  const btn = document.getElementById('search-btn');
  btn.onclick = toggleSearch;
  document.getElementById('search-close').onclick = toggleSearch;
  
  const input = document.getElementById('search-input');
  let timeout;
  input.oninput = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => runSearch(input.value), 250);
  };
}

async function runSearch(query) {
  const resultsDiv = document.getElementById('search-results');
  if (!query.trim()) {
    resultsDiv.innerHTML = '<div style="color:#888;padding:8px;font-size:12px;">Type to search...</div>';
    return;
  }
  resultsDiv.innerHTML = '<div style="color:#888;padding:8px;font-size:12px;">Searching...</div>';
  const q = query.toLowerCase();
  const results = [];
  for (const p of pages) {
    const text = (p.text || '').toLowerCase();
    const idx = text.indexOf(q);
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + q.length + 60);
      results.push({ pageNumber: p.pageNumber, snippet: p.text.slice(start, end) });
    }
  }
  if (results.length === 0) {
    resultsDiv.innerHTML = '<div style="color:#888;padding:8px;font-size:12px;">No results found.</div>';
    return;
  }
  resultsDiv.innerHTML = results.map(r => 
    '<div class="search-result" data-page="' + r.pageNumber + '">' +
      '<div class="page-num">Page ' + r.pageNumber + '</div>' +
      '<div class="snippet">' + highlightSnippet(r.snippet, query) + '</div>' +
    '</div>'
  ).join('');
  resultsDiv.querySelectorAll('.search-result').forEach(el => {
    el.onclick = () => {
      const pageNum = parseInt(el.dataset.page);
      pageFlip.flip(pageNum - 1);
      toggleSearch();
    };
  });
}

function highlightSnippet(snippet, query) {
  const re = new RegExp('(' + query.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\\$&') + ')', 'gi');
  return snippet.replace(re, '<mark>$1</mark>').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
`;