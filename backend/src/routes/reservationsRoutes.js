// Εδώ προστατεύουμε όλα τα reservation routes με JWT.
// Άρα χωρίς valid Bearer token, ο χρήστης δεν θα περάσει.

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    createReservation,
    getUserReservations,
    updateReservation,
    deleteReservation,
} = require('../controllers/reservationsController');

const router = express.Router();

// Όλα τα reservation routes είναι protected.
router.use(authMiddleware);

router.post('/reservations', createReservation);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', deleteReservation);
router.get('/user/reservations', getUserReservations);

module.exports = router;