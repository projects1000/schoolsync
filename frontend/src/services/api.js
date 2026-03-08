import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Wrap the axios instance with a 30-second TTL cache for GET requests
const api = setupCache(axiosInstance, {
    ttl: 1000 * 30, 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        // console.log('API Request Interceptor - Token:', token ? 'Found' : 'Missing'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor — redirect to login when token is expired (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
