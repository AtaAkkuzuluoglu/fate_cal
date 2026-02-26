// ═══════════════════════════════════════
// Character Creator — Step-by-step wizard
// ═══════════════════════════════════════

import { createCharacter, updateStressLimits } from '../engine/character.js';
import { SKILL_LIST, getSkillTranslation, PYRAMID_STRUCTURE, validateSkillPyramid, getRatingLabel } from '../engine/skills.js';
import { t } from '../engine/i18n.js';
import { saveCharacter } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

const STEPS = [
  { id: 'basics', labelKey: 'creator.step.basics' },
  { id: 'aspects', labelKey: 'creator.step.aspects' },
  { id: 'skills', labelKey: 'creator.step.skills' },
  { id: 'stunts', labelKey: 'creator.step.stunts' },
  { id: 'summary', labelKey: 'creator.step.summary' },
];

export function renderCharacterCreatorPage(container, navigate) {
  let currentStep = 0;
  let character = createCharacter();

  function renderWizardProgress() {
    return `
      <div class="wizard-progress">
        ${STEPS.map((step, i) => `
          ${i > 0 ? `<div class="wizard-connector ${i <= currentStep ? 'completed' : ''}"></div>` : ''}
          <div class="wizard-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}">
            <div class="step-circle">${i < currentStep ? '✓' : i + 1}</div>
            <span class="step-label">${t(step.labelKey)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderStepContent() {
    switch (STEPS[currentStep].id) {
      case 'basics':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-lg); font-family: var(--font-display);">${t('creator.basics.title')}</h3>
            <div style="margin-bottom: var(--sp-lg);">
              <label class="label">${t('creator.basics.name')}</label>
              <input class="input" id="char-name" value="${character.name}" placeholder="${t('creator.basics.name_ph')}" />
            </div>
            <div>
              <label class="label">${t('creator.basics.notes')}</label>
              <textarea class="textarea" id="char-notes" placeholder="${t('creator.basics.notes_ph')}">${character.notes}</textarea>
            </div>
          </div>
        `;

      case 'aspects':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">${t('creator.aspects.title')}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              ${t('creator.aspects.desc')}
            </p>
            ${[
            { key: 'highConcept', labelKey: 'aspect.highConcept', hintKey: 'aspect.highConcept.hint', type: 'high-concept' },
            { key: 'trouble', labelKey: 'aspect.trouble', hintKey: 'aspect.trouble.hint', type: 'trouble' },
            { key: 'relationship', labelKey: 'aspect.relationship', hintKey: 'aspect.relationship.hint', type: 'relationship' },
            { key: 'free1', labelKey: 'aspect.free1', hintKey: 'aspect.free.hint', type: 'free' },
            { key: 'free2', labelKey: 'aspect.free2', hintKey: 'aspect.free2.hint', type: 'free' },
            { key: 'free3', labelKey: 'aspect.free3', hintKey: 'aspect.free3.hint', type: 'free' },
          ].map(a => `
              <div class="aspect-input-group" style="margin-bottom: var(--sp-md);">
                <label class="label">
                  <span class="aspect-dot aspect-dot-${a.type}"></span>
                  ${t(a.labelKey)}
                </label>
                <input class="input aspect-field" data-key="${a.key}" 
                  value="${character.aspects[a.key]}" 
                  placeholder="${t(a.hintKey)}" />
              </div>
            `).join('')}
          </div>
        `;

      case 'skills':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">${t('creator.skills.title')}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              ${t('creator.skills.desc')}
            </p>
            ${PYRAMID_STRUCTURE.map(level => `
              <div style="margin-bottom: var(--sp-lg);">
                <div style="display: flex; align-items: center; gap: var(--sp-sm); margin-bottom: var(--sp-sm);">
                  <span class="badge badge-gold">+${level.rating}</span>
                  <span style="font-weight: 600; font-size: 0.85rem;">${level.label} — ${level.count} ${t('creator.skills.count')}</span>
                </div>
                <div class="skill-row" style="flex-wrap: wrap; justify-content: flex-start;">
                  ${Array.from({ length: level.count }, (_, idx) => {
          const assigned = Object.entries(character.skills)
            .filter(([, r]) => r === level.rating)
            .map(([s]) => s);
          const current = assigned[idx] || '';
          return `
                      <select class="select skill-select" data-rating="${level.rating}" data-index="${idx}"
                              style="min-width: 180px; max-width: 220px;">
                        <option value="">${t('creator.skills.select')}</option>
                        ${SKILL_LIST.map(s => `
                          <option value="${s}" 
                            ${s === current ? 'selected' : ''}
                            ${character.skills[s] > 0 && s !== current ? 'disabled' : ''}>
                            ${getSkillTranslation(s)}
                          </option>
                        `).join('')}
                      </select>
                    `;
        }).join('')}
                </div>
              </div>
            `).join('')}
            <div id="skill-validation" style="margin-top: var(--sp-md);"></div>
          </div>
        `;

      case 'stunts':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">${t('creator.stunts.title')}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              ${t('creator.stunts.desc')}
            </p>
            <div id="stunts-list">
              ${character.stunts.map((s, i) => `
                <div class="stunt-entry" style="margin-bottom: var(--sp-md); display: flex; gap: var(--sp-sm); align-items: flex-start;">
                  <div style="flex: 1;">
                    <input class="input stunt-name" data-index="${i}" placeholder="${t('creator.stunts.name_ph')}" value="${s.name}" style="margin-bottom: var(--sp-xs);" />
                    <textarea class="textarea stunt-desc" data-index="${i}" placeholder="${t('creator.stunts.desc_ph')}">${s.description}</textarea>
                  </div>
                  <button class="btn btn-danger btn-sm remove-stunt" data-index="${i}">✕</button>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-outline" id="add-stunt-btn" style="margin-top: var(--sp-sm);">${t('creator.stunts.add')}</button>
            <div style="margin-top: var(--sp-md); padding: var(--sp-md); background: rgba(240,165,0,0.05); border-radius: var(--radius-md);">
              <span style="font-weight: 700; color: var(--gold);">Refresh: ${character.refresh}</span>
              <span style="color: var(--text-muted); margin-left: var(--sp-sm); font-size: 0.85rem;">
                (${character.stunts.length} stunt${character.stunts.length > 3 ? ` → -${character.stunts.length - 3} refresh` : ''})
              </span>
            </div>
          </div>
        `;

      case 'summary':
        const validation = validateSkillPyramid(character.skills);
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-lg); font-family: var(--font-display);">${t('creator.summary.title')}</h3>
            
            <div style="margin-bottom: var(--sp-lg);">
              <h4 style="color: var(--gold); font-size: 1.5rem; margin-bottom: var(--sp-xs); font-family: var(--font-display);">
                ${character.name || t('creator.summary.unnamed')}
              </h4>
            </div>

            <div style="margin-bottom: var(--sp-lg);">
              <span class="label">${t('char.aspects')}</span>
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

            <div style="margin-bottom: var(--sp-lg);">
              <span class="label">${t('char.skills')}</span>
              ${!validation.valid ? `
                <div style="color: var(--danger); font-size: 0.85rem; margin-bottom: var(--sp-sm);">
                  ${t('creator.summary.incomplete')} ${validation.errors.join(', ')}
                </div>
              ` : ''}
              <div class="skill-pyramid">
                ${PYRAMID_STRUCTURE.map(level => {
              const skills = Object.entries(character.skills).filter(([, r]) => r === level.rating).map(([s]) => s);
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

            ${character.stunts.length > 0 ? `
              <div style="margin-bottom: var(--sp-lg);">
                <span class="label">${t('char.stunts')} (${character.stunts.length})</span>
                ${character.stunts.map(s => `
                  <div style="padding: var(--sp-sm) var(--sp-md); background: rgba(124,58,237,0.05); border-radius: var(--radius-sm); margin-bottom: var(--sp-xs);">
                    <strong style="color: var(--purple-300);">${s.name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: var(--sp-sm);">${s.description}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div style="display: flex; gap: var(--sp-lg);">
              <div class="badge badge-gold" style="font-size: 0.9rem; padding: 6px 14px;">Refresh: ${character.refresh}</div>
              <div class="badge badge-purple" style="font-size: 0.9rem; padding: 6px 14px;">FP: ${character.fatePoints}</div>
            </div>
          </div>
        `;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="creator-page">
        <div class="section-header animate-in">
          <h2>${t('creator.title')}</h2>
          <p>${t('creator.subtitle')}</p>
        </div>
        ${renderWizardProgress()}
        ${renderStepContent()}
        <div class="wizard-buttons" style="display: flex; justify-content: space-between; margin-top: var(--sp-xl);">
          <button class="btn btn-outline" id="prev-btn" ${currentStep === 0 ? 'disabled style="opacity:0.3;pointer-events:none;"' : ''}>
            ← ${t('btn.back')}
          </button>
          ${currentStep < STEPS.length - 1 ? `
            <button class="btn btn-gold" id="next-btn">${t('btn.next')} →</button>
          ` : `
            <button class="btn btn-gold btn-lg" id="save-btn">💾 ${t('btn.save')}</button>
          `}
        </div>
      </div>
    `;

    // Add style for aspect dots
    if (!document.getElementById('creator-style')) {
      const style = document.createElement('style');
      style.id = 'creator-style';
      style.textContent = `
        .aspect-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
        .aspect-dot-high-concept { background: var(--gold); }
        .aspect-dot-trouble { background: var(--danger); }
        .aspect-dot-relationship { background: var(--purple); }
        .aspect-dot-free { background: var(--info); }
      `;
      document.head.appendChild(style);
    }

    bindEvents();
  }

  function bindEvents() {
    document.getElementById('prev-btn')?.addEventListener('click', () => {
      if (currentStep > 0) { currentStep--; render(); }
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
      collectCurrentStepData();
      if (currentStep < STEPS.length - 1) { currentStep++; render(); }
    });
    document.getElementById('save-btn')?.addEventListener('click', async () => {
      collectCurrentStepData();
      if (!character.name.trim()) {
        showToast(t('toast.error'), 'error');
        return;
      }
      updateStressLimits(character);
      const success = await saveCharacter(character);
      if (!success) {
        showToast(t('toast.error'), 'error');
        return;
      }
      showToast(t('toast.saved'), 'success');
      navigate('character-sheet', { id: character.id });
    });

    // Step-specific bindings
    if (STEPS[currentStep].id === 'basics') {
      document.getElementById('char-name')?.addEventListener('input', e => character.name = e.target.value);
      document.getElementById('char-notes')?.addEventListener('input', e => character.notes = e.target.value);
    }

    if (STEPS[currentStep].id === 'aspects') {
      container.querySelectorAll('.aspect-field').forEach(input => {
        input.addEventListener('input', e => {
          character.aspects[e.target.dataset.key] = e.target.value;
        });
      });
    }

    if (STEPS[currentStep].id === 'skills') {
      container.querySelectorAll('.skill-select').forEach(select => {
        select.addEventListener('change', e => {
          const rating = parseInt(e.target.dataset.rating);
          const value = e.target.value;

          // Clear old assignment at this rating+index
          const assigned = Object.entries(character.skills)
            .filter(([, r]) => r === rating)
            .map(([s]) => s);
          const idx = parseInt(e.target.dataset.index);
          if (assigned[idx]) {
            character.skills[assigned[idx]] = 0;
          }

          // Set new
          if (value) {
            character.skills[value] = rating;
          }
          render();
        });
      });
    }

    if (STEPS[currentStep].id === 'stunts') {
      document.getElementById('add-stunt-btn')?.addEventListener('click', () => {
        character.stunts.push({ name: '', description: '' });
        if (character.stunts.length > 3) {
          character.refresh = Math.max(1, 3 - (character.stunts.length - 3));
        }
        render();
      });
      container.querySelectorAll('.remove-stunt').forEach(btn => {
        btn.addEventListener('click', () => {
          character.stunts.splice(parseInt(btn.dataset.index), 1);
          character.refresh = Math.max(1, 3 - Math.max(0, character.stunts.length - 3));
          render();
        });
      });
      container.querySelectorAll('.stunt-name').forEach(input => {
        input.addEventListener('input', e => {
          character.stunts[parseInt(e.target.dataset.index)].name = e.target.value;
        });
      });
      container.querySelectorAll('.stunt-desc').forEach(input => {
        input.addEventListener('input', e => {
          character.stunts[parseInt(e.target.dataset.index)].description = e.target.value;
        });
      });
    }
  }

  function collectCurrentStepData() {
    // Data is collected via event listeners
  }

  render();
}
