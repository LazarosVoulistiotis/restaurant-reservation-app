/* Business logic layer του authentication
Ασχολείται μόνο με: έλεγχο χρήστη στη βάση, hashing password, comparison password and token generation */

// Imports
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const HttpError = require('../utils/httpError');
const { generateToken } = require('../utils/jwt');

// async function για register
async function registerUser({ name, email, password }) {
    // Καθαρίζουμε το email, example " Test@Email.com " → "test@email.com"
    const normalizedEmail = email.trim().toLowerCase();

    // Τρέχουμε query στη βάση για να δούμε αν υπάρχει ήδη χρήστης με αυτό το email
    const [existingUsers] = await pool.query(
        'SELECT user_id FROM users WHERE email = ? LIMIT 1',
        [normalizedEmail]
    );

    if (existingUsers.length > 0) {
        throw new HttpError(409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // κάνουμε insert τον νέο χρήστη στη βάση
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name.trim(), normalizedEmail, passwordHash]
    );

    // object για τον νέο χρήστη
    const user = {
        user_id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
    };

    // JWT token για τον νέο χρήστη
    const token = generateToken(user);

    return { user, token };
}

// Async function για login
async function loginUser({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Ψάχνουμε στη βάση τον χρήστη με αυτό το email
    const [rows] = await pool.query(
        `SELECT user_id, name, email, password_hash
     FROM users
     WHERE email = ?
     LIMIT 1`,
        [normalizedEmail]
    );

    if (rows.length === 0) {
        throw new HttpError(401, 'Invalid email or password');
    }

    // Παίρνουμε την πρώτη εγγραφή που βρέθηκε
    const userRecord = rows[0];

    const isPasswordValid = await bcrypt.compare(
        password,
        userRecord.password_hash
    );

    if (!isPasswordValid) {
        throw new HttpError(401, 'Invalid email or password');
    }

    const user = {
        user_id: userRecord.user_id,
        name: userRecord.name,
        email: userRecord.email,
    };

    const token = generateToken(user);

    return { user, token };
}

module.exports = {
    registerUser,
    loginUser,
};