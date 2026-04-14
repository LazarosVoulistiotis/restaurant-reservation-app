/* Το controller:
παίρνει το request
κάνει basic validation
χρησιμοποιεί το req.user.userId από το JWT middleware
καλεί το service
επιστρέφει το JSON response */

const HttpError = require('../utils/httpError');
const {
    createReservation: createReservationService,
    getReservationsForUser,
    updateReservation: updateReservationService,
    deleteReservation: deleteReservationService,
} = require('../services/reservationsService');

// Κάνει validate το :id στα routes update/delete.
function parsePositiveId(value, fieldName) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new HttpError(400, `${fieldName} must be a positive integer`);
    }

    return parsedValue;
}

// Ελέγχει ότι στο create υπάρχουν όλα τα required fields.
function validateCreateReservationBody(body) {
    const requiredFields = [
        'restaurant_id',
        'reservation_date',
        'reservation_time',
        'people_count',
    ];

    const missingField = requiredFields.find((field) => body[field] === undefined || body[field] === null || body[field] === '');

    if (missingField) {
        throw new HttpError(
            400,
            'restaurant_id, reservation_date, reservation_time and people_count are required'
        );
    }
}

// Ελέγχει ότι στο update στάλθηκε τουλάχιστον ένα πεδίο.
function validateUpdateReservationBody(body) {
    const allowedFields = [
        'restaurant_id',
        'reservation_date',
        'reservation_time',
        'people_count',
    ];

    const hasAtLeastOneField = allowedFields.some((field) => body[field] !== undefined);

    if (!hasAtLeastOneField) {
        throw new HttpError(
            400,
            'At least one of restaurant_id, reservation_date, reservation_time or people_count must be provided'
        );
    }
}

// Παίρνει τον logged-in user από req.user, καλεί το service, επιστρέφει 201.
async function createReservation(req, res, next) {
    try {
        validateCreateReservationBody(req.body);

        const reservation = await createReservationService({
            userId: req.user.userId,
            ...req.body,
        });

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation,
        });
    } catch (error) {
        next(error);
    }
}

// Φέρνει μόνο τις κρατήσεις του current user.
async function getUserReservations(req, res, next) {
    try {
        const reservations = await getReservationsForUser(req.user.userId);

        res.status(200).json({
            count: reservations.length,
            reservations,
        });
    } catch (error) {
        next(error);
    }
}

// Παίρνει το reservationId από το URL, το κάνει validate, και κάνει update μόνο για τον current user.
async function updateReservation(req, res, next) {
    try {
        validateUpdateReservationBody(req.body);

        const reservationId = parsePositiveId(req.params.id, 'Reservation id');

        const reservation = await updateReservationService({
            reservationId,
            userId: req.user.userId,
            updates: req.body,
        });

        res.status(200).json({
            message: 'Reservation updated successfully',
            reservation,
        });
    } catch (error) {
        next(error);
    }
}

// Παίρνει το reservationId, το κάνει validate και διαγράφει μόνο αν η κράτηση ανήκει στον current user.
async function deleteReservation(req, res, next) {
    try {
        const reservationId = parsePositiveId(req.params.id, 'Reservation id');

        await deleteReservationService({
            reservationId,
            userId: req.user.userId,
        });

        res.status(200).json({
            message: 'Reservation deleted successfully',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createReservation,
    getUserReservations,
    updateReservation,
    deleteReservation,
};