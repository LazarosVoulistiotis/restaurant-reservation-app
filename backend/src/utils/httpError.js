/* φτιάχνουμε μια δική μας custom κλάση error.
Αντί να γράφουμε παντού απλό throw new Error(...), θα μπορούμε να γράφουμε:
throw new HttpError(404, 'User not found'); */

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Εξάγουμε την κλάση ώστε να μπορούμε να τη χρησιμοποιούμε σε άλλα αρχεία
module.exports = HttpError;