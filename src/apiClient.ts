import axios from 'axios';

export const API_BASE_URL ='https://micrositio-iris-backend.onrender.com';

//export const API_BASE_URL ='http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.warn('🚨 Error CORS detectado:', error.message);
    }

    return Promise.reject(error);
  }
);

export async function fetchStream(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('jwt_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  return response;
}

export default apiClient;
