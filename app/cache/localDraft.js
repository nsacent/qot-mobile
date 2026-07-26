import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_VERSION } from './queryCache';

const draftKey = (userId) => `${CACHE_VERSION}:user:${userId || 'guest'}:post-ad-draft`;

export const getLocalListingDraft = async (userId) => {
    try {
        const raw = await AsyncStorage.getItem(draftKey(userId));
        const draft = raw ? JSON.parse(raw) : null;
        return draft?.data ? draft : null;
    } catch {
        return null;
    }
};

export const saveLocalListingDraft = async (userId, draft) => {
    if (!userId || !draft?.data) return;
    await AsyncStorage.setItem(draftKey(userId), JSON.stringify({
        ...draft,
        updated_at: new Date().toISOString(),
    }));
};

export const clearLocalListingDraft = (userId) => (
    AsyncStorage.removeItem(draftKey(userId))
);

export const clearPrivateDeviceCache = async (userId) => {
    if (!userId) return;
    await AsyncStorage.multiRemove([
        draftKey(userId),
    ]);
};
