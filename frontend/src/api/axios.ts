import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// VITE_API_URL debe definirse en tu archivo .env.production
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 120000, // Aumentado a 120 segundos (2 minutos) para dar tiempo de sobra a Render Free a despertar
});

// Interceptor de Peticiones: Adjunta el Token JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor de Respuestas: Manejo de errores 401 y logging en producción
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde con 401, el token ha expirado o es inválido
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Loguear errores solo si no estamos en producción para evitar fugas de info
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
