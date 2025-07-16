import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        return api(originalRequest);
      } catch (refreshError) {
        const authStore = useAuthStore();
        authStore.user = null;
        localStorage.removeItem('isAuthenticated');

        window.location.href = '/auth/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Auth endpoints
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    refreshToken: () => api.post('/auth/refresh-token')
  },
  
  // Rooms endpoints
  rooms: {
    search: (searchParams) => api.post('/rooms/search', searchParams),
    getAll: () => api.get('/rooms'),
    getById: (id) => api.get(`/rooms/${id}`)
  },
  
  // Bookings endpoints
  bookings: {
    create: (bookingData) => api.post('/bookings', bookingData),
    getAll: (status) => api.get('/bookings', { params: { status } }),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.delete(`/bookings/${id}`)
  }
};

export default api;