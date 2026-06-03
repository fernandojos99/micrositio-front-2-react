import apiClient from '../apiClient';

/**
 * Interfaz que representa un tipo de experimento.
 */
export interface ExperimentoTipo {
  id_experimento_tipo: number;
  nombre: string;
  icono?: string;
  tipo: 'DESCUBRIMIENTO' | 'VALIDACION';
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todos los tipos de experimento.
 * @returns {Promise<ExperimentoTipo[]>} Lista de tipos de experimento.
 */
export const obtenerTodos = async (): Promise<ExperimentoTipo[]> => {
  const response = await apiClient.get('/experimentos-tipos');
  return response.data.data;
};

/**
 * Obtiene un tipo de experimento por su ID.
 * @param {number} id_experimento_tipo - ID del tipo de experimento.
 * @returns {Promise<ExperimentoTipo>} Tipo de experimento encontrado.
 */
export const obtenerPorId = async (id_experimento_tipo: number): Promise<ExperimentoTipo> => {
  const response = await apiClient.get(`/experimentos-tipos/${id_experimento_tipo}`);
  return response.data.data;
};

/**
 * Crea un nuevo tipo de experimento.
 * @param {Partial<ExperimentoTipo>} data - Datos del tipo de experimento.
 * @returns {Promise<ExperimentoTipo>} Tipo de experimento creado.
 */
export const crear = async (data: Partial<ExperimentoTipo>): Promise<ExperimentoTipo> => {
  const response = await apiClient.post('/experimentos-tipos', data);
  return response.data.data;
};

/**
 * Actualiza un tipo de experimento existente.
 * @param {number} id_experimento_tipo - ID del tipo de experimento a actualizar.
 * @param {Partial<ExperimentoTipo>} data - Datos a actualizar.
 * @returns {Promise<ExperimentoTipo>} Tipo de experimento actualizado.
 */
export const actualizar = async (
  id_experimento_tipo: number,
  data: Partial<ExperimentoTipo>
): Promise<ExperimentoTipo> => {
  const response = await apiClient.patch(`/experimentos-tipos/${id_experimento_tipo}`, data);
  return response.data.data;
};

/**
 * Elimina un tipo de experimento por su ID.
 * @param {number} id_experimento_tipo - ID del tipo de experimento a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id_experimento_tipo: number): Promise<void> => {
  await apiClient.delete(`/experimentos-tipos/${id_experimento_tipo}`);
};