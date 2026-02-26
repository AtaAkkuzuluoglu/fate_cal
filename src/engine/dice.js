// ═══════════════════════════════════════
// Fate Dice Engine — 4dF roller
// ═══════════════════════════════════════

const LADDER = {
    '-4': 'Berbat', '-3': 'Kötü',
    '-2': 'Korkunç', '-1': 'Zayıf',
    '0': 'Sıradan', '1': 'Ortalama',
    '2': 'Adil', '3': 'İyi',
    '4': 'Harika', '5': 'Mükemmel',
    '6': 'İnanılmaz', '7': 'Epik',
    '8': 'Efsanevi'
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
    return LADDER[String(clamped)] || `+${clamped}`;
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
            return { label: 'Başarısız', color: 'var(--danger)', emoji: '✗' };
        case 'tie':
            return { label: 'Berabere', color: 'var(--warning)', emoji: '≈' };
        case 'success':
            return { label: 'Başarı', color: 'var(--success)', emoji: '✓' };
        case 'succeed_with_style':
            return { label: 'Şıklıkla Başarı!', color: 'var(--gold)', emoji: '★' };
        default:
            return { label: outcome, color: 'var(--text-secondary)', emoji: '' };
    }
}

export { LADDER };
