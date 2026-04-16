/* Το LoginScreen.js είναι η οθόνη σύνδεσης που συνδέει το form του
χρήστη με το authentication system της εφαρμογής, παρέχοντας
validation, loading state και καθαρό error feedback. */

import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ route }) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (route.params?.prefillEmail) {
            setEmail(route.params.prefillEmail);
        }
    }, [route.params]);

    const validateForm = () => {
        if (!email.trim() || !password.trim()) {
            setErrorMessage('Email και password είναι υποχρεωτικά.');
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            await login({
                email: email.trim().toLowerCase(),
                password,
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Αποτυχία σύνδεσης. Έλεγξε τα στοιχεία σου.';

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Login</Text>

                <Text style={styles.subtitle}>
                    Συνδέσου για να δεις τα διαθέσιμα εστιατόρια και να συνεχίσεις.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {errorMessage ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F1',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#57534E',
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 24,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 14,
        fontSize: 16,
    },
    messageContainer: {
        minHeight: 24,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#B45309',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 6,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
    },
});