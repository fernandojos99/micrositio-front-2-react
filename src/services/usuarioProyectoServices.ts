import apiClient from "../apiClient";

export interface usuarioProyecto {
  id_usuario: number;
  id_proyecto: number;
}

export const crearUsuarioProyecto = async (data: usuarioProyecto) => {
  const response = await apiClient.post('/usuario_proyecto/', data);
  return response.data;
}



/**
 * Elimina la relación usuario-proyecto
 * @param data { id_usuario, id_proyecto }
 */
export const eliminarUsuarioProyecto = async (userId: string, id_proyecto: number) => {
  try {
    // Algunos backends esperan el body en data para delete
    const response = await apiClient.delete(`/usuario_proyecto/${userId}/${id_proyecto}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuarioProyecto:', error);
    throw error;
  }
};
