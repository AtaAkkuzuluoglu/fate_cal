// ═══════════════════════════════════════
// Dice Roller Page
// ═══════════════════════════════════════

import { rollFateDice, calculateResult, getOutcome, getLadderLabel, getDieSymbol, getDieClass, getOutcomeDisplay } from '../engine/dice.js';
import { SKILL_LIST, SKILL_TRANSLATIONS } from '../engine/skills.js';
import { showToast } from '../components/toast.js';

export function renderDiceRollerPage(container) {
  let rollHistory = [];
  let selectedSkill = '';
  let skillRating = 0;
  let bonus = 0;
  let difficulty = 0;
  let currentDice = null;

  function render() {
    container.innerHTML = `
      <div class="dice-page">
        <div class="section-header animate-in">
          <h2>🎲 Zar Atma</h2>
          <p>4 Fate Zarı (4dF) ile aksiyonunuzu çözün</p>
        </div>

        <div class="grid-2">
          <!-- Left: Dice & Controls -->
          <div class="animate-in animate-in-delay-1">
            <!-- Dice Display -->
            <div class="card" style="text-align: center; margin-bottom: var(--sp-lg);">
              <div class="dice-container" id="dice-display" style="margin-bottom: var(--sp-lg);">
                ${currentDice ? currentDice.map((d, i) => `
                  <div class="fate-die ${getDieClass(d)} rolling" style="animation-delay: ${i * 0.1}s">
                    ${getDieSymbol(d)}
                  </div>
                `).join('') : `
                  <div class="fate-die blank">?</div>
                  <div class="fate-die blank">?</div>
                  <div class="fate-die blank">?</div>
                  <div class="fate-die blank">?</div>
                `}
              </div>

              ${currentDice ? (() => {
        const result = calculateResult(currentDice, skillRating, bonus);
        const out = getOutcome(result, difficulty);
        const display = getOutcomeDisplay(out.outcome);
        return `
                  <div class="roll-result">
                    <div class="result-total" style="font-size: 2.5rem; font-weight: 900; color: ${result > 0 ? 'var(--success)' : result < 0 ? 'var(--danger)' : 'var(--warning)'}; margin-bottom: var(--sp-sm);">
                      ${display.emoji} ${result >= 0 ? '+' : ''}${result}
                    </div>
                    <div class="result-ladder" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: var(--sp-sm);">
                      ${getLadderLabel(result)}
                    </div>
                    <div class="result-outcome" style="font-size: 1.1rem; font-weight: 700; color: ${display.color};">
                      ${display.label}
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: var(--sp-sm);">
                      Zar: ${currentDice.reduce((s, d) => s + d, 0) >= 0 ? '+' : ''}${currentDice.reduce((s, d) => s + d, 0)}
                      ${skillRating ? ` | Yetenek: +${skillRating}` : ''}
                      ${bonus ? ` | Bonus: +${bonus}` : ''}
                      | Shift: ${out.shifts >= 0 ? '+' : ''}${out.shifts}
                    </div>
                  </div>
                `;
      })() : `
                <p style="color: var(--text-muted); font-style: italic;">Zar atın ve sonucu görün</p>
              `}

              <button class="btn btn-gold btn-lg" id="roll-btn" style="margin-top: var(--sp-lg); min-width: 200px;">
                🎲 Zar At!
              </button>
            </div>

            <!-- Controls -->
            <div class="card">
              <h3 style="margin-bottom: var(--sp-md); font-family: var(--font-display);">Ayarlar</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-md);">
                <div>
                  <label class="label">Yetenek</label>
                  <select class="select" id="skill-select">
                    <option value="">Yetenek Seçin</option>
                    ${SKILL_LIST.map(s => `
                      <option value="${s}" ${s === selectedSkill ? 'selected' : ''}>
                        ${SKILL_TRANSLATIONS[s]} (${s})
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="label">Yetenek Seviyesi</label>
                  <select class="select" id="skill-rating">
                    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(r => `
                      <option value="${r}" ${r === skillRating ? 'selected' : ''}>
                        +${r} ${getLadderLabel(r)}
                      </option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="label">Bonus (+2 Invoke vb.)</label>
                  <select class="select" id="bonus-select">
                    ${[0, 2, 4, 6, 8].map(b => `
                      <option value="${b}" ${b === bonus ? 'selected' : ''}>+${b}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: History & Ladder -->
          <div class="animate-in animate-in-delay-2">
            <!-- Ladder Reference -->
            <div class="card" style="margin-bottom: var(--sp-lg);">
              <h3 style="margin-bottom: var(--sp-md); font-family: var(--font-display);">Merdiven</h3>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${[8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4].map(v => {
        let vColor = 'var(--warning)'; // 0
        if (v > 0) vColor = 'var(--success)';
        if (v < 0) vColor = 'var(--danger)';
        return `
                  <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-radius: 4px;
                    background: ${currentDice && calculateResult(currentDice, skillRating, bonus) === v ? (v > 0 ? 'rgba(76,175,80,0.1)' : v < 0 ? 'rgba(244,67,54,0.1)' : 'rgba(240,165,0,0.1)') : 'transparent'};">
                    <span class="ladder-label" data-value="${v}" style="font-size: 0.8rem; color: ${vColor}; font-weight: bold;">
                      ${v >= 0 ? '+' : ''}${v}
                    </span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${getLadderLabel(v)}</span>
                  </div>
                `;
      }).join('')}
              </div>
            </div>

            <!-- Roll History -->
            <div class="card">
              <h3 style="margin-bottom: var(--sp-md); font-family: var(--font-display);">Atış Geçmişi</h3>
              ${rollHistory.length > 0 ? `
                <div class="action-log">
                  ${rollHistory.slice().reverse().map(h => {
        const disp = getOutcomeDisplay(h.outcome);
        return `
                      <div class="log-entry roll">
                        <span style="color: ${disp.color}; font-weight: 700;">
                          ${disp.emoji} ${h.result >= 0 ? '+' : ''}${h.result}
                        </span>
                        <span style="margin-left: 8px;">${disp.label}</span>
                        ${h.skill ? `<span style="margin-left: 8px; color: var(--text-muted);">(${SKILL_TRANSLATIONS[h.skill] || h.skill} +${h.skillRating})</span>` : ''}
                      </div>
                    `;
      }).join('')}
                </div>
              ` : `
                <div class="empty-state" style="padding: var(--sp-lg);">
                  <p style="color: var(--text-muted); font-size: 0.85rem;">Henüz atış yapılmadı</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('roll-btn').addEventListener('click', doRoll);
    document.getElementById('skill-select').addEventListener('change', e => {
      selectedSkill = e.target.value;
    });
    document.getElementById('skill-rating').addEventListener('change', e => {
      skillRating = parseInt(e.target.value);
    });
    document.getElementById('bonus-select').addEventListener('change', e => {
      bonus = parseInt(e.target.value);
    });
  }

  function doRoll() {
    currentDice = rollFateDice();
    const result = calculateResult(currentDice, skillRating, bonus);
    const out = getOutcome(result, difficulty);
    const display = getOutcomeDisplay(out.outcome);

    rollHistory.push({
      dice: [...currentDice],
      skill: selectedSkill,
      skillRating,
      bonus,
      difficulty,
      result,
      outcome: out.outcome,
      shifts: out.shifts,
      timestamp: Date.now()
    });

    render();
    showToast(`${display.emoji} ${display.label}: ${result >= 0 ? '+' : ''}${result}`,
      result > 0 ? 'success' : result < 0 ? 'error' : 'warning'
    );
  }

  render();
}
