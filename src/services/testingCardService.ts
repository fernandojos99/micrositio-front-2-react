import apiClient from '../apiClient';

// Obtener Testing Card por ID
export const obtenerTestingCardPorId = async (id_testing_card: string | number) => {
  const response = await apiClient.get(`/testing-cards/${id_testing_card}`);
  return response.data.data;
};

// Obtener Testing Cards por Secuencia
export const obtenerTestingCardsPorSecuencia = async (id_secuencia: string | number) => {
  const response = await apiClient.get('/testing-cards', { params: { secuenciaId: id_secuencia } });
  return response.data.data;
};

// Obtener todas las  Testing Cards asociadas a una platilla 
export const obtenerTodasTestingCardsDePlantillas = async () => {
  const response = await apiClient.get('/testing-cards/plantillas');
  return response.data.data;
};

// Obtener Testing Cards por Padre
export const obtenerTestingCardsPorPadre = async (padre_id: string | number) => {
  const response = await apiClient.get('/testing-cards', { params: { padreId: padre_id } });
  return response.data.data;
};

// Listar todas las Testing Cards
export const listarTodasTestingCards = async () => {
  const response = await apiClient.get('/testing-cards/');
  return response.data.data;
};

// Crear una nueva Testing Card
export const crearTestingCard = async (testingCardData: any) => {
  const response = await apiClient.post('/testing-cards/', testingCardData);
  return response.data.data;
};

// Actualizar una Testing Card
export const actualizarTestingCard = async (id_testing_card: string | number, testingCardData: any) => {
  const response = await apiClient.patch(`/testing-cards/${id_testing_card}`, testingCardData);
  return response.data.data;
};

// Aplicar una plantilla una Testing Card existente
// Solo copia, titulo, descripcion, id_experimiento ademas de crear las metricas asociadas
export const aplicarPlantillaATestingCard = async (id_testing_card:number, id_plantilla_testing_card:string|number) => {
  const response = await apiClient.patch(`/testing-cards/${id_testing_card}/aplicar-plantilla`, { id_plantilla_testing_card });
  return response.data.data;
};

// Eliminar una Testing Card
export const eliminarTestingCard = async (id_testing_card: string | number) => {
  const response = await apiClient.delete(`/testing-cards/${id_testing_card}`);
  return response.data.data;
};
