/* Το RootNavigator.js είναι ο κεντρικός router της εφαρμογής που ενώνει auth flow και
main app flow, αντικαθιστώντας τα προσωρινά placeholders με τα τελικά reservation και profile screens.*/

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import ReservationFormScreen from '../screens/ReservationFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

// Displays a startup loading screen while auth state is being restored.
function LoadingScreen() {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#B45309" />
            <Text style={styles.loadingText}>Preparing app...</Text>
        </View>
    );
}

export default function RootNavigator() {
    const { isAuthenticated, isBootstrapping } = useAuth();

    if (isBootstrapping) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFF8F1',
                },
                headerTintColor: '#7C2D12',
                headerTitleStyle: {
                    fontWeight: '700',
                },
                contentStyle: {
                    backgroundColor: '#FFF8F1',
                },
            }}
        >
            {!isAuthenticated ? (
                <>
                    <Stack.Screen
                        name="Welcome"
                        component={WelcomeScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ title: 'Register' }}
                    />
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ title: 'Login' }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Restaurants"
                        component={RestaurantsScreen}
                        options={({ navigation }) => ({
                            title: 'Restaurants',
                            headerLeft: () => null,
                            headerRight: () => (
                                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                                    <Text style={styles.headerLink}>Profile</Text>
                                </TouchableOpacity>
                            ),
                        })}
                    />
                    <Stack.Screen
                        name="ReservationForm"
                        component={ReservationFormScreen}
                        options={{ title: 'Reservation' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{ title: 'My Reservations' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF8F1',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        color: '#57534E',
    },
    headerLink: {
        color: '#B45309',
        fontWeight: '700',
    },
});