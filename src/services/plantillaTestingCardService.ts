
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
  const response = await apiClient.get('/plantilla_testing_card/');
  return response.data;
};

/**
 * Obtiene plantillas testing card por empleado
 * @param {number} idEmpleado _ ID del empleado
 * @returns {Promise<PlantillaTestingCard[]>} Lista de plantillas testing card del empleado
 */
export const obtenerPlantillasTestingCardPorEmpleado = async (idEmpleado: number): Promise<PlantillaTestingCard[]> => {
  const response = await apiClient.get(`/plantilla_testing_card/empleado/${idEmpleado}`);
  return response.data;
};

/**
 * Obtiene plantillas testing card por testing card
 * @param {number} idTestingCard _ ID de la testing card
 * @returns {Promise<PlantillaTestingCard[]>} Lista de plantillas testing card de la testing card específica
 */
export const obtenerPlantillasTestingCardPorTestingCard = async (idTestingCard: number): Promise<PlantillaTestingCard[]> => {
  const response = await apiClient.get(`/plantilla_testing_card/testing-card/${idTestingCard}`);
  return response.data;
};

/**
 * Obtiene una plantilla testing card específica por su ID
 * @param {string} id _ ID de la plantilla testing card a buscar
 * @returns {Promise<PlantillaTestingCard>} Los datos de la plantilla testing card
 */
export const obtenerPlantillaTestingCardPorId = async (id: string): Promise<PlantillaTestingCard> => {
  const response = await apiClient.get(`/plantilla_testing_card/${id}`);
  return response.data;
};

/**
 * Crea una nueva plantilla testing card
 * @param {CrearPlantillaTestingCardData} plantillaData _ Datos de la nueva plantilla testing card
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card creada
 */
export const crearPlantillaTestingCard = async ( id_testing_card: number, id_empleado:number  ) => {
  const response = await apiClient.post('/plantilla_testing_card/', { id_testing_card, id_empleado });
  return response.data;
};

/**
 * Actualiza los datos de una plantilla testing card existente
 * @param {ActualizarPlantillaTestingCardData} plantillaData _ Datos a actualizar (debe incluir el id)
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card actualizada
 */
export const actualizarPlantillaTestingCard = async (plantillaData: ActualizarPlantillaTestingCardData): Promise<PlantillaTestingCard> => {
  const response = await apiClient.patch('/plantilla_testing_card/', plantillaData);
  return response.data;
};

/**
 * Elimina una plantilla testing card
 * @param {string} id _ ID de la plantilla testing card a eliminar
 * @returns {Promise<PlantillaTestingCard>} La plantilla testing card eliminada
 */
export const eliminarPlantillaTestingCard = async (id: string): Promise<PlantillaTestingCard> => {
  const response = await apiClient.delete('/plantilla_testing_card/', {
    data: { id }
  });
  return response.data;
};
