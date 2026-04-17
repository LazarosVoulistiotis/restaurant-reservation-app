// The api.js file defines how the frontend communicates with the backend
// and manages the JWT header for authenticated requests.

import axios from 'axios';

// Base URL for backend API requests.
const API_BASE_URL = 'http://localhost:5000';

// Holds a callback that will run when auth fails.
let authFailureHandler = null;

// Shared axios instance for all API calls.
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Registers a logout-like handler from the auth layer.
export function setAuthFailureHandler(handler) {
    authFailureHandler = handler;
}

// Adds or removes the JWT Authorization header globally.
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

// Intercepts API errors and handles expired/invalid auth cleanly.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;
        const hadAuthHeader = Boolean(
            originalRequest?.headers?.Authorization ||
            api.defaults.headers.common.Authorization
        );

        if (status === 401 && hadAuthHeader && !originalRequest?._authHandled) {
            originalRequest._authHandled = true;

            if (authFailureHandler) {
                await authFailureHandler();
            }
        }

        return Promise.reject(error);
    }
);

export default api;