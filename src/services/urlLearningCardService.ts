import apiClient from '../apiClient';

/**
 * Interfaz que representa una URL de Learning Card.
 */
export interface UrlLearningCard {
  id_url_lc: number;
  id_learning_card: number;
  url: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtiene todas las URLs de Learning Cards.
 * @returns {Promise<UrlLearningCard[]>} Lista de URLs de Learning Cards.
 */
export const obtenerTodas = async (): Promise<UrlLearningCard[]> => {
  const response = await apiClient.get('/urls-learning-card/');
  return response.data.data;
};

/**
 * Obtiene una URL de Learning Card por su ID.
 * @param {string | number} id_url_lc - ID de la URL de Learning Card.
 * @returns {Promise<UrlLearningCard>} URL de Learning Card encontrada.
 */
export const obtenerPorId = async (id_url_lc: string | number): Promise<UrlLearningCard> => {
  const response = await apiClient.get(`/urls-learning-card/${id_url_lc}`);
  return response.data.data;
};

/**
 * Obtiene las URLs asociadas a una Learning Card.
 * @param {number} id_learning_card - ID de la Learning Card.
 * @returns {Promise<UrlLearningCard[]>} Lista de URLs asociadas a la Learning Card.
 */
export const obtenerPorLearningCard = async (id_learning_card: string | number): Promise<UrlLearningCard[]> => {
  const response = await apiClient.get('/urls-learning-card/', { params: { learningCardId: id_learning_card } });
  return response.data.data;
};

/**
 * Crea una nueva URL de Learning Card.
 * @param {Partial<UrlLearningCard>} data - Datos de la URL de Learning Card.
 * @returns {Promise<UrlLearningCard>} URL de Learning Card creada.
 */
export const crear = async (data: Partial<UrlLearningCard>): Promise<UrlLearningCard> => {
  const response = await apiClient.post('/urls-learning-card/', data);
  return response.data.data;
};

/**
 * Actualiza una URL de Learning Card existente.
 * @param {string | number} id_url_lc - ID de la URL de Learning Card a actualizar.
 * @param {Partial<UrlLearningCard>} data - Datos a actualizar.
 * @returns {Promise<UrlLearningCard>} URL de Learning Card actualizada.
 */
export const actualizar = async (id_url_lc: string | number, data: Partial<UrlLearningCard>): Promise<UrlLearningCard> => {
  const response = await apiClient.patch(`/urls-learning-card/${id_url_lc}`, data);
  return response.data.data;
};

/**
 * Elimina una URL de Learning Card por su ID.
 * @param {string | number} id_url_lc - ID de la URL de Learning Card a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_url_lc: string | number): Promise<void> => {
  await apiClient.delete(`/urls-learning-card/${id_url_lc}`);
};