/* Εδώ μπαίνει όλη η πραγματική λογική:
validation των reservation fields
έλεγχος αν υπάρχει restaurant
έλεγχος ownership
έλεγχος αν η κράτηση είναι μελλοντική
insert / select / update / delete queries */

const pool = require('../db/pool');
const HttpError = require('../utils/httpError');

// Helper function. Ελέγχει αν το date είναι σωστό και σε μορφή YYYY-MM-DD.
function isValidDateString(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

// Ελέγχει αν η ώρα είναι HH:MM ή HH:MM:SS.
function isValidTimeString(value) {
    return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(value);
}

// Αν δώσεις 20:30, το κάνει 20:30:00 για να ταιριάζει καλά με SQL TIME.
function normalizeTime(value) {
    return value.length === 5 ? `${value}:00` : value;
}

// Ενώνει date + time σε ένα JavaScript datetime.
function buildReservationDateTime(date, time) {
    return new Date(`${date}T${normalizeTime(time)}`);
}

// Επιστρέφει true μόνο αν η κράτηση είναι στο μέλλον.
function isFutureReservation(date, time) {
    return buildReservationDateTime(date, time).getTime() > Date.now();
}

// Ελέγχει αν υπάρχει το εστιατόριο.
async function getRestaurantById(restaurantId) {
    const [rows] = await pool.query(
        'SELECT restaurant_id FROM restaurants WHERE restaurant_id = ? LIMIT 1',
        [restaurantId]
    );

    return rows[0] || null;
}

// Φέρνει μία κράτηση μόνο αν ανήκει στον συγκεκριμένο χρήστη.
async function getOwnedReservationById(reservationId, userId) {
    const [rows] = await pool.query(
        `
      SELECT
        r.reservation_id,
        r.user_id,
        r.restaurant_id,
        rest.name AS restaurant_name,
        rest.location AS restaurant_location,
        DATE_FORMAT(r.reservation_date, '%Y-%m-%d') AS reservation_date,
        TIME_FORMAT(r.reservation_time, '%H:%i:%s') AS reservation_time,
        r.people_count
      FROM reservations r
      INNER JOIN restaurants rest
        ON r.restaurant_id = rest.restaurant_id
      WHERE r.reservation_id = ? AND r.user_id = ?
      LIMIT 1
    `,
        [reservationId, userId]
    );

    return rows[0] || null;
}

// Κάνει όλο το validation για: restaurant_id, reservation_date, reservation_time, people_count και πετάει 400 όπου χρειάζεται
function validateReservationPayload({
                                        restaurant_id,
                                        reservation_date,
                                        reservation_time,
                                        people_count,
                                    }) {
    const normalizedRestaurantId = Number(restaurant_id);
    const normalizedPeopleCount = Number(people_count);

    if (!Number.isInteger(normalizedRestaurantId) || normalizedRestaurantId <= 0) {
        throw new HttpError(400, 'restaurant_id must be a positive integer');
    }

    if (!isValidDateString(reservation_date)) {
        throw new HttpError(400, 'reservation_date must be in YYYY-MM-DD format');
    }

    if (!isValidTimeString(reservation_time)) {
        throw new HttpError(400, 'reservation_time must be in HH:MM or HH:MM:SS format');
    }

    if (!Number.isInteger(normalizedPeopleCount) || normalizedPeopleCount <= 0) {
        throw new HttpError(400, 'people_count must be a positive integer');
    }

    const normalizedTimeValue = normalizeTime(reservation_time);

    if (!isFutureReservation(reservation_date, normalizedTimeValue)) {
        throw new HttpError(400, 'Reservation must be scheduled for a future date and time');
    }

    return {
        restaurant_id: normalizedRestaurantId,
        reservation_date,
        reservation_time: normalizedTimeValue,
        people_count: normalizedPeopleCount,
    };
}

// Κάνει create: validate, check restaurant exists, insert and επιστρέφει τη νέα κράτηση
async function createReservation({ userId, restaurant_id, reservation_date, reservation_time, people_count }) {
    const validatedData = validateReservationPayload({
        restaurant_id,
        reservation_date,
        reservation_time,
        people_count,
    });

    const restaurant = await getRestaurantById(validatedData.restaurant_id);

    if (!restaurant) {
        throw new HttpError(404, 'Restaurant not found');
    }

    const [result] = await pool.query(
        `
      INSERT INTO reservations (
        user_id,
        restaurant_id,
        reservation_date,
        reservation_time,
        people_count
      )
      VALUES (?, ?, ?, ?, ?)
    `,
        [
            userId,
            validatedData.restaurant_id,
            validatedData.reservation_date,
            validatedData.reservation_time,
            validatedData.people_count,
        ]
    );

    return getOwnedReservationById(result.insertId, userId);
}

// Φέρνει όλες τις κρατήσεις του logged-in user, μαζί με στοιχεία εστιατορίου.
async function getReservationsForUser(userId) {
    const [rows] = await pool.query(
        `
      SELECT
        r.reservation_id,
        r.user_id,
        r.restaurant_id,
        rest.name AS restaurant_name,
        rest.location AS restaurant_location,
        DATE_FORMAT(r.reservation_date, '%Y-%m-%d') AS reservation_date,
        TIME_FORMAT(r.reservation_time, '%H:%i:%s') AS reservation_time,
        r.people_count
      FROM reservations r
      INNER JOIN restaurants rest
        ON r.restaurant_id = rest.restaurant_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date ASC, r.reservation_time ASC
    `,
        [userId]
    );

    return rows;
}

// Κάνει update μόνο αν: η κράτηση υπάρχει, ανήκει στον user, είναι μελλοντική. Υποστηρίζει και partial update, γιατί ενώνει τα νέα fields με τα παλιά.
async function updateReservation({ reservationId, userId, updates }) {
    const existingReservation = await getOwnedReservationById(reservationId, userId);

    if (!existingReservation) {
        throw new HttpError(404, 'Reservation not found');
    }

    if (!isFutureReservation(existingReservation.reservation_date, existingReservation.reservation_time)) {
        throw new HttpError(400, 'Only future reservations can be updated');
    }

    const mergedData = {
        restaurant_id: updates.restaurant_id ?? existingReservation.restaurant_id,
        reservation_date: updates.reservation_date ?? existingReservation.reservation_date,
        reservation_time: updates.reservation_time ?? existingReservation.reservation_time,
        people_count: updates.people_count ?? existingReservation.people_count,
    };

    const validatedData = validateReservationPayload(mergedData);

    const restaurant = await getRestaurantById(validatedData.restaurant_id);

    if (!restaurant) {
        throw new HttpError(404, 'Restaurant not found');
    }

    await pool.query(
        `
      UPDATE reservations
      SET
        restaurant_id = ?,
        reservation_date = ?,
        reservation_time = ?,
        people_count = ?
      WHERE reservation_id = ? AND user_id = ?
    `,
        [
            validatedData.restaurant_id,
            validatedData.reservation_date,
            validatedData.reservation_time,
            validatedData.people_count,
            reservationId,
            userId,
        ]
    );

    return getOwnedReservationById(reservationId, userId);
}

// Διαγράφει μόνο αν: η κράτηση υπάρχει, ανήκει στον user, είναι μελλοντική
async function deleteReservation({ reservationId, userId }) {
    const existingReservation = await getOwnedReservationById(reservationId, userId);

    if (!existingReservation) {
        throw new HttpError(404, 'Reservation not found');
    }

    if (!isFutureReservation(existingReservation.reservation_date, existingReservation.reservation_time)) {
        throw new HttpError(400, 'Only future reservations can be deleted');
    }

    await pool.query(
        'DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?',
        [reservationId, userId]
    );
}

module.exports = {
    createReservation,
    getReservationsForUser,
    updateReservation,
    deleteReservation,
};