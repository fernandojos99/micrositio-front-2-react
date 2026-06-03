import apiClient from '../apiClient';

/**
 * Interfaz que representa una métrica de testing card.
 * @interface MetricaTestingCard
 */
export interface MetricaTestingCard {
  id_metrica: number;
  id_testing_card: number;
  nombre: string;
  operador: string;
  criterio: string;
  resultado?: string;
  creado: string;
  actualizado: string;
}

/**
 * Obtiene todas las métricas.
 * @returns {Promise<MetricaTestingCard[]>} Lista de todas las métricas.
 */
export const obtenerTodas = async (): Promise<MetricaTestingCard[]> => {
  const response = await apiClient.get('/metricas-testing-card');
  return response.data.data;
};

/**
 * Obtiene una métrica por su ID.
 * @param {number} id_metrica - ID de la métrica.
 * @returns {Promise<MetricaTestingCard>} Métrica encontrada.
 */
export const obtenerPorId = async (id_metrica: number): Promise<MetricaTestingCard> => {
  const response = await apiClient.get(`/metricas-testing-card/${id_metrica}`);
  return response.data.data;
};

/**
 * Obtiene las métricas asociadas a un Testing Card.
 * @param {number} id_testing_card - ID del Testing Card.
 * @returns {Promise<MetricaTestingCard[]>} Lista de métricas asociadas.
 */
export const obtenerPorTestingCard = async (id_testing_card: number): Promise<MetricaTestingCard[]> => {
  const response = await apiClient.get(`/metricas-testing-card`, {
    params: { testingCardId: id_testing_card },
  });
  return response.data.data;
};

/**
 * Crea una nueva métrica.
 * @param {Partial<MetricaTestingCard>} data - Datos de la métrica.
 * @returns {Promise<MetricaTestingCard>} Métrica creada.
 */
export const crear = async (data: Partial<MetricaTestingCard>): Promise<MetricaTestingCard> => {
  const response = await apiClient.post('/metricas-testing-card', data);
  return response.data.data;
};

/**
 * Actualiza una métrica existente.
 * @param {number} id_metrica - ID de la métrica a actualizar.
 * @param {Partial<MetricaTestingCard>} data - Datos a actualizar.
 * @returns {Promise<MetricaTestingCard>} Métrica actualizada.
 */
export const actualizar = async (
  id_metrica: number,
  data: Partial<MetricaTestingCard>
): Promise<MetricaTestingCard> => {
  const response = await apiClient.patch(`/metricas-testing-card/${id_metrica}`, data);
  return response.data.data;
};

/**
 * Elimina una métrica por su ID.
 * @param {number} id_metrica - ID de la métrica a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_metrica: number): Promise<void> => {
  await apiClient.delete(`/metricas-testing-card/${id_metrica}`);
};

/**
 * Actualiza el resultado de una métrica específica.
 * @param {number} id_metrica - ID de la métrica a actualizar.
 * @param {string} resultado - Nuevo resultado de la métrica.
 * @returns {Promise<MetricaTestingCard>} Métrica actualizada.
 */
export const actualizarResultado = async (
  id_metrica: number,
  resultado: string
): Promise<MetricaTestingCard> => {
  const response = await apiClient.patch(`/metricas-testing-card/${id_metrica}/resultado`, { resultado });
  return response.data.data;
};
