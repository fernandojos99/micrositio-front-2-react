import apiClient from '../apiClient';

/**
 * Interfaz que representa una URL de Formato.
 */
export interface UrlFormato {
  id_url_formato: number;
  url: string;
  created_at?: string;
  updated_at?: string;
  categoria : string;
}

/**
 * Obtiene todas las URLs de Formato.
 * @returns {Promise<UrlFormato[]>} Lista de URLs de Formato.
 */
export const obtenerTodas = async (): Promise<UrlFormato[]> => {
  const response = await apiClient.get('/url_formato');
  return response.data;
};

/**
 * Obtiene una URL de Formato por su ID.
 * @param {string | number} id_url_formato - ID de la URL de Formato.
 * @returns {Promise<UrlFormato>} URL de Formato encontrada.
 */
export const obtenerPorId = async (id_url_formato: string | number): Promise<UrlFormato> => {
  const response = await apiClient.get('/url_formato', { params: { id_url_formato } });
  return response.data;
};

/**
 * Crea una nueva URL de Formato.
 * @param {Partial<UrlFormato>} data - Datos de la URL de Formato.
 * @returns {Promise<UrlFormato>} URL de Formato creada.
 */
export const crear = async (data: Partial<UrlFormato>): Promise<UrlFormato> => {
  const response = await apiClient.post('/url_formato/crear', data);
  return response.data;
};

/**
 * Actualiza una URL de Formato existente.
 * @param {string | number} id_url_formato - ID de la URL de Formato a actualizar.
 * @param {Partial<UrlFormato>} data - Datos a actualizar.
 * @returns {Promise<UrlFormato>} URL de Formato actualizada.
 */
export const actualizar = async (id_url_formato: string | number, data: Partial<UrlFormato>): Promise<UrlFormato> => {
  const response = await apiClient.put('/url_formato/', { id_url_formato, ...data });
  return response.data;
};

/**
 * Elimina una URL de Formato por su ID.
 * @param {string | number} id_url_formato - ID de la URL de Formato a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_url_formato: string | number): Promise<void> => {
  const response = await apiClient.delete('/url_formato/', { data: { id_url_formato } });
  return response.data;
};