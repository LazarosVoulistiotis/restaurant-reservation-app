/* Το AuthContext.js διαχειρίζεται όλο τον κύκλο ζωής του authentication
στο frontend: restore session, register, login, logout, auth state,
και token propagation προς το API layer. */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import api, { setAuthFailureHandler, setAuthToken } from '../services/api';
import { clearToken, getToken, saveToken } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    // Restores a persisted session when the app starts.
    const bootstrapAuth = useCallback(async () => {
        try {
            const storedToken = await getToken();

            if (storedToken) {
                setAuthToken(storedToken);
                setToken(storedToken);
            }
        } catch (error) {
            console.error('Failed to restore auth token:', error);
        } finally {
            setIsBootstrapping(false);
        }
    }, []);

    // Registers a new user through the backend API.
    const register = useCallback(async ({ name, email, password }) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
        });

        return response.data;
    }, []);

    // Logs in the user, persists the token, and updates API auth headers.
    const login = useCallback(async ({ email, password }) => {
        const response = await api.post('/login', {
            email,
            password,
        });

        const receivedToken = response.data?.token;

        if (!receivedToken) {
            throw new Error('Δεν επιστράφηκε token από το backend.');
        }

        await saveToken(receivedToken);
        setAuthToken(receivedToken);
        setToken(receivedToken);

        return response.data;
    }, []);

    // Clears local auth state and removes the persisted token.
    const logout = useCallback(async () => {
        await clearToken();
        setAuthToken(null);
        setToken(null);
    }, []);

    useEffect(() => {
        bootstrapAuth();
    }, [bootstrapAuth]);

    // Registers the global auth-failure handler for expired/invalid tokens.
    useEffect(() => {
        setAuthFailureHandler(async () => {
            await logout();
        });

        return () => {
            setAuthFailureHandler(null);
        };
    }, [logout]);

    const value = useMemo(
        () => ({
            token,
            isAuthenticated: Boolean(token),
            isBootstrapping,
            register,
            login,
            logout,
        }),
        [token, isBootstrapping, register, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}