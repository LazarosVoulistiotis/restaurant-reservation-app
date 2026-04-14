/* φτιάχνουμε δύο middleware functions:
notFoundHandler: πιάνει routes που δεν υπάρχουν
errorHandler: πιάνει errors που γίνονται οπουδήποτε στην εφαρμογή
Αυτό σημαίνει ότι το API μας θα επιστρέφει πάντα καθαρή, σταθερή μορφή error response, π.χ.:
{ "message": "Invalid email or password"}
και όχι ακατάστατα stack traces στον client. */

function notFoundHandler(req, res, next) {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
}

function errorHandler(err, req, res, next) {
    // Τυπώνει το error στο terminal/server logs
    console.error(err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({ message });
}

module.exports = {
    notFoundHandler,
    errorHandler,
};