import apiClient from '../apiClient';

/**
 * Servicio para manejar las posiciones de los nodos en el flujo
 */
// Obtener todas las posiciones de nodos para una secuencia
export const obtenerPosicionesSecuencia = async (id_secuencia: string | number) => {
  const response = await apiClient.get(`/flow-positions/${id_secuencia}`);
  return response.data;
};

/**
 * Servicio para obtener las posiciones de un nodo dado su id 
 */
export const obtenerPosicionesPorId = async (id_nodo: string | number, node_type: 'testing' | 'learning', id_secuencia: number) => {
  const response = await apiClient.get(`/flow-positions/${id_nodo}/${node_type}/${id_secuencia}`);
  return response.data;
};


// Guardar/actualizar posición de un nodo
export const guardarPosicionNodo = async (posicionData: {
  id_secuencia: number;
  node_type: 'testing' | 'learning';
  node_id: number;
  position_x: number;
  position_y: number;
}) => {
  const response = await apiClient.post('/flow-positions', posicionData);
  return response.data;
};

// Guardar múltiples posiciones en lote
export const guardarPosicionesLote = async (posiciones: Array<{
  id_secuencia: number;
  node_type: 'testing' | 'learning';
  node_id: number;
  position_x: number;
  position_y: number;
}>) => {
  // Intentar diferentes formatos según lo que espere tu backend
  try {
    // Opción 1: endpoint /flow-positions/batch con array directo
    const response = await apiClient.post('/flow-positions/batch', posiciones);
    return response.data;
  } catch (error) {
    console.log('Fallo opción 1, intentando opción 2...');
    
    try {
      // Opción 2: endpoint /flow-positions con array envuelto
      const response = await apiClient.post('/flow-positions', { posiciones });
      return response.data;
    } catch (error2) {
      console.log('Fallo opción 2, intentando opción 3...');
      
      // Opción 3: endpoint /flow-positions con array directo
      const response = await apiClient.post('/flow-positions', posiciones);
      return response.data;
    }
  }
};

// Guardar múltiples posiciones una por una (fallback)
export const guardarPosicionesIndividual = async (posiciones: Array<{
  id_secuencia: number;
  node_type: 'testing' | 'learning';
  node_id: number;
  position_x: number;
  position_y: number;
}>) => {
  const resultados = [];
  for (const posicion of posiciones) {
    try {
      const resultado = await guardarPosicionNodo(posicion);
      resultados.push(resultado);
    } catch (error) {
      console.error('Error guardando posición individual:', posicion, error);
      throw error; // Propagar el error para que el llamador lo maneje
    }
  }
  return resultados;
};

// Limpiar todas las posiciones de una secuencia
export const limpiarPosicionesSecuencia = async (id_secuencia: string | number) => {
  const response = await apiClient.delete(`/flow-positions/${id_secuencia}`);
  return response.data;
};
