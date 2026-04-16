/* Το RootNavigator.js ελέγχει ολόκληρο το navigation flow της εφαρμογής, συνδέοντας το
authentication state με τα σωστά screens και εξασφαλίζοντας καθαρή μετάβαση μεταξύ public
 και protected περιοχών του app. */

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';

// Δημιουργούμε το stack object του navigator. (Stack is a container component for arranging elements vertically or horizontally.)
const Stack = createNativeStackNavigator();

// μικρό βοηθητικό component για το loading state της εφαρμογής
function LoadingScreen() {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#B45309" />
            <Text style={styles.loadingText}>Preparing app...</Text>
        </View>
    );
}

// προσωρινό placeholder screen για το reservation form
function ReservationPlaceholderScreen({ route }) {
    const restaurant = route.params?.restaurant;

    return (
        <View style={styles.centered}>
            <Text style={styles.placeholderTitle}>Reservation Form</Text>
            <Text style={styles.placeholderText}>
                Επόμενο βήμα στην Ημέρα 4.
            </Text>

            {restaurant ? (
                <Text style={styles.placeholderText}>
                    Selected restaurant: {restaurant.name}
                </Text>
            ) : null}
        </View>
    );
}

// placeholder screen για Profile / My Reservations
function ProfilePlaceholderScreen() {
    const { logout } = useAuth();

    return (
        <View style={styles.centered}>
            <Text style={styles.placeholderTitle}>Profile / My Reservations</Text>
            <Text style={styles.placeholderText}>
                Θα ολοκληρωθεί στην Ημέρα 4.
            </Text>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

// Ορίζουμε το κεντρικό navigation component της εφαρμογής.
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
                        component={ReservationPlaceholderScreen}
                        options={{ title: 'Reservation' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfilePlaceholderScreen}
                        options={{ title: 'Profile' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

// Styles
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
    placeholderTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 12,
        textAlign: 'center',
    },
    placeholderText: {
        color: '#57534E',
        textAlign: 'center',
        marginBottom: 10,
    },
    headerLink: {
        color: '#B45309',
        fontWeight: '700',
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#B45309',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});