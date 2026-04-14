/* Αυτό είναι το service του restaurants endpoint.
 Φτιάχνει το SQL query
 εφαρμόζει τα optional filters
 μιλάει στη βάση
 επιστρέφει τα αποτελέσματα */

// import το MariaDB pool
const pool = require('../db/pool');

async function getRestaurants({ name, location }) {
    // Ξεκινάμε το βασικό SQL query
    let query = `
    SELECT restaurant_id, name, location, description
    FROM restaurants
  `;

    // Αυτός ο πίνακας κρατά τα WHERE conditions που θα μπουν μόνο αν δοθούν query params.
    const conditions = [];
    // Αυτός κρατά τις πραγματικές τιμές για τα placeholders ?.
    const values = [];

    if (name) {
        conditions.push('name LIKE ?');
        values.push(`%${name}%`);
    }

    if (location) {
        conditions.push('location LIKE ?');
        values.push(`%${location}%`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Ταξινομούμε αλφαβητικά για πιο καθαρή επιστροφή
    query += ' ORDER BY name ASC';

    // Τρέχουμε το query με parameterized values
    const [rows] = await pool.query(query, values);

    // Επιστρέφουμε τις εγγραφές στο controller
    return rows;
}

module.exports = {
    getRestaurants,
};