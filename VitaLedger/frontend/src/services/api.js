import axios from 'axios';

const PROD_BASE = '/api';
const DEV_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
    // In production on Vercel, API calls go to /api/* (same domain, routed to Python serverless).
    // Locally, set VITE_API_URL=http://127.0.0.1:8000 in .env or the fallback kicks in.
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEV_BASE : PROD_BASE),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
