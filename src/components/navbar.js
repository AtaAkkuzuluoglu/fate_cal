// ═══════════════════════════════════════
// Navbar Component
// ═══════════════════════════════════════

import { getCurrentUser, logout } from '../engine/storage.js';
import { t, getLanguage, toggleLanguage } from '../engine/i18n.js';

const NAV_ITEMS = [
  { id: 'home', labelKey: 'nav.home', icon: '⚔' },
  { id: 'character-creator', labelKey: 'nav.create', icon: '✦' },
  { id: 'campaign', labelKey: 'nav.campaign', icon: '🗺️' },
  { id: 'dice-roller', labelKey: 'nav.dice', icon: '🎲' },
];

export function renderNavbar(currentPage, onNavigate) {
  const nav = document.getElementById('main-nav');
  const user = getCurrentUser();

  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="#home" style="display: flex; align-items: center; gap: var(--sp-sm);">
        <img src="/logo.svg" alt="Fate Logo" width="24" height="24" onerror="this.style.display='none'" />
        FATE CONDENSED
      </a>
      <ul class="nav-links">
        ${NAV_ITEMS.map(item => `
          <li>
            <button class="nav-link ${currentPage === item.id ? 'active' : ''}"
                    data-page="${item.id}">
              <span>${item.icon}</span> ${t(item.labelKey)}
            </button>
          </li>
        `).join('')}
      </ul>
      <div class="nav-user">
        <button class="btn btn-sm" id="lang-toggle-btn" style="background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 4px; padding: 4px 8px; font-weight: bold; font-family: var(--font-display); font-size: 0.8rem; cursor: pointer;">
          ${getLanguage() === 'tr' ? 'ENG' : 'TR'}
        </button>
        ${user ? `
          <span class="nav-username">👤 ${user.username}</span>
          <button class="btn btn-sm btn-outline" id="logout-btn">${t('nav.logout')}</button>
        ` : `
          <button class="btn btn-sm btn-outline" data-page="auth" id="login-nav-btn">${t('nav.login')}</button>
        `}
      </div>
    </div>
  `;

  // Add styles for user section
  if (!document.getElementById('nav-user-style')) {
    const style = document.createElement('style');
    style.id = 'nav-user-style';
    style.textContent = `
      .nav-user {
        display: flex;
        align-items: center;
        gap: var(--sp-sm);
      }
      .nav-username {
        font-size: 0.8rem;
        color: var(--text-secondary);
        font-weight: 500;
      }
      @media (max-width: 768px) {
        .nav-username { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  nav.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      onNavigate(btn.dataset.page);
    });
  });

  document.getElementById('login-nav-btn')?.addEventListener('click', () => onNavigate('auth'));

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    onNavigate('auth');
  });

  document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
    toggleLanguage();
  });
}
