import apiClient from '../apiClient';

/**
 * Interfaz para los datos de login
 */
export interface LoginData {
  alias: string;
  password: string;
}

/**
 * Interfaz para los datos de registro
 */
export interface RegisterData {
  alias: string;
  password: string;
  tipo: 'EDITOR' | 'VISITANTE';
  id_empleado?: number | null;
}

/**
 * Interfaz para el usuario del backend
 */
export interface BackendUser {
  image: undefined;
  id_usuario?: string; // Cuando viene del objeto usuario directo
  user_id?: string;    // Cuando viene del JWT decodificado
  alias: string;
  tipo: 'EDITOR' | 'VISITANTE';
  id_empleado: number | null;
  activo?: boolean;
  proyectos?: number[] | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: BackendUser;
  };
}

/**
 * Interfaz para la respuesta de verificación
 */
export interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    usuario: BackendUser;
  };
}

/**
 * Inicia sesión con alias y contraseña
 * @param {LoginData} loginData - Datos de login
 * @returns {Promise<AuthResponse>} Respuesta con token y usuario
 */
export const login = async (loginData: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', loginData);
  return response.data;
};

/**
 * Registra un nuevo usuario
 * @param {RegisterData} registerData - Datos de registro
 * @returns {Promise<AuthResponse>} Respuesta con token y usuario
 */
export const register = async (registerData: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/registro', registerData);
  return response.data;
};

/**
 * Verifica si el token almacenado es válido
 * @returns {Promise<VerifyResponse>} Respuesta con datos del usuario
 */
export const verifyToken = async (): Promise<VerifyResponse> => {
  const token = localStorage.getItem('jwt_token');
  
  if (!token) {
    throw new Error('No hay token disponible');
  }

  const response = await apiClient.get('/auth/verificar', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data;
};

/**
 * Obtiene el token JWT del localStorage
 * @returns {string | null} Token JWT o null si no existe
 */
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

/**
 * Guarda el token JWT en localStorage
 * @param {string} token - Token JWT a guardar
 */
export const setToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
};

/**
 * Elimina el token JWT del localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('jwt_token');
};