import apiClient from '../apiClient';

/**
 * Interfaz que representa una URL de Testing Card.
 */
export interface UrlTestingCard {
  id_url_tc: number;
  id_testing_card: number;
  url: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtiene todas las URLs de Testing Cards.
 * @returns {Promise<UrlTestingCard[]>} Lista de URLs de Testing Cards.
 */
export const obtenerTodas = async (): Promise<UrlTestingCard[]> => {
  const response = await apiClient.get('/urls-testing-card/');
  return response.data.data;
};

/**
 * Obtiene una URL de Testing Card por su ID.
 * @param {string | number} id_url_tc - ID de la URL de Testing Card.
 * @returns {Promise<UrlTestingCard>} URL de Testing Card encontrada.
 */
export const obtenerPorId = async (id_url_tc: string | number): Promise<UrlTestingCard> => {
  const response = await apiClient.get(`/urls-testing-card/${id_url_tc}`);
  return response.data.data;
};

/**
 * Obtiene las URLs asociadas a una Testing Card.
 * @param {number} id_testing_card - ID de la Testing Card.
 * @returns {Promise<UrlTestingCard[]>} Lista de URLs asociadas a la Testing Card.
 */
export const obtenerPorTestingCard = async (id_testing_card: string | number): Promise<UrlTestingCard[]> => {
  const response = await apiClient.get('/urls-testing-card/', { params: { testingCardId: id_testing_card } });
  return response.data.data;
};

/**
 * Crea una nueva URL de Testing Card.
 * @param {Partial<UrlTestingCard>} data - Datos de la URL de Testing Card.
 * @returns {Promise<UrlTestingCard>} URL de Testing Card creada.
 */
export const crear = async (data: Partial<UrlTestingCard>): Promise<UrlTestingCard> => {
  const response = await apiClient.post('/urls-testing-card/', data);
  return response.data.data;
};

/**
 * Actualiza una URL de Testing Card existente.
 * @param {string | number} id_url_tc - ID de la URL de Testing Card a actualizar.
 * @param {Partial<UrlTestingCard>} data - Datos a actualizar.
 * @returns {Promise<UrlTestingCard>} URL de Testing Card actualizada.
 */
export const actualizar = async (id_url_tc: string | number, data: Partial<UrlTestingCard>): Promise<UrlTestingCard> => {
  const response = await apiClient.patch(`/urls-testing-card/${id_url_tc}`, data);
  return response.data.data;
};

/**
 * Elimina una URL de Testing Card por su ID.
 * @param {string | number} id_url_tc - ID de la URL de Testing Card a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_url_tc: string | number): Promise<void> => {
  await apiClient.delete(`/urls-testing-card/${id_url_tc}`);
};