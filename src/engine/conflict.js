// ═══════════════════════════════════════
// Conflict Engine — Scene management
// ═══════════════════════════════════════

let _conflictId = Date.now();

/**
 * Create a new conflict scene
 */
export function createConflict(participants = []) {
    return {
        id: `conflict_${_conflictId++}`,
        type: 'conflict', // 'conflict', 'contest', 'challenge'
        participants: participants.map(p => ({
            characterId: p.id,
            name: p.name,
            hasActed: false,
        })),
        turnOrder: [],
        currentTurnIndex: 0,
        round: 1,
        situationAspects: [],
        log: [],
        active: true,
    };
}

/**
 * Create a contest scene
 */
export function createContest(participants = [], goal = '', victoriesNeeded = 3) {
    return {
        id: `contest_${_conflictId++}`,
        type: 'contest',
        participants: participants.map(p => ({
            characterId: p.id,
            name: p.name,
            victories: 0,
        })),
        goal,
        victoriesNeeded,
        round: 1,
        situationAspects: [],
        log: [],
        active: true,
    };
}

/**
 * Create a challenge scene
 */
export function createChallenge(obstacles = []) {
    return {
        id: `challenge_${_conflictId++}`,
        type: 'challenge',
        obstacles: obstacles.map((o, i) => ({
            id: i,
            description: o.description || o,
            skill: o.skill || '',
            difficulty: o.difficulty || 2,
            resolved: false,
            result: null,
        })),
        situationAspects: [],
        log: [],
        active: true,
    };
}

/**
 * Set turn order (popcorn initiative)
 */
export function setTurnOrder(conflict, characterId) {
    const participant = conflict.participants.find(p => p.characterId === characterId);
    if (participant && !participant.hasActed) {
        participant.hasActed = true;
        conflict.turnOrder.push(characterId);

        // Check if all have acted → new round
        if (conflict.participants.every(p => p.hasActed)) {
            conflict.round++;
            conflict.participants.forEach(p => p.hasActed = false);
            conflict.turnOrder = [];
            conflict.log.push({
                type: 'round',
                message: `── Round ${conflict.round} ──`,
                timestamp: Date.now()
            });
        }
    }
    return conflict;
}

/**
 * Add a situation aspect to a scene
 */
export function addSituationAspect(scene, text, freeInvokes = 1) {
    scene.situationAspects.push({
        text,
        freeInvokes,
        createdAt: Date.now()
    });
    scene.log.push({
        type: 'advantage',
        message: `Durum aspect'i oluşturuldu: "${text}" (${freeInvokes} ücretsiz invoke)`,
        timestamp: Date.now()
    });
    return scene;
}

/**
 * Remove a situation aspect
 */
export function removeSituationAspect(scene, index) {
    const removed = scene.situationAspects.splice(index, 1);
    if (removed.length > 0) {
        scene.log.push({
            type: 'info',
            message: `Durum aspect'i kaldırıldı: "${removed[0].text}"`,
            timestamp: Date.now()
        });
    }
    return scene;
}

/**
 * Log an action in the scene
 */
export function logAction(scene, type, message) {
    scene.log.push({
        type,         // 'roll', 'invoke', 'compel', 'attack', 'defend', 'advantage', 'info'
        message,
        timestamp: Date.now()
    });
    return scene;
}

/**
 * End the scene
 */
export function endScene(scene) {
    scene.active = false;
    scene.log.push({
        type: 'info',
        message: 'Sahne sona erdi.',
        timestamp: Date.now()
    });
    return scene;
}
