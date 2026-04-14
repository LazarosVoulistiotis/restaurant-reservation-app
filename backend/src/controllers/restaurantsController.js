/* Το controller:
παίρνει τα query params από το request
τα καθαρίζει
καλεί το service
στέλνει πίσω το JSON response
Άρα εδώ έχουμε request/response logic, όχι SQL. */

const HttpError = require('../utils/httpError');
const { getRestaurants } = require('../services/restaurantsService');

// Helper function για να καθαρίζουμε τα query params.
function normalizeQueryValue(value) {
    if (value === undefined) {
        return undefined;
    }

    // Αν σταλεί ίδιο query param πολλές φορές το θεωρούμε invalid και γυρνάμε 400
    if (Array.isArray(value)) {
        throw new HttpError(400, 'Each query parameter must be provided only once');
    }

    // Αφαιρούμε περιττά κενά.
    const trimmedValue = value.trim();

    return trimmedValue === '' ? undefined : trimmedValue;
}

// Ο βασικός route handler
async function listRestaurants(req, res, next) {
    try {
        const filters = {
            name: normalizeQueryValue(req.query.name),
            location: normalizeQueryValue(req.query.location),
        };

        // Καλούμε το service.
        const restaurants = await getRestaurants(filters);

        res.status(200).json({
            count: restaurants.length, // Πολύ χρήσιμο για Postman και frontend
            restaurants,
        });
    }
    // Οτιδήποτε πάει λάθος περνά στο global error handler
    catch (error) {
        next(error);
    }
}

module.exports = {
    listRestaurants,
};