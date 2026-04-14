/* Το app.js είναι ο κεντρικός πυρήνας της Express εφαρμογής.
 Φορτώνεται το environment,
 ενεργοποιούνται middleware όπως cors και express.json,
 δηλώνονται τα βασικά routes,
 συνδέονται τα auth routes,
 και στο τέλος μπαίνουν οι global error handlers. */

// Φορτώνει τις μεταβλητές από το .env
require('dotenv').config();

// Imports
const express = require('express');
const cors = require('cors'); // επιτρέπει στο frontend να μιλάει με το backend από άλλη διεύθυνση/port
const pool = require('./db/pool'); // μόνο για το /db-test

const authRoutes = require('./routes/authRoutes');
const restaurantsRoutes = require('./routes/restaurantsRoutes');
const reservationsRoutes = require('./routes/reservationsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Δημιουργούμε την Express εφαρμογή
const app = express();

// Ενεργοποιούμε το CORS middleware
app.use(cors());
// Λέμε στην Express να κάνει parse JSON request bodies.
app.use(express.json());

// Δηλώνουμε ένα απλό GET endpoint για health check
app.get('/health', (req, res) => {
    res.json({ message: 'API is running' });
});

// Δηλώνουμε endpoint για έλεγχο σύνδεσης με τη βάση
app.get('/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS db_status');

        res.json({
            message: 'Database connection successful',
            result: rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error.message,
        });
    }
});

// Συνδέουμε τσ routes στην εφαρμογή
app.use(authRoutes);
app.use(restaurantsRoutes);
app.use(reservationsRoutes);

// Αν κανένα route δεν ταίριαξε, τότε θα γυρίσει 404
app.use(notFoundHandler);
// Πιάνει errors που έγιναν σε controllers/services και πέρασαν με next(error)
app.use(errorHandler);

module.exports = app;