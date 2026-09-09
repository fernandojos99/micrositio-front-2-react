/**
 * Tipos de datos para el componente FlowEditor
 * @fileoverview Definiciones de tipos TypeScript para Testing Cards y Learning Cards
 */

/**
 * Tipos de experimento disponibles
 * @typedef {string} ExperimentType
 */
export type ExperimentType = 'Entrevista' | 'Prototipo' | 'Encuesta' | 'A/B Test';

/**
 * Categorías de experimento disponibles
 * @typedef {string} ExperimentCategory
 */
export type ExperimentCategory = 'Descubrimiento' | 'Validación';

/**
 * Estructura de datos para archivos adjuntos
 * @interface Attachment
 */
export interface Attachment {
  /** URL del archivo */
  fileUrl: string;
  /** Nombre del archivo */
  fileName: string;
  /** Tamaño del archivo en bytes (opcional) */
  fileSize?: number;
}

/**
 * Tipos para métricas reales de la BD
 * @interface MetricaTestingCard
 */
export interface MetricaTestingCard {
  id_metrica: number;
  id_testing_card: number;
  nombre: string;
  operador: string;
  criterio: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Ajuste de TestingCardData para coincidir con la BD
 * @interface TestingCardData
 * @description Contiene toda la información necesaria para una Testing Card,
 * incluyendo hipótesis, métricas, documentación y callbacks de acción.
 */
export interface TestingCardData {
  id: number;
  id_testing_card: number;
  id_secuencia: number;
  padre_id?: number | null;
  titulo: string;
  hipotesis: string;
  id_experimento_tipo: number;
  descripcion: string;
  dia_inicio: string;
  dia_fin: string;
  anexo_url?: string | null;
  id_responsable: number;
  status: 'EN PLANEACION' | 'EN VALIDACION' | 'EN ANALISIS' | 'CANCELADO' | 'TERMINADO';
  created_at?: string;
  updated_at?: string;
  // Opcionales para frontend
  metricas?: MetricaTestingCard[];
  documentationUrls?: string[];
  attachments?: Attachment[];
  collaborators?: string[];
  // @callbacks: Funciones de acción para el nodo
  /** Callback para añadir una Testing Card conectada */
  onAddTesting?: () => void;
  /** Callback para añadir una Learning Card conectada */
  onAddLearning?: () => void;
  /** Callback para editar el nodo */
  onEdit?: () => void;
  /** Callback para eliminar el nodo */
  onDelete?: () => void;
}

/**
 * Estructura de datos para una Learning Card
 * @interface LearningCardData
 * @description Contiene los resultados y hallazgos obtenidos de un experimento,
 * conectada a una Testing Card específica.
 */
export interface LearningCardData {
  id_learning_card: number;
  id_testing_card: number;
  resultado: string | null;
  hallazgo: string | null;
  estado: 'ACEPTADA' | 'RECHAZADA' | 'REITERAR' | 'MAL PLANTEADA';
  id_responsable: number;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  /** URLs de documentación de referencia */
  //documentationUrls?: string[];
  /** IDs de colaboradores asignados */
  //collaborators?: string[];
  // Callbacks (si los necesitas en frontend)
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Tipo unificado para los datos de nodo
 * @typedef {TestingCardData | LearningCardData} NodeData
 * @description Union type que permite manejar ambos tipos de nodos de forma unificada
 */
export type NodeData = TestingCardData | LearningCardData;

/**
 * Datos para la creación de un nuevo nodo (legacy)
 * @interface CreateNodeData
 * @deprecated Usar TestingCardData o LearningCardData directamente
 */
export interface CreateNodeData {
  /** Nombre del nodo */
  nombre: string;
  /** Descripción del nodo */
  descripcion: string;
  /** Fecha asociada */
  fecha: string;
  /** Posición en el canvas */
  position: {
    x: number;
    y: number;
  };
}

/**
 * Datos para la actualización de un nodo existente (legacy)
 * @interface UpdateNodeData
 * @deprecated Usar TestingCardData o LearningCardData directamente
 */
export interface UpdateNodeData {
  /** ID del nodo a actualizar */
  id: string;
  /** Nuevo nombre (opcional) */
  nombre?: string;
  /** Nueva descripción (opcional) */
  descripcion?: string;
  /** Nueva fecha (opcional) */
  fecha?: string;
}

/**
 * Estados posibles del editor de flujo
 * @typedef {string} FlowEditorState
 */
export type FlowEditorState = 'idle' | 'editing' | 'creating' | 'deleting';

/**
 * Configuración del editor de flujo
 * @interface FlowEditorConfig
 * @description Configuración personalizable para el comportamiento del FlowEditor
 */
export interface FlowEditorConfig {
  /** Habilitar/deshabilitar el grid de fondo */
  showGrid: boolean;
  /** Habilitar/deshabilitar los controles */
  showControls: boolean;
  /** Habilitar/deshabilitar el mini mapa */
  showMiniMap: boolean;
  /** Zoom inicial */
  defaultZoom: number;
  /** Posición inicial del viewport */
  defaultViewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

/**
 * Configuración de posicionamiento automático
 * @interface PositioningConfig
 * @description Configuración para el algoritmo de posicionamiento automático de nodos
 */
export interface PositioningConfig {
  /** Distancia horizontal entre Testing Cards */
  horizontalOffset: number;
  /** Distancia vertical para Learning Cards */
  verticalOffset: number;
  /** Padding para evitar colisiones */
  collisionPadding: number;
  /** Número máximo de intentos para resolver colisiones */
  maxCollisionAttempts: number;
}

/**
 * Información de nivel de nodo para z-index dinámico
 * @interface NodeLevelInfo
 */
export interface NodeLevelInfo {
  /** ID del nodo */
  nodeId: string;
  /** Nivel de profundidad en el árbol */
  level: number;
  /** Z-index calculado */
  zIndex: number;
  /** IDs de nodos padre */
  parentIds: string[];
  /** IDs de nodos hijo */
  childIds: string[];
}