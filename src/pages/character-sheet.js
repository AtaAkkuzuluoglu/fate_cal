// ═══════════════════════════════════════
// Character Sheet — View & manage
// ═══════════════════════════════════════

import { toggleStress, setConsequence, clearStress } from '../engine/character.js';
import { invoke, compel, earnFP, spendFP, refreshPoints } from '../engine/fate-points.js';
import { SKILL_TRANSLATIONS, PYRAMID_STRUCTURE } from '../engine/skills.js';
import { rollFateDice, calculateResult, getOutcome, getLadderLabel, getDieSymbol, getDieClass, getOutcomeDisplay } from '../engine/dice.js';
import { getCharacter, saveCharacter, deleteCharacter } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

export async function renderCharacterSheetPage(container, navigate, params = {}) {
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Yükleniyor...</p></div>`;
  let character;
  try {
    character = await getCharacter(params.id);
    if (!character) throw new Error("Karakter bulunamadı");
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${err.message.includes('bulunamadı') ? '✦' : '⚠'}</div>
        <p>${err.message}</p>
        <button class="btn btn-gold" id="back-home" style="margin-top: 1rem;">Ana Sayfaya Dön</button>
      </div>
    `;
    container.querySelector('#back-home')?.addEventListener('click', () => navigate('home'));
    return;
  }

  let lastRoll = null;

  async function save() {
    await saveCharacter(character);
  }

  function render() {
    container.innerHTML = `
      <div class="sheet-page">
        <!-- Header -->
        <div class="sheet-header animate-in" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--sp-xl);">
          <div>
            <h2 style="font-family: var(--font-display); margin-bottom: var(--sp-xs);">${character.name}</h2>
            ${character.aspects.highConcept ? `
              <p style="color: var(--text-secondary); font-style: italic;">"${character.aspects.highConcept}"</p>
            ` : ''}
          </div>
          <div style="display: flex; gap: var(--sp-sm);">
            <button class="btn btn-outline btn-sm" id="edit-btn">✎ Düzenle</button>
            <button class="btn btn-danger btn-sm" id="delete-btn">🗑 Sil</button>
          </div>
        </div>

        <div class="grid-2">
          <!-- Left Column -->
          <div>
            <!-- Fate Points -->
            <div class="card card-gold animate-in animate-in-delay-1" style="margin-bottom: var(--sp-lg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-md);">
                <h3 style="font-family: var(--font-display);">Fate Points</h3>
                <span class="badge badge-gold">Refresh: ${character.refresh}</span>
              </div>
              <div class="fp-counter" style="justify-content: center;">
                <button class="fp-btn" id="fp-minus">−</button>
                <div class="fp-token">${character.fatePoints}</div>
                <button class="fp-btn" id="fp-plus">+</button>
              </div>
              <div style="margin-top: var(--sp-md);">
                <button class="btn btn-sm btn-outline" id="fp-refresh" style="width: 100%;">🔄 Refresh (${character.refresh})</button>
              </div>
            </div>

            <!-- Aspects -->
            <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Aspect'ler</h3>
              <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
                ${Object.entries(character.aspects)
        .filter(([, v]) => v)
        .map(([k, v]) => {
          const types = { highConcept: 'high-concept', trouble: 'trouble', relationship: 'relationship', free1: 'free', free2: 'free' };
          const labels = { highConcept: 'High Concept', trouble: 'Trouble', relationship: 'Relationship', free1: 'Serbest 1', free2: 'Serbest 2' };
          return `
                      <div class="aspect-card ${types[k]}">
                        <div class="aspect-type">${labels[k]}</div>
                        <div class="aspect-text">${v}</div>
                      </div>
                    `;
        }).join('')}
              </div>
            </div>

            <!-- Stunts -->
            <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Stunt'lar</h3>
              ${character.stunts.length > 0 ? character.stunts.map(s => `
                <div style="padding: var(--sp-sm) var(--sp-md); background: rgba(124,58,237,0.05); border-radius: var(--radius-sm); margin-bottom: var(--sp-sm); border-left: 3px solid var(--purple);">
                  <strong style="color: var(--purple-300);">${s.name}</strong>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 2px;">${s.description}</p>
                </div>
              `).join('') : '<p style="color: var(--text-muted);">Stunt eklenmemiş</p>'}
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Quick Roll -->
            <div class="card animate-in animate-in-delay-1" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Hızlı Zar</h3>
              <div style="display: flex; gap: var(--sp-sm); margin-bottom: var(--sp-md); flex-wrap: wrap;">
                <select class="select" id="quick-skill" style="flex: 1; min-width: 140px;">
                  <option value="0">Yetenek seçin...</option>
                  ${Object.entries(character.skills)
        .filter(([, r]) => r > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([s, r]) => `
                      <option value="${r}">${SKILL_TRANSLATIONS[s]} (+${r})</option>
                    `).join('')}
                </select>
                <button class="btn btn-gold" id="quick-roll-btn">🎲 At</button>
              </div>
              ${lastRoll ? (() => {
        const disp = getOutcomeDisplay(lastRoll.outcome);
        return `
                  <div style="text-align: center;">
                    <div class="dice-container" style="margin-bottom: var(--sp-sm);">
                      ${lastRoll.dice.map(d => `
                        <div class="fate-die ${getDieClass(d)} rolling">${getDieSymbol(d)}</div>
                      `).join('')}
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: ${disp.color};">
                      ${disp.emoji} ${lastRoll.result >= 0 ? '+' : ''}${lastRoll.result} — ${disp.label}
                    </div>
                  </div>
                `;
      })() : ''}
            </div>

            <!-- Stress -->
            <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-md);">
                <h3 style="font-family: var(--font-display);">Stress</h3>
                <button class="btn btn-sm btn-outline" id="clear-stress">Temizle</button>
              </div>
              <div style="margin-bottom: var(--sp-md);">
                <span class="label">Fiziksel</span>
                <div class="stress-track">
                  ${character.stress.physical.map((filled, i) => `
                    <div class="stress-box ${filled ? 'filled' : ''}" data-track="physical" data-index="${i}">
                      ${filled ? '' : (i + 1)}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div>
                <span class="label">Mental</span>
                <div class="stress-track">
                  ${character.stress.mental.map((filled, i) => `
                    <div class="stress-box ${filled ? 'filled' : ''}" data-track="mental" data-index="${i}">
                      ${filled ? '' : (i + 1)}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Consequences -->
            <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Consequences</h3>
              ${[
        { key: 'mild', label: 'Mild', shift: 2 },
        { key: 'moderate', label: 'Moderate', shift: 4 },
        { key: 'severe', label: 'Severe', shift: 6 },
      ].map(c => `
                <div class="consequence-slot consequence-${c.key}" style="margin-bottom: var(--sp-sm);">
                  <div class="shift-badge">${c.shift}</div>
                  <input class="consequence-input" data-severity="${c.key}" 
                    value="${character.consequences[c.key] || ''}" 
                    placeholder="${c.label} (${c.shift} shift)" />
                </div>
              `).join('')}
            </div>

            <!-- Skills -->
            <div class="card animate-in animate-in-delay-4">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Yetenekler</h3>
              <div class="skill-pyramid">
                ${PYRAMID_STRUCTURE.map(level => {
        const skills = Object.entries(character.skills)
          .filter(([, r]) => r === level.rating)
          .map(([s]) => s);
        return skills.length > 0 ? `
                    <div class="skill-row">
                      ${skills.map(s => `
                        <div class="skill-slot">
                          <span class="skill-rating">+${level.rating}</span>
                          <span class="skill-name">${SKILL_TRANSLATIONS[s]}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : '';
      }).join('')}
              </div>
            </div>
          </div>
        </div>

        ${character.notes ? `
          <div class="card animate-in" style="margin-top: var(--sp-lg);">
            <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-sm);">Notlar</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; white-space: pre-wrap;">${character.notes}</p>
          </div>
        ` : ''}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Fate Points
    document.getElementById('fp-minus')?.addEventListener('click', async () => {
      const res = spendFP(character);
      if (res.success) { await save(); render(); showToast(res.message, 'info'); }
      else showToast(res.message, 'error');
    });
    document.getElementById('fp-plus')?.addEventListener('click', async () => {
      const res = earnFP(character);
      await save(); render(); showToast(res.message, 'success');
    });
    document.getElementById('fp-refresh')?.addEventListener('click', async () => {
      refreshPoints(character);
      await save(); render();
      showToast(`Fate Points yenilendi: ${character.fatePoints}`, 'success');
    });

    // Stress
    container.querySelectorAll('.stress-box').forEach(box => {
      box.addEventListener('click', async () => {
        toggleStress(character, box.dataset.track, parseInt(box.dataset.index));
        await save(); render();
      });
    });
    document.getElementById('clear-stress')?.addEventListener('click', async () => {
      clearStress(character);
      await save(); render();
      showToast('Stress temizlendi', 'info');
    });

    // Consequences
    container.querySelectorAll('.consequence-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        setConsequence(character, e.target.dataset.severity, e.target.value);
        await save();
        showToast('Consequence güncellendi', 'info');
      });
    });

    // Quick Roll
    document.getElementById('quick-roll-btn')?.addEventListener('click', () => {
      const skillRating = parseInt(document.getElementById('quick-skill')?.value || '0');
      const dice = rollFateDice();
      const result = calculateResult(dice, skillRating);
      const out = getOutcome(result, 0);
      lastRoll = { dice, result, outcome: out.outcome, shifts: out.shifts };
      render();
      const disp = getOutcomeDisplay(out.outcome);
      showToast(`${disp.emoji} ${disp.label}: ${result >= 0 ? '+' : ''}${result}`, out.outcome === 'fail' ? 'error' : 'success');
    });

    // Edit / Delete
    document.getElementById('edit-btn')?.addEventListener('click', () => {
      navigate('character-creator', { id: character.id });
    });
    document.getElementById('delete-btn')?.addEventListener('click', async () => {
      if (confirm(`"${character.name}" silinsin mi?`)) {
        await deleteCharacter(character.id);
        showToast('Karakter silindi', 'info');
        navigate('home');
      }
    });
  }

  render();
}
