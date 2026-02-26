// ═══════════════════════════════════════
// Skills — Fate Condensed Skill List & Pyramid
// ═══════════════════════════════════════

import { t } from './i18n.js';

export const SKILL_LIST = [
    'Athletics', 'Burglary', 'Contacts', 'Crafts', 'Deceive',
    'Drive', 'Empathy', 'Fight', 'Investigate', 'Lore',
    'Notice', 'Physique', 'Provoke', 'Rapport', 'Resources',
    'Shoot', 'Stealth', 'Will'
];

export function getSkillTranslation(skill) {
    return t(`skill.${skill.toLowerCase()}`);
}

// Removed hardcoded SKILL_TRANSLATIONS

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
    return t(`dice.ladder.${rating}`) || `+${rating}`;
}

/**
 * Create an empty skills object with all skills at 0
 */
export function createEmptySkills() {
    const skills = {};
    SKILL_LIST.forEach(s => skills[s] = 0);
    return skills;
}
