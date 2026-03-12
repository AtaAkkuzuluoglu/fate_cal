// ═══════════════════════════════════════
// Campaign Hub — Shared notes and character list
// ═══════════════════════════════════════

import {
    getCurrentUser,
    addCharacterToCampaign,
    getCampaignCharacters,
    getCampaignNotes,
    saveCampaignNotes
} from '../engine/storage.js';
import { showToast } from '../components/toast.js';
import { t } from '../engine/i18n.js';

export async function renderCampaignPage(container, navigate) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>${t('loading')}</p></div>`;

    const user = getCurrentUser();
    if (!user) {
        navigate('auth');
        return;
    }

    const isDM = user.role === 'dm';

    let characters = [];
    let notes = '';

    try {
        const [charsData, notesData] = await Promise.all([
            getCampaignCharacters(),
            getCampaignNotes()
        ]);
        characters = charsData || [];
        notes = notesData ? notesData.content : '';
    } catch (err) {
        console.error('Failed to load campaign data:', err);
        showToast(t('toast.error'), 'error');
    }

    function render() {
        container.innerHTML = `
            <div class="session-page">
                <div class="section-header animate-in">
                    <h2>🗺️ ${t('nav.campaign')}</h2>
                    <p>${isDM ? t('campaign.title_dm') : t('campaign.title_player')}</p>
                </div>

                <div class="grid-2">
                    <!-- Left: Shared Notes -->
                    <div class="card animate-in animate-in-delay-1" style="display: flex; flex-direction: column; min-height: 500px;">
                        <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-sm);">
                            ${t('campaign.notes_title')}
                        </h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--sp-md);">
                            ${isDM ? t('campaign.notes_desc_dm') : t('campaign.notes_desc_player')}
                        </p>
                        
                        <textarea id="campaign-notes" class="input" style="flex: 1; resize: none; font-family: monospace; line-height: 1.5; padding: var(--sp-md);" placeholder="${t('campaign.notes_ph')}">${notes}</textarea>
                        
                        <div style="display: flex; justify-content: flex-end; margin-top: var(--sp-md);">
                            <button id="save-notes-btn" class="btn btn-gold">${t('campaign.notes_save')}</button>
                        </div>
                    </div>

                    <!-- Right: Characters -->
                    <div>
                        ${isDM ? `
                            <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
                                <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-sm);">${t('campaign.add_char_title')}</h3>
                                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--sp-md);">
                                    ${t('campaign.add_char_desc')}
                                </p>
                                <div style="display: flex; gap: var(--sp-sm);">
                                    <input type="text" id="add-char-input" class="input" placeholder="${t('campaign.add_char_ph')}" style="flex: 1;">
                                    <button id="add-char-btn" class="btn btn-purple">${t('campaign.add_char_btn')}</button>
                                </div>
                            </div>
                        ` : ''}

                        <div class="card animate-in animate-in-delay-3">
                            <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">
                                ${isDM ? t('campaign.chars_title_dm') : t('campaign.chars_title_player')}
                            </h3>
                            
                            ${characters.length === 0 ? `
                                <div class="empty-state" style="padding: var(--sp-xl) var(--sp-md);">
                                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                                        ${isDM ? t('campaign.no_chars_dm') : t('campaign.no_chars_player')}
                                    </p>
                                    ${!isDM ? `
                                        <button class="btn btn-outline btn-sm" style="margin-top: var(--sp-md);" id="go-create-btn">${t('campaign.char_go_create')}</button>
                                    ` : ''}
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
                                    ${characters.map(c => `
                                        <div class="aspect-card free campaign-char-card" style="cursor: pointer;" data-id="${c.id}">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <div style="font-weight: 600; font-size: 1.1rem; color: var(--gold);">${c.name || t('creator.summary.unnamed')}</div>
                                                    <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
                                                        ${c.aspects?.highConcept || t('campaign.char_no_concept')}
                                                    </div>
                                                </div>
                                                <div style="text-align: right;">
                                                    <div class="badge badge-purple" style="margin-bottom: 4px;">FP: ${c.fatePoints || 0}</div><br>
                                                    <div class="badge badge-gold">Refresh: ${c.refresh || 3}</div>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: var(--sp-md); text-align: center;">${t('campaign.char_click_hint')}</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindEvents();
    }

    function bindEvents() {
        const saveNotesBtn = document.getElementById('save-notes-btn');
        if (saveNotesBtn) {
            saveNotesBtn.addEventListener('click', async () => {
                const content = document.getElementById('campaign-notes').value;
                const originalText = saveNotesBtn.innerText;
                saveNotesBtn.innerText = `⏳ ${t('toast.saving', { default: 'Kaydediliyor...' })}`;
                saveNotesBtn.disabled = true;

                try {
                    await saveCampaignNotes(content);
                    showToast(t('toast.saved'), 'success');
                } catch (err) {
                    showToast(t('toast.error'), 'error');
                } finally {
                    saveNotesBtn.innerText = originalText;
                    saveNotesBtn.disabled = false;
                }
            });
        }

        const addCharBtn = document.getElementById('add-char-btn');
        if (addCharBtn) {
            addCharBtn.addEventListener('click', async () => {
                const input = document.getElementById('add-char-input');
                const code = input.value.trim();

                if (!code) {
                    showToast(t('toast.error'), 'error');
                    return;
                }

                addCharBtn.disabled = true;
                addCharBtn.innerText = '...';

                try {
                    await addCharacterToCampaign(code);
                    showToast(t('toast.saved'), 'success');
                    input.value = '';

                    // Reload characters
                    const charsData = await getCampaignCharacters();
                    characters = charsData || [];
                    render();
                } catch (err) {
                    showToast(t('toast.error'), 'error');
                } finally {
                    addCharBtn.disabled = false;
                    addCharBtn.innerText = t('campaign.add_char_btn');
                }
            });
        }

        const goCreateBtn = document.getElementById('go-create-btn');
        if (goCreateBtn) {
            goCreateBtn.addEventListener('click', () => {
                navigate('character-creator');
            });
        }

        container.querySelectorAll('.campaign-char-card').forEach(card => {
            card.addEventListener('click', () => {
                navigate('character-sheet', { id: card.dataset.id });
            });
        });
    }

    render();
}
