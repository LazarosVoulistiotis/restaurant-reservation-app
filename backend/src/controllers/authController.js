/* controller = request/response logic
Το controller είναι το σημείο που:
παραλαμβάνει το HTTP request,
κάνει αρχικό validation,
καλεί το service,
και επιστρέφει JSON response. */

const HttpError = require('../utils/httpError');
const { registerUser, loginUser } = require('../services/authService');

// Ορίζουμε regex για βασικό email validation (A Regular Expression is a sequence of characters that forms a search pattern)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper function για validation του register request body
function validateRegisterBody(body) {
    const { name, email, password } = body;

    if (!name || !email || !password) {
        throw new HttpError(400, 'Name, email and password are required');
    }

    if (name.trim().length < 2) {
        throw new HttpError(400, 'Name must be at least 2 characters long');
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new HttpError(400, 'Please provide a valid email address');
    }

    if (password.length < 6) {
        throw new HttpError(400, 'Password must be at least 6 characters long');
    }
}

// Validation helper για login
function validateLoginBody(body) {
    const { email, password } = body;

    if (!email || !password) {
        throw new HttpError(400, 'Email and password are required');
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new HttpError(400, 'Please provide a valid email address');
    }
}

// Actual route handler για register
async function register(req, res, next) {
    try {
        validateRegisterBody(req.body);

        // Καλούμε το service layer. Το service επιστρέφει: user and token
        const result = await registerUser(req.body);

        // επιτυχημένο response 201 Created
        res.status(201).json({
            message: 'User registered successfully',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        next(error);
    }
}

// Route handler για login
async function login(req, res, next) {
    try {
        validateLoginBody(req.body);

        // Καλούμε το service layer
        const result = await loginUser(req.body);

        res.status(200).json({
            message: 'Login successful',
            user: result.user,
            token: result.token,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
};