import apiClient from "../apiClient";

export interface usuarioProyecto {
  id_usuario: number;
  id_proyecto: number;
}

export const crearUsuarioProyecto = async (data: usuarioProyecto) => {
  const response = await apiClient.post('/api/usuarioProyecto', data);
  return response.data;
}


/**
 * 
 * @param userId 
 * @returns 
 */
export const obtenerProyectosPorUsuario = async (userId: string) => {
  try {
    const response = await apiClient.get(`/api/usuarios/${userId}/proyectos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener proyectos del usuario:", error);
    throw error;
  }
};

/**
 * Elimina la relación usuario-proyecto
 * @param data { id_usuario, id_proyecto }
 */
export const eliminarUsuarioProyecto = async (data: usuarioProyecto) => {
  try {
    // Algunos backends esperan el body en data para delete
    const response = await apiClient.delete('/api/usuarioProyecto', { data });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuarioProyecto:', error);
    throw error;
  }
};
