/* Το AuthContext.js διαχειρίζεται όλο τον κύκλο ζωής του authentication
στο frontend: restore session, register, login, logout, auth state,
και token propagation προς το API layer. */

import {
    createContext, // για το authentication state
    useCallback, // για να “σταθεροποιούμε” functions μεταξύ renders
    useContext, // για να διαβάζουμε την τιμή ενός Context.
    useEffect, // επαναφέρει το αποθηκευμένο session.
    useMemo, // για το value του provider, ώστε να μην ξαναφτιάχνεται
    useState, // για local state μέσα στο component
} from 'react';

import api, { setAuthToken } from '../services/api';
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
    }, []); // Το κενό dependency array σημαίνει ότι η function δημιουργείται μία φορά και παραμένει σταθερή.

    useEffect(() => {
        bootstrapAuth();
    }, [bootstrapAuth]);

    const register = useCallback(async ({ name, email, password }) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
        });

        return response.data;
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const response = await api.post('/login', {
            email,
            password,
        });

        const receivedToken = response.data?.token; // Το ?. είναι optional chaining, ώστε αν για κάποιο λόγο το data δεν υπάρχει, να μην σκάσει το app αμέσως.

        if (!receivedToken) {
            throw new Error('Δεν επιστράφηκε token από το backend.');
        }

        await saveToken(receivedToken);
        setAuthToken(receivedToken);
        setToken(receivedToken);

        return response.data;
    }, []);

    const logout = useCallback(async () => {
        await clearToken();
        setAuthToken(null);
        setToken(null);
    }, []);

    // δημιουργούμε το object που θα δίνει ο provider στο context
    const value = useMemo(
        () => ({
            token,
            isAuthenticated: Boolean(token), // χρήσιμο για navigation logic
            isBootstrapping, // Εκθέτει το loading state του initial auth restore.
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