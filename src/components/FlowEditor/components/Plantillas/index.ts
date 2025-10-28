/**
 * @fileoverview Exportaciones del sistema de plantillas de Testing Cards
 * 
 * Este archivo centraliza todas las exportaciones del sistema de plantillas,
 * facilitando la importación de componentes, tipos y utilidades desde un
 * único punto de entrada.
 * 
 * Uso:
 * ```tsx
 * import { 
 *   TemplateViewerModal, 
 *   TemplateFlowViewer, 
 *   TemplateTestingCardNode,
 *   TemplateViewerModalProps 
 * } from './components/Plantillas';
 * ```
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

// Componentes principales
export { default as TemplateViewerModal } from './TemplateViewerModal';
export { default as TemplateFlowViewer } from './TemplateFlowViewer';
export { default as TemplateTestingCardNode } from './TemplateTestingCardNode';
<<<<<<< HEAD
export { default as TemplateTestingCardList } from './TemplateTestingCardList';
=======
>>>>>>> e3d08452b44b9c1911517dd776675adbbe5c2ade

// Tipos y interfaces
export type {
  // Props de componentes
  TemplateViewerModalProps,
  TemplateFlowViewerProps,
  TemplateTestingCardNodeProps,
  
  // Tipos de datos
  TemplateTestingCardData,
  TemplateServiceResponse,
  TemplateModalState,
  TemplateFilters,
  CreateTemplateOptions,
  ApplyTemplateResult,
  
  // Tipos de ReactFlow
  TemplateNode,
  
  // Tipos auxiliares
  TemplateAction,
  TemplateCategory,
  AccessType,
  ViewMode,
  LoadingState
} from './types';

// Constantes
export { TEMPLATE_CONSTANTS } from './types';

// Importar TEMPLATE_CONSTANTS para re-exportar constantes individuales
import { TEMPLATE_CONSTANTS } from './types';

// Re-exportar constantes más usadas para facilidad de uso
export const {
  CATEGORIES,
  ACCESS_TYPES,
  VIEW_MODES,
  LOADING_STATES
} = TEMPLATE_CONSTANTS;
