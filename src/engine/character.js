// ═══════════════════════════════════════
// Character — Data model & helpers
// ═══════════════════════════════════════

import { createEmptySkills } from './skills.js';

let _idCounter = Date.now();

/**
 * Create a new character with defaults
 */
export function createCharacter(overrides = {}) {
    return {
        id: `char_${_idCounter++}`,
        name: '',
        aspects: {
            highConcept: '',
            trouble: '',
            relationship: '',
            free1: '',
            free2: ''
        },
        skills: createEmptySkills(),
        stunts: [],   // Array of { name, description }
        stress: {
            physical: [false, false, false],
            mental: [false, false, false]
        },
        consequences: {
            mild: null,      // string or null
            moderate: null,
            severe: null
        },
        refresh: 3,
        fatePoints: 3,
        notes: '',
        createdAt: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Toggle a stress box
 */
export function toggleStress(character, track, index) {
    if (character.stress[track] && index < character.stress[track].length) {
        character.stress[track][index] = !character.stress[track][index];
    }
    return character;
}

/**
 * Set a consequence
 */
export function setConsequence(character, severity, text) {
    character.consequences[severity] = text || null;
    return character;
}

/**
 * Clear all stress boxes
 */
export function clearStress(character) {
    character.stress.physical = character.stress.physical.map(() => false);
    character.stress.mental = character.stress.mental.map(() => false);
    return character;
}

/**
 * Check if character is taken out
 * (All stress filled and all consequence slots used)
 */
export function isTakenOut(character) {
    const allStressFilled =
        character.stress.physical.every(b => b) &&
        character.stress.mental.every(b => b);
    const allConsequencesFilled =
        character.consequences.mild !== null &&
        character.consequences.moderate !== null &&
        character.consequences.severe !== null;
    return allStressFilled && allConsequencesFilled;
}

/**
 * Add a stunt and adjust refresh
 */
export function addStunt(character, stunt) {
    character.stunts.push(stunt);
    if (character.stunts.length > 3) {
        character.refresh = Math.max(1, 3 - (character.stunts.length - 3));
    }
    return character;
}

/**
 * Remove a stunt by index and re-adjust refresh
 */
export function removeStunt(character, index) {
    character.stunts.splice(index, 1);
    character.refresh = Math.max(1, 3 - Math.max(0, character.stunts.length - 3));
    return character;
}

/**
 * Get the total number of used stress boxes
 */
export function getFilledStressCount(character) {
    const physical = character.stress.physical.filter(b => b).length;
    const mental = character.stress.mental.filter(b => b).length;
    return { physical, mental, total: physical + mental };
}

/**
 * Absorb shifts of stress from an attack.
 * Returns remaining shifts (damage overflow) if cannot absorb.
 */
export function absorbStress(character, shifts, track = 'physical') {
    let remaining = shifts;

    // Try to find a single stress box that can absorb
    for (let i = 0; i < character.stress[track].length; i++) {
        if (!character.stress[track][i] && (i + 1) >= remaining) {
            character.stress[track][i] = true;
            return 0;
        }
    }

    return remaining;
}
