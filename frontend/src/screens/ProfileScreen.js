/* Το ProfileScreen.js είναι το screen που μετατρέπει το “Profile / My Reservations”
από placeholder σε πλήρες reservation history και management flow.*/

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import {
    deleteReservation,
    getUserReservations,
} from '../services/reservations';

// Builds a comparable Date object from reservation date and time.
function buildReservationDateTime(date, time) {
    const normalizedTime = time?.length === 5 ? `${time}:00` : time;
    return new Date(`${date}T${normalizedTime}`);
}

// Returns true when the reservation is still in the future.
function isFutureReservation(reservation) {
    return (
        buildReservationDateTime(
            reservation.reservation_date,
            reservation.reservation_time
        ).getTime() > Date.now()
    );
}

// Formats YYYY-MM-DD into DD/MM/YYYY for display.
function formatDateLabel(value) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
}

// Formats HH:MM:SS into HH:MM for display.
function formatTimeLabel(value) {
    return value.slice(0, 5);
}

export default function ProfileScreen({ navigation, route }) {
    const { logout } = useAuth();

    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [noticeMessage, setNoticeMessage] = useState('');

    // Loads the user's reservations and supports initial load / refresh modes.
    const fetchReservations = useCallback(async ({ mode = 'initial' } = {}) => {
        try {
            setErrorMessage('');

            if (mode === 'initial') setIsLoading(true);
            if (mode === 'refresh') setIsRefreshing(true);

            const data = await getUserReservations();
            setReservations(data);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Αδυναμία φόρτωσης κρατήσεων.';

            setErrorMessage(message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Reads success messages passed from create/edit flows.
    useEffect(() => {
        if (route.params?.notice) {
            setNoticeMessage(route.params.notice);
            navigation.setParams({ notice: undefined, refreshToken: undefined });
        }
    }, [route.params?.notice, route.params?.refreshToken, navigation]);

    // Reloads reservations whenever the screen becomes active.
    useFocusEffect(
        useCallback(() => {
            fetchReservations({ mode: 'initial' });
        }, [fetchReservations])
    );

    // Configures the screen header and logout action.
    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'My Reservations',
            headerRight: () => (
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.headerLink}>Logout</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, logout]);

    const upcomingReservations = reservations.filter(isFutureReservation);
    const pastReservations = reservations.filter(
        (reservation) => !isFutureReservation(reservation)
    );

    function handleEdit(reservation) {
        navigation.navigate('ReservationForm', {
            mode: 'edit',
            reservation,
            restaurant: {
                restaurant_id: reservation.restaurant_id,
                name: reservation.restaurant_name,
                location: reservation.restaurant_location,
            },
        });
    }

    // Deletes a reservation and refreshes the list afterwards.
    const performDelete = async (reservationId) => {
        try {
            setDeletingId(reservationId);
            setErrorMessage('');
            setNoticeMessage('');

            const result = await deleteReservation(reservationId);
            setNoticeMessage(result.message);

            await fetchReservations({ mode: 'refresh' });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Αποτυχία διαγραφής κράτησης.';

            setErrorMessage(message);
        } finally {
            setDeletingId(null);
        }
    };

    // Shows a platform-appropriate confirmation dialog before deletion.
    function handleDelete(reservationId) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const confirmed = window.confirm(
                'Are you sure you want to delete this reservation?'
            );

            if (confirmed) {
                performDelete(reservationId);
            }

            return;
        }

        Alert.alert(
            'Delete reservation',
            'Are you sure you want to delete this future reservation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => performDelete(reservationId),
                },
            ]
        );
    }

    // Renders one reservation card for either upcoming or past history.
    function renderReservationCard(reservation, type) {
        const isUpcoming = type === 'upcoming';

        return (
            <View key={reservation.reservation_id} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.restaurantName}>
                            {reservation.restaurant_name}
                        </Text>
                        <Text style={styles.restaurantLocation}>
                            {reservation.restaurant_location}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            isUpcoming ? styles.upcomingBadge : styles.pastBadge,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusBadgeText,
                                isUpcoming
                                    ? styles.upcomingBadgeText
                                    : styles.pastBadgeText,
                            ]}
                        >
                            {isUpcoming ? 'Upcoming' : 'Past'}
                        </Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaValue}>
                        {formatDateLabel(reservation.reservation_date)}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Time</Text>
                    <Text style={styles.metaValue}>
                        {formatTimeLabel(reservation.reservation_time)}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>People</Text>
                    <Text style={styles.metaValue}>{reservation.people_count}</Text>
                </View>

                {isUpcoming ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => handleEdit(reservation)}
                        >
                            <Text style={styles.secondaryButtonText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.dangerButton,
                                deletingId === reservation.reservation_id &&
                                styles.buttonDisabled,
                            ]}
                            onPress={() => handleDelete(reservation.reservation_id)}
                            disabled={deletingId === reservation.reservation_id}
                        >
                            <Text style={styles.dangerButtonText}>
                                {deletingId === reservation.reservation_id
                                    ? 'Deleting...'
                                    : 'Delete'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#B45309" />
                <Text style={styles.loadingText}>Loading reservations...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => fetchReservations({ mode: 'refresh' })}
                />
            }
        >
            <View style={styles.content}>
                <Text style={styles.title}>My reservations</Text>

                <Text style={styles.subtitle}>
                    Δες τις επερχόμενες κρατήσεις σου και το ιστορικό προηγούμενων
                    κρατήσεων.
                </Text>

                {noticeMessage ? (
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeText}>{noticeMessage}</Text>
                    </View>
                ) : null}

                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {reservations.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateTitle}>
                            No reservations yet
                        </Text>
                        <Text style={styles.emptyStateText}>
                            Κάνε την πρώτη σου κράτηση από τη λίστα εστιατορίων.
                        </Text>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Restaurants')}
                        >
                            <Text style={styles.primaryButtonText}>
                                Browse restaurants
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Upcoming reservations</Text>

                        {upcomingReservations.length > 0 ? (
                            upcomingReservations.map((reservation) =>
                                renderReservationCard(reservation, 'upcoming')
                            )
                        ) : (
                            <View style={styles.sectionEmptyState}>
                                <Text style={styles.sectionEmptyText}>
                                    Δεν υπάρχουν επερχόμενες κρατήσεις.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>Past reservations</Text>

                        {pastReservations.length > 0 ? (
                            pastReservations.map((reservation) =>
                                renderReservationCard(reservation, 'past')
                            )
                        ) : (
                            <View style={styles.sectionEmptyState}>
                                <Text style={styles.sectionEmptyText}>
                                    Δεν υπάρχουν παλαιότερες κρατήσεις ακόμη.
                                </Text>
                            </View>
                        )}
                    </>
                )}
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
        maxWidth: 960,
        alignSelf: 'center',
    },
    centeredContainer: {
        flex: 1,
        backgroundColor: '#FFF8F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#57534E',
    },
    headerLink: {
        color: '#B45309',
        fontWeight: '700',
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
        marginBottom: 18,
    },
    noticeBox: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    noticeText: {
        color: '#065F46',
        fontWeight: '600',
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    errorText: {
        color: '#B91C1C',
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '700',
        color: '#44403C',
        marginTop: 8,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E7E5E4',
        padding: 16,
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1917',
        marginBottom: 4,
    },
    restaurantLocation: {
        color: '#B45309',
        fontWeight: '600',
    },
    statusBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    upcomingBadge: {
        backgroundColor: '#FEF3C7',
    },
    pastBadge: {
        backgroundColor: '#E7E5E4',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    upcomingBadgeText: {
        color: '#92400E',
    },
    pastBadgeText: {
        color: '#57534E',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metaLabel: {
        color: '#78716C',
        fontWeight: '600',
    },
    metaValue: {
        color: '#1C1917',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#F5F5F4',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#44403C',
        fontWeight: '700',
    },
    dangerButton: {
        flex: 1,
        backgroundColor: '#B91C1C',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    primaryButton: {
        backgroundColor: '#B45309',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E7E5E4',
        padding: 24,
        alignItems: 'center',
        marginTop: 8,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        color: '#57534E',
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionEmptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E7E5E4',
        padding: 18,
        marginBottom: 14,
    },
    sectionEmptyText: {
        color: '#57534E',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});