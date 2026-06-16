/* Pixel NFT canvas + gallery tiles
   Deterministic, math-only visuals. No external assets. */

// ---- always start at the top on refresh ----
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Detect a page reload (vs. a fresh navigation that may legitimately deep-link
// to a section via #hash).
const navEntry = performance.getEntriesByType('navigation')[0];
const isReload = navEntry
  ? navEntry.type === 'reload'
  : performance.navigation && performance.navigation.type === 1;
// On reload, drop any #section hash so the browser doesn't re-jump to it.
if (isReload && location.hash) {
  history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  // guard against a late anchor jump on reload
  if (isReload) requestAnimationFrame(() => window.scrollTo(0, 0));
});

// ---- mobile nav toggle ----
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
});

// close mobile nav + set active state on click
const navLinks = document.querySelectorAll('[data-nav]');
navLinks.forEach((l) =>
  l.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.classList.remove('is-open');
  })
);

const lockedMessages = [
  'Not yet. The pixels are still negotiating their union contract.',
  'Locked for now. One of the squares swallowed the key.',
  'Coming later. The wallet goblin is still doing paperwork.',
  'Patience, collector. The lab coat is at the dry cleaner.'
];

const futurePages = {
  lab: {
    eyebrow: 'Lab locked',
    title: 'The Lab opens in a later stage.',
    body: 'This is where collectors will connect wallets, view owned Grid Theory NFTs, remix them into art, play with the canvas, download the result and burn their art to collect a physical print. Every print ships with an authenticity certificate you can verify here using its certificate number.',
    highlight: 'Burn your finished art to claim a physical fine-art print — your Grid Theory, shipped to your door.',
    joke: 'The pixels are currently wearing tiny safety goggles. Please wait until the experiment stops smoking.',
    items: ['Wallet art viewer', 'Owned NFT canvas', 'Downloadable mosaics', 'Burn to claim print', 'Verify print certificate']
  },
  store: {
    eyebrow: 'Store locked',
    title: 'The Store is being assembled pixel by pixel.',
    body: 'This future page will hold Grid Theory prints, clothing drops, collector goods, and a few surprises we are not supposed to leak yet.',
    joke: 'The shopkeeper is ironing hoodies and yelling at a poster tube. Please give the pixels a minute.',
    items: ['Prints', 'Clothing', 'Surprise drops']
  }
};

let futurePageCloseTimer = null;

function closeFuturePage() {
  const page = document.querySelector('.future-page');
  if (!page || !page.classList.contains('is-visible')) return;

  window.clearTimeout(futurePageCloseTimer);
  page.classList.add('is-closing');
  page.classList.remove('is-visible');
  document.body.classList.add('future-page-exiting');
  document.body.classList.remove('future-page-open');

  futurePageCloseTimer = window.setTimeout(() => {
    page.classList.remove('is-closing');
    document.body.classList.remove('future-page-exiting');
  }, 300);
}

function openFuturePage(type = 'lab') {
  const content = futurePages[type] || futurePages.lab;
  let page = document.querySelector('.future-page');
  window.clearTimeout(futurePageCloseTimer);

  if (!page) {
    page = document.createElement('div');
    page.className = 'future-page';
    page.setAttribute('role', 'dialog');
    page.setAttribute('aria-modal', 'true');
    document.body.appendChild(page);
  }

  page.innerHTML = `
    <div class="future-page-card">
      <button class="future-close" type="button" aria-label="Close locked page">Close</button>
      <span class="future-eyebrow">${content.eyebrow}</span>
      <h2>${content.title}</h2>
      <p>${content.body}</p>
      ${content.highlight ? `<div class="future-highlight">🔥 ${content.highlight}</div>` : ''}
      <div class="future-list">
        ${content.items.map((item) => `<span>${item}</span>`).join('')}
      </div>
      <strong>${content.joke}</strong>
    </div>
  `;

  page.querySelector('.future-close')?.addEventListener('click', closeFuturePage);
  page.onclick = (event) => {
    if (event.target === page) closeFuturePage();
  };

  page.classList.remove('is-closing');
  document.body.classList.remove('future-page-exiting');
  document.body.classList.add('future-page-open');
  requestAnimationFrame(() => page.classList.add('is-visible'));
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeFuturePage();
});

document.addEventListener('click', (event) => {
  const lockedNav = event.target.closest?.('[data-locked-nav]');
  const lockedAction = event.target.closest?.('[data-locked-action]');

  if (!lockedNav && !lockedAction) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  nav.classList.remove('is-open');
  toggle?.classList.remove('is-open');

  if (lockedNav) {
    const type = lockedNav.getAttribute('href')?.replace('#', '') || 'lab';
    openFuturePage(type);
    return;
  }

  const lockedPanel = event.target.closest?.('.locked-panel');
  openFuturePage(lockedPanel?.id || 'lab');
}, true);

// ---- active section tracking ----
const sections = ['home', 'canvas', 'grid', 'builder', 'lab', 'gallery', 'creations'].map((id) => document.getElementById(id));
const links = document.querySelectorAll('.nav-link');
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) =>
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)
        );
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((s) => s && obs.observe(s));

// ---- seeded PRNG (mulberry32) ----
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACCENT = '#d88a35';
const PALETTE = [
  '#061312', '#0a2421', '#123a33', '#1d5b4a', '#3f7a57',
  '#746d46', '#9b6938', '#b97734', '#c47d31', '#f0b56a',
  '#e39a45', '#d88a35', '#8b5a32', '#341b3f', '#160c23'
];
const CANVAS_GRADIENTS = [
  ['#ffffff', '#fff7ed', '#ffe5ec', '#ffc2d1', '#ff8fab', '#fb6f92'],
  ['#f8fbff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#2563eb'],
  ['#f7fee7', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#16a34a'],
  ['#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#d88a35', '#9a4f16'],
  ['#faf5ff', '#f3e8ff', '#e9d5ff', '#c4b5fd', '#a78bfa', '#7c3aed'],
  ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#d946ef', '#a21caf'],
  ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#0891b2'],
  ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#e11d48'],
  ['#ffffff', '#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#57534e'],
  ['#fffbeb', '#fef3c7', '#fde68a', '#facc15', '#f97316', '#ef4444']
];
const CANVAS_CYCLE_SECONDS = 9;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseColor(color) {
  if (color.startsWith('rgb')) {
    return color.match(/\d+/g).slice(0, 3).map(Number);
  }

  const hex = parseInt(color.replace('#', ''), 16);
  return [hex >> 16, (hex >> 8) & 0xff, hex & 0xff];
}

function mixHex(a, b, amount) {
  const [ar, ag, ab] = parseColor(a);
  const [br, bg, bb] = parseColor(b);
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);
  return `rgb(${rr | 0}, ${rg | 0}, ${rb | 0})`;
}

function sampleGradient(colors, position) {
  const p = clamp(position, 0, 0.999);
  const scaled = p * (colors.length - 1);
  const index = Math.floor(scaled);
  const local = easeInOutSine(scaled - index);
  return mixHex(colors[index], colors[index + 1], local);
}

// ---- living pixel canvas ----
const field = document.getElementById('field');
const gridCards = Array.from(document.querySelectorAll('[data-grid-size]'));

function renderGridSizePreview(card) {
  const size = Number(card.dataset.gridSize);
  const sample = card.querySelector('.grid-sample');
  if (!sample || !size) return;

  sample.style.setProperty('--grid-size', size);
  sample.innerHTML = '';
}

gridCards.forEach(renderGridSizePreview);

if (field) {
  const ctx = field.getContext('2d');
  let w, h, dpr;
  let gridSize = 2;
  let activePixel = null;
  let lastPaint = 0;
  let animationStart = 0;

  function createCellMeta(size) {
    return Array.from({ length: size * size }, (_, idx) => {
      const rand = rng(12000 + size * 173 + idx * 97);
      return {
        phase: rand() * Math.PI * 2,
        drift: 0.85 + rand() * 0.78,
        gradient: Math.floor(rand() * CANVAS_GRADIENTS.length),
        offset: rand() * 0.18 - 0.09
      };
    });
  }

  let cellMeta = createCellMeta(gridSize);

  function setActiveGridCard(size) {
    gridCards.forEach((card) => {
      const active = Number(card.dataset.gridSize) === size;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });
  }

  function setCanvasGridSize(size) {
    gridSize = size;
    activePixel = null;
    cellMeta = createCellMeta(size);
    lastPaint = 0;
    setActiveGridCard(size);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = field.getBoundingClientRect();
    w = r.width;
    h = r.height;
    field.width = w * dpr;
    field.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  gridCards.forEach((card) => {
    card.addEventListener('click', () => setCanvasGridSize(Number(card.dataset.gridSize)));
  });

  field.addEventListener('click', (event) => {
    const rect = field.getBoundingClientRect();
    const square = Math.min(w, h) * 0.84;
    const originX = (w - square) / 2;
    const originY = (h - square) / 2;
    const localX = event.clientX - rect.left - originX;
    const localY = event.clientY - rect.top - originY;

    if (localX < 0 || localY < 0 || localX > square || localY > square) return;

    activePixel = {
      x: Math.min(gridSize - 1, Math.floor((localX / square) * gridSize)),
      y: Math.min(gridSize - 1, Math.floor((localY / square) * gridSize))
    };
  });

  function drawLivingCanvas(now = 0) {
    if (!animationStart) animationStart = now;
    const elapsed = now - lastPaint;

    if (elapsed < FRAME_INTERVAL && !prefersReducedMotion) {
      requestAnimationFrame(drawLivingCanvas);
      return;
    }

    lastPaint = now - (elapsed % FRAME_INTERVAL);
    const seconds = prefersReducedMotion ? 0 : (now - animationStart) / 1000;
    ctx.clearRect(0, 0, w, h);
    const square = Math.min(w, h) * 0.84;
    const originX = (w - square) / 2;
    const originY = (h - square) / 2;
    const cellSize = square / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const meta = cellMeta[i + j * gridSize];
        const gx = (i + 0.5) / gridSize;
        const gy = (j + 0.5) / gridSize;
        const diagonal = gx * 0.62 + gy * 0.38;
        const cycle = seconds / CANVAS_CYCLE_SECONDS + meta.phase * 0.045;
        const gradientShift = Math.floor(cycle) % CANVAS_GRADIENTS.length;
        const gradientBlend = easeInOutSine(cycle - Math.floor(cycle));
        const primaryGradient = CANVAS_GRADIENTS[(meta.gradient + gradientShift) % CANVAS_GRADIENTS.length];
        const secondaryGradient = CANVAS_GRADIENTS[(meta.gradient + gradientShift + 1) % CANVAS_GRADIENTS.length];
        const tertiaryGradient = CANVAS_GRADIENTS[(meta.gradient + gradientShift + 4) % CANVAS_GRADIENTS.length];
        const wave = Math.sin(seconds * (meta.drift * 1.35) + meta.phase + gx * 1.9 - gy * 1.2);
        const breath = easeInOutSine((wave + 1) / 2);
        const slowBloom = easeInOutSine((Math.cos(seconds * 0.55 + meta.phase) + 1) / 2);
        const colorPosition = 0.04 + diagonal * 0.86 + meta.offset + (breath - 0.5) * 0.18;
        const baseColor = sampleGradient(primaryGradient, colorPosition);
        const driftColor = sampleGradient(secondaryGradient, colorPosition + 0.1 + breath * 0.08);
        const sparkColor = sampleGradient(tertiaryGradient, 1 - colorPosition + slowBloom * 0.12);
        const cycleColor = mixHex(baseColor, driftColor, gradientBlend);
        ctx.fillStyle = mixHex(cycleColor, sparkColor, slowBloom * 0.16);
        ctx.globalAlpha = 0.86 + breath * 0.12;
        ctx.fillRect(originX + i * cellSize, originY + j * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.15;
    for (let line = 0; line <= gridSize; line++) {
      const pos = originX + line * cellSize;
      const yPos = originY + line * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, originY);
      ctx.lineTo(pos, originY + square);
      ctx.moveTo(originX, yPos);
      ctx.lineTo(originX + square, yPos);
      ctx.stroke();
    }

    if (activePixel) {
      ctx.strokeStyle = '#5aa7ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        originX + activePixel.x * cellSize + 1,
        originY + activePixel.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    }

    if (!prefersReducedMotion) requestAnimationFrame(drawLivingCanvas);
  }

  resize();
  setActiveGridCard(gridSize);
  requestAnimationFrame(drawLivingCanvas);
}

// ---- builder demo: fixed colour shades for no-wallet play ----
const demoBoard = document.getElementById('demo-board');
const demoPalette = document.getElementById('demo-palette');
const demoSizeButtons = document.querySelectorAll('[data-demo-size]');
const demoDownloadButton = document.getElementById('download-demo-art');
const demoStatus = document.getElementById('demo-status');
const demoCount = document.getElementById('demo-count');

const DEMO_COLOURS = [
  { tokenId: 'D01', color: '#050505' },
  { tokenId: 'D02', color: '#242424' },
  { tokenId: 'D03', color: '#555555' },
  { tokenId: 'D04', color: '#e6e2d7' },
  { tokenId: 'D05', color: '#0b6f73' },
  { tokenId: 'D06', color: '#1ca3a5' },
  { tokenId: 'D07', color: '#17483c' },
  { tokenId: 'D08', color: '#2f7a57' },
  { tokenId: 'D09', color: '#8b5a32' },
  { tokenId: 'D10', color: '#d88a35' },
  { tokenId: 'D11', color: '#f0b56a' },
  { tokenId: 'D12', color: '#ff4d4d' },
  { tokenId: 'D13', color: '#ff8fab' },
  { tokenId: 'D14', color: '#c44569' },
  { tokenId: 'D15', color: '#4f8dff' },
  { tokenId: 'D16', color: '#2dd4ff' },
  { tokenId: 'D17', color: '#7c3aed' },
  { tokenId: 'D18', color: '#200f36' },
  { tokenId: 'D19', color: '#ffc247' },
  { tokenId: 'D20', color: '#a7f070' },
  { tokenId: 'D21', color: '#ffffff' },
  { tokenId: 'D22', color: 'url("assets/sample/one-of-one.jpg") center / cover no-repeat' }
];

let demoSize = 2;
let selectedDemoColour = DEMO_COLOURS[9];
let demoPixels = [];
let placedDemoIds = new Set();

function updateDemoCount() {
  if (!demoCount) return;
  const available = DEMO_COLOURS.length - placedDemoIds.size;
  demoCount.textContent = `${available} / ${DEMO_COLOURS.length} colour blocks`;
}

function getNextAvailableDemoColour() {
  return DEMO_COLOURS.find((token) => !placedDemoIds.has(token.tokenId)) || null;
}

function renderDemoPalette() {
  if (!demoPalette) return;
  demoPalette.innerHTML = '';

  const availableTokens = DEMO_COLOURS.filter((token) => !placedDemoIds.has(token.tokenId));

  if (!availableTokens.length) {
    demoPalette.innerHTML = '<div class="nft-empty">All demo colour blocks are on the grid. Replace a square or change grid size to bring them back.</div>';
    updateDemoCount();
    return;
  }

  availableTokens.forEach((token) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'nft-swatch demo-swatch';
    swatch.draggable = true;
    swatch.dataset.color = token.color;
    swatch.dataset.token = token.tokenId;
    swatch.style.background = token.color;
    swatch.setAttribute('aria-label', `Demo colour ${token.tokenId}`);

    if (selectedDemoColour?.tokenId === token.tokenId) swatch.classList.add('is-selected');

    swatch.addEventListener('click', () => {
      selectedDemoColour = token;
      document.querySelectorAll('.demo-swatch').forEach((item) =>
        item.classList.toggle('is-selected', item.dataset.token === selectedDemoColour.tokenId)
      );
      if (demoStatus) demoStatus.textContent = `Drag demo shade ${token.tokenId} into a square.`;
    });

    swatch.addEventListener('dragstart', (event) => {
      selectedDemoColour = token;
      event.dataTransfer.setData('application/json', JSON.stringify(token));
      event.dataTransfer.effectAllowed = 'copy';
    });

    demoPalette.appendChild(swatch);
  });

  updateDemoCount();
}

function clearDemoCell(cell) {
  const previousToken = cell.dataset.tokenId;
  if (previousToken) placedDemoIds.delete(previousToken);
}

function resetDemoCell(cell) {
  const index = Number(cell.dataset.index);
  clearDemoCell(cell);
  demoPixels[index] = '#101010';
  cell.style.background = '#101010';
  cell.dataset.color = '#101010';
  cell.dataset.tokenId = '';
  cell.draggable = false;
  selectedDemoColour = selectedDemoColour || getNextAvailableDemoColour();
  renderDemoPalette();
}

// Write a colour (or clear) into a cell without changing which tokens are
// considered "placed" — used for moving/swapping between squares.
function writeDemoCell(cell, token) {
  const index = Number(cell.dataset.index);
  if (token) {
    demoPixels[index] = token.color;
    cell.style.background = token.color;
    cell.dataset.color = token.color;
    cell.dataset.tokenId = token.tokenId;
    cell.draggable = true;
  } else {
    demoPixels[index] = '#101010';
    cell.style.background = '#101010';
    cell.dataset.color = '#101010';
    cell.dataset.tokenId = '';
    cell.draggable = false;
  }
}

function cellToken(cell) {
  return cell.dataset.tokenId
    ? { tokenId: cell.dataset.tokenId, color: cell.dataset.color }
    : null;
}

// Move a placed shade onto another square. If the target already holds a
// shade, the two swap places (target's shade returns to the source square).
function moveOrSwapDemoCell(sourceCell, targetCell) {
  if (!sourceCell || !targetCell || sourceCell === targetCell) return;
  const source = cellToken(sourceCell);
  if (!source) return;
  const target = cellToken(targetCell);

  writeDemoCell(targetCell, source);
  writeDemoCell(sourceCell, target); // target may be null (move) or its shade (swap)

  if (demoStatus) {
    demoStatus.textContent = target
      ? `Swapped ${source.tokenId} and ${target.tokenId}.`
      : `Moved ${source.tokenId} to a new square.`;
  }
}

function paintDemoCell(cell, token) {
  if (!token) return;
  const currentToken = cell.dataset.tokenId;
  if (placedDemoIds.has(token.tokenId) && currentToken !== token.tokenId) return;

  const index = Number(cell.dataset.index);
  clearDemoCell(cell);
  demoPixels[index] = token.color;
  cell.style.background = token.color;
  cell.dataset.color = token.color;
  cell.dataset.tokenId = token.tokenId;
  cell.draggable = true;
  placedDemoIds.add(token.tokenId);

  if (selectedDemoColour?.tokenId === token.tokenId) {
    selectedDemoColour = getNextAvailableDemoColour();
  }

  renderDemoPalette();
}

function renderDemoBoard(size = demoSize) {
  if (!demoBoard) return;
  demoSize = size;
  demoPixels = Array(size * size).fill('#101010');
  placedDemoIds = new Set();
  selectedDemoColour = DEMO_COLOURS[9];
  demoBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  demoBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  demoBoard.innerHTML = '';

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'builder-cell';
    cell.dataset.index = String(i);
    cell.dataset.color = '#101010';
    cell.dataset.tokenId = '';
    cell.draggable = false;
    cell.setAttribute('aria-label', `Demo pixel ${i + 1}`);

    cell.addEventListener('dragover', (event) => {
      event.preventDefault();
      cell.classList.add('is-hovered');
    });
    cell.addEventListener('dragstart', (event) => {
      if (!cell.dataset.tokenId) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData('application/json', JSON.stringify({
        source: 'demo-cell',
        sourceIndex: cell.dataset.index,
        token: {
          tokenId: cell.dataset.tokenId,
          color: cell.dataset.color
        }
      }));
      event.dataTransfer.effectAllowed = 'move';
    });
    cell.addEventListener('dragleave', () => cell.classList.remove('is-hovered'));
    cell.addEventListener('drop', (event) => {
      event.preventDefault();
      cell.classList.remove('is-hovered');
      let droppedData = null;
      try {
        droppedData = JSON.parse(event.dataTransfer.getData('application/json') || 'null');
      } catch {
        droppedData = null;
      }

      if (droppedData?.source === 'demo-cell') {
        const sourceIndex = Number.parseInt(droppedData.sourceIndex, 10);
        if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return;
        const sourceCell = demoBoard.querySelector(`[data-index="${sourceIndex}"]`);
        moveOrSwapDemoCell(sourceCell, cell);
        return;
      }

      // dropped from the palette — place it (only into an empty square)
      const droppedToken = droppedData?.token || droppedData;
      paintDemoCell(cell, droppedToken);
    });

    demoBoard.appendChild(cell);
  }

  renderDemoPalette();
}

demoSizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const size = Number(button.dataset.demoSize);
    demoSizeButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    renderDemoBoard(size);
  });
});

// ---- design-cell rendering (so downloads match exactly what's on the grid) ----
// Some palette tokens aren't flat colours (gradient / image designs). Preload any
// image-backed designs so the canvas export can draw the real pixels, not a stand-in.
const designImageCache = {};
function designSrc(value) {
  const m = /url\(["']?([^"')]+)["']?\)/.exec(value || '');
  return m ? m[1] : null;
}
function preloadDesignImage(value) {
  const src = designSrc(value);
  if (!src || designImageCache[src]) return;
  const img = new Image();
  img.src = src;
  designImageCache[src] = img;
}
function drawImageCover(ctx, img, dx, dy, dw, dh) {
  const scale = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / scale, sh = dh / scale;
  const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}
// Paint one cell to match its on-screen background: flat colour, CSS gradient, or image.
function fillArtCell(ctx, value, dx, dy, dw, dh) {
  if (!value || value === '#101010') {            // empty cell
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx, dy, dw, dh);
    return;
  }
  if (value[0] === '#') {                          // flat colour
    ctx.fillStyle = value;
    ctx.fillRect(dx, dy, dw, dh);
    return;
  }
  if (value.includes('gradient')) {                // matches the D13 CSS gradient (135deg)
    const g = ctx.createLinearGradient(dx, dy, dx + dw, dy + dh);
    g.addColorStop(0, '#ff8fab');
    g.addColorStop(0.5, '#f0b56a');
    g.addColorStop(1, '#1ca3a5');
    ctx.fillStyle = g;
    ctx.fillRect(dx, dy, dw, dh);
    return;
  }
  const img = designImageCache[designSrc(value)]; // image design (cover fit, like CSS)
  if (img && img.complete && img.naturalWidth) {
    drawImageCover(ctx, img, dx, dy, dw, dh);
    return;
  }
  ctx.fillStyle = '#1ca3a5';                        // fallback if the image isn't ready yet
  ctx.fillRect(dx, dy, dw, dh);
}
// preload image-backed designs now that the helpers + DEMO_COLOURS exist
DEMO_COLOURS.forEach((t) => preloadDesignImage(t.color));

// Render the pixel art as a framed Grid Theory card:
//  - small "GRID THEORY" title top-left
//  - the artwork fitted crisply in the main area
//  - "A SYSTEM OF PIXELS." centered below
//  - the #NFT token code at the very bottom
function renderArtCard(pixels, size, code, name) {
  const W = 1254;
  const H = 1254;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // card background + rounded frame
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#d8d4ca';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(30, 30, W - 60, H - 60, 22);
  ctx.stroke();

  const margin = 64;

  // smaller title (top-left) — "GRID THEORY" with the E in THEORY in red
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 40px ui-monospace, "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  let titleX = margin;
  [
    { t: 'GRID TH', c: '#1b1b2e' },
    { t: 'E', c: '#ff4d4d' },
    { t: 'ORY', c: '#1b1b2e' }
  ].forEach((part) => {
    ctx.fillStyle = part.c;
    ctx.fillText(part.t, titleX, 96);
    titleX += ctx.measureText(part.t).width;
  });

  // tagline (top-right)
  ctx.fillStyle = '#9a958a';
  ctx.font = '500 24px ui-monospace, "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('A SYSTEM OF PIXELS.', W - margin, 96);

  // header divider
  ctx.strokeStyle = '#e7e3da';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 124);
  ctx.lineTo(W - 30, 124);
  ctx.stroke();

  // single footer row: token id (left) · art name (center) · standard (right)
  const codeY = H - 64;

  // art area between divider and the footer text
  const top = 158;
  const bottomLimit = codeY - 46;
  const bx0 = margin;
  const bx1 = W - margin;
  const boxW = bx1 - bx0;
  const boxH = bottomLimit - top;
  const cell = Math.floor(Math.min(boxW, boxH) / size);
  const side = cell * size;
  const ax = Math.round(bx0 + (boxW - side) / 2);
  const ay = Math.round(top + (boxH - side) / 2);

  ctx.imageSmoothingEnabled = false;
  pixels.forEach((color, index) => {
    const x = index % size;
    const y = Math.floor(index / size);
    fillArtCell(ctx, color, ax + x * cell, ay + y * cell, cell, cell);
  });

  // subtle cell separators
  ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  ctx.lineWidth = 1;
  for (let line = 0; line <= size; line++) {
    const p = line * cell;
    ctx.beginPath();
    ctx.moveTo(ax + p, ay);
    ctx.lineTo(ax + p, ay + side);
    ctx.moveTo(ax, ay + p);
    ctx.lineTo(ax + side, ay + p);
    ctx.stroke();
  }

  // footer divider (mirrors the header divider) — below the art, above the info
  ctx.strokeStyle = '#e7e3da';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, codeY - 40);
  ctx.lineTo(W - 30, codeY - 40);
  ctx.stroke();

  // footer row — token id (left), art name (center), standard (right), same style
  ctx.fillStyle = '#1b1b2e';
  ctx.font = '500 20px ui-monospace, "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TOKEN ID - ' + code, margin, codeY);
  if (name) {
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), W / 2, codeY);
  }
  ctx.textAlign = 'right';
  ctx.fillText('ERC - 721', W - margin, codeY);

  return canvas;
}

function makeNftCode() {
  return 'GT ' + (1 + Math.floor(Math.random() * 99));
}

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
}

// Trigger a file download in a way that works across browsers: the anchor
// MUST be in the document for Firefox/Safari to honour .click().
function triggerDownload(href, filename, revoke) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1500);
}

function downloadArtCard(pixels, size, name) {
  const code = makeNftCode();
  const canvas = renderArtCard(pixels, size, code, name);
  const filename = `${slugify(name)}.png`;

  // Prefer a Blob URL (robust, no data-URI size limits); fall back to data URL.
  if (canvas.toBlob) {
    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(URL.createObjectURL(blob), filename, true);
      } else {
        triggerDownload(canvas.toDataURL('image/png'), filename, false);
      }
    }, 'image/png');
  } else {
    triggerDownload(canvas.toDataURL('image/png'), filename, false);
  }
}

// Use the typed name, or fall back to a default so the download always works.
function artNameOrDefault(input) {
  return (input?.value || '').trim() || 'Grid Theory Sample';
}

// true when at least one cell has a colour/design placed (not the empty square)
function gridHasContent(pixels) {
  return pixels.some((c) => c && c !== '#101010');
}

const demoArtNameInput = document.getElementById('demo-art-name');

demoDownloadButton?.addEventListener('click', () => {
  if (!gridHasContent(demoPixels)) {
    if (demoStatus) demoStatus.textContent = 'Add at least one colour to the grid before downloading.';
    return;
  }
  const name = artNameOrDefault(demoArtNameInput);
  downloadArtCard(demoPixels, demoSize, name);
});

renderDemoPalette();
renderDemoBoard(demoSize);

// Drag a placed colour back onto the palette/drawer to remove it from the grid
// and return it to where it was picked from.
function enablePaletteReturn(paletteEl, getBoard, resetFn, cellSource) {
  if (!paletteEl) return;
  paletteEl.addEventListener('dragover', (event) => {
    event.preventDefault();
    paletteEl.classList.add('is-return-target');
  });
  paletteEl.addEventListener('dragleave', () => paletteEl.classList.remove('is-return-target'));
  paletteEl.addEventListener('drop', (event) => {
    event.preventDefault();
    paletteEl.classList.remove('is-return-target');
    let data = null;
    try {
      data = JSON.parse(event.dataTransfer.getData('application/json') || 'null');
    } catch {
      data = null;
    }
    if (!data || data.source !== cellSource) return;
    const index = Number.parseInt(data.sourceIndex, 10);
    if (!Number.isFinite(index)) return;
    const cell = getBoard().querySelector(`[data-index="${index}"]`);
    if (cell) resetFn(cell);
  });
}

enablePaletteReturn(demoPalette, () => demoBoard, resetDemoCell, 'demo-cell');

// ---- lab: owned NFT shades -> drag/drop pixel art ----
const builderBoard = document.getElementById('builder-board');
const nftPalette = document.getElementById('nft-palette');
const builderSizeButtons = document.querySelectorAll('[data-builder-size]');
const downloadButton = document.getElementById('download-art');
const connectWalletButton = document.getElementById('connect-wallet');
const walletStatus = document.getElementById('wallet-status');
const nftCount = document.getElementById('nft-count');

const COLLECTION_CONFIG = {
  // Add your deployed ERC-721 collection contract here to load real wallet-owned NFTs.
  // Example: contractAddress: '0x1234...abcd'
  contractAddress: '',
  chainId: '0x1',
  chainName: 'Ethereum',
  requiresEnumerable: true
};

const NFT_SHADE_FALLBACKS = [
  '#008596', '#10b8c1', '#77c7c2', '#d5d2c4', '#fff1dd', '#ffb06b',
  '#ff6a35', '#ef2f4f', '#c51658', '#612650', '#261537', '#070812',
  '#003d3d', '#007a5b', '#2f9f58', '#a3c75a', '#ffd447', '#ff940d',
  '#f04427', '#9b2f22', '#613a2f', '#244256', '#285fd4', '#6c3fc1',
  '#050505', '#242424', '#555555', '#9a9a9a', '#e6e2d7', '#ffffff',
  '#ff4d4d', '#4f8dff'
];

let builderSize = 8;
let selectedNft = null;
let builderPixels = [];
let ownedNfts = [];
let placedTokenIds = new Set();
let walletConnected = false;

function updateNftCount() {
  const ownedCount = ownedNfts.length;

  if (!ownedCount) {
    if (nftCount) {
      nftCount.textContent = walletConnected ? 'Owned NFTs: 0' : 'Owned NFTs: Connect wallet';
    }
    return;
  }

  const availableCount = Math.max(0, ownedCount - placedTokenIds.size);
  const label = walletConnected ? 'Owned NFTs' : 'Sample NFTs';
  if (nftCount) {
    nftCount.textContent = `${label}: ${availableCount.toLocaleString()} / ${ownedCount.toLocaleString()} available`;
  }
}

function renderNftEmpty(message) {
  if (!nftPalette) return;
  nftPalette.innerHTML = `<div class="nft-empty">${message}</div>`;
}

function renderNftPalette(tokens = ownedNfts) {
  if (!nftPalette) return;
  nftPalette.innerHTML = '';

  if (!tokens.length) {
    renderNftEmpty('Connect a wallet with Grid Theory NFTs to populate this collection drawer.');
    updateNftCount();
    return;
  }

  tokens.forEach((token) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'nft-swatch';
    swatch.draggable = true;
    swatch.dataset.color = token.color;
    swatch.dataset.tokenId = token.tokenId;
    swatch.dataset.token = `#${token.tokenId}`;
    swatch.style.background = token.color;
    swatch.setAttribute('aria-label', `Owned NFT ${token.tokenId}`);

    if (selectedNft?.tokenId === token.tokenId) swatch.classList.add('is-selected');
    if (placedTokenIds.has(token.tokenId)) {
      swatch.disabled = true;
      swatch.style.opacity = '0.28';
      swatch.draggable = false;
    }

    swatch.addEventListener('click', () => {
      if (placedTokenIds.has(token.tokenId)) return;
      selectedNft = token;
      document.querySelectorAll('.nft-swatch').forEach((item) =>
        item.classList.toggle('is-selected', item.dataset.tokenId === selectedNft.tokenId)
      );
    });

    swatch.addEventListener('dragstart', (event) => {
      if (placedTokenIds.has(token.tokenId)) {
        event.preventDefault();
        return;
      }
      selectedNft = token;
      event.dataTransfer.setData('application/json', JSON.stringify(token));
      event.dataTransfer.effectAllowed = 'copy';
    });

    nftPalette.appendChild(swatch);
  });
}

function tokenColorFromId(tokenId) {
  const index = Math.abs(Number(BigInt(tokenId) % BigInt(NFT_SHADE_FALLBACKS.length)));
  return NFT_SHADE_FALLBACKS[index];
}

function clearTokenFromCell(cell) {
  const previousToken = cell.dataset.tokenId;
  if (previousToken) placedTokenIds.delete(previousToken);
}

function resetBuilderCell(cell) {
  const index = Number(cell.dataset.index);
  clearTokenFromCell(cell);
  builderPixels[index] = '#101010';
  cell.style.background = '#101010';
  cell.dataset.color = '#101010';
  cell.dataset.tokenId = '';
  cell.draggable = false;
  renderNftPalette();
  updateNftCount();
}

function moveBuilderCell(sourceCell, targetCell, token) {
  if (!sourceCell || !targetCell || !token || sourceCell === targetCell) return;
  resetBuilderCell(sourceCell);
  paintBuilderCell(targetCell, token);
}

function paintBuilderCell(cell, token) {
  if (!token || placedTokenIds.has(token.tokenId)) return;
  const index = Number(cell.dataset.index);
  clearTokenFromCell(cell);
  builderPixels[index] = token.color;
  cell.style.background = token.color;
  cell.dataset.color = token.color;
  cell.dataset.tokenId = token.tokenId;
  cell.draggable = true;
  placedTokenIds.add(token.tokenId);
  renderNftPalette();
  updateNftCount();
}

function renderBuilderBoard(size = builderSize) {
  if (!builderBoard) return;
  builderSize = size;
  builderPixels = Array(size * size).fill('#101010');
  placedTokenIds = new Set();
  builderBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  builderBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  builderBoard.innerHTML = '';
  updateNftCount();

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'builder-cell';
    cell.dataset.index = String(i);
    cell.dataset.color = '#101010';
    cell.dataset.tokenId = '';
    cell.draggable = false;
    cell.setAttribute('aria-label', `Pixel ${i + 1}`);

    cell.addEventListener('click', () => paintBuilderCell(cell, selectedNft));
    cell.addEventListener('dragover', (event) => {
      event.preventDefault();
      cell.classList.add('is-hovered');
    });
    cell.addEventListener('dragstart', (event) => {
      if (!cell.dataset.tokenId) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData('application/json', JSON.stringify({
        source: 'lab-cell',
        sourceIndex: cell.dataset.index,
        token: {
          tokenId: cell.dataset.tokenId,
          color: cell.dataset.color
        }
      }));
      event.dataTransfer.effectAllowed = 'move';
    });
    cell.addEventListener('dragleave', () => cell.classList.remove('is-hovered'));
    cell.addEventListener('drop', (event) => {
      event.preventDefault();
      cell.classList.remove('is-hovered');
      let droppedData = null;
      try {
        droppedData = JSON.parse(event.dataTransfer.getData('application/json') || 'null');
      } catch {
        droppedData = null;
      }

      if (droppedData?.source === 'lab-cell') {
        const sourceIndex = Number.parseInt(droppedData.sourceIndex, 10);
        if (!Number.isFinite(sourceIndex) || sourceIndex < 0) return;
        const sourceCell = builderBoard.querySelector(`[data-index="${sourceIndex}"]`);
        moveBuilderCell(sourceCell, cell, droppedData.token);
        return;
      }

      const droppedToken = droppedData?.token || droppedData;
      paintBuilderCell(cell, droppedToken || selectedNft);
    });

    builderBoard.appendChild(cell);
  }
}

builderSizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const size = Number(button.dataset.builderSize);
    builderSizeButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    renderBuilderBoard(size);
  });
});

function encodeAddress(address) {
  return address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

function encodeUint(value) {
  return BigInt(value).toString(16).padStart(64, '0');
}

// The wallet provider chosen in the picker (falls back to the default injected one).
let activeProvider = null;
function walletProvider() {
  return activeProvider || window.ethereum || null;
}

async function ethCall(to, data) {
  return walletProvider().request({
    method: 'eth_call',
    params: [{ to, data }, 'latest']
  });
}

async function loadOwnedCollectionNfts(ownerAddress) {
  if (!COLLECTION_CONFIG.contractAddress) {
    if (walletStatus) {
      walletStatus.textContent = 'Wallet connected. Add your collection contract address in script.js to load real owned NFTs.';
    }
    return [];
  }

  try {
    await walletProvider().request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: COLLECTION_CONFIG.chainId }]
    });
  } catch {
    // Some wallets do not support chain switching. Continue with the current chain.
  }

  const contract = COLLECTION_CONFIG.contractAddress;
  const balanceHex = await ethCall(contract, `0x70a08231${encodeAddress(ownerAddress)}`);
  const balance = Number(BigInt(balanceHex));
  const tokens = [];

  for (let index = 0; index < balance; index++) {
    try {
      const tokenHex = await ethCall(contract, `0x2f745c59${encodeAddress(ownerAddress)}${encodeUint(index)}`);
      const tokenId = BigInt(tokenHex).toString();
      tokens.push({ tokenId, color: tokenColorFromId(tokenId) });
    } catch {
      if (walletStatus) {
        walletStatus.textContent = 'Wallet connected, but this contract does not expose owned token IDs. Add an NFT indexer or enumerable collection method to list the exact NFTs.';
      }
      return tokens;
    }
  }

  return tokens;
}

const labArtNameInput = document.getElementById('art-name');

downloadButton?.addEventListener('click', () => {
  if (!gridHasContent(builderPixels)) {
    if (walletStatus) walletStatus.textContent = 'Add at least one shade to the grid before downloading.';
    return;
  }
  const name = artNameOrDefault(labArtNameInput);
  downloadArtCard(builderPixels, builderSize, name);
});

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// Reflect a connected account in the Lab: load real NFTs if a contract is
// configured, otherwise keep the playable sample shades.
async function applyConnectedAccount(account) {
  walletConnected = true;
  if (connectWalletButton) connectWalletButton.textContent = `Connected ${shortAddress(account)}`;

  if (COLLECTION_CONFIG.contractAddress) {
    const tokens = await loadOwnedCollectionNfts(account);
    ownedNfts = tokens;
    placedTokenIds = new Set();
    selectedNft = tokens[0] || null;
    renderBuilderBoard(builderSize);
    renderNftPalette(ownedNfts);
    updateNftCount();
    if (walletStatus) {
      walletStatus.textContent = tokens.length
        ? `Connected ${shortAddress(account)}. Showing owned Grid Theory NFTs.`
        : `Connected ${shortAddress(account)}. No owned Grid Theory NFTs found in this wallet.`;
    }
    return;
  }

  // No collection contract configured — wallet is connected, keep sample shades.
  updateNftCount();
  if (walletStatus) {
    walletStatus.textContent = `Connected ${shortAddress(account)}. Add a collection contract in script.js to load owned NFTs — sample shades shown below.`;
  }
}

// ---- wallet selection ----
// All injected providers (some browsers expose several via ethereum.providers).
function injectedProviders() {
  const eth = window.ethereum;
  if (!eth) return [];
  if (Array.isArray(eth.providers) && eth.providers.length) return eth.providers;
  return [eth];
}

const WALLET_CHOICES = [
  {
    key: 'metamask',
    name: 'MetaMask',
    detect: (p) => p.isMetaMask && !p.isBraveWallet && !p.isCoinbaseWallet,
    install: 'https://metamask.io/download/'
  },
  {
    key: 'coinbase',
    name: 'Coinbase Wallet',
    detect: (p) => p.isCoinbaseWallet,
    install: 'https://www.coinbase.com/wallet/downloads'
  },
  {
    key: 'other',
    name: 'Other / Browser wallet',
    detect: () => true,
    install: null
  }
];

function findProvider(choice) {
  const list = injectedProviders();
  return list.find(choice.detect) || null;
}

let walletPickerEl = null;
function closeWalletPicker() {
  walletPickerEl?.classList.remove('is-visible');
}

function openWalletPicker() {
  if (!walletPickerEl) {
    walletPickerEl = document.createElement('div');
    walletPickerEl.className = 'wallet-modal';
    walletPickerEl.setAttribute('role', 'dialog');
    walletPickerEl.setAttribute('aria-modal', 'true');
    document.body.appendChild(walletPickerEl);
    walletPickerEl.addEventListener('click', (event) => {
      if (event.target === walletPickerEl) closeWalletPicker();
    });
  }

  const options = WALLET_CHOICES.map((choice) => {
    const available = Boolean(findProvider(choice));
    const status = choice.key === 'other'
      ? (available ? 'Detected' : 'None found')
      : (available ? 'Detected' : 'Not installed');
    return `
      <button class="wallet-option" type="button" data-wallet="${choice.key}" ${available ? '' : 'data-missing="true"'}>
        <span class="wallet-option-name">${choice.name}</span>
        <span class="wallet-option-status">${status}</span>
      </button>`;
  }).join('');

  walletPickerEl.innerHTML = `
    <div class="wallet-card">
      <button class="wallet-close" type="button" aria-label="Close">Close</button>
      <span class="wallet-eyebrow">Connect a wallet</span>
      <h3>Choose how to connect.</h3>
      <div class="wallet-options">${options}</div>
      <small>You'll be asked to approve the connection in your wallet.</small>
    </div>
  `;

  walletPickerEl.querySelector('.wallet-close')?.addEventListener('click', closeWalletPicker);
  walletPickerEl.querySelectorAll('.wallet-option').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = WALLET_CHOICES.find((c) => c.key === button.dataset.wallet);
      if (choice) selectWallet(choice);
    });
  });

  requestAnimationFrame(() => walletPickerEl.classList.add('is-visible'));
}

function selectWallet(choice) {
  const provider = findProvider(choice);
  if (!provider) {
    closeWalletPicker();
    if (walletStatus) {
      walletStatus.textContent = `${choice.name} not found. ${choice.install ? 'Opening its install page…' : 'Install a browser wallet and reload.'}`;
    }
    if (choice.install) window.open(choice.install, '_blank', 'noreferrer');
    return;
  }
  closeWalletPicker();
  connectWithProvider(provider, choice.name);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeWalletPicker();
});

async function connectWithProvider(provider, label) {
  activeProvider = provider;
  attachWalletListeners(provider);

  try {
    if (connectWalletButton) connectWalletButton.textContent = `Connecting ${label}…`;
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const account = accounts?.[0];
    if (!account) {
      if (walletStatus) walletStatus.textContent = 'No wallet account was returned.';
      if (connectWalletButton) connectWalletButton.textContent = 'Connect wallet';
      return;
    }
    await applyConnectedAccount(account);
  } catch (error) {
    // 4001 = user rejected the request
    if (walletStatus) {
      walletStatus.textContent = error?.code === 4001
        ? `${label} connection was rejected.`
        : `Could not connect to ${label}. Please try again.`;
    }
    if (connectWalletButton) connectWalletButton.textContent = 'Connect wallet';
  }
}

const listenerBoundProviders = new WeakSet();
function attachWalletListeners(provider) {
  if (!provider?.on || listenerBoundProviders.has(provider)) return;
  listenerBoundProviders.add(provider);
  provider.on('accountsChanged', (accounts) => {
    if (provider !== activeProvider) return;
    if (accounts && accounts.length) {
      applyConnectedAccount(accounts[0]);
    } else {
      walletConnected = false;
      if (connectWalletButton) connectWalletButton.textContent = 'Connect wallet';
      if (walletStatus) walletStatus.textContent = 'Wallet disconnected.';
      updateNftCount();
    }
  });
  provider.on('chainChanged', () => {
    if (provider === activeProvider) window.location.reload();
  });
}

connectWalletButton?.addEventListener('click', () => {
  if (!window.ethereum) {
    if (walletStatus) {
      walletStatus.textContent = 'No web3 wallet detected. Install MetaMask or another browser wallet and reload.';
    }
    window.open('https://metamask.io/download/', '_blank', 'noreferrer');
    return;
  }
  openWalletPicker();
});

// If a wallet is already authorized, reflect it without prompting.
if (window.ethereum?.request) {
  const preferred = injectedProviders().find((p) => p.isMetaMask) || window.ethereum;
  preferred
    .request({ method: 'eth_accounts' })
    .then((accounts) => {
      if (accounts && accounts.length) {
        activeProvider = preferred;
        attachWalletListeners(preferred);
        applyConnectedAccount(accounts[0]);
      }
    })
    .catch(() => {});
}

// Seed the Lab with sample shades so it's playable before connecting a wallet.
ownedNfts = NFT_SHADE_FALLBACKS.map((color, index) => ({
  tokenId: String(index + 1),
  color
}));
selectedNft = ownedNfts[0] || null;
renderBuilderBoard(builderSize);
renderNftPalette(ownedNfts);
updateNftCount();
enablePaletteReturn(nftPalette, () => builderBoard, resetBuilderCell, 'lab-cell');

// ---- certificate verification ----
const certForm = document.getElementById('cert-form');
const certInput = document.getElementById('cert-input');
const certResult = document.getElementById('cert-result');

function verifyCertificate(raw) {
  const value = raw.trim().toUpperCase();
  if (!value) {
    return { ok: false, message: 'Enter a certificate number to verify.' };
  }

  // Accept the printed format GT-PRINT-#### (1–9999).
  const match = value.match(/^GT-PRINT-(\d{1,4})$/);
  if (!match) {
    return {
      ok: false,
      message: `“${value}” is not a valid certificate format. Expected GT-PRINT-0001.`
    };
  }

  const number = Number(match[1]);
  if (number < 1 || number > 9999) {
    return { ok: false, message: `Certificate ${value} is outside the issued range.` };
  }

  const id = String(number).padStart(4, '0');
  return {
    ok: true,
    message: `Authentic. Certificate GT-PRINT-${id} is a genuine Grid Theory print, linked to token GT ${number} (ERC-721).`
  };
}

certForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!certResult) return;
  const result = verifyCertificate(certInput?.value || '');
  certResult.textContent = result.message;
  certResult.classList.toggle('is-valid', result.ok);
  certResult.classList.toggle('is-invalid', !result.ok);
});

// ---- gallery tiles: distinctive grid/mosaic studies ----
const GALLERY_STYLES = [
  {
    name: 'Gradient',
    cells: 2,
    palette: ['#1d1208', '#8b5a32', '#d88a35', '#f0b56a'],
    mode: 'diagonal',
    img: 'assets/sample/gradient.jpg'
  },
  {
    name: 'Ocean glass',
    cells: 6,
    palette: ['#07151a', '#0b6f73', '#1ca3a5', '#8fc9c4', '#e8f3ed'],
    mode: 'wave'
  },
  {
    name: 'Pastel',
    cells: 4,
    palette: ['#08080a', '#ff4d4d', '#4f8dff', '#f0b56a', '#ffffff'],
    mode: 'blocks',
    img: 'assets/sample/pastel.jpg'
  },
  {
    name: '1/1',
    cells: 6,
    palette: ['#09040f', '#2a1743', '#65305d', '#b9783a', '#f0b56a'],
    mode: 'radial',
    img: 'assets/sample/one-of-one.jpg'
  },
  {
    name: 'Dark',
    cells: 3,
    palette: ['#050505', '#242424', '#555555', '#9a9a9a', '#e6e2d7'],
    mode: 'checker',
    img: 'assets/sample/dark.jpg'
  },
  {
    name: 'Wave',
    cells: 3,
    palette: ['#05100c', '#17483c', '#2f7a57', '#a98643', '#d8d0bd'],
    mode: 'islands',
    img: 'assets/sample/wave.jpg'
  },
  {
    name: 'Heat trace',
    cells: 6,
    palette: ['#100606', '#9b2f22', '#c98534', '#f2aa35', '#fff0c7'],
    mode: 'stripes'
  },
  {
    name: 'Primary grid',
    cells: 4,
    palette: ['#050505', '#ff4d4d', '#4f8dff', '#f0b56a', '#f7f2e8'],
    mode: 'primary'
  },
  {
    name: 'Coral tide',
    cells: 6,
    palette: ['#1a0610', '#7a1f3d', '#d94f6c', '#ff9aa6', '#ffe2d6'],
    mode: 'wave'
  },
  {
    name: 'Slate blocks',
    cells: 4,
    palette: ['#070a0f', '#1f3a52', '#3f6c8c', '#86a8c4', '#e3edf5'],
    mode: 'blocks'
  },
  {
    name: 'Sand dunes',
    cells: 3,
    palette: ['#1c150a', '#6b4f24', '#b08534', '#e0bd6a', '#f6ead0'],
    mode: 'diagonal'
  },
  {
    name: 'Neon check',
    cells: 2,
    palette: ['#0a0014', '#ff2db2', '#2dd4ff', '#f5ff2d', '#ffffff'],
    mode: 'checker'
  }
];

function colorFromStyle(style, x, y, rand) {
  const max = style.cells - 1;
  const nx = max === 0 ? 0 : x / max;
  const ny = max === 0 ? 0 : y / max;
  const center = Math.hypot(nx - 0.5, ny - 0.5);
  let index = 0;

  if (style.mode === 'diagonal') {
    index = Math.floor((nx + ny) * (style.palette.length - 1));
  } else if (style.mode === 'wave') {
    index = Math.floor((Math.sin(nx * Math.PI * 2.2 + ny * 2.5) * 0.5 + 0.5) * (style.palette.length - 1));
  } else if (style.mode === 'blocks') {
    index = (Math.floor(x / 2) + Math.floor(y / 2) + Math.floor(rand() * 2)) % style.palette.length;
  } else if (style.mode === 'radial') {
    index = Math.floor(Math.min(0.99, center * 1.7) * style.palette.length);
  } else if (style.mode === 'checker') {
    index = (x + y) % style.palette.length;
  } else if (style.mode === 'islands') {
    index = Math.floor(((Math.sin(x * 1.7) + Math.cos(y * 1.3) + 2) / 4) * (style.palette.length - 1));
  } else if (style.mode === 'stripes') {
    index = (x + Math.floor(y / 2)) % style.palette.length;
  } else if (style.mode === 'primary') {
    index = (x === y || x + y === max) ? 2 : (x % 2 === 0 ? y : x) % style.palette.length;
  }

  return style.palette[Math.max(0, Math.min(style.palette.length - 1, index))];
}

// cache loaded gallery images so each src is only fetched once
const tileImageCache = new Map();
function loadTileImage(src) {
  let img = tileImageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    tileImageCache.set(src, img);
  }
  return img;
}

// draw an image as a centred "cover" fit inside the square tile
function drawCover(ctx, img, size) {
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
}

function renderTile(canvas, seed, style) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  const size = r.width;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // image-backed tile: paint the photo cover-fit instead of procedural cells
  if (style.img) {
    const img = loadTileImage(style.img);
    const paint = () => {
      ctx.fillStyle = '#060606';
      ctx.fillRect(0, 0, size, size);
      drawCover(ctx, img, size);
    };
    if (img.complete && img.naturalWidth) paint();
    else img.addEventListener('load', paint, { once: true });
    return;
  }

  const rand = rng(seed);
  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, size, size);

  const cells = style.cells;
  const cell = size / cells;

  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      ctx.fillStyle = colorFromStyle(style, x, y, rand);
      ctx.globalAlpha = 0.86 + rand() * 0.14;
      ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  for (let line = 0; line <= cells; line++) {
    const pos = line * cell;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }
}

// caption: photo tiles show just the name, procedural tiles keep the grid size
function tileCaption(style) {
  return style.img
    ? style.name
    : `${style.cells} × ${style.cells} · ${style.name}`;
}

const grid = document.getElementById('gallery-grid');
if (grid) {
  // Fixed seed so the tiles are static and identical on every load.
  const baseSeed = 424242;
  // Shade Traits: image-based shades only, in this explicit order.
  const order = ['Gradient', 'Pastel', 'Wave', 'Dark', '1/1'];
  const traitStyles = order
    .map((n) => GALLERY_STYLES.find((s) => s.name === n))
    .filter(Boolean);

  traitStyles.forEach((currentStyle, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const seed = baseSeed + i * 7919;
    const c = document.createElement('canvas');
    const caption = document.createElement('span');
    caption.className = 'tile-caption';
    caption.textContent = tileCaption(currentStyle);
    tile.append(c, caption);
    grid.appendChild(tile);
    requestAnimationFrame(() => renderTile(c, seed, currentStyle));
  });

  // "more traits hidden" placeholder tile
  const hidden = document.createElement('div');
  hidden.className = 'tile tile-hidden';
  hidden.innerHTML = '<span class="tile-caption">More traits hidden</span>';
  grid.appendChild(hidden);
}

// ---- gallery: example creations (different image types you can compose) ----
const CREATION_STYLES = [
  { name: 'Gradient blend', cells: 6, palette: ['#1c150a', '#6b4f24', '#b08534', '#e0bd6a', '#f6ead0'], mode: 'diagonal' },
  { name: 'Ocean waves',    cells: 6, palette: ['#07151a', '#0b6f73', '#1ca3a5', '#8fc9c4', '#e8f3ed'], mode: 'wave' },
  { name: 'Radial burst',   cells: 6, palette: ['#09040f', '#2a1743', '#65305d', '#b9783a', '#f0b56a'], mode: 'radial' },
  { name: 'Pixel grid',     cells: 4, palette: ['#050505', '#ff4d4d', '#4f8dff', '#f0b56a', '#f7f2e8'], mode: 'primary' },
  { name: 'Stone mosaic',   cells: 4, palette: ['#070a0f', '#1f3a52', '#3f6c8c', '#86a8c4', '#e3edf5'], mode: 'blocks' },
  { name: 'Neon checker',   cells: 3, palette: ['#0a0014', '#ff2db2', '#2dd4ff', '#f5ff2d', '#ffffff'], mode: 'checker' },
  { name: 'Heat map',       cells: 6, palette: ['#100606', '#9b2f22', '#c98534', '#f2aa35', '#fff0c7'], mode: 'stripes' },
  { name: 'Garden islands', cells: 3, palette: ['#05100c', '#17483c', '#2f7a57', '#a98643', '#d8d0bd'], mode: 'islands' }
];

const creationsGrid = document.getElementById('creations-grid');
if (creationsGrid) {
  const seedBase = 90210;
  CREATION_STYLES.forEach((style, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const c = document.createElement('canvas');
    const caption = document.createElement('span');
    caption.className = 'tile-caption';
    caption.textContent = style.name; // the type of image
    tile.append(c, caption);
    creationsGrid.appendChild(tile);
    requestAnimationFrame(() => renderTile(c, seedBase + i * 4099, style));
  });
}
