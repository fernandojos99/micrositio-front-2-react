import apiClient from '../apiClient';

export interface Usuario {
  id_usuario: string; // UUID
  alias: string;
  password_hash: string;
  tipo: 'EDITOR' | 'VISITANTE';
  id_empleado?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearUsuarioData {
  alias: string;
  password: string; // Se envía como password, el backend se encarga del hash
  tipo: 'EDITOR' | 'VISITANTE';
  id_empleado?: number;
  activo?: boolean;
}

export interface ActualizarUsuarioData {
  alias?: string;
  tipo?: 'EDITOR' | 'VISITANTE';
  id_empleado?: number;
  activo?: boolean;
}

export interface CambiarPasswordData {
  password: string; // Nueva contraseña sin hash
}

/**
 * Obtiene un usuario específico por su ID de empleado
 * @param {number} id_empleado - ID del empleado asociado
 * @returns {Promise<Usuario>} Los datos del usuario
 */
export const obtenerUsuarioPorIdEmpleado = async (id_empleado: number): Promise<Usuario> => {
  const response = await apiClient.get(`/usuarios/empleado/${id_empleado}`);
  return response.data;
};

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Usuario[]>} Lista de todos los usuarios
 */
export const obtenerTodosUsuarios = async (): Promise<Usuario[]> => {
  const response = await apiClient.get('/usuarios/');
  return response.data;
};

/**
 * Crea un nuevo usuario
 * @param {CrearUsuarioData} usuarioData - Datos del nuevo usuario
 * @returns {Promise<Usuario>} El usuario creado
 */
export const crearUsuario = async (usuarioData: CrearUsuarioData): Promise<Usuario> => {
  const response = await apiClient.post('/usuarios/', usuarioData);
  return response.data;
};

/**
 * Obtiene un usuario específico por su ID
 * @param {string} id - ID del usuario (UUID)
 * @returns {Promise<Usuario>} Los datos del usuario
 */
export const obtenerUsuarioPorId = async (id: string): Promise<Usuario> => {
  const response = await apiClient.get(`/usuarios/${id}`);
  return response.data;
};

/**
 * Actualiza los datos de un usuario existente
 * @param {string} id - ID del usuario (UUID)
 * @param {ActualizarUsuarioData} usuarioData - Datos a actualizar
 * @returns {Promise<Usuario>} El usuario actualizado
 */
export const actualizarUsuario = async (id: string, usuarioData: ActualizarUsuarioData): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}`, usuarioData);
  return response.data;
};

/**
 * Elimina un usuario (eliminación física)
 * @param {string} id - ID del usuario (UUID)
 * @returns {Promise<void>} Confirmación de eliminación
 */
export const eliminarUsuario = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/usuarios/${id}`);
  return response.data;
};

/**
 * Da de baja a un usuario (activo = false)
 * @param {string} id - ID del usuario (UUID)
 * @returns {Promise<Usuario>} El usuario actualizado
 */
export const darBajaUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/baja`);
  return response.data;
};

/**
 * Da de alta a un usuario (activo = true)
 * @param {string} id - ID del usuario (UUID)
 * @returns {Promise<Usuario>} El usuario actualizado
 */
export const darAltaUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/alta`);
  return response.data;
};

/**
 * Cambia la contraseña de un usuario
 * @param {string} id - ID del usuario (UUID)
 * @param {CambiarPasswordData} passwordData - Nueva contraseña
 * @returns {Promise<Usuario>} El usuario actualizado
 */
export const cambiarPasswordUsuario = async (id: string, passwordData: CambiarPasswordData): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/password`, passwordData);
  return response.data;
};

// Exportar todas las funciones como default para facilitar el uso
export default {
  obtenerUsuarioPorIdEmpleado,
  obtenerTodosUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  darBajaUsuario,
  darAltaUsuario,
  cambiarPasswordUsuario,
};
