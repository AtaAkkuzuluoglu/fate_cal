// ═══════════════════════════════════════
// Navbar Component
// ═══════════════════════════════════════

import { getCurrentUser, logout } from '../engine/storage.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Ana Sayfa', icon: '⚔' },
  { id: 'character-creator', label: 'Karakter', icon: '✦' },
  { id: 'campaign', label: 'Serüven', icon: '🗺️' },
  { id: 'dice-roller', label: 'Zar', icon: '🎲' },
];

export function renderNavbar(currentPage, onNavigate) {
  const nav = document.getElementById('main-nav');
  const user = getCurrentUser();

  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="#home">FATE CONDENSED</a>
      <ul class="nav-links">
        ${NAV_ITEMS.map(item => `
          <li>
            <button class="nav-link ${currentPage === item.id ? 'active' : ''}"
                    data-page="${item.id}">
              <span>${item.icon}</span> ${item.label}
            </button>
          </li>
        `).join('')}
      </ul>
      <div class="nav-user">
        ${user ? `
          <span class="nav-username">👤 ${user.username}</span>
          <button class="btn btn-sm btn-outline" id="logout-btn">Çıkış</button>
        ` : ''}
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

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    onNavigate('auth');
  });
}
