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
 * Obtiene todas las plantillas secuencia
 * @returns {Promise<PlantillaSecuencia[]>} Lista de todas las plantillas secuencia
 */
export const obtenerPlantillasSecuencia = async (): Promise<PlantillaSecuencia[]> => {
  const response = await apiClient.get('/plantilla-secuencia/');
  return response.data;
};

/**
 * Obtiene una plantilla secuencia específica por su ID
 * @param {string} id - ID de la plantilla secuencia a buscar
 * @returns {Promise<PlantillaSecuencia>} Los datos de la plantilla secuencia
 */
export const obtenerPlantillaSecuenciaPorId = async (id: string): Promise<PlantillaSecuencia> => {
  const response = await apiClient.get(`/plantilla-secuencia/${id}`);
  return response.data;
};

/**
 * Crea una nueva plantilla secuencia
 * @param {CrearPlantillaSecuenciaData} plantillaData - Datos de la nueva plantilla secuencia
 * @returns {Promise<PlantillaSecuencia>} La plantilla secuencia creada
 */
export const crearPlantillaSecuencia = async (plantillaData: CrearPlantillaSecuenciaData): Promise<PlantillaSecuencia> => {
  const response = await apiClient.post('/plantilla-secuencia/', plantillaData);
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
  const response = await apiClient.put(`/plantilla-secuencia/${id}`, plantillaData);
  return response.data;
};

/**
 * Elimina una plantilla secuencia
 * @param {string} id - ID de la plantilla secuencia a eliminar
 * @returns {Promise<void>} Confirmación de eliminación
 */
export const eliminarPlantillaSecuencia = async (id: string): Promise<void> => {
  await apiClient.delete(`/plantilla-secuencia/${id}`);
};

/**
 * Aplica una plantilla de secuencia a otra secuencia
 * @param {number} idSecuenciaDestino - ID de la secuencia donde se aplicará la plantilla
 * @param {string} idPlantillaSecuencia - ID de la plantilla de secuencia a aplicar
 * @returns {Promise<any>} Resultado de la aplicación
 */
export const aplicarPlantillaSecuencia = async (
  idSecuenciaDestino: number, 
  idPlantillaSecuencia: string
): Promise<any> => {
  const response = await apiClient.post('/plantilla-secuencia/aplicar', {
    id_secuencia_destino: idSecuenciaDestino,
    id_plantilla_secuencia: idPlantillaSecuencia
  });
  return response.data;
};
