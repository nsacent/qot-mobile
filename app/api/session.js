import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'qot.session';
let memorySession = null;

const canUseWebStorage = () => (
    Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined'
);

export const readSession = async () => {
    try {
        const raw = canUseWebStorage()
            ? globalThis.localStorage.getItem(SESSION_KEY)
            : await SecureStore.getItemAsync(SESSION_KEY);

        memorySession = raw ? JSON.parse(raw) : null;
    } catch {
        memorySession = null;
    }

    return memorySession;
};

export const getSession = () => memorySession;

export const saveSession = async (session) => {
    memorySession = session;
    const raw = JSON.stringify(session);

    if (canUseWebStorage()) {
        globalThis.localStorage.setItem(SESSION_KEY, raw);
        return;
    }

    await SecureStore.setItemAsync(SESSION_KEY, raw);
};

export const updateTokens = async (tokens) => {
    if (!memorySession) return;

    await saveSession({
        ...memorySession,
        tokens: {
            ...memorySession.tokens,
            ...tokens,
        },
    });
};

export const clearSession = async () => {
    memorySession = null;

    if (canUseWebStorage()) {
        globalThis.localStorage.removeItem(SESSION_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(SESSION_KEY);
};
