/**
 * @fileoverview Componente TemplateFlowViewer - FlowEditor especializado para plantillas
 * 
 * Este archivo contiene un FlowEditor simplificado y especializado para mostrar
 * plantillas de Testing Cards en modo de solo lectura. No permite edición,
 * creación o eliminación de nodos, solo visualización.
 * 
 * Características principales:
 * - Vista previa de plantillas sin capacidades de edición
 * - Carga automática de Testing Cards asociadas a la plantilla
 * - Posicionamiento automático e inteligente de nodos
 * - Integración con ReactFlow en modo de solo lectura
 * - Manejo de estados de carga y error
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Background,
  Controls,
  ReactFlowProvider,
  BackgroundVariant,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Edge,
  MarkerType,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

import TemplateTestingCardNode from './TemplateTestingCardNode';
import { 
  TemplateFlowViewerProps, 
  TemplateTestingCardData, 
  TemplateNode,
  LoadingState,
  TEMPLATE_CONSTANTS
} from './types';

/**
 * Tipos de nodos disponibles para el template viewer
 * Solo incluye el nodo de Testing Card en modo plantilla
 */
const nodeTypes: NodeTypes = {
  testing: TemplateTestingCardNode,
};

/**
 * Configuración por defecto para el posicionamiento de nodos
 */
const DEFAULT_NODE_SPACING = {
  horizontal: 300,  // Espaciado horizontal entre nodos
  vertical: 200,    // Espaciado vertical entre nodos
  startX: 150,      // Posición X inicial
  startY: 100,      // Posición Y inicial
};

/**
 * Componente TemplateFlowViewer
 * 
 * FlowEditor especializado para mostrar plantillas de Testing Cards.
 * Carga los datos de la plantilla y los renderiza en un formato de solo lectura
 * utilizando ReactFlow con capacidades de edición deshabilitadas.
 * 
 * @param props - Propiedades del componente
 * @returns Componente React del visualizador de plantillas
 */
const TemplateFlowViewer: React.FC<TemplateFlowViewerProps> = ({
  plantillaId,
  height = '500px',
  width = '100%',
  showControls = true,
  onDataLoaded,
  onError
}) => {
  // Estados para manejar los nodos y edges de ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState<TemplateTestingCardData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Estados locales para el manejo de la UI
  const [loadingState, setLoadingState] = useState<LoadingState>(TEMPLATE_CONSTANTS.LOADING_STATES.IDLE);
  const [templateData, setTemplateData] = useState<TemplateTestingCardData[]>([]);

  /**
   * Effect principal que se ejecuta cuando cambia el ID de la plantilla
   */
  useEffect(() => {
    if (plantillaId) {
      loadTemplateTestingCards();
    }
  }, [plantillaId]);

  /**
   * Carga las Testing Cards asociadas a la plantilla desde el servicio
   */
  const loadTemplateTestingCards = async () => {
    try {
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.LOADING);
      
      // TODO: Reemplazar con llamada real al servicio de plantillas
      // const response = await TemplateService.getTestingCardsByTemplate(plantillaId);
      
      // Datos mock para desarrollo - simular Testing Cards de una plantilla
      const mockTestingCards: TemplateTestingCardData[] = [
        {
          id_testing_card: 1,
          id_secuencia: 1,
          titulo: 'Validar hipótesis principal',
          descripcion: 'Probar si los usuarios entienden el valor propuesto',
          hipotesis: 'Los usuarios comprenderán el valor en los primeros 30 segundos',
          dia_inicio: '2025-10-28',
          dia_fin: '2025-11-04',
          status: 'EN PLANEACION',
          id_experimento_tipo: 1,
          padre_id: null,
          id_responsable: 1,
          id_plantilla: plantillaId,
          nombre_plantilla: 'Plantilla de Marketing',
          categoria: 'Marketing',
          es_publica: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id_testing_card: 2,
          id_secuencia: 1,
          titulo: 'Medir engagement inicial',
          descripcion: 'Analizar métricas de interacción en la primera sesión',
          hipotesis: 'El engagement será mayor al 70% en la primera pantalla',
          dia_inicio: '2025-11-05',
          dia_fin: '2025-11-12',
          status: 'EN PLANEACION',
          id_experimento_tipo: 2,
          padre_id: 1,
          id_responsable: 1,
          id_plantilla: plantillaId,
          categoria: 'Marketing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id_testing_card: 3,
          id_secuencia: 1,
          titulo: 'Optimizar conversión',
          descripcion: 'Mejorar el funnel basado en los resultados anteriores',
          hipotesis: 'Las mejoras incrementarán la conversión en un 20%',
          dia_inicio: '2025-11-13',
          dia_fin: '2025-11-20',
          status: 'EN PLANEACION',
          id_experimento_tipo: 3,
          padre_id: 1,
          id_responsable: 1,
          id_plantilla: plantillaId,
          categoria: 'Marketing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      setTemplateData(mockTestingCards);
      
      // Convertir a nodos de ReactFlow
      const templateNodes = convertToTemplateNodes(mockTestingCards);
      setNodes(templateNodes);
      
      // Generar conexiones entre nodos
      const templateEdges = generateTemplateEdges(mockTestingCards);
      setEdges(templateEdges);
      
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.SUCCESS);
      
      // Notificar al componente padre que los datos se cargaron
      if (onDataLoaded) {
        onDataLoaded(mockTestingCards);
      }
      
    } catch (error) {
      console.error('Error cargando Testing Cards de plantilla:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar plantilla';
      
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.ERROR);
      
      // Notificar al componente padre sobre el error
      if (onError) {
        onError(new Error(errorMessage));
      }
    }
  };

  /**
   * Convierte las Testing Cards de plantilla en nodos de ReactFlow
   * @param testingCards - Array de Testing Cards de la plantilla
   * @returns Array de nodos de ReactFlow configurados para modo plantilla
   */
  const convertToTemplateNodes = (testingCards: TemplateTestingCardData[]): TemplateNode[] => {
    return testingCards.map((card, index) => {
      // Calcular posición automática basada en jerarquía
      const position = calculateNodePosition(card, testingCards, index);

      return {
        id: `template-testing-${card.id_testing_card}`,
        type: 'testing',
        position,
        data: {
          ...card,
          // Asegurar que no hay callbacks de acción - modo solo lectura
          onEdit: undefined,
          onDelete: undefined,
          onAddTesting: undefined,
          onAddLearning: undefined,
          onStatusChange: undefined,
        },
        // Configuración específica para modo plantilla
        draggable: false,        // No permite arrastrar
        selectable: false,       // No permite seleccionar
        connectable: false,      // No permite conectar
      };
    });
  };

  /**
   * Calcula la posición de un nodo basada en su jerarquía y relaciones
   * @param card - Testing Card actual
   * @param allCards - Todas las Testing Cards de la plantilla
   * @param index - Índice de la card en el array
   * @returns Posición calculada para el nodo
   */
  const calculateNodePosition = (
    card: TemplateTestingCardData, 
    allCards: TemplateTestingCardData[], 
    index: number
  ): { x: number; y: number } => {
    
    // Si es nodo raíz (sin padre)
    if (!card.padre_id) {
      return {
        x: DEFAULT_NODE_SPACING.startX,
        y: DEFAULT_NODE_SPACING.startY + (index * DEFAULT_NODE_SPACING.vertical)
      };
    }

    // Buscar el nodo padre
    const parentCard = allCards.find(c => c.id_testing_card === card.padre_id);
    if (!parentCard) {
      // Si no encuentra padre, posicionar como raíz
      return {
        x: DEFAULT_NODE_SPACING.startX,
        y: DEFAULT_NODE_SPACING.startY + (index * DEFAULT_NODE_SPACING.vertical)
      };
    }

    // Calcular posición relativa al padre
    const parentIndex = allCards.findIndex(c => c.id_testing_card === card.padre_id);
    const siblingsCount = allCards.filter(c => c.padre_id === card.padre_id).length;
    const siblingIndex = allCards.filter(c => c.padre_id === card.padre_id).findIndex(c => c.id_testing_card === card.id_testing_card);

    return {
      x: DEFAULT_NODE_SPACING.startX + DEFAULT_NODE_SPACING.horizontal,
      y: DEFAULT_NODE_SPACING.startY + (parentIndex * DEFAULT_NODE_SPACING.vertical) + (siblingIndex * (DEFAULT_NODE_SPACING.vertical / 2))
    };
  };

  /**
   * Genera las conexiones (edges) entre nodos basadas en las relaciones padre-hijo
   * @param testingCards - Array de Testing Cards de la plantilla
   * @returns Array de edges de ReactFlow
   */
  const generateTemplateEdges = (testingCards: TemplateTestingCardData[]): Edge[] => {
    const edges: Edge[] = [];

    testingCards.forEach(card => {
      if (card.padre_id) {
        // Buscar el nodo padre
        const parentCard = testingCards.find(c => c.id_testing_card === card.padre_id);
        if (parentCard) {
          edges.push({
            id: `template-edge-${card.padre_id}-${card.id_testing_card}`,
            source: `template-testing-${card.padre_id}`,
            target: `template-testing-${card.id_testing_card}`,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'smoothstep',
            animated: false,  // Sin animación para plantillas
            style: {
              stroke: '#8B5CF6',
              strokeWidth: 2,
              strokeDasharray: '5,5', // Línea punteada para indicar que es plantilla
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#8B5CF6',
            },
            label: 'Flujo de plantilla',
            labelStyle: {
              fontSize: '10px',
              color: '#6B7280',
              fontStyle: 'italic',
            }
          });
        }
      }
    });

    return edges;
  };

  /**
   * Maneja el cambio en los nodos (requerido by ReactFlow, pero sin funcionalidad real)
   */
  const handleNodesChange = useCallback((changes: any) => {
    // En modo plantilla, no permitir cambios reales
    // Solo mantener ReactFlow feliz con el callback
    onNodesChange(changes);
  }, [onNodesChange]);

  /**
   * Maneja el cambio en los edges (requerido by ReactFlow, pero sin funcionalidad real)
   */
  const handleEdgesChange = useCallback((changes: any) => {
    // En modo plantilla, no permitir cambios reales
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Renderizado del componente
  return (
    <div 
      className="template-flow-viewer" 
      style={{ 
        width, 
        height,
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Estado de carga */}
      {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.LOADING && (
        <div className="template-flow-loading">
          <div className="loading-spinner"></div>
          <p>Cargando vista previa de plantilla...</p>
        </div>
      )}

      {/* Estado de error */}
      {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.ERROR && (
        <div className="template-flow-error">
          <h3>Error al cargar plantilla</h3>
          <p>No se pudo cargar la vista previa de la plantilla.</p>
          <button onClick={loadTemplateTestingCards}>
            Reintentar
          </button>
        </div>
      )}

      {/* ReactFlow - Solo visible cuando los datos están cargados */}
      {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.SUCCESS && (
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              includeHiddenNodes: false,
            }}
            // Configuración para modo de solo lectura
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}        // Permitir pan (mover vista)
            zoomOnScroll={true}     // Permitir zoom con scroll
            zoomOnPinch={true}      // Permitir zoom con pinch
            preventScrolling={false}
            // Estilos del contenedor
            style={{
              background: '#F9FAFB',
            }}
          >
            {/* Fondo con patrón de puntos */}
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#D1D5DB"
            />
            
            {/* Controles de zoom y pan (condicional) */}
            {showControls && (
              <Controls 
                showInteractive={false}
                showFitView={true}
                showZoom={true}
                position="bottom-right"
              />
            )}
          </ReactFlow>
        </ReactFlowProvider>
      )}

      {/* Overlay con información de plantilla */}
      <div className="template-flow-overlay">
        <div className="template-flow-badge">
          <span>📋</span>
          <span>Vista previa de plantilla</span>
        </div>
      </div>
    </div>
  );
};

// Exportar el componente como default
export default TemplateFlowViewer;
