/* Το route file είναι το σημείο όπου λέμε στην Express:
όταν έρθει POST /register → πήγαινε στο register
όταν έρθει POST /login → πήγαινε στο login */

// Imports
const express = require('express');
const { register, login } = require('../controllers/authController');

// Δημιουργούμε ένα νέο router object, “μικρός δρομολογητής” για τα auth endpoints
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;