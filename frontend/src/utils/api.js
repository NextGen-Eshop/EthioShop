import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create an Axios instance with base URL
const api = axios.create({
  // Pointing to the local backend server for now until Render is updated
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true, // Needed if relying on httpOnly cookies for refresh token
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Get the current token from Zustand store
    const token = useAuthStore.getState().user?.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration/401s if needed
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // You could handle 401 Unauthorized errors here by attempting to refresh the token, 
    // or by clearing the local auth store and redirecting to login.
    if (error.response?.status === 401) {
      // For now, let the components handle the 401, but we could add auto-logout:
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
