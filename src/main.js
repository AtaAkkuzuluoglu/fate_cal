// ═══════════════════════════════════════
// FATE CONDENSED — Main Entry & Router
// ═══════════════════════════════════════

import './style.css';
import { renderNavbar } from './components/navbar.js';
import { renderHomePage } from './pages/home.js';
import { renderDiceRollerPage } from './pages/dice-roller.js';
import { renderCharacterCreatorPage } from './pages/character-creator.js';
import { renderCharacterSheetPage } from './pages/character-sheet.js';
import { renderGameSessionPage } from './pages/game-session.js';
import { renderAuthPage } from './pages/auth.js';
import { isLoggedIn } from './engine/storage.js';

// ── Router State ──
let currentPage = 'home';
let pageParams = {};

const routes = {
  'auth': (c, nav, p) => renderAuthPage(c, nav),
  'home': (c, nav, p) => renderHomePage(c, nav),
  'dice-roller': (c, nav, p) => renderDiceRollerPage(c),
  'character-creator': (c, nav, p) => renderCharacterCreatorPage(c, nav),
  'character-sheet': (c, nav, p) => renderCharacterSheetPage(c, nav, p),
  'game-session': (c, nav, p) => renderGameSessionPage(c, nav),
};

// Pages that don't require auth
const publicPages = ['auth'];

export function navigate(page, params = {}) {
  currentPage = page;
  pageParams = params;
  window.location.hash = page;
  renderApp();
}

function renderApp() {
  // Auth guard: redirect to auth if not logged in
  if (!isLoggedIn() && !publicPages.includes(currentPage)) {
    currentPage = 'auth';
    window.location.hash = 'auth';
  }

  // If logged in and on auth page, redirect to home
  if (isLoggedIn() && currentPage === 'auth') {
    currentPage = 'home';
    window.location.hash = 'home';
  }

  const content = document.getElementById('page-content');
  content.innerHTML = '';
  content.scrollTop = 0;
  window.scrollTo(0, 0);

  // Only show navbar when logged in
  if (isLoggedIn()) {
    renderNavbar(currentPage, navigate);
  } else {
    document.getElementById('main-nav').innerHTML = '';
  }

  const renderer = routes[currentPage];
  if (renderer) {
    renderer(content, navigate, pageParams);
  } else {
    content.innerHTML = `<div class="empty-state"><p>Sayfa bulunamadı</p></div>`;
  }
}

// ── Hash-based routing ──
function handleHash() {
  const hash = window.location.hash.slice(1) || 'home';
  const [page, ...rest] = hash.split('/');
  currentPage = page;
  pageParams = rest.length > 0 ? { id: rest[0] } : {};
  renderApp();
}

window.addEventListener('hashchange', handleHash);

// ── Init ──
handleHash();
