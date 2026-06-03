import apiClient  from "../apiClient";
export interface CategoriaAgente {
  id_categoria: number;
  nombre_categoria: string;
}

/**
 * Obtiene todas las categorías de agentes
 * @returns {Promise<CategoriaAgente[]>} Lista de todas las categorías
 */
export const obtenerCategoriasAgentes = async (): Promise<CategoriaAgente[]> => {
  const response = await apiClient.get('/agentes-categorias/categorias');
  return response.data.data;
}



