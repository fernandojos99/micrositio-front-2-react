// src/services/searchService.ts
import apiClient from '../apiClient';

export type SearchScope =
  | 'proyectos'
  | 'agentes'
  | 'prompts'
  | 'secuencias'
  | 'testing_cards'
  | 'learning_cards'
  | 'all';

export interface Proyecto {
  id_proyecto: number;
  titulo: string;
  descripcion?: string;
  [key: string]: any;
}

// Proyecto “resumen” anidado dentro de secuencia / testing / learning
export interface ProyectoResumen {
  id_proyecto: number;
  titulo: string;
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

// Empleado/responsable de una testing card
export interface EmpleadoResumen {
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
}

// Secuencia, incluida dentro de testing_card y también como resultado directo
export interface SecuenciaResult {
  id_secuencia: number;
  id_proyecto?: number | null;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
  proyecto?: ProyectoResumen | null;
}

// Testing card con sus relaciones
export interface TestingCardResult {
  id_testing_card: number;
  id_secuencia?: number | null;
  titulo: string;
  hipotesis?: string | null;
  descripcion?: string | null;
  status?: string | null;
  // relaciones que vienen del backend
  secuencia?: SecuenciaResult | null;
  responsable?: EmpleadoResumen | null;
}

// Learning card con sus relaciones (testing_card → secuencia → proyecto)
export interface LearningCardResult {
  id: number;
  id_testing_card: number;
  resultado?: string | null;
  hallazgo?: string | null;
  estado?: string | null;
  testing_card?: TestingCardResult & {
    secuencia?: SecuenciaResult | null;
    responsable?: EmpleadoResumen | null;
  } | null;
}

export interface SearchResults {
  proyectos?: Proyecto[];
  agentes?: Agente[];
  prompts?: Prompt[];
  secuencias?: SecuenciaResult[];
  testing_cards?: TestingCardResult[];
  learning_cards?: LearningCardResult[];
}

export async function search(
  q: string,
  scope: SearchScope = 'all'
): Promise<SearchResults> {

  const response = await apiClient.get('/search', {
    params: { q, scope },
  });


  const data = response.data?.data ?? {};

  const parsed: SearchResults = {
    proyectos: data.proyectos ?? [],
    agentes: data.agentes ?? [],
    prompts: data.prompts ?? [],
    secuencias: data.secuencias ?? [],
    testing_cards: data.testing_cards ?? [],
    learning_cards: data.learning_cards ?? [],
  };


  return parsed;
}


