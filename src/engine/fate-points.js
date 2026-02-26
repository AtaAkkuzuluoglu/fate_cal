// ═══════════════════════════════════════
// Fate Points — Invoke / Compel / Refresh
// ═══════════════════════════════════════

/**
 * Invoke an aspect: spend 1 FP for +2 bonus or a reroll
 * @returns {{ success: boolean, message: string }}
 */
export function invoke(character, aspectText) {
    if (character.fatePoints <= 0) {
        return { success: false, message: 'Yeterli Fate Point yok!' };
    }
    character.fatePoints--;
    return {
        success: true,
        message: `"${aspectText}" invoke edildi → +2 bonus. FP: ${character.fatePoints}`
    };
}

/**
 * Compel an aspect: character gains +1 FP but faces a complication
 * @returns {{ success: boolean, message: string }}
 */
export function compel(character, aspectText) {
    character.fatePoints++;
    return {
        success: true,
        message: `"${aspectText}" compel edildi → komplikasyon! FP: ${character.fatePoints}`
    };
}

/**
 * Refresh fate points to refresh value at session start
 */
export function refreshPoints(character) {
    character.fatePoints = Math.max(character.fatePoints, character.refresh);
    return character;
}

/**
 * Concede in a conflict: earn 1 FP + 1 per consequence taken in this conflict
 * @param {number} consequencesTaken - number of consequences taken during this conflict
 */
export function concede(character, consequencesTaken = 0) {
    character.fatePoints += 1 + consequencesTaken;
    return {
        success: true,
        message: `Çatışmadan çekildi → +${1 + consequencesTaken} FP. Toplam: ${character.fatePoints}`
    };
}

/**
 * Spend FP manually
 */
export function spendFP(character, amount = 1) {
    if (character.fatePoints < amount) {
        return { success: false, message: 'Yeterli Fate Point yok!' };
    }
    character.fatePoints -= amount;
    return { success: true, message: `${amount} FP harcandı. Kalan: ${character.fatePoints}` };
}

/**
 * Earn FP manually
 */
export function earnFP(character, amount = 1) {
    character.fatePoints += amount;
    return { success: true, message: `+${amount} FP kazanıldı. Toplam: ${character.fatePoints}` };
}
