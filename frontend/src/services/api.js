// Το api.js ορίζει πώς και πού το frontend επικοινωνεί με το backend,
// και διαχειρίζεται το JWT header για authenticated requests.

import axios from 'axios'; // για HTTP requests προς το backend

// Base URL for backend API requests.
// Use your local IPv4 address when testing from a physical device with Expo Go.
const API_BASE_URL = 'http://localhost:5000';

// Shared axios instance for all API calls.
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adds or removes the JWT Authorization header globally.
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

export default api;