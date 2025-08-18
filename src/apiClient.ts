import axios from 'axios';

const apiClient = axios.create({
  baseURL:  'https://micrositio-iris-backend.onrender.com', //  'http://localhost:3000',//

  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente a todas las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar storage
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('auth_user');
      
      // Opcional: redirigir al login o emitir evento
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;