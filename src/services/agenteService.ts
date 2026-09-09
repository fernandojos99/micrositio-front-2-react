import apiClient from '../apiClient';

export const CATEGORIAS_AGENTE = [
  "Descubrimiento",
  "Ideación",
  "Investigación",
  "Prototipado",
  "Validación",
] as const

export type CategoriaAgente = typeof CATEGORIAS_AGENTE[number]

export interface Agente {
  id_agente: number;
  nombre: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
  categoria?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrearAgenteData {
  nombre: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
  categoria?: string;
}

export interface ActualizarAgenteData {
  id_agente: number;
  nombre?: string;
  link?: string;
  descripcion?: string;
  prompt?: string;
  categoria?: string;
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
 * Obtiene los agente de una categoria dada
 */
export const listarPorCategoria = async (idCategoria: number): Promise<Agente[]> => {
  const response = await apiClient.get(`/agentes/categoria/${idCategoria}`);
  return response.data;
};

/**
 * Obtiene un agente específico por su ID
 * @param {number} id - ID del agente a buscar
 * @returns {Promise<Agente>} Los datos del agente
 */
export const obtenerAgentePorId = async (idAgente: number): Promise<Agente> => {
  
  // Para GET con body en axios, usar request con configuración específica
  const response = await apiClient.request({
    method: 'GET',
    url: `/agentes/${idAgente}`,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
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
