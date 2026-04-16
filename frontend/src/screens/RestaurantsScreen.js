/* Το RestaurantsScreen.js υλοποιεί το restaurant browsing flow του app,
συνδέοντας το frontend με το /restaurants endpoint και προσφέροντας
καθαρή εμπειρία αναζήτησης, φόρτωσης, ανανέωσης και μετάβασης προς την κράτηση.*/

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import api from '../services/api';

function normalizeRestaurants(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.restaurants)) {
        return data.restaurants;
    }

    return [];
}

function deduplicateRestaurants(restaurants) {
    return restaurants.filter(
        (restaurant, index, array) =>
            index ===
            array.findIndex(
                (item) => String(item.restaurant_id) === String(restaurant.restaurant_id)
            )
    );
}

export default function RestaurantsScreen({ navigation }) {
    const [restaurants, setRestaurants] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const loadAllRestaurants = useCallback(async () => {
        const response = await api.get('/restaurants');
        return normalizeRestaurants(response.data);
    }, []);

    const searchRestaurants = useCallback(
        async (query) => {
            const trimmedQuery = query.trim();

            if (!trimmedQuery) {
                return loadAllRestaurants();
            }

            const [byNameResponse, byLocationResponse] = await Promise.all([
                api.get('/restaurants', { params: { name: trimmedQuery } }),
                api.get('/restaurants', { params: { location: trimmedQuery } }),
            ]);

            const merged = [
                ...normalizeRestaurants(byNameResponse.data),
                ...normalizeRestaurants(byLocationResponse.data),
            ];

            return deduplicateRestaurants(merged);
        },
        [loadAllRestaurants]
    );

    const fetchRestaurants = useCallback(
        async ({ mode = 'initial', query = '' } = {}) => {
            try {
                setErrorMessage('');

                if (mode === 'initial') setIsLoading(true);
                if (mode === 'search') setIsSearching(true);
                if (mode === 'refresh') setIsRefreshing(true);

                const data =
                    query.trim().length > 0
                        ? await searchRestaurants(query)
                        : await loadAllRestaurants();

                setRestaurants(data);
            } catch (error) {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Αδυναμία φόρτωσης εστιατορίων.';

                setErrorMessage(message);
            } finally {
                setIsLoading(false);
                setIsSearching(false);
                setIsRefreshing(false);
            }
        },
        [loadAllRestaurants, searchRestaurants]
    );

    useEffect(() => {
        fetchRestaurants({ mode: 'initial' });
    }, [fetchRestaurants]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Restaurants',
            headerBackVisible: false,
        });
    }, [navigation]);

    const handleSearch = () => {
        fetchRestaurants({ mode: 'search', query: searchText });
    };

    const handleClear = () => {
        setSearchText('');
        fetchRestaurants({ mode: 'search', query: '' });
    };

    const renderRestaurantCard = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.restaurantLocation}>{item.location}</Text>
            <Text style={styles.restaurantDescription}>
                {item.description || 'No description available.'}
            </Text>

            <TouchableOpacity
                style={styles.bookButton}
                onPress={() =>
                    navigation.navigate('ReservationForm', {
                        restaurant: item,
                    })
                }
            >
                <Text style={styles.bookButtonText}>Book now</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#B45309" />
                <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.screenTitle}>Find your next table</Text>

                <Text style={styles.screenSubtitle}>
                    Αναζήτησε εστιατόρια με βάση το όνομα ή την τοποθεσία.
                </Text>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by restaurant name or location"
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />

                    <TouchableOpacity
                        style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={isSearching}
                    >
                        <Text style={styles.searchButtonText}>
                            {isSearching ? '...' : 'Search'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                    <Text style={styles.clearButtonText}>Clear search</Text>
                </TouchableOpacity>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                {!errorMessage && restaurants.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateTitle}>No restaurants found</Text>
                        <Text style={styles.emptyStateText}>
                            Δοκίμασε άλλο όνομα ή άλλη τοποθεσία.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={restaurants}
                        keyExtractor={(item) => String(item.restaurant_id)}
                        renderItem={renderRestaurantCard}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={() =>
                                    fetchRestaurants({ mode: 'refresh', query: searchText })
                                }
                            />
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8F1',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    content: {
        flex: 1,
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
    screenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 8,
    },
    screenSubtitle: {
        fontSize: 15,
        color: '#57534E',
        marginBottom: 18,
        lineHeight: 22,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E7E5E4',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    searchButton: {
        backgroundColor: '#B45309',
        borderRadius: 12,
        paddingHorizontal: 18,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 96,
    },
    searchButtonDisabled: {
        opacity: 0.7,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    clearButton: {
        alignSelf: 'flex-start',
        marginBottom: 14,
    },
    clearButtonText: {
        color: '#B45309',
        fontWeight: '600',
    },
    errorText: {
        color: '#B91C1C',
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E7E5E4',
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
        marginBottom: 10,
    },
    restaurantDescription: {
        color: '#57534E',
        lineHeight: 22,
        marginBottom: 14,
    },
    bookButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#B45309',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    bookButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    emptyState: {
        marginTop: 48,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#7C2D12',
        marginBottom: 8,
    },
    emptyStateText: {
        color: '#57534E',
        textAlign: 'center',
    },
});