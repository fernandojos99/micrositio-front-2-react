import apiClient from '../apiClient';

export const obtenerSecuenciasPorProyecto = async (id_proyecto: number) => {
  const response = await apiClient.get('/secuencias', { 
    params: { proyectoId: id_proyecto } 
  });
  return response.data.data;
};

export const obtenerSecuenciasId = async (id_secuencia: number) => {
  const response = await apiClient.get(`/secuencias/${id_secuencia}`);
  return response.data.data;
};


// Crear secuencia
export const crearSecuencia = async (data: any) => {
  const response = await apiClient.post('/secuencias', data);
  return response.data.data;
};

export const actualizarSecuencia = async (id: number, data: any) => {
  const response = await apiClient.patch(`/secuencias/${id}`, data);
  return response.data.data;
};

export const aplicarPlantillaSecuencia = async (id_secuencia: number, id_plantilla_secuencia: string) => {
  const response = await apiClient.patch(`/secuencias/${id_secuencia}/aplicar-plantilla`, { id_plantilla_secuencia });
  return response.data.data;
};

export const eliminarSecuencia = async (id: number) => {
  await apiClient.delete(`/secuencias/${id}`);
};

