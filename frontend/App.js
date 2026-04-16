// Το App.js είναι ο κεντρικός “σκελετός” που ενώνει:
// authentication context + navigation system + overall app startup.

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
    return (
        // Provides global auth state to the app
        <AuthProvider>
            {/* Hosts the app navigation tree */}
            <NavigationContainer>
                <StatusBar style="dark" />
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}