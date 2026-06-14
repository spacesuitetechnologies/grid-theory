/* Pixel NFT canvas + gallery tiles
   Deterministic, math-only visuals. No external assets. */

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
    body: 'This is where collectors will connect wallets, view owned Grid Theory NFTs, remix them into art, play with the canvas, download the result and burn their art to collect a physical print.',
    highlight: 'Burn your finished art to claim a physical fine-art print — your Grid Theory, shipped to your door.',
    joke: 'The pixels are currently wearing tiny safety goggles. Please wait until the experiment stops smoking.',
    items: ['Wallet art viewer', 'Owned NFT canvas', 'Downloadable mosaics', 'Burn to claim print']
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
const sections = ['home', 'canvas', 'grid', 'builder', 'gallery'].map((id) => document.getElementById(id));
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
  let gridSize = 6;
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
  { tokenId: 'D12', color: '#ff4d4d' }
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
      if (demoStatus) demoStatus.textContent = `Selected demo shade ${token.tokenId}. Click or drag into the grid.`;
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

function moveDemoCell(sourceCell, targetCell, token) {
  if (!sourceCell || !targetCell || !token || sourceCell === targetCell) return;
  resetDemoCell(sourceCell);
  paintDemoCell(targetCell, token);
  if (demoStatus) demoStatus.textContent = `Moved demo shade ${token.tokenId} to a new square.`;
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

    cell.addEventListener('click', () => {
      if (!selectedDemoColour && cell.dataset.tokenId) {
        resetDemoCell(cell);
        return;
      }
      paintDemoCell(cell, selectedDemoColour);
    });
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
        moveDemoCell(sourceCell, cell, droppedData.token);
        return;
      }

      const droppedToken = droppedData?.token || droppedData;
      paintDemoCell(cell, droppedToken || selectedDemoColour);
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

demoDownloadButton?.addEventListener('click', () => {
  const scale = 96;
  const canvas = document.createElement('canvas');
  canvas.width = demoSize * scale;
  canvas.height = demoSize * scale;
  const ctx = canvas.getContext('2d');

  demoPixels.forEach((color, index) => {
    const x = index % demoSize;
    const y = Math.floor(index / demoSize);
    ctx.fillStyle = color || '#101010';
    ctx.fillRect(x * scale, y * scale, scale, scale);
  });

  const link = document.createElement('a');
  link.download = `grid-theory-demo-${demoSize}x${demoSize}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

renderDemoPalette();
renderDemoBoard(demoSize);

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
  if (!walletConnected) {
    if (nftCount) nftCount.textContent = 'Owned NFTs: Connect wallet';
    return;
  }

  const ownedCount = ownedNfts.length;
  const availableCount = Math.max(0, ownedCount - placedTokenIds.size);
  if (nftCount) {
    nftCount.textContent = ownedCount
      ? `Owned NFTs: ${availableCount.toLocaleString()} / ${ownedCount.toLocaleString()} available`
      : 'Owned NFTs: 0';
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

async function ethCall(to, data) {
  return window.ethereum.request({
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
    await window.ethereum.request({
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

downloadButton?.addEventListener('click', () => {
  const scale = 96;
  const canvas = document.createElement('canvas');
  canvas.width = builderSize * scale;
  canvas.height = builderSize * scale;
  const ctx = canvas.getContext('2d');

  builderPixels.forEach((color, index) => {
    const x = index % builderSize;
    const y = Math.floor(index / builderSize);
    ctx.fillStyle = color || '#101010';
    ctx.fillRect(x * scale, y * scale, scale, scale);
  });

  const link = document.createElement('a');
  link.download = `grid-theory-${builderSize}x${builderSize}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

connectWalletButton?.addEventListener('click', async () => {
  if (!window.ethereum) {
    if (walletStatus) walletStatus.textContent = 'No injected wallet found. Install MetaMask or connect with another wallet provider.';
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts?.[0];
    if (!account) {
      if (walletStatus) walletStatus.textContent = 'No wallet account was returned.';
      return;
    }

    walletConnected = Boolean(account);
    ownedNfts = await loadOwnedCollectionNfts(account);
    selectedNft = ownedNfts[0] || null;
    placedTokenIds = new Set();
    renderBuilderBoard(builderSize);
    renderNftPalette(ownedNfts);
    updateNftCount();

    if (walletStatus && account && COLLECTION_CONFIG.contractAddress) {
      walletStatus.textContent = ownedNfts.length
        ? `Connected ${account.slice(0, 6)}…${account.slice(-4)}. Showing owned Grid Theory NFTs.`
        : `Connected ${account.slice(0, 6)}…${account.slice(-4)}. No owned Grid Theory NFTs found.`;
    }
    connectWalletButton.textContent = 'Wallet connected';
  } catch {
    if (walletStatus) walletStatus.textContent = 'Wallet connection was cancelled.';
  }
});

renderNftEmpty('Connect wallet to load owned Grid Theory NFTs from the collection.');
renderBuilderBoard(builderSize);
updateNftCount();

// ---- gallery tiles: distinctive grid/mosaic studies ----
const GALLERY_STYLES = [
  {
    name: 'Amber field',
    cells: 2,
    palette: ['#1d1208', '#8b5a32', '#d88a35', '#f0b56a'],
    mode: 'diagonal'
  },
  {
    name: 'Ocean glass',
    cells: 6,
    palette: ['#07151a', '#0b6f73', '#1ca3a5', '#8fc9c4', '#e8f3ed'],
    mode: 'wave'
  },
  {
    name: 'Signal blocks',
    cells: 4,
    palette: ['#08080a', '#ff4d4d', '#4f8dff', '#f0b56a', '#ffffff'],
    mode: 'blocks'
  },
  {
    name: 'Violet dusk',
    cells: 6,
    palette: ['#09040f', '#2a1743', '#65305d', '#b9783a', '#f0b56a'],
    mode: 'radial'
  },
  {
    name: 'Mono study',
    cells: 3,
    palette: ['#050505', '#242424', '#555555', '#9a9a9a', '#e6e2d7'],
    mode: 'checker'
  },
  {
    name: 'Garden map',
    cells: 3,
    palette: ['#05100c', '#17483c', '#2f7a57', '#a98643', '#d8d0bd'],
    mode: 'islands'
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

function renderTile(canvas, seed, style) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  const size = r.width;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
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

const grid = document.getElementById('gallery-grid');
if (grid) {
  const TILE_COUNT = 8;
  const baseSeed = Math.floor(Math.random() * 1e6);
  // Track the style shown in every tile so no two tiles ever match.
  const displayedStyles = new Array(TILE_COUNT);

  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const id = document.createElement('span');
    id.className = 'tile-id';
    const seed = baseSeed + i * 7919;
    const currentStyle = GALLERY_STYLES[i % GALLERY_STYLES.length];
    displayedStyles[i] = currentStyle;
    id.textContent = '#' + (1 + (seed % 12000)).toString().padStart(5, '0');
    const c = document.createElement('canvas');
    const caption = document.createElement('span');
    caption.className = 'tile-caption';
    caption.textContent = `${currentStyle.cells} × ${currentStyle.cells} · ${currentStyle.name}`;
    tile.append(c, id, caption);
    grid.appendChild(tile);
    requestAnimationFrame(() => renderTile(c, seed, currentStyle));

    tile.addEventListener('click', () => {
      const newSeed = Math.floor(Math.random() * 1e6);
      // Only pick a style that no other tile is currently showing.
      const available = GALLERY_STYLES.filter(
        (style) => !displayedStyles.includes(style)
      );
      if (!available.length) return; // every style already on screen
      const newStyle = available[Math.floor(Math.random() * available.length)];
      displayedStyles[i] = newStyle;

      id.textContent = '#' + (1 + (newSeed % 12000)).toString().padStart(5, '0');
      caption.textContent = `${newStyle.cells} × ${newStyle.cells} · ${newStyle.name}`;

      tile.classList.add('tile-flash');
      tile.addEventListener('animationend', () => tile.classList.remove('tile-flash'), { once: true });

      renderTile(c, newSeed, newStyle);
    });
  }
}
