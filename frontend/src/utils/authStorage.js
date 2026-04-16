// Το authStorage.js είναι ο βοηθητικός μηχανισμός που αποθηκεύει, ανακτά και διαγράφει το JWT token από τη συσκευή.

// Για να αποθηκεύουμε το authentication token, ώστε ο χρήστης να μη χρειάζεται να κάνει login κάθε φορά που ανοίγει την εφαρμογή
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key used for the persisted JWT session.
const TOKEN_KEY = 'auth_token';

export async function saveToken(token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
}