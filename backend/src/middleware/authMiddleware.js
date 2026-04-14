// Αυτό είναι το middleware που προστατεύει routes.

const jwt = require('jsonwebtoken');

// Δημιουργούμε Express middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Απορρίπτουμε requests χωρίς σωστό token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token is required',
        });
    }

    // Παίρνουμε μόνο το token.
    const token = authHeader.split(' ')[1];

    // Επαλήθευση token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        // Αν όλα πήγαν καλά, συνεχίζουμε στο επόμενο middleware ή route handler
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}

module.exports = authMiddleware;