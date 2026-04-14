/* Εδώ λες στην Express:
όταν έρθει GET /restaurants να εκτελεστεί ο listRestaurants */

const express = require('express');
const { listRestaurants } = require('../controllers/restaurantsController');

const router = express.Router();

router.get('/restaurants', listRestaurants);

module.exports = router;