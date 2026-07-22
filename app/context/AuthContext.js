import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import * as authApi from '../api/auth';
import {
    clearSession,
    getSession,
    readSession,
    saveSession,
} from '../api/session';

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

            try {
                const currentUser = await authApi.getCurrentUser();
                if (active) setUser(currentUser);
                await saveSession({ ...getSession(), user: currentUser });
            } catch {
                await clearSession();
            } finally {
                if (active) setIsBootstrapping(false);
            }
        };

        restore();
        return () => { active = false; };
    }, []);

    const signIn = useCallback(async (credentials) => {
        const result = await authApi.login(credentials);
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signUp = useCallback(async (details) => {
        const result = await authApi.register(details);
        await saveSession({ user: result.user, tokens: result.tokens });
        setUser(result.user);
        return result.user;
    }, []);

    const signOut = useCallback(async () => {
        const refresh = getSession()?.tokens?.refresh;
        try {
            if (refresh) await authApi.logout(refresh);
        } catch {
            // Local sign-out must still complete if the token has expired.
        }
        await clearSession();
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        signIn,
        signUp,
        signOut,
    }), [user, isBootstrapping, signIn, signUp, signOut]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider.');
    return context;
};
