// ═══════════════════════════════════════
// Home Page
// ═══════════════════════════════════════

import { loadCharacters } from '../engine/storage.js';

export async function renderHomePage(container, navigate) {
  // Show loading state
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Yükleniyor...</p></div>`;

  const characters = await loadCharacters();

  container.innerHTML = `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero animate-in">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-fate">FATE</span>
            <span class="hero-condensed">CONDENSED</span>
          </h1>
          <p class="hero-subtitle">Kaderinizi zarlara bırakın, hikayenizi yazın.</p>
          <p class="hero-desc">Fate Condensed masa üstü rol yapma sistemi ile dijital ortamda maceraya atılın.</p>
        </div>
      </section>

      <!-- Quick Access Cards -->
      <section class="quick-access">
        <div class="grid-3">
          <button class="card quick-card animate-in animate-in-delay-1" id="qa-create">
            <div class="quick-icon">✦</div>
            <h3>Karakter Oluştur</h3>
            <p>Aspect'ler, yetenekler ve stunt'lar ile karakterini yarat</p>
          </button>
          <button class="card quick-card animate-in animate-in-delay-2" id="qa-dice">
            <div class="quick-icon">🎲</div>
            <h3>Zar At</h3>
            <p>4 Fate zarı at, yetenek ve bonus ekle</p>
          </button>
          <button class="card quick-card animate-in animate-in-delay-3" id="qa-campaign">
            <div class="quick-icon">📜</div>
            <h3>Serüven</h3>
            <p>Kampanyalara katıl, ortak notları oku veya yönet</p>
          </button>
        </div>
      </section>

      <!-- Characters List -->
      <section class="characters-section animate-in animate-in-delay-4">
        <div class="section-header">
          <h2>Karakterlerim</h2>
          <p>${characters.length} karakter kayıtlı</p>
        </div>
        ${characters.length > 0 ? `
          <div class="grid-2">
            ${characters.map(c => `
              <div class="card char-card" data-id="${c.id}">
                <div class="char-card-header">
                  <h3 class="char-name">${c.name || 'İsimsiz'}</h3>
                  <div class="char-fp">
                    <span class="fp-token-sm">${c.fatePoints}</span>
                    <span class="fp-label-sm">FP</span>
                  </div>
                </div>
                ${c.aspects.highConcept ? `
                  <div class="char-concept">"${c.aspects.highConcept}"</div>
                ` : ''}
                <div class="char-meta">
                  <span class="badge badge-gold">Refresh: ${c.refresh}</span>
                  <span class="badge badge-purple">Stunt: ${c.stunts.length}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">✦</div>
            <p>Henüz karakter oluşturmadınız</p>
            <button class="btn btn-gold" id="empty-create-btn">İlk Karakterini Oluştur</button>
          </div>
        `}
      </section>

      <!-- System Info -->
      <section class="system-info animate-in animate-in-delay-4">
        <div class="card card-purple">
          <h3 style="margin-bottom: var(--sp-md);">Fate Condensed Nedir?</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7;">
            Fate Condensed, hikaye odaklı bir masa üstü rol yapma oyunu sistemidir. 
            Oyuncular <strong style="color: var(--gold);">Aspect</strong>'ler ile karakterlerini tanımlar, 
            <strong style="color: var(--gold);">4 Fate Zarı</strong> (4dF) ile aksiyonlarını çözer ve 
            <strong style="color: var(--gold);">Fate Point</strong>'ler ile kaderlerini şekillendirir.
            Sistem dört temel aksiyon sunar: Overcome, Create an Advantage, Attack ve Defend.
          </p>
        </div>
      </section>
    </div>
  `;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    .hero {
      text-align: center;
      padding: var(--sp-3xl) 0;
      position: relative;
    }
    .hero-title {
      font-size: 3.5rem;
      margin-bottom: var(--sp-md);
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .hero-fate {
      font-family: var(--font-display);
      background: var(--gradient-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 4.5rem;
      font-weight: 900;
      letter-spacing: 8px;
    }
    .hero-condensed {
      font-family: var(--font-body);
      font-size: 1.2rem;
      font-weight: 300;
      letter-spacing: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      font-style: italic;
      margin-bottom: var(--sp-sm);
    }
    .hero-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
      max-width: 500px;
      margin: 0 auto;
    }
    .quick-access { margin-bottom: var(--sp-2xl); }
    .quick-card {
      text-align: center;
      cursor: pointer;
      border: none;
      font-family: var(--font-body);
    }
    .quick-card h3 {
      font-family: var(--font-display);
      margin-bottom: var(--sp-sm);
    }
    .quick-card p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .quick-icon {
      font-size: 2.5rem;
      margin-bottom: var(--sp-md);
    }
    .characters-section { margin-bottom: var(--sp-2xl); }
    .char-card { cursor: pointer; }
    .char-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-sm);
    }
    .char-name { font-family: var(--font-display); font-size: 1.1rem; }
    .fp-token-sm {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--gradient-gold);
      color: #0a0a0f;
      font-weight: 800;
      font-size: 0.8rem;
    }
    .fp-label-sm { font-size: 0.7rem; color: var(--text-muted); margin-left: 4px; }
    .char-concept {
      font-style: italic;
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: var(--sp-sm);
    }
    .char-meta { display: flex; gap: var(--sp-sm); }
    .system-info { margin-bottom: var(--sp-2xl); }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.5rem; }
      .hero-fate { font-size: 3rem; letter-spacing: 4px; }
      .hero-condensed { font-size: 0.9rem; letter-spacing: 6px; }
    }
  `;
  container.appendChild(style);

  // Events
  document.getElementById('qa-create')?.addEventListener('click', () => navigate('character-creator'));
  document.getElementById('qa-dice')?.addEventListener('click', () => navigate('dice-roller'));
  document.getElementById('qa-campaign')?.addEventListener('click', () => navigate('campaign'));
  document.getElementById('empty-create-btn')?.addEventListener('click', () => navigate('character-creator'));

  container.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      navigate('character-sheet', { id: card.dataset.id });
    });
  });
}
