// src/services/searchService.ts
import apiClient from '../apiClient'; // 👈 ajusta la ruta si está en otro folder

// 👇 ahora soporta todos los scopes del backend
export type SearchScope =
  | 'proyectos'
  | 'agentes'
  | 'prompts'
  | 'secuencias'
  | 'testing_cards'
  | 'learning_cards'
  | 'documentos'
  | 'all';

export interface Proyecto {
  id_proyecto: number;
  nombre: string;
  [key: string]: any;
}

export interface Agente {
  id_agente: number;
  nombre: string;
  apellido?: string;
  [key: string]: any;
}

export interface Prompt {
  id_prompt: number;
  titulo: string;
  [key: string]: any;
}

export interface Secuencia {
  id_secuencia: number;
  id_proyecto: number;
  nombre: string;
  descripcion?: string;
  [key: string]: any;
}

export interface TestingCard {
  id_testing_card: number;
  id_proyecto: number;
  titulo: string;
  hipotesis?: string;
  descripcion?: string;
  [key: string]: any;
}

export interface LearningCard {
  id_learning_card: number;
  id_proyecto: number;
  resultado?: string;
  hallazgo?: string;
  [key: string]: any;
}

// Si luego agregas índice de documentos, lo tipamos mejor
export interface DocumentoIndexado {
  id?: number;
  id_proyecto?: number;
  source_type?: string;
  source_id?: number;
  titulo?: string;
  resumen?: string;
  [key: string]: any;
}

export interface SearchResults {
  proyectos?: Proyecto[];
  agentes?: Agente[];
  prompts?: Prompt[];
  secuencias?: Secuencia[];
  testing_cards?: TestingCard[];
  learning_cards?: LearningCard[];
  documentos?: DocumentoIndexado[];
}

export async function search(
  q: string,
  scope: SearchScope = 'all'
): Promise<SearchResults> {
  console.log('🔍 Lanzando búsqueda al backend:', { q, scope });

  const response = await apiClient.get('/search', {
    params: { q, scope },
  });

  console.log('⬅️ Respuesta cruda de /search:', response.data);

  const data = response.data?.data ?? {};

  const parsed: SearchResults = {
    proyectos: data.proyectos ?? [],
    agentes: data.agentes ?? [],
    prompts: data.prompts ?? [],
    secuencias: data.secuencias ?? [],
    testing_cards: data.testing_cards ?? [],
    learning_cards: data.learning_cards ?? [],
    documentos: data.documentos ?? [],
  };

  console.log('🧩 Resultados parseados:', parsed);

  return parsed;
}
