/* Το RegisterScreen.js είναι η φόρμα εγγραφής του app, με validation,
backend integration, loading state και καθαρό success/error feedback */

import { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage('Όλα τα πεδία είναι υποχρεωτικά.');
            return false;
        }

        if (name.trim().length < 2) {
            setErrorMessage('Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες.');
            return false;
        }

        const emailRegex = /\S+@\S+\.\S+/;

        if (!emailRegex.test(email.trim())) {
            setErrorMessage('Δώσε έγκυρο email.');
            return false;
        }

        if (password.length < 6) {
            setErrorMessage('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleRegister = async () => {
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            setSuccessMessage('Η εγγραφή ολοκληρώθηκε επιτυχώς. Μεταφορά στο login...');

            setTimeout(() => {
                navigation.navigate('Login', {
                    prefillEmail: email.trim().toLowerCase(),
                });
            }, 900);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Αποτυχία εγγραφής. Προσπάθησε ξανά.';

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create account</Text>

                <Text style={styles.subtitle}>
                    Δημιούργησε λογαριασμό για να ξεκινήσεις τις κρατήσεις σου.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                />

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

                {(errorMessage || successMessage) ? (
                    <View style={styles.messageContainer}>
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        {successMessage ? (
                            <Text style={styles.successText}>{successMessage}</Text>
                        ) : null}
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
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
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    linkText: {
        textAlign: 'center',
        color: '#B45309',
        fontWeight: '600',
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
    },
    successText: {
        color: '#15803D',
        textAlign: 'center',
    },
});