import apiClient from '../apiClient';

export const obtenerProyectos = async (): Promise<any[]> => {
  const response = await apiClient.get('/proyectos');
  return response.data;
};

export const obtenerProyectosPorIdUsuario = async (id: string): Promise<any[]> => {
  const response = await apiClient.get(`/proyectos/usuario/${id}`);
  return response.data;
};


export const obtenerProyectoPorId = async (id: number) => {
  // Debe ser POST, no GET
  const response = await apiClient.post('/proyectos/p', { id_proyecto: id });
  return response.data;
};

export const crearProyecto = async (proyecto: any): Promise<any> => {
  const response = await apiClient.post('/proyectos', proyecto);
  return response.data;
};

export const actualizarProyecto = async (id: number, proyecto: any): Promise<any> => {
  const response = await apiClient.patch('/proyectos', { id_proyecto: id, ...proyecto });
  return response.data;
};

export const eliminarProyecto = async (id: number): Promise<void> => {
  await apiClient.delete('/proyectos', { data: { id_proyecto: id } });
};

