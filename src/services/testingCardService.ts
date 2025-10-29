import apiClient from '../apiClient';

// Obtener Testing Card por ID
export const obtenerTestingCardPorId = async (id_testing_card: string | number) => {
  const response = await apiClient.get(`/t/testing_card/${id_testing_card}`);
  return response.data;
};

// Obtener Testing Cards por Secuencia
export const obtenerTestingCardsPorSecuencia = async (id_secuencia: string | number) => {
  const response = await apiClient.get('/testing_card/s', { params: { id_secuencia } });
  return response.data;
};

// Obtener Testing Cards por Padre
export const obtenerTestingCardsPorPadre = async (padre_id: string | number) => {
  const response = await apiClient.get(`/testing_card/padre`, { params: { padre_id } });
  return response.data;
};

// Listar todas las Testing Cards
export const listarTodasTestingCards = async () => {
  const response = await apiClient.get('/testing_card/');
  return response.data;
};

// Crear una nueva Testing Card
export const crearTestingCard = async (testingCardData: any) => {
  const response = await apiClient.post('/testing_card/', testingCardData);
  return response.data;
};

// Actualizar una Testing Card
export const actualizarTestingCard = async (id_testing_card: string | number, testingCardData: any) => {
  const response = await apiClient.patch('/testing_card/', { id_testing_card, ...testingCardData });
  return response.data;
};

// Eliminar una Testing Card
export const eliminarTestingCard = async (id_testing_card: string | number) => {
  const response = await apiClient.delete('/testing_card/', { data: { id_testing_card } });
  return response.data;
};
