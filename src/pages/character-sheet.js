// ═══════════════════════════════════════
// Character Sheet — View & manage
// ═══════════════════════════════════════

import { toggleStress, setConsequence, clearStress, updateStressLimits, toggleMana, clearMana, updateManaUnlock } from '../engine/character.js';
import { invoke, compel, earnFP, spendFP, refreshPoints } from '../engine/fate-points.js';
import { SKILL_LIST, getSkillTranslation, PYRAMID_STRUCTURE, getRatingLabel } from '../engine/skills.js';
import { t } from '../engine/i18n.js';
import { rollFateDice, calculateResult, getOutcome, getLadderLabel, getDieSymbol, getDieClass, getOutcomeDisplay } from '../engine/dice.js';
import { getCharacter, saveCharacter, deleteCharacter, getCurrentUser } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

export async function renderCharacterSheetPage(container, navigate, params = {}) {
  container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>${t('loading')}</p></div>`;
  let character;
  try {
    character = await getCharacter(params.id);
    if (!character) throw new Error(t('error.character_not_found'));
    // Ensure mana track exists for characters created before this feature
    if (!character.mana) {
      character.mana = { boxes: Array(10).fill(false), unlockedCount: 2 };
      await saveCharacter(character);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${err.message.includes('bulunamadı') ? '✦' : '⚠'}</div>
        <p>${err.message}</p>
        <button class="btn btn-gold" id="back-home" style="margin-top: 1rem;">${t('home.back_to_home')}</button>
      </div>
    `;
    container.querySelector('#back-home')?.addEventListener('click', () => navigate('home'));
    return;
  }

  let lastRoll = null;
  const currentUser = getCurrentUser();
  const isDM = currentUser?.role === 'dm';

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
              <p style="color: var(--text-secondary); font-style: italic; margin-bottom: var(--sp-xs);">"${character.aspects.highConcept}"</p>
            ` : ''}
            <div style="font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: var(--sp-sm); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px dashed var(--border-light);">
              <span>${t('sheet.adventure_code')}: </span>
              <code style="color: var(--gold); user-select: all;" id="char-code">${character.id}</code>
            </div>
          </div>
          <div style="display: flex; gap: var(--sp-sm);">
            <button class="btn btn-outline btn-sm" id="edit-btn">
          ${t('sheet.edit')}
        </button>
        <button class="btn btn-danger btn-sm" id="delete-btn">
          ${t('sheet.delete')}
        </button>
          </div>
        </div>

        <div class="grid-2">
          <!-- Left Column -->
          <div>
            <!-- Fate Points -->
            <div class="card card-gold animate-in animate-in-delay-1" style="margin-bottom: var(--sp-lg);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-md);">
                <h3 style="font-family: var(--font-display);">${t('char.fate_points')}</h3>
                <span class="badge badge-gold">${t('sheet.refresh_label', { refresh: character.refresh })}</span>
              </div>
              <div class="fp-counter" style="justify-content: center;">
                <button class="fp-btn" id="fp-minus">−</button>
                <div class="fp-token">${character.fatePoints}</div>
                <button class="fp-btn" id="fp-plus">+</button>
              </div>
              <div style="margin-top: var(--sp-md);">
                <button class="btn btn-sm btn-outline" id="fp-refresh" style="width: 100%;">🔄 ${t('sheet.refresh_button', { refresh: character.refresh })}</button>
              </div>
            </div>

            <!-- Aspects -->
            <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md);">
            ${t('char.aspects')}
          </h3>
          <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
            ${Object.entries(character.aspects)
        .filter(([, v]) => v)
        .map(([k, v]) => {
          const types = { highConcept: 'high-concept', trouble: 'trouble', relationship: 'relationship', free1: 'free', free2: 'free', free3: 'free' };
          const labels = { highConcept: 'aspect.highConcept', trouble: 'aspect.trouble', relationship: 'aspect.relationship', free1: 'aspect.free1', free2: 'aspect.free2', free3: 'aspect.free3' };
          return `
                  <div class="aspect-card ${types[k]}">
                    <div class="aspect-type">${t(labels[k])}</div>
                    <div class="aspect-text">${v}</div>
                  </div>
                `;
        }).join('')}
              </div>
            </div>

            <!-- Stunts -->
            <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md);">
            ${t('char.stunts')}
          </h3>
          <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
            ${character.stunts.length > 0
        ? character.stunts.map(s => `
                <div style="padding: var(--sp-sm) var(--sp-md); background: rgba(124,58,237,0.05); border-radius: var(--radius-sm); margin-bottom: var(--sp-sm); border-left: 3px solid var(--purple);">
                  <strong style="color: var(--purple-300);">${s.name}</strong>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 2px;">${s.description}</p>
                </div>
              `).join('')
        : `<p style="color: var(--text-muted);">${t('sheet.no_stunts')}</p>`
      }
          </div>
            </div>

            <!-- Notes -->
            <div class="card animate-in animate-in-delay-4" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md);">
                ${t('char.notes')}
              </h3>
              <textarea id="char-notes" class="input" style="width: 100%; min-height: 120px; resize: vertical; font-family: monospace;">${character.notes || ''}</textarea>
              <button id="save-notes-btn" class="btn btn-gold" style="margin-top: var(--sp-sm);">${t('btn.save')}</button>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Quick Roll -->
            <div class="card animate-in animate-in-delay-1" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md);">
            ${t('sheet.quick_roll')}
          </h3>
              <div style="display: flex; gap: var(--sp-sm); margin-bottom: var(--sp-md); flex-wrap: wrap;">
                <select class="select" id="quick-skill" style="flex: 1; min-width: 140px;">
                  <option value="0">${t('sheet.select_skill')}</option>
                  ${Object.entries(character.skills)
        .filter(([, r]) => r > 0)
        .sort(([, a], [, b]) => b - a)
        .map(([s, r]) => `
                      <option value="${r}">${getSkillTranslation(s)} (+${r})</option>
                    `).join('')}
                </select>
                <button class="btn btn-gold" id="quick-roll-btn">🎲 ${t('sheet.roll_button')}</button>
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
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md); display: flex; justify-content: space-between;">
            ${t('char.stress')}
            <button class="btn btn-outline btn-sm" id="clear-stress" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">${t('sheet.clear_stress')}</button>
          </h3>
              <div style="margin-bottom: var(--sp-md);">
                <span class="label">${t('sheet.physical')}</span>
                <div class="stress-track">
                  ${character.stress.physical.map((filled, i) => `
                    <div class="stress-box ${filled ? 'filled' : ''}" data-track="physical" data-index="${i}">
                      ${filled ? '' : (i + 1)}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div>
                <span class="label">${t('sheet.mental')}</span>
                <div class="stress-track">
                  ${character.stress.mental.map((filled, i) => `
                    <div class="stress-box ${filled ? 'filled' : ''}" data-track="mental" data-index="${i}">
                      ${filled ? '' : (i + 1)}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Mana -->
            <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--purple); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md); display: flex; justify-content: space-between; align-items: center;">
                ${t('sheet.mana')}
                <div style="display: flex; gap: var(--sp-sm); align-items: center;">
                  ${isDM ? `
                    <button class="btn btn-outline btn-sm" id="mana-unlock-minus" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">${t('sheet.dm_lock')}</button>
                    <span class="badge badge-purple" id="mana-unlock-count">${character.mana?.unlockedCount || 2}</span>
                    <button class="btn btn-outline btn-sm" id="mana-unlock-plus" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">${t('sheet.dm_unlock')}</button>
                  ` : `
                    <span class="badge badge-purple">${character.mana?.unlockedCount || 2}/10</span>
                  `}
                  <button class="btn btn-outline btn-sm" id="clear-mana" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">${t('sheet.clear_mana')}</button>
                </div>
              </h3>
              <div class="mana-track">
                ${Array.from({ length: 10 }, (_, i) => {
                  const mana = character.mana || { boxes: Array(10).fill(false), unlockedCount: 2 };
                  const filled = mana.boxes[i] || false;
                  const unlocked = i < mana.unlockedCount;
                  return `
                    <div class="mana-box ${filled ? 'filled' : ''} ${unlocked ? '' : 'locked'}" data-index="${i}">
                      ${filled ? '' : (i + 1)}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Consequences -->
            <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
              <h3 style="font-family: var(--font-display); color: var(--gold); border-bottom: 2px solid var(--border-color); padding-bottom: var(--sp-sm); margin-bottom: var(--sp-md);">
            ${t('char.consequences')}
          </h3>
          <div style="display: flex; flex-direction: column; gap: var(--sp-md);">
            ${[
        { key: 'mild', label: t('consequence.mild'), shift: 2 },
        { key: 'moderate', label: t('consequence.moderate'), shift: 4 },
        { key: 'severe', label: t('consequence.severe'), shift: 6 },
        { key: 'permanent', label: t('consequence.permanent'), shift: 8 },
      ].map(c => `
                <div class="consequence-slot consequence-${c.key}" style="margin-bottom: var(--sp-sm);">
                  <div class="shift-badge">${c.shift}</div>
                  <input class="consequence-input" data-severity="${c.key}"
                    value="${character.consequences[c.key] || ''}"
                    placeholder="${c.label} (${c.shift} ${t('sheet.shift_label')})" />
                </div>
              `).join('')}
            </div>
            </div>

            <!-- Skills -->
            <div class="card animate-in animate-in-delay-4">
              <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">${t('char.skills')}</h3>
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
                          <span class="skill-name">${getSkillTranslation(s)}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : '';
      }).join('')}
              </div>
            </div>
          </div>
        </div>

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
      showToast(t('toast.saved'), 'info');
    });

    // Mana
    container.querySelectorAll('.mana-box').forEach(box => {
      box.addEventListener('click', async () => {
        const index = parseInt(box.dataset.index);
        const mana = character.mana || { boxes: Array(10).fill(false), unlockedCount: 2 };
        if (index < mana.unlockedCount) {
          toggleMana(character, index);
          await save(); render();
        }
      });
    });
    document.getElementById('clear-mana')?.addEventListener('click', async () => {
      clearMana(character);
      await save(); render();
      showToast(t('toast.saved'), 'info');
    });
    if (isDM) {
      document.getElementById('mana-unlock-plus')?.addEventListener('click', async () => {
        const mana = character.mana || { boxes: Array(10).fill(false), unlockedCount: 2 };
        if (mana.unlockedCount < 10) {
          updateManaUnlock(character, mana.unlockedCount + 1);
          await save(); render();
          showToast(t('sheet.mana_unlocked', { count: character.mana.unlockedCount }), 'success');
        }
      });
      document.getElementById('mana-unlock-minus')?.addEventListener('click', async () => {
        const mana = character.mana || { boxes: Array(10).fill(false), unlockedCount: 2 };
        if (mana.unlockedCount > 2) {
          updateManaUnlock(character, mana.unlockedCount - 1);
          await save(); render();
          showToast(t('sheet.mana_unlocked', { count: character.mana.unlockedCount }), 'info');
        }
      });
    }

    // Consequences
    container.querySelectorAll('.consequence-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        setConsequence(character, e.target.dataset.severity, e.target.value);
        await save();
        showToast(t('toast.saved'), 'info');
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

    // Notes
    document.getElementById('save-notes-btn')?.addEventListener('click', async () => {
      character.notes = document.getElementById('char-notes').value;
      await save();
      showToast(t('toast.saved'), 'success');
    });

    // Edit / Delete
    document.getElementById('edit-btn')?.addEventListener('click', () => {
      navigate('character-creator', { id: character.id });
    });
    document.getElementById('delete-btn')?.addEventListener('click', async () => {
      if (confirm(t('sheet.delete') + ` "${character.name}"?`)) {
        await deleteCharacter(character.id);
        showToast(t('toast.saved'), 'info');
        navigate('home');
      }
    });
  }

  render();
}
