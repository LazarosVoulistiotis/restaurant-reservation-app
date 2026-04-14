/* Ένα μικρό helper που αναλαμβάνει να δημιουργεί JWT tokens.
Αντί να γράφουμε παντού μέσα σε controllers/services τον ίδιο κώδικα με jwt.sign(...), τον βάζουμε εδώ μία φορά και τον επαναχρησιμοποιούμε */

// import το package jsonwebtoken
const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign(
        // Payload του token (Το payload είναι τα δεδομένα που θέλουμε να “κουβαλάει” το token.)
        {
            userId: user.user_id,
            email: user.email,
        },
        // secret key με το οποίο “υπογράφεται” το token
        process.env.JWT_SECRET,
        // options object του token
        {
            expiresIn: '7d',
        }
    );
}

module.exports = {
    generateToken,
};