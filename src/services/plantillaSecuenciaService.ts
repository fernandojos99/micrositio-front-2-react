import apiClient from '../apiClient';

export interface PlantillaSecuencia {
  id_plantilla_secuencia: string;
  id_secuencia: number;
  id_empleado: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrearPlantillaSecuenciaData {
  id_secuencia: number;
  id_empleado: number;
}

export interface ActualizarPlantillaSecuenciaData {
  id: string;
  id_secuencia?: number;
  id_empleado?: number;
}

/**
 * Estructura de respuesta del backend para plantillas
 */
export interface PlantillaSecuenciaResponse {
  success: boolean;
  message: string;
  data: PlantillaSecuencia[];
}

/**
 * Obtiene todas las plantillas secuencia
 * @returns {Promise<PlantillaSecuenciaResponse>} Respuesta con lista de todas las plantillas secuencia
 */
export const obtenerPlantillasSecuencia = async (): Promise<PlantillaSecuenciaResponse> => {
  const response = await apiClient.get('/plantilla_secuencia/');
  return response.data;
};

/**
 * Obtiene una plantilla secuencia específica por su ID
 * @param {string} id - ID de la plantilla secuencia a buscar
 * @returns {Promise<PlantillaSecuencia>} Los datos de la plantilla secuencia
 */
export const obtenerPlantillaSecuenciaPorId = async (id: string): Promise<PlantillaSecuencia> => {
  const response = await apiClient.get(`/plantilla_secuencia/${id}`);
  return response.data;
};

/**
 * Obtiene una plantilla secuencia específica por id de la secuencia asociada.
 * @param {string} id - ID de la plantilla secuencia a buscar
 * @returns {Promise<PlantillaSecuencia>} Los datos de la plantilla secuencia
 */
export const obtenerPlantillaSecuenciaPorIdSecuencia = async (id: number): Promise<PlantillaSecuencia> => {
  const response = await apiClient.get(`/plantilla_secuencia/secuencia/${id}`);
  return response.data;
};

/**
 * Crea una nueva plantilla secuencia
 * @param {CrearPlantillaSecuenciaData} plantillaData - Datos de la nueva plantilla secuencia
 * @returns {Promise<PlantillaSecuencia>} La plantilla secuencia creada
 */
export const crearPlantillaSecuencia = async (plantillaData: CrearPlantillaSecuenciaData): Promise<PlantillaSecuencia> => {
  const response = await apiClient.post('/plantilla_secuencia/', plantillaData);
  return response.data;
};

/**
 * Actualiza los datos de una plantilla secuencia existente
 * @param {string} id - ID de la plantilla secuencia a actualizar
 * @param {Partial<CrearPlantillaSecuenciaData>} plantillaData - Datos a actualizar
 * @returns {Promise<PlantillaSecuencia>} La plantilla secuencia actualizada
 */
export const actualizarPlantillaSecuencia = async (
  id: string, 
  plantillaData: Partial<CrearPlantillaSecuenciaData>
): Promise<PlantillaSecuencia> => {
  const response = await apiClient.put(`/plantilla_secuencia/${id}`, plantillaData);
  return response.data;
};

/**
 * Elimina una plantilla secuencia
 * @param {string} id - ID de la plantilla secuencia a eliminar
 * @returns {Promise<void>} Confirmación de eliminación
 */
export const eliminarPlantillaSecuencia = async (id: string): Promise<void> => {
  await apiClient.delete(`/plantilla_secuencia/${id}`);
};


