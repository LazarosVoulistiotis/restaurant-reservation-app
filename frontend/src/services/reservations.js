/* Το reservations.js είναι το οργανωμένο frontend API module
που χειρίζεται όλο το CRUD communication των κρατήσεων με το backend.*/

import api from './api';

// Normalizes a single-reservation response into a stable value.
function normalizeReservation(data) {
    return data?.reservation ?? null;
}

// Normalizes a reservations list response into an array.
function normalizeReservations(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.reservations)) {
        return data.reservations;
    }

    return [];
}

// Creates a new reservation through the backend API.
export async function createReservation(payload) {
    const response = await api.post('/reservations', payload);

    return {
        message: response.data?.message || 'Reservation created successfully',
        reservation: normalizeReservation(response.data),
    };
}

// Fetches all reservations that belong to the logged-in user.
export async function getUserReservations() {
    const response = await api.get('/user/reservations');

    return normalizeReservations(response.data);
}

// Updates an existing reservation by id.
export async function updateReservation(reservationId, payload) {
    const response = await api.put(`/reservations/${reservationId}`, payload);

    return {
        message: response.data?.message || 'Reservation updated successfully',
        reservation: normalizeReservation(response.data),
    };
}

// Deletes a reservation by id.
export async function deleteReservation(reservationId) {
    const response = await api.delete(`/reservations/${reservationId}`);

    return {
        message: response.data?.message || 'Reservation deleted successfully',
    };
}