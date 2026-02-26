// ═══════════════════════════════════════
// I18n — Internationalization Engine
// ═══════════════════════════════════════

const dictionary = {
    // Nav & General
    'nav.home': { tr: 'Ana Sayfa', en: 'Home' },
    'nav.create': { tr: 'Karakter Yarat', en: 'Create Character' },
    'nav.dice': { tr: 'Zar At', en: 'Roll Dice' },
    'nav.campaign': { tr: 'Serüven', en: 'Campaign' },
    'nav.login': { tr: 'Giriş / Kayıt', en: 'Login / Register' },
    'nav.logout': { tr: 'Çıkış', en: 'Logout' },
    'btn.save': { tr: 'Kaydet', en: 'Save' },
    'btn.cancel': { tr: 'İptal', en: 'Cancel' },
    'btn.edit': { tr: 'Düzenle', en: 'Edit' },
    'btn.delete': { tr: 'Sil', en: 'Delete' },
    'btn.back': { tr: 'Geri', en: 'Back' },
    'btn.next': { tr: 'İleri', en: 'Next' },

    'loading': { tr: 'Yükleniyor...', en: 'Loading...' },
    'error.character_not_found': { tr: 'Karakter bulunamadı', en: 'Character not found' },
    'home.back_to_home': { tr: 'Ana Sayfaya Dön', en: 'Back to Home' },

    // Home Page
    'home.title': { tr: 'Fate Condensed\nKarakter Yöneticisi', en: 'Fate Condensed\nCharacter Manager' },
    'home.subtitle': { tr: 'Aspect\'ler, yetenekler ve stunt\'lar ile karakterini yarat', en: 'Create your character with Aspects, skills, and stunts' },
    'home.btn.create': { tr: '✦ Yeni Karakter Yarat', en: '✦ Create New Character' },
    'home.btn.session': { tr: '🎲 Serüven', en: '🎲 Campaign' },
    'home.my_characters': { tr: 'Karakterlerim', en: 'My Characters' },
    'home.no_characters': { tr: 'Henüz karakter yaratmadın.', en: 'You haven\'t created any characters yet.' },

    // Dice
    'dice.ladder.-4': { tr: 'Berbat', en: 'Terrible' },
    'dice.ladder.-3': { tr: 'Korkunç', en: 'Abysmal' },
    'dice.ladder.-2': { tr: 'Kötü', en: 'Poor' },
    'dice.ladder.-1': { tr: 'Zayıf', en: 'Mediocre' },
    'dice.ladder.0': { tr: 'Sıradan', en: 'Average' },
    'dice.ladder.1': { tr: 'Ortalama', en: 'Fair' },
    'dice.ladder.2': { tr: 'Adil', en: 'Good' },
    'dice.ladder.3': { tr: 'İyi', en: 'Great' },
    'dice.ladder.4': { tr: 'Harika', en: 'Superb' },
    'dice.ladder.5': { tr: 'Mükemmel', en: 'Fantastic' },
    'dice.ladder.6': { tr: 'İnanılmaz', en: 'Epic' },
    'dice.ladder.7': { tr: 'Epik', en: 'Legendary' },
    'dice.ladder.8': { tr: 'Efsanevi', en: 'Mythic' },

    'outcome.fail': { tr: 'Başarısız', en: 'Fail' },
    'outcome.tie': { tr: 'Berabere', en: 'Tie' },
    'outcome.success': { tr: 'Başarı', en: 'Success' },
    'outcome.succeed_with_style': { tr: 'Şıklıkla Başarı!', en: 'Succeed with Style!' },

    // Skills
    'skill.athletics': { tr: 'Atletizm', en: 'Athletics' },
    'skill.burglary': { tr: 'Hırsızlık', en: 'Burglary' },
    'skill.contacts': { tr: 'Bağlantılar', en: 'Contacts' },
    'skill.crafts': { tr: 'Zanaat', en: 'Crafts' },
    'skill.deceive': { tr: 'Aldatma', en: 'Deceive' },
    'skill.drive': { tr: 'Sürüş', en: 'Drive' },
    'skill.empathy': { tr: 'Empati', en: 'Empathy' },
    'skill.fight': { tr: 'Dövüş', en: 'Fight' },
    'skill.investigate': { tr: 'Araştırma', en: 'Investigate' },
    'skill.lore': { tr: 'Bilgi', en: 'Lore' },
    'skill.notice': { tr: 'Farkındalık', en: 'Notice' },
    'skill.physique': { tr: 'Fizik', en: 'Physique' },
    'skill.provoke': { tr: 'Tahrik', en: 'Provoke' },
    'skill.rapport': { tr: 'İlişki', en: 'Rapport' },
    'skill.resources': { tr: 'Kaynaklar', en: 'Resources' },
    'skill.shoot': { tr: 'Atıcılık', en: 'Shoot' },
    'skill.stealth': { tr: 'Gizlilik', en: 'Stealth' },
    'skill.will': { tr: 'İrade', en: 'Will' },

    // Character Sheet & Creator
    'char.name_placeholder': { tr: 'Örn: Kaptan Jack', en: 'Ex: Captain Jack' },
    'char.notes_placeholder': { tr: 'Karakterin geçmişi, hedefleri...', en: 'Character backstory, goals...' },
    'char.aspects': { tr: 'Aspect\'ler', en: 'Aspects' },
    'char.stunts': { tr: 'Stunt\'lar', en: 'Stunts' },
    'char.skills': { tr: 'Yetenekler', en: 'Skills' },
    'char.stress': { tr: 'Stres', en: 'Stress' },
    'char.consequences': { tr: 'Consequences', en: 'Consequences' },
    'char.notes': { tr: 'Notlar', en: 'Notes' },
    'char.code': { tr: 'Serüven Kodu', en: 'Campaign Code' },
    'char.fate_points': { tr: 'Fate Points', en: 'Fate Points' },

    'aspect.highConcept': { tr: 'High Concept', en: 'High Concept' },
    'aspect.trouble': { tr: 'Trouble', en: 'Trouble' },
    'aspect.relationship': { tr: 'Relationship', en: 'Relationship' },
    'aspect.free': { tr: 'Aspect', en: 'Aspect' },
    'aspect.free1': { tr: 'Aspect 1', en: 'Aspect 1' },
    'aspect.free2': { tr: 'Aspect 2', en: 'Aspect 2' },
    'aspect.free3': { tr: 'Aspect 3', en: 'Aspect 3' },

    'consequence.mild': { tr: 'Mild (Hafif)', en: 'Mild' },
    'consequence.moderate': { tr: 'Moderate (Orta)', en: 'Moderate' },
    'consequence.severe': { tr: 'Severe (Ağır)', en: 'Severe' },
    'consequence.permanent': { tr: 'Permanent (Kalıcı)', en: 'Permanent' },

    // Creator Steps
    'creator.title': { tr: '✦ Karakter Oluştur', en: '✦ Create Character' },
    'creator.subtitle': { tr: 'Adım adım karakterinizi yaratın', en: 'Create your character step by step' },
    'creator.step.basics': { tr: 'Temel', en: 'Basics' },
    'creator.step.aspects': { tr: 'Aspect', en: 'Aspects' },
    'creator.step.skills': { tr: 'Yetenekler', en: 'Skills' },
    'creator.step.stunts': { tr: 'Stunt', en: 'Stunts' },
    'creator.step.summary': { tr: 'Özet', en: 'Summary' },

    'creator.basics.title': { tr: 'Karakter Temelleri', en: 'Character Basics' },
    'creator.basics.name': { tr: 'Karakter Adı', en: 'Character Name' },
    'creator.basics.name_ph': { tr: 'Karakterinizin adını girin...', en: 'Enter character name...' },
    'creator.basics.notes': { tr: 'Notlar (opsiyonel)', en: 'Notes (optional)' },
    'creator.basics.notes_ph': { tr: 'Arka plan, görünüş, kişilik...', en: 'Backstory, appearance, personality...' },

    'creator.aspects.title': { tr: 'Aspect\'ler', en: 'Aspects' },
    'creator.aspects.desc': { tr: 'Karakterinizi tanımlayan 6 ifade. Invoke ve Compel mekanikleri ile oyunu etkiler.', en: '6 phrases that define your character. They affect the game via Invoke and Compel.' },
    'aspect.highConcept.hint': { tr: 'Karakterinizin özü nedir?', en: 'What is your character\'s core?' },
    'aspect.trouble.hint': { tr: 'Tekrarlayan sorun veya zayıflık', en: 'A recurring problem or weakness' },
    'aspect.relationship.hint': { tr: 'Önemli bir ilişki veya bağ', en: 'An important relationship or bond' },
    'aspect.free.hint': { tr: 'Ekstra bir özellik veya geçmiş', en: 'An extra trait or backstory' },
    'aspect.free2.hint': { tr: 'Başka bir önemli detay', en: 'Another important detail' },
    'aspect.free3.hint': { tr: 'Son dokunuşlar', en: 'Final touches' },

    'creator.skills.title': { tr: 'Yetenek Piramidi', en: 'Skill Pyramid' },
    'creator.skills.desc': { tr: '1×Great(+4), 2×Good(+3), 3×Fair(+2), 4×Average(+1). Diğerleri Mediocre(+0).', en: '1×Great(+4), 2×Good(+3), 3×Fair(+2), 4×Average(+1). The rest are Mediocre(+0).' },
    'creator.skills.select': { tr: 'Seçin...', en: 'Select...' },
    'creator.skills.count': { tr: 'yetenek', en: 'skills' },

    'creator.stunts.title': { tr: 'Stunt\'lar', en: 'Stunts' },
    'creator.stunts.desc': { tr: '3 ücretsiz stunt. Ek stunt\'lar Refresh\'i düşürür (min 1). Örnek: "Bir yeteneği belirli bir durumda +2 bonus ile kullan."', en: '3 free stunts. Extra stunts reduce Refresh (min 1). Example: "Use a skill with a +2 bonus in a specific situation."' },
    'creator.stunts.name_ph': { tr: 'Stunt adı', en: 'Stunt name' },
    'creator.stunts.desc_ph': { tr: 'Açıklama: Ne yapar?', en: 'Description: What does it do?' },
    'creator.stunts.add': { tr: '+ Stunt Ekle', en: '+ Add Stunt' },

    'creator.summary.title': { tr: 'Karakter Özeti', en: 'Character Summary' },
    'creator.summary.unnamed': { tr: 'İsimsiz Karakter', en: 'Unnamed Character' },
    'creator.summary.incomplete': { tr: '⚠ Piramit tamamlanmadı:', en: '⚠ Pyramid incomplete:' },

    'sheet.edit': { tr: '✎ Düzenle', en: '✎ Edit' },
    'sheet.delete': { tr: '🗑 Sil', en: '🗑 Delete' },
    'sheet.quick_roll': { tr: 'Hızlı Zar', en: 'Quick Roll' },
    'sheet.select_skill': { tr: 'Yetenek seçin...', en: 'Select skill...' },
    'sheet.roll_btn': { tr: '🎲 At', en: '🎲 Roll' },
    'sheet.roll_button': { tr: 'At', en: 'Roll' },
    'sheet.clear_stress': { tr: 'Temizle', en: 'Clear' },
    'sheet.physical': { tr: 'Fiziksel', en: 'Physical' },
    'sheet.mental': { tr: 'Mental', en: 'Mental' },
    'sheet.no_stunts': { tr: 'Stunt eklenmemiş', en: 'No stunts added' },
    'sheet.refresh_label': { tr: 'Refresh: {refresh}', en: 'Refresh: {refresh}' },
    'sheet.refresh_button': { tr: 'Refresh ({refresh})', en: 'Refresh ({refresh})' },
    'sheet.adventure_code': { tr: 'Serüven Kodu', en: 'Campaign Code' },
    'sheet.shift_label': { tr: 'shift', en: 'shift' },

    // Campaign
    'campaign.title_dm': { tr: 'Oyun Yöneticisi Paneli', en: 'Dungeon Master Panel' },
    'campaign.title_player': { tr: 'Oyuncu Paneli', en: 'Player Panel' },
    'campaign.notes_title': { tr: '📜 Ortak Serüven Notları', en: '📜 Shared Campaign Notes' },
    'campaign.notes_desc_dm': { tr: 'Senin ve oyuncularının paylaştığı ortak notlar.', en: 'Shared notes between you and your players.' },
    'campaign.notes_desc_player': { tr: 'Serüvende alınan ortak notlar. DM ve tüm oyuncular görebilir.', en: 'Shared notes in the campaign. Viewable by the DM and all players.' },
    'campaign.notes_ph': { tr: 'Buraya notlarınızı yazın...', en: 'Write your notes here...' },
    'campaign.notes_save': { tr: '💾 Notları Kaydet', en: '💾 Save Notes' },
    'campaign.add_char_title': { tr: 'Karakter Ekle', en: 'Add Character' },
    'campaign.add_char_desc': { tr: 'Oyuncularının sana verdiği "Serüven Kodu"nu girerek karakterlerini bu serüvene ekleyebilirsin.', en: 'Enter the "Campaign Code" provided by your players to add their characters to this campaign.' },
    'campaign.add_char_ph': { tr: 'Örn: char_1703212410294', en: 'Ex: char_1703212410294' },
    'campaign.add_char_btn': { tr: 'Ekle', en: 'Add' },
    'campaign.chars_title_dm': { tr: 'Serüvendeki Karakterler', en: 'Characters in Campaign' },
    'campaign.chars_title_player': { tr: 'Senin Karakterlerin', en: 'Your Characters' },
    'campaign.no_chars_dm': { tr: 'Henüz bu serüvene karakter eklenmemiş.', en: 'No characters have been added to this campaign yet.' },
    'campaign.no_chars_player': { tr: 'Henüz karakter yaratmadın.', en: 'You haven\'t created any characters yet.' },
    'campaign.char_go_create': { tr: 'Karakter Yarat', en: 'Create Character' },
    'campaign.char_no_concept': { tr: 'Konsept belirtilmemiş', en: 'No concept specified' },
    'campaign.char_click_hint': { tr: 'Karakterin tam sayfasına gitmek için üzerine tıkla.', en: 'Click on a character to view their full sheet.' },

    // Auth
    'auth.title': { tr: 'Fate Condensed', en: 'Fate Condensed' },
    'auth.login_tab': { tr: 'Giriş Yap', en: 'Login' },
    'auth.register_tab': { tr: 'Kayıt Ol', en: 'Register' },
    'auth.username': { tr: 'Kullanıcı Adı', en: 'Username' },
    'auth.password': { tr: 'Şifre', en: 'Password' },
    'auth.role': { tr: 'Rol', en: 'Role' },
    'auth.role_player': { tr: 'Oyuncu', en: 'Player' },
    'auth.role_dm': { tr: 'Oyun Yöneticisi (DM)', en: 'Dungeon Master (DM)' },

    // Toast Messages
    'toast.saved': { tr: 'Kaydedildi!', en: 'Saved!' },
    'toast.error': { tr: 'Bir hata oluştu!', en: 'An error occurred!' },
    'toast.saving': { tr: 'Kaydediliyor...', en: 'Saving...' },
};

let currentLanguage = localStorage.getItem('fate_language') || 'tr';

export function getLanguage() {
    return currentLanguage;
}

export function setLanguage(lang) {
    if (lang === 'tr' || lang === 'en') {
        currentLanguage = lang;
        localStorage.setItem('fate_language', lang);
        // Refresh the page or trigger re-render
        window.location.reload();
    }
}

export function toggleLanguage() {
    const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
    setLanguage(newLang);
}

export function t(key, params = {}) {
    if (!dictionary[key]) {
        console.warn(`Missing translation key: ${key}`);
        return params.default || key;
    }

    let text = dictionary[key][currentLanguage] || dictionary[key]['tr'];

    // Replace parameters if any exist
    if (params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
    }

    return text;
}
