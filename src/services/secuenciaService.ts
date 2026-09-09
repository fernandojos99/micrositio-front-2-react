import apiClient from '../apiClient';

// Obtener secuencias por proyecto (usando GET con query param)
export const obtenerSecuenciasPorProyecto = async (id_proyecto: number) => {
  const response = await apiClient.get('/secuencias/p', { 
    params: { id_proyecto } 
  });
  return response.data;
};

// Obtener secuencias por proyecto (usando GET con query param)
export const obtenerSecuenciasId = async (id_secuencia: number) => {
  const response = await apiClient.get(`/secuencias/${id_secuencia}`


  );
  return response.data;
}; 
// Crear secuencia
export const crearSecuencia = async (data: any) => {
  const response = await apiClient.post('/secuencias', data);
  return response.data;
};

// Actualizar secuencia
export const actualizarSecuencia = async (id: number, data: any) => {
  const response = await apiClient.patch(`/secuencias/${id}`, data);
  return response.data;
};

export const aplicarPlantillaSecuencia = async (id_secuencia: number, id_plantilla_secuencia: string) => {
  console.log('aplicarPlantillaSecuencia - Enviando parámetros:');
  console.log('- id_secuencia:', id_secuencia, 'tipo:', typeof id_secuencia);
  console.log('- id_plantilla_secuencia:', id_plantilla_secuencia, 'tipo:', typeof id_plantilla_secuencia);
  
  const payload = { id_secuencia, id_plantilla_secuencia };
  console.log('- payload completo:', payload);
  
  const response = await apiClient.patch('/secuencias/aplicar-plantilla', payload);
  return response.data;
};

// Eliminar secuencia
export const eliminarSecuencia = async (id: number) => {
  await apiClient.delete(`/secuencias/${id}`);
};

