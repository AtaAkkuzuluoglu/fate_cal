// ═══════════════════════════════════════
// Fate Dice Engine — 4dF roller
// ═══════════════════════════════════════

import { t } from './i18n.js';

const LADDER = {
    '-4': 'Terrible', '-3': 'Abysmal',
    '-2': 'Poor', '-1': 'Mediocre',
    '0': 'Average', '1': 'Fair',
    '2': 'Good', '3': 'Great',
    '4': 'Superb', '5': 'Fantastic',
    '6': 'Epic', '7': 'Legendary',
    '8': 'Mythic'
};

/**
 * Roll a single Fate die: -1, 0, or +1
 * Uses crypto for true randomness
 */
function rollOneDie() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const val = arr[0] % 3; // 0, 1, 2
    return val - 1;          // -1, 0, +1
}

/**
 * Roll 4 Fate Dice
 * @returns {number[]} Array of 4 values, each -1, 0, or +1
 */
export function rollFateDice() {
    return [rollOneDie(), rollOneDie(), rollOneDie(), rollOneDie()];
}

/**
 * Calculate total result
 * @param {number[]} dice - Array of dice results
 * @param {number} skillRating - Skill rating to add
 * @param {number} bonus - Any additional bonus (e.g. from invokes)
 * @returns {number}
 */
export function calculateResult(dice, skillRating = 0, bonus = 0) {
    const diceTotal = dice.reduce((sum, d) => sum + d, 0);
    return diceTotal + skillRating + bonus;
}

/**
 * Determine outcome given result vs difficulty
 * @param {number} result - Total roll result
 * @param {number} difficulty - Target difficulty
 * @returns {{ outcome: string, shifts: number }}
 */
export function getOutcome(result, difficulty) {
    const shifts = result - difficulty;
    if (shifts < 0) return { outcome: 'fail', shifts };
    if (shifts === 0) return { outcome: 'tie', shifts: 0 };
    if (shifts >= 3) return { outcome: 'succeed_with_style', shifts };
    return { outcome: 'success', shifts };
}

/**
 * Get the Fate Ladder label for a numeric value
 * @param {number} value
 * @returns {string}
 */
export function getLadderLabel(value) {
    const clamped = Math.max(-4, Math.min(8, value));
    return t(`dice.ladder.${clamped}`) || `+${clamped}`;
}

/**
 * Get display character for a die face
 * @param {number} value - -1, 0, or +1
 * @returns {string}
 */
export function getDieSymbol(value) {
    if (value > 0) return '+';
    if (value < 0) return '−';
    return '○';
}

/**
 * Get CSS class for a die face
 * @param {number} value
 * @returns {string}
 */
export function getDieClass(value) {
    if (value > 0) return 'plus';
    if (value < 0) return 'minus';
    return 'blank';
}

/**
 * Get outcome display info
 * @param {string} outcome
 * @returns {{ label: string, color: string, emoji: string }}
 */
export function getOutcomeDisplay(outcome) {
    switch (outcome) {
        case 'fail':
            return { label: t('outcome.fail'), color: 'var(--danger)', emoji: '✗' };
        case 'tie':
            return { label: t('outcome.tie'), color: 'var(--warning)', emoji: '≈' };
        case 'success':
            return { label: t('outcome.success'), color: 'var(--success)', emoji: '✓' };
        case 'succeed_with_style':
            return { label: t('outcome.succeed_with_style'), color: 'var(--gold)', emoji: '★' };
        default:
            return { label: outcome, color: 'var(--text-secondary)', emoji: '' };
    }
}

export { LADDER };
