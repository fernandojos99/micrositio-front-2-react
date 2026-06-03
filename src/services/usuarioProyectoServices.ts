import apiClient from "../apiClient";

export interface usuarioProyecto {
  id_usuario: number;
  id_proyecto: number;
}

export const crearUsuarioProyecto = async (userId: string, projectId: number) => {
  // Convertir userId de string a number porque el backend espera id_usuario como number
  const response = await apiClient.post('/usuarios-proyectos/', { 
    id_usuario: userId, 
    id_proyecto: projectId 
  });
  return response.data.data;
}



/**
 * Elimina la relación usuario-proyecto
 * @param data { id_usuario, id_proyecto }
 */
export const eliminarUsuarioProyecto = async (userId: string, id_proyecto: number) => {
  try {
    // Convertir userId a number para consistencia con el backend
    const numericUserId = Number(userId);
    const response = await apiClient.delete(`/usuarios-proyectos/${numericUserId}/${id_proyecto}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al eliminar usuarioProyecto:', error);
    throw error;
  }
};
