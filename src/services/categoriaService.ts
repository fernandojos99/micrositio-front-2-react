import apiClient from '../apiClient';

/**
 * Interfaz que representa una categoría.
 */
export interface Categoria {
  id_categoria: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todas las categorías.
 * @returns {Promise<Categoria[]>} Lista de categorías.
 */
export const obtenerTodas = async (): Promise<Categoria[]> => {
  const response = await apiClient.get('/categorias');
  return response.data.data;
};

/**
 * Obtiene una categoría por su ID.
 * @param {number} id_categoria - ID de la categoría a buscar.
 * @returns {Promise<Categoria>} La categoría encontrada.
 */
export const obtenerPorId = async (id_categoria: number): Promise<Categoria> => {
  const response = await apiClient.get(`/categorias/${id_categoria}`);
  return response.data.data;
};

/**
 * Crea una nueva categoría.
 * @param {Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>} data - Datos para crear la categoría (sin los campos autogenerados).
 * @returns {Promise<Categoria>} La categoría creada con sus campos autogenerados.
 */
export const crear = async (data: Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>): Promise<Categoria> => {
  const response = await apiClient.post('/categorias', data);
  return response.data.data;
};

/**
 * Actualiza una categoría existente.
 * @param {number} id_categoria - ID de la categoría a actualizar.
 * @param {Partial<Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>>} data - Datos a actualizar.
 * @returns {Promise<Categoria>} La categoría actualizada.
 */
export const actualizar = async (
  id_categoria: number,
  data: Partial<Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>>
): Promise<Categoria> => {
  const response = await apiClient.patch(`/categorias/${id_categoria}`, data);
  return response.data.data;
};

/**
 * Elimina una categoría por su ID.
 * @param {number} id_categoria - ID de la categoría a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_categoria: number): Promise<void> => {
  await apiClient.delete(`/categorias/${id_categoria}`);
};