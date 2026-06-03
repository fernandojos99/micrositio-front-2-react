import apiClient from '../apiClient';

export interface PlantillaMetricaTc {
  id_plantilla_metrica: string;
  id_metrica: number;
  id_empleado: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrearPlantillaMetricaTcData {
  id_metrica: number;
  id_empleado: number;
}

export interface ActualizarPlantillaMetricaTcData {
  id: string;
  id_metrica?: number;
  id_empleado?: number;
}

/**
 * Obtiene todas las plantillas métrica TC
 * @returns {Promise<PlantillaMetricaTc[]>} Lista de todas las plantillas métrica TC
 */
export const obtenerPlantillasMetricaTc = async (): Promise<PlantillaMetricaTc[]> => {
  const response = await apiClient.get('/plantillas-metricas-tc/');
  return response.data.data;
};

/**
 * Obtiene plantillas métrica TC por empleado
 * @param {number} idEmpleado - ID del empleado
 * @returns {Promise<PlantillaMetricaTc[]>} Lista de plantillas métrica TC del empleado
 */
export const obtenerPlantillasMetricaTcPorEmpleado = async (idEmpleado: number): Promise<PlantillaMetricaTc[]> => {
  const response = await apiClient.get(`/plantillas-metricas-tc/empleado/${idEmpleado}`);
  return response.data.data;
};

/**
 * Obtiene plantillas métrica TC por métrica
 * @param {number} idMetrica - ID de la métrica
 * @returns {Promise<PlantillaMetricaTc[]>} Lista de plantillas métrica TC de la métrica
 */
export const obtenerPlantillasMetricaTcPorMetrica = async (idMetrica: number): Promise<PlantillaMetricaTc[]> => {
  const response = await apiClient.get(`/plantillas-metricas-tc/metrica/${idMetrica}`);
  return response.data.data;
};

/**
 * Obtiene una plantilla métrica TC específica por su ID
 * @param {string} id - ID de la plantilla métrica TC a buscar
 * @returns {Promise<PlantillaMetricaTc>} Los datos de la plantilla métrica TC
 */
export const obtenerPlantillaMetricaTcPorId = async (id: string): Promise<PlantillaMetricaTc> => {
  const response = await apiClient.get(`/plantillas-metricas-tc/${id}`);
  return response.data.data;
};

/**
 * Crea una nueva plantilla métrica TC
 * @param {CrearPlantillaMetricaTcData} plantillaData - Datos de la nueva plantilla métrica TC
 * @returns {Promise<PlantillaMetricaTc>} La plantilla métrica TC creada
 */
export const crearPlantillaMetricaTc = async (plantillaData: CrearPlantillaMetricaTcData): Promise<PlantillaMetricaTc> => {
  const response = await apiClient.post('/plantillas-metricas-tc/', plantillaData);
  return response.data.data;
};

/**
 * Actualiza los datos de una plantilla métrica TC existente
 * @param {ActualizarPlantillaMetricaTcData} plantillaData - Datos a actualizar (debe incluir el id)
 * @returns {Promise<PlantillaMetricaTc>} La plantilla métrica TC actualizada
 */
export const actualizarPlantillaMetricaTc = async (plantillaData: ActualizarPlantillaMetricaTcData): Promise<PlantillaMetricaTc> => {
  const { id, ...data } = plantillaData;
  const response = await apiClient.patch(`/plantillas-metricas-tc/${id}`, data);
  return response.data.data;
};

/**
 * Elimina una plantilla métrica TC
 * @param {string} id - ID de la plantilla métrica TC a eliminar
 * @returns {Promise<PlantillaMetricaTc>} La plantilla métrica TC eliminada
 */
export const eliminarPlantillaMetricaTc = async (id: string): Promise<PlantillaMetricaTc> => {
  const response = await apiClient.delete(`/plantillas-metricas-tc/${id}`);
  return response.data.data;
};
