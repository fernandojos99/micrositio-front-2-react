/**
 * @fileoverview Tipos TypeScript para el sistema de gestión de plantillas
 * 
 * Este archivo contiene todas las interfaces y tipos necesarios para el funcionamiento
 * del sistema de plantillas de Testing Cards. Define las estructuras de datos que
 * utilizan los componentes de visualización y gestión de plantillas.
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import { Node } from 'reactflow';
import { TestingCardData } from '../../types';

/**
 * Interfaz para los datos de una plantilla de Testing Card
 * Extiende TestingCardData pero sin los callbacks de acción
 */
export interface TemplateTestingCardData extends Omit<TestingCardData, 'onEdit' | 'onDelete' | 'onAddTesting' | 'onAddLearning' | 'onStatusChange'> {
  /** ID único de la plantilla */
  id_plantilla?: number;
  
  /** Nombre descriptivo de la plantilla */
  nombre_plantilla?: string;
  
  /** Descripción de la plantilla */
  descripcion_plantilla?: string;
  
  /** Categoría de la plantilla (ej: "Marketing", "Producto", "UX") */
  categoria?: string;
  
  /** Indica si es una plantilla pública o privada */
  es_publica?: boolean;
  
  /** Usuario que creó la plantilla */
  creado_por?: number;
  
  /** Fecha de creación de la plantilla */
  fecha_creacion?: string;
  
  /** Fecha de última modificación */
  fecha_modificacion?: string;
  
  /** Número de veces que se ha usado la plantilla */
  usos_count?: number;
}

/**
 * Props para el componente TemplateViewerModal
 */
export interface TemplateViewerModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  
  /** Función para cerrar el modal */
  onClose: () => void;
  
  /** ID de la plantilla a mostrar */
  plantillaId: number;
  
  /** Nombre de la plantilla para mostrar en el título */
  plantillaNombre: string;
  
  /** Descripción opcional de la plantilla */
  plantillaDescripcion?: string;
  
  /** Función que se ejecuta cuando el usuario decide usar la plantilla */
  onUseTemplate?: (plantillaId: number) => void;
  
  /** Función que se ejecuta cuando el usuario decide duplicar la plantilla */
  onDuplicateTemplate?: (plantillaId: number) => void;
}

/**
 * Props para el componente TemplateFlowViewer
 */
export interface TemplateFlowViewerProps {
  /** ID de la plantilla a cargar y mostrar */
  plantillaId: number;
  
  /** Altura del contenedor del flow viewer (opcional) */
  height?: string | number;
  
  /** Anchura del contenedor del flow viewer (opcional) */
  width?: string | number;
  
  /** Indica si debe mostrar los controles de zoom y pan */
  showControls?: boolean;
  
  /** Función callback que se ejecuta cuando los datos se cargan */
  onDataLoaded?: (testingCards: TemplateTestingCardData[]) => void;
  
  /** Función callback que se ejecuta si hay un error al cargar */
  onError?: (error: Error) => void;
  
  /** Función callback para aplicar una Testing Card específica */
  onApplyTestingCard?: (testingCardData: TemplateTestingCardData) => void;
  
  /** Indica si debe mostrar botones "Aplicar" en los nodos */
  showApplyButtons?: boolean;
}

/**
 * Props para el componente TemplateTestingCardNode
 */
export interface TemplateTestingCardNodeProps {
  /** Datos de la Testing Card en modo plantilla */
  data: TemplateTestingCardData;
  
  /** Indica si el nodo está seleccionado (solo visual) */
  selected?: boolean;
  
  /** Modo de visualización del nodo */
  viewMode?: 'preview' | 'compact' | 'detailed';
  
  /** Función callback cuando se hace clic en el nodo (opcional) */
  onClick?: (nodeId: string) => void;
  
  /** Función callback para aplicar esta Testing Card específica */
  onApplyTemplate?: (testingCardData: TemplateTestingCardData) => void;
  
  /** Indica si debe mostrar el botón "Aplicar" */
  showApplyButton?: boolean;
}

/**
 * Interfaz para la respuesta del servicio de plantillas
 */
export interface TemplateServiceResponse {
  /** Datos de la plantilla */
  plantilla: {
    id_plantilla: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    es_publica: boolean;
    creado_por: number;
    fecha_creacion: string;
    fecha_modificacion: string;
    usos_count: number;
  };
  
  /** Testing Cards asociadas a la plantilla */
  testing_cards: TemplateTestingCardData[];
  
  /** Metadata adicional */
  metadata?: {
    total_cards: number;
    has_learning_cards: boolean;
    complexity_level: 'simple' | 'medium' | 'complex';
  };
}

/**
 * Interfaz para los filtros de búsqueda de plantillas
 */
export interface TemplateFilters {
  /** Filtrar por categoría */
  categoria?: string;
  
  /** Filtrar por tipo de acceso */
  tipo_acceso?: 'publica' | 'privada' | 'todas';
  
  /** Filtrar por creador */
  creado_por?: number;
  
  /** Filtrar por rango de fechas */
  fecha_desde?: string;
  fecha_hasta?: string;
  
  /** Ordenar por campo específico */
  orden_por?: 'nombre' | 'fecha_creacion' | 'usos_count';
  
  /** Dirección del ordenamiento */
  orden_direccion?: 'asc' | 'desc';
  
  /** Búsqueda por texto */
  busqueda?: string;
}

/**
 * Interfaz para el estado del modal de plantillas
 */
export interface TemplateModalState {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  
  /** ID de la plantilla seleccionada */
  selectedTemplateId: number | null;
  
  /** Datos de la plantilla seleccionada */
  selectedTemplate: TemplateServiceResponse | null;
  
  /** Estado de carga */
  loading: boolean;
  
  /** Error si lo hay */
  error: string | null;
  
  /** Modo actual del modal */
  mode: 'view' | 'select' | 'create';
}

/**
 * Interfaz para las opciones de creación de plantilla
 */
export interface CreateTemplateOptions {
  /** Nombre de la nueva plantilla */
  nombre: string;
  
  /** Descripción de la plantilla */
  descripcion: string;
  
  /** Categoría de la plantilla */
  categoria: string;
  
  /** Si debe ser pública o privada */
  es_publica: boolean;
  
  /** IDs de las Testing Cards a incluir en la plantilla */
  testing_card_ids: number[];
  
  /** Si debe incluir las Learning Cards asociadas */
  incluir_learning_cards: boolean;
}

/**
 * Tipo para los nodos de plantilla en ReactFlow
 */
export type TemplateNode = Node<TemplateTestingCardData>;

/**
 * Tipo para las acciones disponibles en el contexto de plantillas
 */
export type TemplateAction = 
  | 'view'           // Ver plantilla
  | 'use'            // Usar plantilla
  | 'duplicate'      // Duplicar plantilla
  | 'edit'           // Editar plantilla (solo si es propietario)
  | 'delete'         // Eliminar plantilla (solo si es propietario)
  | 'share';         // Compartir plantilla

/**
 * Interfaz para el resultado de aplicar una plantilla
 */
export interface ApplyTemplateResult {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Mensaje descriptivo del resultado */
  message: string;
  
  /** IDs de las nuevas Testing Cards creadas */
  created_testing_card_ids?: number[];
  
  /** IDs de las nuevas Learning Cards creadas (si aplica) */
  created_learning_card_ids?: number[];
  
  /** Error si lo hay */
  error?: string;
}

/**
 * Constantes para el sistema de plantillas
 */
export const TEMPLATE_CONSTANTS = {
  /** Categorías predefinidas para plantillas */
  CATEGORIES: [
    'Marketing',
    'Producto', 
    'UX/UI',
    'Tecnología',
    'Ventas',
    'Customer Success',
    'Operaciones',
    'General'
  ] as const,
  
  /** Tipos de acceso */
  ACCESS_TYPES: {
    PUBLIC: 'publica',
    PRIVATE: 'privada',
    ALL: 'todas'
  } as const,
  
  /** Modos de visualización */
  VIEW_MODES: {
    PREVIEW: 'preview',
    COMPACT: 'compact', 
    DETAILED: 'detailed'
  } as const,
  
  /** Estados de carga */
  LOADING_STATES: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  } as const
} as const;

/**
 * Tipo para las categorías de plantillas
 */
export type TemplateCategory = typeof TEMPLATE_CONSTANTS.CATEGORIES[number];

/**
 * Tipo para los tipos de acceso
 */
export type AccessType = typeof TEMPLATE_CONSTANTS.ACCESS_TYPES[keyof typeof TEMPLATE_CONSTANTS.ACCESS_TYPES];

/**
 * Tipo para los modos de visualización
 */
export type ViewMode = typeof TEMPLATE_CONSTANTS.VIEW_MODES[keyof typeof TEMPLATE_CONSTANTS.VIEW_MODES];

/**
 * Tipo para los estados de carga
 */
export type LoadingState = typeof TEMPLATE_CONSTANTS.LOADING_STATES[keyof typeof TEMPLATE_CONSTANTS.LOADING_STATES];
