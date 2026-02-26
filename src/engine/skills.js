// ═══════════════════════════════════════
// Skills — Fate Condensed Skill List & Pyramid
// ═══════════════════════════════════════

export const SKILL_LIST = [
    'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive',
    'Drive', 'Empathy', 'Fight', 'Investigate', 'Lore',
    'Notice', 'Physique', 'Provoke', 'Rapport', 'Resources',
    'Shoot', 'Stealth', 'Will'
];

export const SKILL_TRANSLATIONS = {
    'Athletics': 'Atletizm',
    'Burglary': 'Hırsızlık',
    'Contacts': 'Bağlantılar',
    'Crafts': 'Zanaat',
    'Deceive': 'Aldatma',
    'Drive': 'Sürüş',
    'Empathy': 'Empati',
    'Fight': 'Dövüş',
    'Investigate': 'Araştırma',
    'Lore': 'Bilgi',
    'Notice': 'Farkındalık',
    'Physique': 'Fizik',
    'Provoke': 'Tahrik',
    'Rapport': 'İlişki',
    'Resources': 'Kaynaklar',
    'Shoot': 'Atıcılık',
    'Stealth': 'Gizlilik',
    'Will': 'İrade'
};

/**
 * Standard Fate Condensed Pyramid:
 * 1 × Great (+4), 2 × Good (+3), 3 × Fair (+2), 4 × Average (+1)
 */
export const PYRAMID_STRUCTURE = [
    { rating: 4, label: 'Great', count: 1 },
    { rating: 3, label: 'Good', count: 2 },
    { rating: 2, label: 'Fair', count: 3 },
    { rating: 1, label: 'Average', count: 4 },
];

/**
 * Validate skill pyramid assignment
 * @param {Object} skills - { skillName: rating, ... }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSkillPyramid(skills) {
    const errors = [];
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const [skill, rating] of Object.entries(skills)) {
        if (rating > 0) {
            if (!SKILL_LIST.includes(skill)) {
                errors.push(`Geçersiz yetenek: ${skill}`);
            }
            if (counts[rating] !== undefined) {
                counts[rating]++;
            }
        }
    }

    for (const level of PYRAMID_STRUCTURE) {
        if (counts[level.rating] !== level.count) {
            errors.push(
                `${level.label} (+${level.rating}): ${level.count} yetenek olmalı, ${counts[level.rating]} tane var`
            );
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Get rating label
 */
export function getRatingLabel(rating) {
    const labels = {
        0: 'Mediocre', 1: 'Average', 2: 'Fair',
        3: 'Good', 4: 'Great', 5: 'Superb',
        6: 'Fantastic', 7: 'Epic', 8: 'Legendary'
    };
    return labels[rating] || `+${rating}`;
}

/**
 * Create an empty skills object with all skills at 0
 */
export function createEmptySkills() {
    const skills = {};
    SKILL_LIST.forEach(s => skills[s] = 0);
    return skills;
}
