import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import * as authApi from '../api/auth';
import { updateProfile as updateProfileRequest } from '../api/account';
import {
    clearSession,
    getSession,
    readSession,
    saveSession,
} from '../api/session';
import { unregisterPushNotifications } from '../services/pushNotifications';
import { clearSessionCache } from '../cache/queryCache';
import { clearPrivateDeviceCache } from '../cache/localDraft';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    useEffect(() => {
        let active = true;

        const restore = async () => {
            const stored = await readSession();
            if (!stored?.tokens?.refresh) {
                if (active) setIsBootstrapping(false);
                return;
            }

            // Restore the locally saved account immediately. The server refresh
            // below keeps it current, but a weak connection must not look like a
            // logout when the app is opened.
            if (active && stored.user) setUser(stored.user);

            try {
                const currentUser = await authApi.getCurrentUser();
                if (active) setUser(currentUser);
                await saveSession({ ...getSession(), user: currentUser });
            } catch (requestError) {
                const sessionWasRejected = [401, 403, 404].includes(requestError?.status)
                    || !getSession()?.tokens?.refresh;

                if (sessionWasRejected) {
                    await clearSession();
                    if (active) setUser(null);
                }
            } finally {
                if (active) setIsBootstrapping(false);
            }
        };

        restore();
        return () => { active = false; };
    }, []);

    const signIn = useCallback(async (credentials) => {
        const result = await authApi.login(credentials);
        clearSessionCache();
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const requestPhoneOTP = useCallback((phone) => authApi.requestPhoneOTP(phone), []);

    const signInWithPhoneOTP = useCallback(async (phone, code) => {
        const result = await authApi.confirmPhoneOTP({ phone, code });
        clearSessionCache();
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signUp = useCallback(async (details) => {
        const result = await authApi.register(details);
        clearSessionCache();
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signInWithGoogle = useCallback(async (credential) => {
        const result = await authApi.loginWithGoogle({
            credential,
        });
        clearSessionCache();
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signInWithApple = useCallback(async (credential, fullName = '') => {
        const result = await authApi.loginWithApple({
            credential,
            fullName,
        });
        clearSessionCache();
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signOut = useCallback(async () => {
        const userId = getSession()?.user?.id;
        const refresh = getSession()?.tokens?.refresh;
        await unregisterPushNotifications().catch(() => {});
        try {
            if (refresh) await authApi.logout(refresh);
        } catch {
            // Local sign-out must still complete if the token has expired.
        }
        await clearSession();
        clearSessionCache();
        await clearPrivateDeviceCache(userId).catch(() => {});
        setUser(null);
    }, []);

    const freezeAccount = useCallback(async () => {
        const userId = getSession()?.user?.id;
        const result = await authApi.freezeAccount();
        await clearSession();
        clearSessionCache();
        await clearPrivateDeviceCache(userId).catch(() => {});
        setUser(null);
        return result;
    }, []);

    const deleteAccount = useCallback(async () => {
        const userId = getSession()?.user?.id;
        await unregisterPushNotifications().catch(() => {});
        const result = await authApi.deleteAccount();
        await clearSession();
        clearSessionCache();
        await clearPrivateDeviceCache(userId).catch(() => {});
        setUser(null);
        return result;
    }, []);

    const refreshUser = useCallback(async () => {
        const currentUser = await authApi.getCurrentUser();
        await saveSession({ ...getSession(), user: currentUser });
        setUser(currentUser);
        return currentUser;
    }, []);

    const updateCurrentUser = useCallback(async (details) => {
        await updateProfileRequest(details);
        const currentUser = await authApi.getCurrentUser();
        await saveSession({ ...getSession(), user: currentUser });
        setUser(currentUser);
        return currentUser;
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        signIn,
        requestPhoneOTP,
        signInWithPhoneOTP,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
        freezeAccount,
        deleteAccount,
        refreshUser,
        updateCurrentUser,
    }), [
        user,
        isBootstrapping,
        signIn,
        requestPhoneOTP,
        signInWithPhoneOTP,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
        freezeAccount,
        deleteAccount,
        refreshUser,
        updateCurrentUser,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider.');
    return context;
};
