import apiClient from '../apiClient';

export const obtenerProyectos = async () => {
  const response = await apiClient.get('/proyectos');
  return response.data.data;
};

export const obtenerProyectosPorIdUsuario = async (id: string) => {
  const response = await apiClient.get(`/proyectos/usuario/${id}`);
  return response.data.data;
};

export const obtenerProyectoPorId = async (id: number) => {
  const response = await apiClient.get(`/proyectos/${id}`);
  return response.data.data;
};

export const crearProyecto = async (proyecto: any) => {
  const response = await apiClient.post('/proyectos', proyecto);
  return response.data.data;
};

export const actualizarProyecto = async (id: number, proyecto: any) => {
  const response = await apiClient.patch(`/proyectos/${id}`, proyecto);
  return response.data.data;
};

export const eliminarProyecto = async (id: number) => {
  await apiClient.delete(`/proyectos/${id}`);
};
