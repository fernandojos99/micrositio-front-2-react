import apiClient from '../apiClient';

/** Las 5 pestañas, en orden. Coincide con el CHECK de proyecto_etapa. */
export const ETAPAS = ['BRIEF', 'PLAN', 'EJECUCION', 'IDEACION', 'RESULTADOS'] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Nombre de cada pestaña en la interfaz. */
export const NOMBRE_ETAPA: Record<Etapa, string> = {
  BRIEF: 'Brief y Propuesta',
  PLAN: 'Plan de trabajo',
  EJECUCION: 'Ejecución',
  IDEACION: 'Ideación',
  RESULTADOS: 'Resultados',
};

/**
 * Lo capturado en las pestañas. Es deliberadamente laxo: la maqueta todavía
 * está cambiando de forma y el backend lo guarda como JSON libre.
 */
export interface DatosEtapa {
  brief?: {
    origen?: 'form' | 'transcript';
    archivo?: { nombre: string; tamano: number; subido: string };
    notas?: string;
  };
  propuesta?: PropuestaServicio;
  [clave: string]: unknown;
}

/** Un servicio contratado dentro de una etapa, con su precio. */
export interface ServicioPropuesto {
  nombre: string;
  precio: number;
}

/**
 * Card que la propuesta promete. Al guardar se crea en la base marcada como
 * borrador, y aquí queda anotado su id para no duplicarla la próxima vez.
 */
export interface CardPlaneada {
  tipo: 'testing' | 'learning';
  titulo: string;
  id_testing_card?: number;
  id_learning_card?: number;
}

/** Una etapa de la propuesta, tal como aparece en la presentación. */
export interface EtapaPropuesta {
  nombre: string;          // "Diagnóstico y Quick Wins"
  etiqueta: string;        // "Clarificación"
  entregables: string[];
  servicios: ServicioPropuesto[];
  requerimientos: string[];
  criterios_exito: string[];
  decisiones: string[];    // "Decisiones a tomar" de la hoja de brief
  cards_planeadas?: CardPlaneada[];
  /** Secuencia que materializa esta etapa, una vez creada. */
  id_secuencia?: number;
  dia_inicio?: string;
  dia_fin?: string;
}

/**
 * Propuesta de servicio. Reproduce la presentación de referencia
 * (MMF: Validación y Escalamiento) para que cada dato sea editable:
 * portada, contexto en tres columnas, reto, etapas y costos.
 */
export interface PropuestaServicio {
  titulo: string;
  subtitulo: string;
  contexto: {
    antecedentes: string[];
    actualidad: string[];
    insights: string[];
  };
  reto: string;
  etapas: EtapaPropuesta[];
  brief: {
    titulo: string;
    objetivo: string;
    objetivos: string[];
  };
  moneda: string;
  /** Marca de dónde salió: hoy siempre la plantilla, mañana la Lambda. */
  origen?: 'plantilla' | 'agente';
  cards_planeadas?: Array<{
    tipo: 'testing' | 'learning';
    titulo: string;
    responsable?: string;
    dia_inicio?: string;
    dia_fin?: string;
  }>;
}

/** Suma de los servicios de una etapa. */
export const totalEtapa = (etapa: EtapaPropuesta): number =>
  etapa.servicios.reduce((suma, servicio) => suma + (Number(servicio.precio) || 0), 0);

/** Inversión total de la propuesta. */
export const totalPropuesta = (propuesta: PropuestaServicio): number =>
  propuesta.etapas.reduce((suma, etapa) => suma + totalEtapa(etapa), 0);

export interface ProyectoEtapa {
  id_proyecto: number;
  etapa_actual: Etapa;
  datos: DatosEtapa;
  aprobado: boolean;
  aprobado_por: string | null;
  aprobado_en: string | null;
  es_maqueta: boolean;
  creado: string | null;
  actualizado: string | null;
}

export interface ResultadoAprobacion extends ProyectoEtapa {
  testing_cards_publicadas: number;
  learning_cards_publicadas: number;
}

/**
 * Etapa de un proyecto. Si nunca se ha guardado nada, el backend devuelve la
 * inicial (BRIEF, sin datos) sin crear la fila.
 */
export const obtenerEtapa = async (idProyecto: number): Promise<ProyectoEtapa> => {
  const { data } = await apiClient.get(`/proyecto_etapa/${idProyecto}`);
  return data;
};

/** Guarda la etapa y/o lo capturado. Solo EDITOR o ADMIN. */
export const guardarEtapa = async (
  idProyecto: number,
  cambios: { etapa_actual?: Etapa; datos?: DatosEtapa; es_maqueta?: boolean }
): Promise<ProyectoEtapa> => {
  const { data } = await apiClient.put(`/proyecto_etapa/${idProyecto}`, cambios);
  return data;
};

// --- Avance del proyecto (alimenta Ejecución y Resultados) -------------------

export interface SecuenciaAvance {
  id_secuencia: number;
  nombre: string;
  estado: string;
  dia_inicio: string | null;
  dia_fin: string | null;
  testing_cards: number;
  testing_cards_terminadas: number;
  testing_cards_canceladas: number;
  learning_cards: number;
  terminada: boolean;
  vencida: boolean;
}

export interface LearningCardAvance {
  id_learning_card: number;
  estado: string;
  hallazgo: string | null;
  resultado: string | null;
  id_testing_card: number;
  testing_card: string;
  id_secuencia: number;
  secuencia: string;
  /** Cuántos accionables tiene ya: si es 0, Ideación propone uno. */
  accionables: number;
}

export interface MetricaAvance {
  id_metrica: number;
  nombre: string;
  operador: string | null;
  criterio: string | null;
  resultado: string | null;
  cumplimiento: 'cumplida' | 'no_cumplida' | 'no_evaluable';
  id_testing_card: number;
  testing_card: string;
  id_secuencia: number;
  secuencia: string;
}

export interface AccionableAvance {
  id_accionable: number;
  id_learning_card: number;
  contenido: string;
  impacto: number;
  esfuerzo: number;
  realizado: boolean;
  id_testing_card: number;
  id_secuencia: number;
  secuencia: string;
}

export interface MiembroEquipo {
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno: string | null;
  cargo: string | null;
  image: string | null;
  activo: boolean;
  es_lider: boolean;
}

export interface AvanceProyecto {
  id_proyecto: number;
  totales: {
    secuencias: number;
    secuencias_terminadas: number;
    secuencias_vencidas: number;
    testing_cards: number;
    testing_cards_terminadas: number;
    testing_cards_canceladas: number;
    learning_cards: number;
    learning_cards_por_estado: Record<string, number>;
    accionables: number;
    accionables_realizados: number;
  };
  secuencias: SecuenciaAvance[];
  learning_cards: LearningCardAvance[];
  metricas: {
    resumen: { total: number; medidas: number; cumplidas: number; no_cumplidas: number; no_evaluables: number };
    detalle: MetricaAvance[];
  };
  accionables: AccionableAvance[];
  equipo: MiembroEquipo[];
}

/**
 * Avance completo del proyecto en una sola petición. Sustituye a encadenar
 * secuencias → testing cards → learning cards → métricas desde el navegador.
 */
export const obtenerAvance = async (idProyecto: number): Promise<AvanceProyecto> => {
  const { data } = await apiClient.get(`/proyecto_etapa/${idProyecto}/avance`);
  return data;
};

/** Aprueba el proyecto y publica sus cards en borrador. Solo ADMIN. */
export const aprobarProyecto = async (idProyecto: number): Promise<ResultadoAprobacion> => {
  const { data } = await apiClient.post(`/proyecto_etapa/${idProyecto}/aprobar`);
  return data;
};
