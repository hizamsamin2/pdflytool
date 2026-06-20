let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  pdfjsLib = pdfjs;
  return pdfjs;
}

let cachedPageFlipScript: string | null = null;

async function getPageFlipScript(): Promise<string> {
  if (cachedPageFlipScript !== null) return cachedPageFlipScript;
  try {
    const res = await fetch("/page-flip.browser.js");
    if (!res.ok) throw new Error("fetch failed");
    cachedPageFlipScript = await res.text();
  } catch {
    cachedPageFlipScript = "";
  }
  return cachedPageFlipScript;
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

const DEFAULT_SCALE = 2.5;

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

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);

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
  const pageFlipScript = await getPageFlipScript();
  const pagesJson = JSON.stringify(
    flipbook.pages.map((p) => ({
      pageNumber: p.pageNumber,
      imageDataUrl: p.imageDataUrl,
      width: p.width,
      height: p.height,
      text: p.text,
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
      <button id="header-fullscreen-btn" title="Fullscreen (F)">⛶</button>
    </div>
  </header>
  <main id="flipbook-container"></main>
  <div id="reading-mode" class="reading-mode hidden"></div>
  <div id="search-overlay" class="search-overlay hidden">
    <input id="search-input" type="search" placeholder="Search in book..." />
    <div id="search-results"></div>
    <button id="search-close">✕</button>
  </div>
  <div class="zoom-controls">
    <button id="zoom-out-btn" title="Zoom out (-)">−</button>
    <button id="zoom-reset-btn" title="Reset zoom (0)">100%</button>
    <button id="zoom-in-btn" title="Zoom in (+)">+</button>
    <button id="mode-btn" title="Toggle reading mode (R)">📖</button>
    <button id="fullscreen-btn" title="Fullscreen (F)">⛶</button>
  </div>
  <button id="search-btn" class="floating-btn" title="Search (S)">🔍</button>
</div>
<script>${pageFlipScript}</script>
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
html, body { width: 100%; height: 100%; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a1a; color: #fff; overflow: hidden; }
.flipbook-app { display: flex; flex-direction: column; width: 100vw; height: 100vh; height: 100dvh; }
.flipbook-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: rgba(0,0,0,0.8); border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10; }
.flipbook-header h1 { font-size: 16px; font-weight: 500; opacity: 0.9; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flipbook-controls { display: flex; align-items: center; gap: 8px; }
.flipbook-controls button { width: 36px; height: 36px; border: none; background: rgba(255,255,255,0.1); color: #fff; border-radius: 6px; cursor: pointer; font-size: 18px; transition: background 0.2s; }
.flipbook-controls button:hover { background: rgba(255,255,255,0.2); }
#page-indicator { min-width: 60px; text-align: center; font-variant-numeric: tabular-nums; font-size: 14px; }
#flipbook-container { flex: 1 1 auto; position: relative; background: #1a1a1a; overflow: auto; display: flex; align-items: flex-start; justify-content: center; padding: 20px; min-height: 0; -webkit-overflow-scrolling: touch; touch-action: pan-y pinch-zoom; overscroll-behavior: contain; }
#flipbook-container .stf__wrapper { transform-origin: top center; will-change: transform; }
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
.zoom-controls { position: fixed; bottom: 16px; left: 16px; display: flex; gap: 4px; background: rgba(20,20,20,0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 4px; backdrop-filter: blur(10px); z-index: 10; }
.zoom-controls button { min-width: 36px; height: 36px; padding: 0 10px; border: none; background: transparent; color: #fff; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
.zoom-controls button:hover { background: rgba(255,255,255,0.12); }
#zoom-reset-btn { font-size: 12px; font-variant-numeric: tabular-nums; }
@media (max-width: 640px) { .flipbook-header h1 { display: none; } .search-overlay { left: 16px; right: 16px; width: auto; } }
.reading-mode { flex: 1 1 auto; background: #2a2a2a; overflow-y: auto; overflow-x: hidden; padding: 16px; -webkit-overflow-scrolling: touch; touch-action: pan-y pinch-zoom; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.reading-mode.hidden { display: none; }
.reading-mode img { max-width: 100%; height: auto; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.5); border-radius: 2px; display: block; transform-origin: top center; transition: transform 0.1s; }
.reading-mode .page-label { position: sticky; top: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 999px; font-size: 11px; color: #fff; z-index: 5; align-self: center; margin-bottom: -4px; }
#flipbook-container.hidden { display: none; }
`;

const STANDALONE_JS = `
let pageFlip = null;
let pages = [];
let currentPage = 1;
let zoomLevel = 1;
let baseWidth = 0;
let baseHeight = 0;
let baseRatio = 0;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

function initFlipbook(pagesData, outline) {
  pages = pagesData;
  const container = document.getElementById('flipbook-container');

  const firstImg = new Image();
  firstImg.onload = function() {
    baseRatio = firstImg.naturalHeight / firstImg.naturalWidth;
    baseWidth = window.innerWidth < 640 ? window.innerWidth : Math.min(800, window.innerWidth - 40);
    baseHeight = baseWidth * baseRatio;

    createFlipbook();
    buildReadingMode();

    setupControls();
    setupSearch(outline);
    setupKeyboard();
    setupZoom();
    setupMode();
    updateZoomLabel();

    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        if (pageFlip) {
          try { pageFlip.update(); } catch(e) {}
        }
        applyZoom();
      }, 100);
    });

    window.addEventListener('resize', () => {
      baseWidth = Math.min(1200, window.innerWidth - 40);
      baseHeight = baseWidth * baseRatio;
      if (pageFlip) {
        try { pageFlip.update(); } catch(e) {}
        applyZoom();
      }
    });
  };
  firstImg.src = pagesData[0].imageDataUrl;
}

function createFlipbook() {
  const container = document.getElementById('flipbook-container');
  container.innerHTML = '';
  const w = baseWidth;
  const h = baseHeight;
  container.style.setProperty('--flip-w', w + 'px');
  container.style.setProperty('--flip-h', h + 'px');

  pageFlip = new St.PageFlip(container, {
    width: w,
    height: h,
    size: 'fixed',
    minWidth: w,
    maxWidth: w,
    minHeight: h,
    maxHeight: h,
    showCover: false,
    mobileScrollSupport: true,
    flippingTime: 600,
    usePortrait: true,
    startZIndex: 0,
    autoSize: false,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    useMouseEvents: true
  });

  pageFlip.loadFromImages(pages.map(p => p.imageDataUrl));

  pageFlip.on('flip', (e) => {
    currentPage = e.data + 1;
    updateIndicator();
  });

  setupPinchZoom(container);
  applyZoom();
}

function applyZoom() {
  const container = document.getElementById('flipbook-container');
  if (!container) return;
  const inner = container.querySelector('.stf__wrapper');
  if (!inner) return;
  inner.style.transform = 'scale(' + zoomLevel + ')';
  inner.style.transformOrigin = 'top center';
  inner.style.width = '100%';
  inner.style.minHeight = (baseHeight * zoomLevel) + 'px';
  applyReadingZoom();
  updateZoomLabel();
}

function applyReadingZoom() {
  const rm = document.getElementById('reading-mode');
  if (!rm) return;
  rm.querySelectorAll('img').forEach(img => {
    img.style.transform = 'scale(' + zoomLevel + ')';
  });
}

let readingMode = false;

function buildReadingMode() {
  const rm = document.getElementById('reading-mode');
  if (!rm) return;
  rm.innerHTML = '';
  pages.forEach((p, idx) => {
    const label = document.createElement('div');
    label.className = 'page-label';
    label.textContent = 'Page ' + p.pageNumber + ' / ' + pages.length;
    rm.appendChild(label);
    const img = document.createElement('img');
    img.src = p.imageDataUrl;
    img.alt = 'Page ' + p.pageNumber;
    img.loading = 'lazy';
    img.dataset.page = p.pageNumber;
    rm.appendChild(img);
  });
}

function setupMode() {
  const btn = document.getElementById('mode-btn');
  if (!btn) return;
  btn.onclick = toggleMode;
}

function toggleMode() {
  readingMode = !readingMode;
  const container = document.getElementById('flipbook-container');
  const rm = document.getElementById('reading-mode');
  const btn = document.getElementById('mode-btn');
  if (readingMode) {
    container.classList.add('hidden');
    rm.classList.remove('hidden');
    if (btn) btn.style.background = 'rgba(59,130,246,0.3)';
  } else {
    container.classList.remove('hidden');
    rm.classList.add('hidden');
    if (btn) btn.style.background = '';
  }
}

let pinchState = null;

function setupPinchZoom(container) {
  let lastTap = 0;
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchState = {
        startDist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
        startZoom: zoomLevel
      };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 300) {
        e.preventDefault();
        if (zoomLevel > 1.05) {
          zoomLevel = 1;
        } else {
          zoomLevel = Math.min(ZOOM_MAX, zoomLevel + 0.5);
        }
        applyZoom();
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pinchState) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / pinchState.startDist;
      const newZoom = pinchState.startZoom * ratio;
      zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
      applyZoom();
    }
  }, { passive: false });

  container.addEventListener('touchend', () => {
    pinchState = null;
  });

  container.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));
      applyZoom();
    }
  }, { passive: false });

  const rm = document.getElementById('reading-mode');
  if (rm) {
    rm.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));
        applyReadingZoom();
      }
    }, { passive: false });
  }
}

function updateIndicator() {
  document.getElementById('page-indicator').textContent = currentPage + ' / ' + pages.length;
}

function updateZoomLabel() {
  const btn = document.getElementById('zoom-reset-btn');
  if (btn) btn.textContent = Math.round(zoomLevel * 100) + '%';
}

function setupControls() {
  document.getElementById('prev-btn').onclick = () => pageFlip && pageFlip.flipPrev();
  document.getElementById('next-btn').onclick = () => pageFlip && pageFlip.flipNext();
  const fsBtn = document.getElementById('header-fullscreen-btn');
  if (fsBtn) {
    fsBtn.onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    };
  }
}

function setupZoom() {
  document.getElementById('zoom-out-btn').onclick = () => {
    zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2));
    applyZoom();
  };
  document.getElementById('zoom-in-btn').onclick = () => {
    zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2));
    applyZoom();
  };
  document.getElementById('zoom-reset-btn').onclick = () => {
    zoomLevel = 1;
    applyZoom();
  };
  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    fsBtn.onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    };
  }
}

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft' && pageFlip && !readingMode) pageFlip.flipPrev();
    else if (e.key === 'ArrowRight' && pageFlip && !readingMode) pageFlip.flipNext();
    else if (e.key.toLowerCase() === 's') toggleSearch();
    else if (e.key.toLowerCase() === 'r') toggleMode();
    else if (e.key.toLowerCase() === 'f') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
    else if (e.key === '+' || e.key === '=') {
      zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2));
      applyZoom();
    }
    else if (e.key === '-' || e.key === '_') {
      zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2));
      applyZoom();
    }
    else if (e.key === '0') {
      zoomLevel = 1;
      applyZoom();
    }
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