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

export async function renderCampaignPage(container, navigate) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>Serüven yükleniyor...</p></div>`;

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
        showToast('Serüven verileri yüklenirken hata oluştu', 'error');
    }

    function render() {
        container.innerHTML = `
            <div class="session-page">
                <div class="section-header animate-in">
                    <h2>🗺️ Serüven</h2>
                    <p>${isDM ? 'Oyun Yöneticisi Paneli' : 'Oyuncu Paneli'}</p>
                </div>

                <div class="grid-2">
                    <!-- Left: Shared Notes -->
                    <div class="card animate-in animate-in-delay-1" style="display: flex; flex-direction: column; min-height: 500px;">
                        <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-sm);">
                            📜 Ortak Serüven Notları
                        </h3>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--sp-md);">
                            ${isDM ? 'Senin ve oyuncularının paylaştığı ortak notlar.' : 'Serüvende alınan ortak notlar. DM ve tüm oyuncular görebilir.'}
                        </p>
                        
                        <textarea id="campaign-notes" class="input" style="flex: 1; resize: none; font-family: monospace; line-height: 1.5; padding: var(--sp-md);" placeholder="Buraya notlarınızı yazın...">${notes}</textarea>
                        
                        <div style="display: flex; justify-content: flex-end; margin-top: var(--sp-md);">
                            <button id="save-notes-btn" class="btn btn-gold">💾 Notları Kaydet</button>
                        </div>
                    </div>

                    <!-- Right: Characters -->
                    <div>
                        ${isDM ? `
                            <div class="card animate-in animate-in-delay-2" style="margin-bottom: var(--sp-lg);">
                                <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-sm);">Karakter Ekle</h3>
                                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--sp-md);">
                                    Oyuncularının sana verdiği "Serüven Kodu"nu girerek karakterlerini bu serüvene ekleyebilirsin.
                                </p>
                                <div style="display: flex; gap: var(--sp-sm);">
                                    <input type="text" id="add-char-input" class="input" placeholder="Örn: char_1703212410294" style="flex: 1;">
                                    <button id="add-char-btn" class="btn btn-purple">Ekle</button>
                                </div>
                            </div>
                        ` : ''}

                        <div class="card animate-in animate-in-delay-3">
                            <h3 style="font-family: var(--font-display); margin-bottom: var(--sp-md);">
                                ${isDM ? 'Serüvendeki Karakterler' : 'Senin Karakterlerin'}
                            </h3>
                            
                            ${characters.length === 0 ? `
                                <div class="empty-state" style="padding: var(--sp-xl) var(--sp-md);">
                                    <p style="color: var(--text-muted); font-size: 0.9rem;">
                                        ${isDM ? 'Henüz bu serüvene karakter eklenmemiş.' : 'Henüz karakter yaratmadın.'}
                                    </p>
                                    ${!isDM ? `
                                        <button class="btn btn-outline btn-sm" style="margin-top: var(--sp-md);" id="go-create-btn">Karakter Yarat</button>
                                    ` : ''}
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: var(--sp-sm);">
                                    ${characters.map(c => `
                                        <div class="aspect-card free" style="cursor: pointer;" onclick="window.location.hash = 'character-sheet/${c.id}'">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <div style="font-weight: 600; font-size: 1.1rem; color: var(--gold);">${c.name || 'İsimsiz Karakter'}</div>
                                                    <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 2px;">
                                                        ${c.aspects?.highConcept || 'Konsept belirtilmemiş'}
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
                                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: var(--sp-md); text-align: center;">Karakterin tam sayfasına gitmek için üzerine tıkla.</p>
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
                saveNotesBtn.innerText = '⏳ Kaydediliyor...';
                saveNotesBtn.disabled = true;

                try {
                    await saveCampaignNotes(content);
                    showToast('Serüven notları başarıyla kaydedildi!', 'success');
                } catch (err) {
                    showToast(err.message || 'Notlar kaydedilemedi', 'error');
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
                    showToast('Lütfen bir karakter kodu girin', 'error');
                    return;
                }

                addCharBtn.disabled = true;
                addCharBtn.innerText = '...';

                try {
                    await addCharacterToCampaign(code);
                    showToast('Karakter başarıyla eklendi!', 'success');
                    input.value = '';

                    // Reload characters
                    const charsData = await getCampaignCharacters();
                    characters = charsData || [];
                    render();
                } catch (err) {
                    showToast(err.message || 'Karakter eklenemedi', 'error');
                } finally {
                    addCharBtn.disabled = false;
                    addCharBtn.innerText = 'Ekle';
                }
            });
        }

        const goCreateBtn = document.getElementById('go-create-btn');
        if (goCreateBtn) {
            goCreateBtn.addEventListener('click', () => {
                navigate('character-creator');
            });
        }
    }

    render();
}
