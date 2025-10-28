import apiClient from '../apiClient';

export interface PlantillaTestingCard {
  id_plantilla_testing_card: string;
  id_testing_card: number;
  id_empleado: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrearPlantillaTestingCardData {
  id_testing_card: number;
  id_empleado: number;
}

export interface ActualizarPlantillaTestingCardData {
  id: string;
  id_testing_card?: number;
  id_empleado?: number;
}

/**
 * Obtiene todas las plantillas testing card
 * @returns {Promise<PlantillaTestingCard[]>} Lista de todas las plantillas testing card
 */
export const obtenerPlantillasTestingCard = async (): Promise<PlantillaTestingCard[]> => {
  const response = await apiClient.get('/plantilla-testing-card/');
  return response.data;
};

/**
 * Obtiene plantillas testing card por empleado
 * @param {number} idEmpleado - ID del empleado
 * @returns {Promise<PlantillaTestingCard[]>} Lista de plantillas testing card del empleado
 */
export const obtenerPlantillasTestingCardPorEmpleado = async (idEmpleado: number): Promise<PlantillaTestingCard[]> => {
  const response = await apiClient.get(`/plantilla-testing-card/empleado/${idEmpleado}`);
  return response.data;
};

/**
 * Obtiene plantillas testing card por testing card
 * @param {number} idTestingCard - ID de la testing card
 * @returns {Promise<PlantillaTestingCard[]>} Lista de plantillas testing card de la testing card específica
 */
export const obtenerPlantillasTestingCardPorTestingCard = async (idTestingCard: number): Promise<PlantillaTestingCard[]> => {
  const response = await apiClient.get(`/plantilla-testing-card/testing-card/${idTestingCard}`);
  return response.data;
};

/**
 * Obtiene una plantilla testing card específica por su ID
 * @param {string} id - ID de la plantilla testing card a buscar
 * @returns {Promise<PlantillaTestingCard>} Los datos de la plantilla testing card
 */
export const obtenerPlantillaTestingCardPorId = async (id: string): Promise<PlantillaTestingCard> => {
  const response = await apiClient.get(`/plantilla-testing-card/${id}`);
  return response.data;
};

/**
 * Crea una nueva plantilla testing card
 * @param {CrearPlantillaTestingCardData} plantillaData - Datos de la nueva plantilla testing card
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card creada
 */
export const crearPlantillaTestingCard = async (plantillaData: CrearPlantillaTestingCardData): Promise<PlantillaTestingCard> => {
  const response = await apiClient.post('/plantilla-testing-card/', plantillaData);
  return response.data;
};

/**
 * Actualiza los datos de una plantilla testing card existente
 * @param {ActualizarPlantillaTestingCardData} plantillaData - Datos a actualizar (debe incluir el id)
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card actualizada
 */
export const actualizarPlantillaTestingCard = async (plantillaData: ActualizarPlantillaTestingCardData): Promise<PlantillaTestingCard> => {
  const response = await apiClient.patch('/plantilla-testing-card/', plantillaData);
  return response.data;
};

/**
 * Elimina una plantilla testing card
 * @param {string} id - ID de la plantilla testing card a eliminar
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card eliminada
 */
export const eliminarPlantillaTestingCard = async (id: string): Promise<PlantillaTestingCard> => {
  const response = await apiClient.delete('/plantilla-testing-card/', {
    data: { id }
  });
  return response.data;
};
