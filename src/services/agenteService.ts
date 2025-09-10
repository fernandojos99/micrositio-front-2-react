import apiClient from '../apiClient';

export interface Agente {
  id_agente: number;
  nombre: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrearAgenteData {
  nombre: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
}

export interface ActualizarAgenteData {
  id: number;
  nombre?: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
}

/**
 * Obtiene todos los agentes
 * @returns {Promise<Agente[]>} Lista de todos los agentes
 */
export const obtenerAgentes = async (): Promise<Agente[]> => {
  const response = await apiClient.get('/agentes/');
  return response.data;
};

/**
 * Obtiene un agente específico por su ID
 * @param {number} id - ID del agente a buscar
 * @returns {Promise<Agente>} Los datos del agente
 */
export const obtenerAgentePorId = async (id: number): Promise<Agente> => {
  // console.log('Obteniendo agente por ID:', id);
  // console.log('Tipo de ID:', typeof id);
  
  // Para GET con body en axios, usar request con configuración específica
  const response = await apiClient.request({
    method: 'POST',
    url: '/agentes/a',
    data: { id },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // console.log('Respuesta del servidor:', response.data);
  return response.data;
};

/**
 * Crea un nuevo agente
 * @param {CrearAgenteData} agenteData - Datos del nuevo agente
 * @returns {Promise<Agente>} El agente creado
 */
export const crearAgente = async (agenteData: CrearAgenteData): Promise<Agente> => {
  const response = await apiClient.post('/agentes/', agenteData);
  return response.data;
};

/**
 * Actualiza los datos de un agente existente
 * @param {ActualizarAgenteData} agenteData - Datos a actualizar (debe incluir el id)
 * @returns {Promise<Agente>} El agente actualizado
 */
export const actualizarAgente = async (agenteData: ActualizarAgenteData): Promise<Agente> => {
  // console.log('actualizarAgente - Datos recibidos:', JSON.stringify(agenteData, null, 2));
  // console.log('actualizarAgente - Tipo de ID:', typeof agenteData.id);
  
  const response = await apiClient.patch('/agentes/', agenteData);
  return response.data;
};

/**
 * Elimina un agente de forma permanente
 * @param {number} id - ID del agente a eliminar
 * @returns {Promise<Agente>} El agente eliminado
 */
export const eliminarAgente = async (id: number): Promise<Agente> => {
  const response = await apiClient.delete('/agentes/', {
    data: { id }
  });
  return response.data;
};
