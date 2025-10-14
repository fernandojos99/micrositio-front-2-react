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
