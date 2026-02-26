// ═══════════════════════════════════════
// Storage — API-based storage with auth
// ═══════════════════════════════════════

const API_BASE = '/api';

// ── Auth State ──

function getToken() {
    return localStorage.getItem('fate_token');
}

function setToken(token) {
    localStorage.setItem('fate_token', token);
}

function getUser() {
    try {
        const raw = localStorage.getItem('fate_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setUser(user) {
    localStorage.setItem('fate_user', JSON.stringify(user));
}

export function isLoggedIn() {
    return !!getToken();
}

export function getCurrentUser() {
    return getUser();
}

export function logout() {
    localStorage.removeItem('fate_token');
    localStorage.removeItem('fate_user');
}

// ── API Helper ──

async function api(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
            cache: 'no-store'
        });
    } catch (networkErr) {
        throw new Error('Sunucuya bağlanılamıyor. Backend çalışıyor mu?');
    }

    // Handle empty responses (204 No Content, etc.)
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        throw new Error('Sunucudan geçersiz yanıt alındı');
    }

    if (!res.ok) {
        console.error(`API Error on ${path}:`, data);
        throw new Error((data && data.error) || `API hatası (${res.status})`);
    }

    return data;
}

// ── Auth ──

export async function login(username, password) {
    const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

export async function register(username, password) {
    const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

// ── Characters ──

export async function loadCharacters() {
    if (!isLoggedIn()) return [];
    try {
        return await api('/characters');
    } catch {
        return [];
    }
}

export async function saveCharacter(character) {
    if (!isLoggedIn()) return false;
    try {
        await api(`/characters/${character.id}`, {
            method: 'PUT',
            body: JSON.stringify(character),
        });
        return true;
    } catch (err) {
        console.error('Save character failed:', err);
        return false;
    }
}

export async function deleteCharacter(id) {
    if (!isLoggedIn()) return false;
    try {
        await api(`/characters/${id}`, { method: 'DELETE' });
        return true;
    } catch {
        return false;
    }
}

export async function getCharacter(id) {
    if (!isLoggedIn()) return null;
    try {
        return await api(`/characters/${id}`);
    } catch (err) {
        console.error('Get character failed:', err);
        throw err; // UI should handle this!
    }
}

// ── Session ──

export async function loadSession() {
    if (!isLoggedIn()) return null;
    try {
        return await api('/session');
    } catch {
        return null;
    }
}

export async function saveSession(session) {
    if (!isLoggedIn()) return false;
    try {
        await api('/session', {
            method: 'POST',
            body: JSON.stringify(session),
        });
        return true;
    } catch {
        return false;
    }
}

export async function clearSession() {
    if (!isLoggedIn()) return;
    try {
        await api('/session', { method: 'DELETE' });
    } catch {
        // ignore
    }
}
