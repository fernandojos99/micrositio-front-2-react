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
  descripcion: string;
}

/**
 * Obtiene todas las URLs de Formato.
 * @returns {Promise<UrlFormato[]>} Lista de URLs de Formato.
 */
export const obtenerTodas = async (): Promise<UrlFormato[]> => {
  const response = await apiClient.get('/urls-formatos');
  return response.data.data;
};

/**
 * Obtiene una URL de Formato por su ID.
 * @param {string | number} id_url_formato - ID de la URL de Formato.
 * @returns {Promise<UrlFormato>} URL de Formato encontrada.
 */
export const obtenerPorId = async (id_url_formato: string | number): Promise<UrlFormato> => {
  const response = await apiClient.get(`/urls-formatos/${id_url_formato}`);
  return response.data.data;
};

/**
 * Crea una nueva URL de Formato.
 * @param {Partial<UrlFormato>} data - Datos de la URL de Formato.
 * @returns {Promise<UrlFormato>} URL de Formato creada.
 */
export const crear = async (data: Partial<UrlFormato>): Promise<UrlFormato> => {
  console.log('[urlFormatoService] ===== CREAR URL =====');
  console.log('[urlFormatoService] Data recibida:', data);
  console.log('[urlFormatoService] URL:', data.url);
  console.log('[urlFormatoService] Categoría:', data.categoria);
  console.log('[urlFormatoService] Descripción:', data.descripcion);
  console.log('[urlFormatoService] =======================');
  
  const response = await apiClient.post('/urls-formatos', data);
  
  console.log('[urlFormatoService] Respuesta del backend:', response.data);
  return response.data.data;
};

/**
 * Actualiza una URL de Formato existente.
 * @param {string | number} id_url_formato - ID de la URL de Formato a actualizar.
 * @param {Partial<UrlFormato>} data - Datos a actualizar.
 * @returns {Promise<UrlFormato>} URL de Formato actualizada.
 */
export const actualizar = async (id_url_formato: string | number, data: Partial<UrlFormato>): Promise<UrlFormato> => {
  console.log('[urlFormatoService] ===== ACTUALIZAR URL =====');
  console.log('[urlFormatoService] ID:', id_url_formato);
  console.log('[urlFormatoService] Data recibida:', data);
  console.log('[urlFormatoService] URL:', data.url);
  console.log('[urlFormatoService] Categoría:', data.categoria);
  console.log('[urlFormatoService] Descripción:', data.descripcion);
  console.log('[urlFormatoService] =======================');
  
  const response = await apiClient.patch(`/urls-formatos/${id_url_formato}`, data);
  
  console.log('[urlFormatoService] Respuesta del backend:', response.data);
  return response.data.data;
};

/**
 * Elimina una URL de Formato por su ID.
 * @param {string | number} id_url_formato - ID de la URL de Formato a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_url_formato: string | number): Promise<void> => {
  const response = await apiClient.delete(`/urls-formatos/${id_url_formato}`);
  return response.data.data;
};