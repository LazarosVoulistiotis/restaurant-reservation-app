require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ message: 'API is running' });
});

app.get('/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 AS db_status');
        res.json({
            message: 'Database connection successful',
            result: rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: 'Database connection failed',
            error: error.message,
        });
    }
});

module.exports = app;