// ═══════════════════════════════════════
// Game Session — Scene management
// ═══════════════════════════════════════

import { loadCharacters, saveSession, loadSession } from '../engine/storage.js';
import { createConflict, createContest, createChallenge, setTurnOrder, addSituationAspect, removeSituationAspect, logAction, endScene } from '../engine/conflict.js';
import { rollFateDice, calculateResult, getOutcome, getLadderLabel, getDieSymbol, getDieClass, getOutcomeDisplay } from '../engine/dice.js';
import { invoke, compel } from '../engine/fate-points.js';
import { SKILL_LIST, SKILL_TRANSLATIONS } from '../engine/skills.js';
import { saveCharacter, getCharacter } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

export async function renderGameSessionPage(container, navigate) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Yükleniyor...</p></div>`;
    const allCharacters = await loadCharacters();
    let session = (await loadSession()) || { scene: null, selectedCharacters: [] };
    let activeCharId = session.selectedCharacters?.[0] || null;
    let cachedActiveChar = activeCharId ? await getCharacter(activeCharId) : null;

    function getActiveChar() {
        return cachedActiveChar;
    }

    function render() {
        container.innerHTML = `
      <div class="session-page">
        <div class="section-header animate-in">
          <h2>⚡ Oyun Oturumu</h2>
          <p>Sahne yönetimi ve aksiyon çözümü</p>
        </div>

        ${allCharacters.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">✦</div>
            <p>Oyuna başlamak için önce karakter oluşturun</p>
            <button class="btn btn-gold" id="go-create">Karakter Oluştur</button>
          </div>
        ` : `
          <div class="grid-2">
            <!-- Left: Scene Management -->
            <div>
              <!-- Character Select -->
              <div class="card animate-in animate-in-delay-1" style="margin-bottom: var(--sp-lg);">
                <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Aktif Karakter</h3>
                <div style="display: flex; gap: var(--sp-sm); flex-wrap: wrap;">
                  ${allCharacters.map(c => `
                    <button class="btn ${activeCharId === c.id ? 'btn-gold' : 'btn-outline'} btn-sm char-select-btn" 
                            data-id="${c.id}">
                      ${c.name || 'İsimsiz'}
                    </button>
                  `).join('')}
                </div>
                ${getActiveChar() ? `
                  <div style="margin-top: var(--sp-md); padding: var(--sp-md); background: rgba(240,165,0,0.05); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 600;">${getActiveChar().name}</span>
                      <div class="fp-counter" style="gap: var(--sp-sm);">
                        <button class="fp-btn" id="session-fp-minus">−</button>
                        <div class="fp-token" style="width: 36px; height: 36px; font-size: 1rem;">${getActiveChar().fatePoints}</div>
                        <button class="fp-btn" id="session-fp-plus">+</button>
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- Scene Launcher -->
              ${!session.scene ? `
                <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
                  <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Sahne Başlat</h3>
                  <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
                    <button class="btn btn-purple scene-start-btn" data-type="conflict">
                      ⚔ Conflict — Çatışma
                    </button>
                    <button class="btn btn-outline scene-start-btn" data-type="contest">
                      🏃 Contest — Yarışma
                    </button>
                    <button class="btn btn-outline scene-start-btn" data-type="challenge">
                      🧩 Challenge — Mücadele
                    </button>
                  </div>
                  <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: var(--sp-md);">
                    <strong>Conflict:</strong> Fiziksel/sosyal çatışma<br/>
                    <strong>Contest:</strong> Rakipler arası yarış<br/>
                    <strong>Challenge:</strong> Engeller dizisi
                  </p>
                </div>
              ` : `
                <!-- Active Scene -->
                <div class="card card-purple animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-md);">
                    <h3 style="font-family: var(--font-display);">
                      ${session.scene.type === 'conflict' ? '⚔ Conflict' : session.scene.type === 'contest' ? '🏃 Contest' : '🧩 Challenge'}
                    </h3>
                    <div style="display: flex; gap: var(--sp-sm);">
                      ${session.scene.type === 'conflict' ? `
                        <span class="badge badge-purple">Round ${session.scene.round}</span>
                      ` : ''}
                      <button class="btn btn-danger btn-sm" id="end-scene-btn">Sahneyi Bitir</button>
                    </div>
                  </div>

                  ${session.scene.type === 'conflict' ? renderConflictUI() : ''}
                  ${session.scene.type === 'contest' ? renderContestUI() : ''}
                  ${session.scene.type === 'challenge' ? renderChallengeUI() : ''}
                </div>

                <!-- Situation Aspects -->
                <div class="card animate-in animate-in-delay-3" style="margin-bottom: var(--sp-lg);">
                  <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Durum Aspect'leri</h3>
                  <div style="display: flex; gap: var(--sp-sm); margin-bottom: var(--sp-md);">
                    <input class="input" id="new-aspect-input" placeholder="Yeni durum aspect'i..." style="flex: 1;" />
                    <button class="btn btn-outline btn-sm" id="add-aspect-btn">+</button>
                  </div>
                  ${session.scene.situationAspects?.length > 0 ? session.scene.situationAspects.map((a, i) => `
                    <div class="aspect-card free" style="margin-bottom: var(--sp-sm); display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div class="aspect-type">Durum</div>
                        <div class="aspect-text">${a.text}</div>
                        ${a.freeInvokes > 0 ? `<span class="badge badge-gold" style="margin-top: 4px;">Ücretsiz Invoke: ${a.freeInvokes}</span>` : ''}
                      </div>
                      <button class="btn btn-sm btn-outline remove-aspect-btn" data-index="${i}">✕</button>
                    </div>
                  `).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">Henüz aspect eklenmedi</p>'}
                </div>
              `}

              <!-- Quick Actions -->
              <div class="card animate-in animate-in-delay-3">
                <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">Hızlı Aksiyon</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-sm);">
                  <div>
                    <label class="label">Yetenek</label>
                    <select class="select" id="action-skill">
                      <option value="0">Seçin...</option>
                      ${getActiveChar() ? Object.entries(getActiveChar().skills)
                .filter(([, r]) => r > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([s, r]) => `<option value="${r}" data-skill="${s}">${SKILL_TRANSLATIONS[s]} (+${r})</option>`)
                .join('') : SKILL_LIST.map(s => `<option value="0">${SKILL_TRANSLATIONS[s]}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="label">Zorluk</label>
                    <select class="select" id="action-difficulty">
                      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => `<option value="${d}">+${d} ${getLadderLabel(d)}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-sm); margin-top: var(--sp-md);">
                  <button class="btn btn-outline btn-sm action-btn" data-action="overcome">🔓 Overcome</button>
                  <button class="btn btn-outline btn-sm action-btn" data-action="advantage">✨ Create Advantage</button>
                  <button class="btn btn-outline btn-sm action-btn" data-action="attack">⚔ Attack</button>
                  <button class="btn btn-outline btn-sm action-btn" data-action="defend">🛡 Defend</button>
                </div>
              </div>
            </div>

            <!-- Right: Action Log -->
            <div>
              <div class="card animate-in animate-in-delay-2" style="position: sticky; top: 80px;">
                <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">📜 Olay Günlüğü</h3>
                <div class="action-log" id="action-log">
                  ${(session.scene?.log || []).length > 0 ?
                session.scene.log.slice().reverse().map(entry => `
                      <div class="log-entry ${entry.type}">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">
                          ${new Date(entry.timestamp).toLocaleTimeString('tr-TR')}
                        </span>
                        <span style="margin-left: var(--sp-sm);">${entry.message}</span>
                      </div>
                    `).join('') : `
                      <div class="empty-state" style="padding: var(--sp-lg);">
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Henüz aksiyon yapılmadı</p>
                      </div>
                    `
            }
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

        bindEvents();
    }

    function renderConflictUI() {
        return `
      <div>
        <span class="label">Sıra (tıklayarak seçin)</span>
        <div style="display: flex; gap: var(--sp-sm); flex-wrap: wrap;">
          ${(session.scene.participants || []).map(p => `
            <button class="btn btn-sm ${p.hasActed ? 'btn-outline' : 'btn-purple'} turn-btn" 
                    data-char="${p.characterId}" ${p.hasActed ? 'disabled style="opacity:0.5;"' : ''}>
              ${p.name} ${p.hasActed ? '✓' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    }

    function renderContestUI() {
        return `
      <div>
        <span class="label">Zaferler (${session.scene.victoriesNeeded} gerekli)</span>
        <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
          ${(session.scene.participants || []).map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--sp-sm); background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
              <span>${p.name}</span>
              <div style="display: flex; align-items: center; gap: var(--sp-sm);">
                <span class="badge ${p.victories >= session.scene.victoriesNeeded ? 'badge-success' : 'badge-gold'}">
                  ${p.victories} / ${session.scene.victoriesNeeded}
                </span>
                <button class="btn btn-sm btn-outline victory-btn" data-char="${p.characterId}">+1</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }

    function renderChallengeUI() {
        return `
      <div>
        <span class="label">Engeller</span>
        <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
          ${(session.scene.obstacles || []).map((o, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--sp-sm); background: rgba(255,255,255,0.03); border-radius: var(--radius-sm);">
              <div>
                <span ${o.resolved ? 'style="text-decoration: line-through; opacity: 0.5;"' : ''}>${o.description}</span>
                <span class="badge badge-gold" style="margin-left: var(--sp-sm);">Zorluk: +${o.difficulty}</span>
              </div>
              ${!o.resolved ? `
                <button class="btn btn-sm btn-outline obstacle-btn" data-index="${i}">Çöz</button>
              ` : `
                <span class="badge badge-success">✓ Çözüldü</span>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }

    function bindEvents() {
        document.getElementById('go-create')?.addEventListener('click', () => navigate('character-creator'));

        // Character select
        container.querySelectorAll('.char-select-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                activeCharId = btn.dataset.id;
                cachedActiveChar = await getCharacter(activeCharId);
                session.selectedCharacters = [activeCharId];
                await saveSession(session);
                render();
            });
        });

        // FP controls
        document.getElementById('session-fp-minus')?.addEventListener('click', async () => {
            const char = getActiveChar();
            if (char && char.fatePoints > 0) {
                char.fatePoints--;
                await saveCharacter(char);
                render();
            }
        });
        document.getElementById('session-fp-plus')?.addEventListener('click', async () => {
            const char = getActiveChar();
            if (char) {
                char.fatePoints++;
                await saveCharacter(char);
                render();
            }
        });

        // Scene start
        container.querySelectorAll('.scene-start-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const type = btn.dataset.type;
                if (type === 'conflict') {
                    session.scene = createConflict(allCharacters);
                } else if (type === 'contest') {
                    session.scene = createContest(allCharacters, '', 3);
                } else {
                    session.scene = createChallenge([
                        { description: 'Engel 1', difficulty: 2 },
                        { description: 'Engel 2', difficulty: 3 },
                        { description: 'Engel 3', difficulty: 4 },
                    ]);
                }
                await saveSession(session);
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} sahnesi başlatıldı!`, 'success');
                render();
            });
        });

        // End scene
        document.getElementById('end-scene-btn')?.addEventListener('click', async () => {
            if (session.scene) {
                endScene(session.scene);
                session.scene = null;
                await saveSession(session);
                showToast('Sahne sona erdi', 'info');
                render();
            }
        });

        // Turn order (conflict)
        container.querySelectorAll('.turn-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (session.scene) {
                    setTurnOrder(session.scene, btn.dataset.char);
                    await saveSession(session);
                    render();
                }
            });
        });

        // Victory (contest)
        container.querySelectorAll('.victory-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (session.scene) {
                    const p = session.scene.participants.find(p => p.characterId === btn.dataset.char);
                    if (p) {
                        p.victories++;
                        logAction(session.scene, 'advantage', `${p.name} 1 zafer kazandı (${p.victories}/${session.scene.victoriesNeeded})`);
                        if (p.victories >= session.scene.victoriesNeeded) {
                            logAction(session.scene, 'info', `🏆 ${p.name} yarışmayı kazandı!`);
                            showToast(`${p.name} yarışmayı kazandı!`, 'success');
                        }
                        await saveSession(session);
                        render();
                    }
                }
            });
        });

        // Obstacle (challenge)
        container.querySelectorAll('.obstacle-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (session.scene) {
                    const idx = parseInt(btn.dataset.index);
                    const obstacle = session.scene.obstacles[idx];
                    if (obstacle) {
                        const skill = parseInt(document.getElementById('action-skill')?.value || '0');
                        const dice = rollFateDice();
                        const result = calculateResult(dice, skill);
                        const out = getOutcome(result, obstacle.difficulty);
                        const disp = getOutcomeDisplay(out.outcome);

                        obstacle.resolved = out.outcome !== 'fail';
                        obstacle.result = out.outcome;
                        logAction(session.scene, 'roll',
                            `${getActiveChar()?.name || 'Oyuncu'} engeli çözmeye çalıştı: ${obstacle.description} → ${disp.emoji} ${disp.label} (${result >= 0 ? '+' : ''}${result} vs +${obstacle.difficulty})`
                        );
                        await saveSession(session);
                        showToast(`${disp.emoji} ${disp.label}`, out.outcome === 'fail' ? 'error' : 'success');
                        render();
                    }
                }
            });
        });

        // Situation aspects
        document.getElementById('add-aspect-btn')?.addEventListener('click', async () => {
            const input = document.getElementById('new-aspect-input');
            if (input?.value.trim() && session.scene) {
                addSituationAspect(session.scene, input.value.trim());
                await saveSession(session);
                render();
            }
        });
        container.querySelectorAll('.remove-aspect-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (session.scene) {
                    removeSituationAspect(session.scene, parseInt(btn.dataset.index));
                    await saveSession(session);
                    render();
                }
            });
        });

        // Action buttons
        container.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const actionType = btn.dataset.action;
                const skill = parseInt(document.getElementById('action-skill')?.value || '0');
                const difficulty = parseInt(document.getElementById('action-difficulty')?.value || '0');
                const char = getActiveChar();

                const dice = rollFateDice();
                const result = calculateResult(dice, skill);
                const out = getOutcome(result, difficulty);
                const disp = getOutcomeDisplay(out.outcome);

                const actionLabels = { overcome: 'Overcome', advantage: 'Create Advantage', attack: 'Attack', defend: 'Defend' };
                const msg = `${char?.name || 'Oyuncu'} → ${actionLabels[actionType]}: [${dice.map(getDieSymbol).join(' ')}] ${result >= 0 ? '+' : ''}${result} vs +${difficulty} → ${disp.emoji} ${disp.label} (${out.shifts >= 0 ? '+' : ''}${out.shifts} shift)`;

                if (session.scene) {
                    logAction(session.scene, actionType === 'attack' ? 'attack' : actionType === 'defend' ? 'defend' : actionType === 'advantage' ? 'advantage' : 'roll', msg);
                    await saveSession(session);
                }

                showToast(`${disp.emoji} ${disp.label}: ${result >= 0 ? '+' : ''}${result}`, out.outcome === 'fail' ? 'error' : 'success');
                render();
            });
        });
    }

    render();
}
