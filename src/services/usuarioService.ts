import apiClient from '../apiClient';

export interface Usuario {
  id_usuario: number;
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
  password: string;
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
  password_actual: string;
  password_nueva: string;
}

export interface UploadResponse {
  image?: string;
  url?: string;
  message?: string;
}

export const obtenerUsuarioPorIdEmpleado = async (id_empleado: number): Promise<Usuario> => {
  const response = await apiClient.get(`/usuarios/empleado/${id_empleado}`);
  return response.data;
};

export const obtenerTodosUsuarios = async (): Promise<Usuario[]> => {
  try {
    console.log('🔍 Llamando al endpoint: GET /usuarios/');
    const response = await apiClient.get('/usuarios/');
    console.log('📊 Respuesta completa del servidor:', response);
    console.log('📋 Datos recibidos:', response.data);
    console.log('🔍 Tipo de datos:', typeof response.data, 'Es array?', Array.isArray(response.data));
    return response.data;
  } catch (error) {
    console.error('❌ Error en obtenerTodosUsuarios:', error);
    throw error;
  }
};

export const crearUsuario = async (usuarioData: CrearUsuarioData): Promise<Usuario> => {
  const response = await apiClient.post('/usuarios/', usuarioData);
  return response.data;
};

export const crearUsuarioVisitante = async (usuarioData: CrearUsuarioData): Promise<Usuario> => {
  const response = await apiClient.post('/usuarios/visitante', usuarioData);
  return response.data;
};

export const obtenerUsuarioPorId = async (id: string): Promise<Usuario> => {
  const response = await apiClient.get(`/usuarios/${id}`);
  return response.data;
};

export const actualizarUsuario = async (id: string, usuarioData: ActualizarUsuarioData): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}`, usuarioData);
  return response.data;
};

export const eliminarUsuario = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/usuarios/${id}`);
  return response.data;
};

export const darBajaUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/baja`);
  return response.data;
};

export const darAltaUsuario = async (id: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/alta`);
  return response.data;
};

export const cambiarPasswordUsuario = async (id: string, passwordData: CambiarPasswordData): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/password`, passwordData);
  return response.data;
};

export const asignarEmpleadoUsuario = async (id_usuario: string, id_empleado: number): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id_usuario}/asignar-empleado`, { id_empleado });
  return response.data;
};

export const actualizarTipoUsuario = async (id: string, tipo: string): Promise<Usuario> => {
  const response = await apiClient.patch(`/usuarios/${id}/tipo`, { tipo });
  return response.data;
};

// ✅ ÚNICO CAMBIO: se agrega el tercer argumento con Content-Type: undefined
export const subirImagenUsuario = async (formData: FormData): Promise<UploadResponse> => {
  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
  return response.data;
};

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
  subirImagenUsuario,
};