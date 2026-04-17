/* Το ReservationFormScreen.js είναι το screen που μετατρέπει το “Book now” σε
πραγματικό reservation flow με validation, create/update logic και σωστή μετάβαση
 στο booking history. */

import { useLayoutEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    createReservation,
    updateReservation,
} from '../services/reservations';

// Returns tomorrow's date in YYYY-MM-DD format.
function getTomorrowDateString() {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Converts HH:MM:SS into HH:MM for the input field.
function normalizeTimeForInput(value) {
    if (!value) {
        return '20:00';
    }

    return value.slice(0, 5);
}

// Validates a date string in YYYY-MM-DD format.
function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Validates a time string in HH:MM format.
function isValidTime(value) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

// Main component
export default function ReservationFormScreen({ navigation, route }) {
    const reservation = route.params?.reservation || null;
    const isEditMode = route.params?.mode === 'edit' && Boolean(reservation);

    // Resolves the restaurant source for both create and edit mode.
    const selectedRestaurant = useMemo(() => {
        if (route.params?.restaurant) {
            return route.params.restaurant;
        }

        if (reservation) {
            return {
                restaurant_id: reservation.restaurant_id,
                name: reservation.restaurant_name,
                location: reservation.restaurant_location,
            };
        }

        return null;
    }, [route.params, reservation]);

    // Form state
    const [reservationDate, setReservationDate] = useState(
        reservation?.reservation_date || getTomorrowDateString()
    );
    const [reservationTime, setReservationTime] = useState(
        normalizeTimeForInput(reservation?.reservation_time)
    );
    const [peopleCount, setPeopleCount] = useState(
        String(reservation?.people_count || 2)
    );

    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Updates the header title based on the screen mode.
    useLayoutEffect(() => {
        navigation.setOptions({
            title: isEditMode ? 'Edit Reservation' : 'Reservation',
        });
    }, [navigation, isEditMode]);

    // Validation
    function validateForm() {
        if (!selectedRestaurant?.restaurant_id) {
            setErrorMessage('Δεν βρέθηκε το επιλεγμένο εστιατόριο.');
            return false;
        }

        if (!reservationDate.trim() || !reservationTime.trim() || !peopleCount.trim()) {
            setErrorMessage('Ημερομηνία, ώρα και αριθμός ατόμων είναι υποχρεωτικά.');
            return false;
        }

        if (!isValidDate(reservationDate.trim())) {
            setErrorMessage('Η ημερομηνία πρέπει να είναι σε μορφή YYYY-MM-DD.');
            return false;
        }

        if (!isValidTime(reservationTime.trim())) {
            setErrorMessage('Η ώρα πρέπει να είναι σε μορφή HH:MM.');
            return false;
        }

        const numericPeopleCount = Number(peopleCount);

        if (!Number.isInteger(numericPeopleCount) || numericPeopleCount <= 0) {
            setErrorMessage('Ο αριθμός ατόμων πρέπει να είναι θετικός ακέραιος.');
            return false;
        }

        setErrorMessage('');
        return true;
    }

    // Submit logic
    async function handleSubmit() {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                restaurant_id: Number(selectedRestaurant.restaurant_id),
                reservation_date: reservationDate.trim(),
                reservation_time: reservationTime.trim(),
                people_count: Number(peopleCount),
            };

            const result = isEditMode
                ? await updateReservation(reservation.reservation_id, payload)
                : await createReservation(payload);

            navigation.navigate('Profile', {
                notice: result.message,
                refreshToken: Date.now(),
            });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Αποτυχία αποθήκευσης κράτησης.';

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Guard render
    if (!selectedRestaurant) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>
                    Δεν υπάρχει επιλεγμένο εστιατόριο για κράτηση.
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Restaurants')}
                >
                    <Text style={styles.primaryButtonText}>Back to restaurants</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.content}>
                <Text style={styles.title}>
                    {isEditMode ? 'Update your reservation' : 'Book your table'}
                </Text>

                <Text style={styles.subtitle}>
                    Συμπλήρωσε ημερομηνία, ώρα και αριθμό ατόμων για να
                    ολοκληρώσεις την κράτησή σου.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Restaurant</Text>
                    <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                    <Text style={styles.restaurantLocation}>
                        {selectedRestaurant.location}
                    </Text>
                </View>

                <Text style={styles.label}>Reservation date</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={reservationDate}
                    onChangeText={setReservationDate}
                    autoCapitalize="none"
                />

                <Text style={styles.helperText}>
                    Παράδειγμα: 2026-04-20
                </Text>

                <Text style={styles.label}>Reservation time</Text>
                <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    value={reservationTime}
                    onChangeText={setReservationTime}
                    autoCapitalize="none"
                />

                <Text style={styles.helperText}>
                    Παράδειγμα: 20:30
                </Text>

                <Text style={styles.label}>Number of people</Text>
                <TextInput
                    style={styles.input}
                    placeholder="2"
                    value={peopleCount}
                    onChangeText={setPeopleCount}
                    keyboardType="number-pad"
                />

                {errorMessage ? (
                    <View style={styles.messageBox}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>
                            {isEditMode ? 'Save changes' : 'Create reservation'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F1',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    content: {
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#FFF8F1',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#57534E',
        lineHeight: 22,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
    },
    cardLabel: {
        color: '#78716C',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1917',
        marginBottom: 4,
    },
    restaurantLocation: {
        color: '#B45309',
        fontWeight: '600',
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#44403C',
        marginBottom: 8,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        fontSize: 16,
        marginBottom: 6,
    },
    helperText: {
        color: '#78716C',
        fontSize: 13,
        marginBottom: 14,
    },
    messageBox: {
        minHeight: 24,
        marginTop: 4,
        marginBottom: 12,
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#B45309',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});