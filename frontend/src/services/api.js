import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Create an Axios instance with interceptors to add Authorization header
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for authentication (cookies/sessions)
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Task APIs
export const fetchTasks = () => {
  const token = localStorage.getItem('token'); // Get stored token
  return api.get('/api/tasks', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, updatedData) => api.put(`/tasks/${id}`, updatedData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// User Authentication APIs
export const login = async (credentials) => {
  const response = await api.post('/api/users/login', credentials);
  localStorage.setItem('token', response.data.token);
  return response;
};


export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  localStorage.setItem('token', response.data.token); // Store token after registration
  return response.data;
};

export const logout = async () => {
  await api.post('/users/logout');
  localStorage.removeItem('token'); // Remove token on logout
};

export default api;
