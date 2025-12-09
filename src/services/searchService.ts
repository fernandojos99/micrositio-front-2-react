// src/services/searchService.ts
import apiClient from '../apiClient'; // 👈 ajusta la ruta si está en otro folder

export type SearchScope = 'proyectos' | 'agentes' | 'prompts' | 'all';

export interface Proyecto {
  id_proyecto: number;
  nombre: string;
  [key: string]: any;
}

export interface Agente {
  id_agente: number;
  nombre: string;
  apellido: string;
  [key: string]: any;
}

export interface Prompt {
  id_prompt: number;
  titulo: string;
  [key: string]: any;
}

export interface SearchResults {
  proyectos?: Proyecto[];
  agentes?: Agente[];
  prompts?: Prompt[];
}

export async function search(
  q: string,
  scope: SearchScope = 'all'
): Promise<SearchResults> {
  const response = await apiClient.get('/search', {
    params: { q, scope },
  });

  // El backend responde { success: true, data: { proyectos?, agentes?, prompts? } }
  const data = response.data?.data ?? {};
  return {
    proyectos: data.proyectos ?? [],
    agentes: data.agentes ?? [],
    prompts: data.prompts ?? [],
  };
}
