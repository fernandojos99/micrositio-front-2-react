import apiClient  from "../apiClient";
export interface AgenteCategoria {
  id_categoria: number;
  nombre: string;
}

export interface ActualizarAgenteCategoriaData {
  idAgente: number;
  idACategoria : string;
}

/**
 * Obtiene todas las categorías que tiene los agentes
 * @returns {Promise<AgenteCategoria[]>} Lista de todas las categorías de agentes 
 */
export const obtenerAgenteCategorias = async (): Promise<AgenteCategoria[]> => {
    const response = await apiClient.get('/agentes_categoria/');
    return response.data;
};

/**
 * 
 * @param id_categoria 
 * @returns 
 */
export const obtenerAgenteCategoriaPorId = async (id_categoria: number): Promise<AgenteCategoria> => {
    const response = await apiClient.get(`/agentes_categoria/${id_categoria}`);
    return response.data;
};