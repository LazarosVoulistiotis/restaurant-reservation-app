/* Το WelcomeScreen.js είναι η introductory/auth entry screen που κατευθύνει
 τον χρήστη είτε στο login είτε στο registration flow με καθαρό και συνεπές UI. */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Restaurant Reservation App</Text>

                <Text style={styles.subtitle}>
                    Κάνε εγγραφή, σύνδεση και βρες εύκολα το κατάλληλο εστιατόριο.
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.primaryButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.secondaryButtonText}>Create account</Text>
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
        marginBottom: 32,
        lineHeight: 24,
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#B45309',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#B45309',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#B45309',
        fontSize: 16,
        fontWeight: '700',
    },
});