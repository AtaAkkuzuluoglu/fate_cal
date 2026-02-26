// ═══════════════════════════════════════
// Character Creator — Step-by-step wizard
// ═══════════════════════════════════════

import { createCharacter } from '../engine/character.js';
import { SKILL_LIST, SKILL_TRANSLATIONS, PYRAMID_STRUCTURE, validateSkillPyramid, getRatingLabel } from '../engine/skills.js';
import { saveCharacter } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

const STEPS = [
  { id: 'basics', label: 'Temel' },
  { id: 'aspects', label: 'Aspect' },
  { id: 'skills', label: 'Yetenekler' },
  { id: 'stunts', label: 'Stunt' },
  { id: 'summary', label: 'Özet' },
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
            <span class="step-label">${step.label}</span>
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
            <h3 style="margin-bottom: var(--sp-lg); font-family: var(--font-display);">Karakter Temelleri</h3>
            <div style="margin-bottom: var(--sp-lg);">
              <label class="label">Karakter Adı</label>
              <input class="input" id="char-name" value="${character.name}" placeholder="Karakterinizin adını girin..." />
            </div>
            <div>
              <label class="label">Notlar (opsiyonel)</label>
              <textarea class="textarea" id="char-notes" placeholder="Arka plan, görünüş, kişilik...">${character.notes}</textarea>
            </div>
          </div>
        `;

      case 'aspects':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">Aspect'ler</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              Karakterinizi tanımlayan 5 ifade. Invoke ve Compel mekanikleri ile oyunu etkiler.
            </p>
            ${[
            { key: 'highConcept', label: 'High Concept', hint: 'Karakterinizin özü nedir?', type: 'high-concept' },
            { key: 'trouble', label: 'Trouble', hint: 'Tekrarlayan sorun veya zayıflık', type: 'trouble' },
            { key: 'relationship', label: 'Relationship', hint: 'Önemli bir ilişki veya bağ', type: 'relationship' },
            { key: 'free1', label: 'Serbest Aspect 1', hint: 'Ekstra bir özellik veya geçmiş', type: 'free' },
            { key: 'free2', label: 'Serbest Aspect 2', hint: 'Başka bir önemli detay', type: 'free' },
          ].map(a => `
              <div class="aspect-input-group" style="margin-bottom: var(--sp-md);">
                <label class="label">
                  <span class="aspect-dot aspect-dot-${a.type}"></span>
                  ${a.label}
                </label>
                <input class="input aspect-field" data-key="${a.key}" 
                  value="${character.aspects[a.key]}" 
                  placeholder="${a.hint}" />
              </div>
            `).join('')}
          </div>
        `;

      case 'skills':
        return `
          <div class="card animate-in">
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">Yetenek Piramidi</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              1×Great(+4), 2×Good(+3), 3×Fair(+2), 4×Average(+1). Diğerleri Mediocre(+0).
            </p>
            ${PYRAMID_STRUCTURE.map(level => `
              <div style="margin-bottom: var(--sp-lg);">
                <div style="display: flex; align-items: center; gap: var(--sp-sm); margin-bottom: var(--sp-sm);">
                  <span class="badge badge-gold">+${level.rating}</span>
                  <span style="font-weight: 600; font-size: 0.85rem;">${level.label} — ${level.count} yetenek</span>
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
                        <option value="">Seçin...</option>
                        ${SKILL_LIST.map(s => `
                          <option value="${s}" 
                            ${s === current ? 'selected' : ''}
                            ${character.skills[s] > 0 && s !== current ? 'disabled' : ''}>
                            ${SKILL_TRANSLATIONS[s]}
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
            <h3 style="margin-bottom: var(--sp-sm); font-family: var(--font-display);">Stunt'lar</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--sp-lg);">
              3 ücretsiz stunt. Ek stunt'lar Refresh'i düşürür (min 1).
              Örnek: "Bir yeteneği belirli bir durumda +2 bonus ile kullan."
            </p>
            <div id="stunts-list">
              ${character.stunts.map((s, i) => `
                <div class="stunt-entry" style="margin-bottom: var(--sp-md); display: flex; gap: var(--sp-sm); align-items: flex-start;">
                  <div style="flex: 1;">
                    <input class="input stunt-name" data-index="${i}" placeholder="Stunt adı" value="${s.name}" style="margin-bottom: var(--sp-xs);" />
                    <textarea class="textarea stunt-desc" data-index="${i}" placeholder="Açıklama: Ne yapar?">${s.description}</textarea>
                  </div>
                  <button class="btn btn-danger btn-sm remove-stunt" data-index="${i}">✕</button>
                </div>
              `).join('')}
            </div>
            <button class="btn btn-outline" id="add-stunt-btn" style="margin-top: var(--sp-sm);">+ Stunt Ekle</button>
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
            <h3 style="margin-bottom: var(--sp-lg); font-family: var(--font-display);">Karakter Özeti</h3>
            
            <div style="margin-bottom: var(--sp-lg);">
              <h4 style="color: var(--gold); font-size: 1.5rem; margin-bottom: var(--sp-xs); font-family: var(--font-display);">
                ${character.name || 'İsimsiz Karakter'}
              </h4>
            </div>

            <div style="margin-bottom: var(--sp-lg);">
              <span class="label">Aspect'ler</span>
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

            <div style="margin-bottom: var(--sp-lg);">
              <span class="label">Yetenekler</span>
              ${!validation.valid ? `
                <div style="color: var(--danger); font-size: 0.85rem; margin-bottom: var(--sp-sm);">
                  ⚠ Piramit tamamlanmadı: ${validation.errors.join(', ')}
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
                          <span class="skill-name">${SKILL_TRANSLATIONS[s]}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : '';
            }).join('')}
              </div>
            </div>

            ${character.stunts.length > 0 ? `
              <div style="margin-bottom: var(--sp-lg);">
                <span class="label">Stunt'lar (${character.stunts.length})</span>
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
          <h2>✦ Karakter Oluştur</h2>
          <p>Adım adım karakterinizi yaratın</p>
        </div>
        ${renderWizardProgress()}
        ${renderStepContent()}
        <div class="wizard-buttons" style="display: flex; justify-content: space-between; margin-top: var(--sp-xl);">
          <button class="btn btn-outline" id="prev-btn" ${currentStep === 0 ? 'disabled style="opacity:0.3;pointer-events:none;"' : ''}>
            ← Geri
          </button>
          ${currentStep < STEPS.length - 1 ? `
            <button class="btn btn-gold" id="next-btn">İleri →</button>
          ` : `
            <button class="btn btn-gold btn-lg" id="save-btn">💾 Karakteri Kaydet</button>
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
        showToast('Karakter adı gerekli!', 'error');
        return;
      }
      const success = await saveCharacter(character);
      if (!success) {
        showToast('Karakter kaydedilirken sunucu hatası oluştu!', 'error');
        return;
      }
      showToast(`"${character.name}" kaydedildi!`, 'success');
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
