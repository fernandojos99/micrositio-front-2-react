import { useCallback } from 'react';
import { Node } from 'reactflow';
import { TestingCardData, LearningCardData, NodeData } from '../components/FlowEditor/types';
import { 
  guardarPosicionesLote, 
  guardarPosicionesIndividual,
  obtenerPosicionesSecuencia 
} from '../services/flowPositionsService';

/**
 * Hook personalizado para manejar las posiciones de los nodos
 * Proporciona funciones para guardar y restaurar posiciones usando la nueva tabla de posiciones
 */
export const useNodePositions = (idSecuencia?: string | number) => {
  const STORAGE_KEY = `flow-positions-${idSecuencia}`;

  /**
   * Calcula posición por defecto basada en el tipo de nodo y jerarquía
   */
  const calculateDefaultPosition = useCallback((
    nodeType: 'testing' | 'learning',
    parentId?: string,
    existingNodes: Node[] = [],
    isRoot: boolean = false
  ) => {
    if (isRoot) {
      return { x: 250, y: 100 };
    }

    if (nodeType === 'testing') {
      if (parentId) {
        // Es un nodo hijo de testing
        const parentNode = existingNodes.find(n => n.id === `testing-${parentId}`);
        const siblingCount = existingNodes.filter(n => 
          n.type === 'testing' && 
          (n.data as TestingCardData).padre_id?.toString() === parentId
        ).length;
        
        return {
          x: parentNode ? parentNode.position.x + 250 : 500,
          y: parentNode ? parentNode.position.y + (siblingCount * 150) + 50 : 100 + (siblingCount * 150)
        };
      } else {
        // Es un nodo raíz adicional
        const rootNodes = existingNodes.filter(n => 
          n.type === 'testing' && 
          !(n.data as TestingCardData).padre_id
        );
        return { x: 250, y: 100 + (rootNodes.length * 200) };
      }
    } else {
      // Learning card
      const testingCardId = parentId;
      const parentNode = existingNodes.find(n => n.id === `testing-${testingCardId}`);
      const siblingLearningCards = existingNodes.filter(n => 
        n.type === 'learning' && 
        (n.data as LearningCardData).id_testing_card?.toString() === testingCardId
      );
      
      return {
        x: parentNode ? parentNode.position.x + 200 : 450,
        y: parentNode ? parentNode.position.y + 200 + (siblingLearningCards.length * 150) : 300 + (siblingLearningCards.length * 150)
      };
    }
  }, []);

  /**
   * Guarda las posiciones de todos los nodos en la base de datos
   */
  const saveNodePositionsToDatabase = useCallback(async (nodes: Node<NodeData>[]) => {
    if (!idSecuencia || nodes.length === 0) {
      console.warn('[useNodePositions] No hay secuencia o nodos para guardar');
      return;
    }

    const posiciones: Array<{
      id_secuencia: number;
      node_type: 'testing' | 'learning';
      node_id: number;
      position_x: number;
      position_y: number;
    }> = [];

    for (const node of nodes) {
      try {
        if (node.type === 'testing') {
          const testingData = node.data as TestingCardData;
          if (testingData.id_testing_card) {
            posiciones.push({
              id_secuencia: Number(idSecuencia),
              node_type: 'testing',
              node_id: testingData.id_testing_card,
              position_x: node.position.x,
              position_y: node.position.y
            });
          }
        } else if (node.type === 'learning') {
          const learningData = node.data as LearningCardData;
          if (learningData.id_learning_card) {
            posiciones.push({
              id_secuencia: Number(idSecuencia),
              node_type: 'learning',
              node_id: learningData.id_learning_card,
              position_x: node.position.x,
              position_y: node.position.y
            });
          }
        }
      } catch (error) {
        console.error(`[useNodePositions] Error procesando nodo ${node.id}:`, error);
      }
    }

    if (posiciones.length === 0) {
      console.warn('[useNodePositions] No hay posiciones válidas para guardar');
      return;
    }


    try {
      await guardarPosicionesLote(posiciones);
    } catch (error) {
      console.error('[useNodePositions] Error guardando posiciones en lote, intentando individual:', error);
      
      // Fallback: intentar guardar una por una
      try {
        await guardarPosicionesIndividual(posiciones);
      } catch (individualError) {
        console.error('[useNodePositions] Error guardando posiciones individualmente:', individualError);
        // Fallback a localStorage si falla todo
        saveNodePositionsToLocalStorage(nodes);
        throw individualError; // Re-lanzar el error para que el componente pueda manejarlo
      }
    }
  }, [idSecuencia]);

  /**
   * Carga las posiciones desde la base de datos
   */
  const loadNodePositionsFromDatabase = useCallback(async (): Promise<Record<string, { x: number; y: number }>> => {
    if (!idSecuencia) {
      return {};
    }

    try {
      const posiciones = await obtenerPosicionesSecuencia(idSecuencia);
      
      // Convertir a formato de mapeo por ID de nodo
      const positionMap: Record<string, { x: number; y: number }> = {};
      
      if (Array.isArray(posiciones)) {
        posiciones.forEach((pos: any) => {
          const nodeId = `${pos.node_type}-${pos.node_id}`;
          positionMap[nodeId] = {
            x: pos.position_x,
            y: pos.position_y
          };
        });
      }
      
      return positionMap;
    } catch (error) {
      console.error('[useNodePositions] Error cargando posiciones desde BD:', error);
      // Fallback a localStorage
      return getNodePositionsFromLocalStorage();
    }
  }, [idSecuencia]);

  /**
   * Guarda las posiciones en localStorage como fallback
   */
  const saveNodePositionsToLocalStorage = useCallback((nodes: Node<NodeData>[]) => {
    if (!idSecuencia) return;

    const positions = nodes.reduce((acc, node) => {
      acc[node.id] = {
        x: node.position.x,
        y: node.position.y,
        timestamp: Date.now()
      };
      return acc;
    }, {} as Record<string, { x: number; y: number; timestamp: number }>);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('[useNodePositions] Error guardando en localStorage:', error);
    }
  }, [STORAGE_KEY, idSecuencia]);

  /**
   * Recupera posiciones desde localStorage
   */
  const getNodePositionsFromLocalStorage = useCallback((): Record<string, { x: number; y: number }> => {
    if (!idSecuencia) return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const positions = JSON.parse(stored);
        // Verificar que las posiciones no sean muy antiguas (más de 30 días)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        return Object.entries(positions).reduce((acc, [nodeId, data]) => {
          const posData = data as { x: number; y: number; timestamp?: number };
          if (!posData.timestamp || posData.timestamp > thirtyDaysAgo) {
            acc[nodeId] = { x: posData.x, y: posData.y };
          }
          return acc;
        }, {} as Record<string, { x: number; y: number }>);
      }
    } catch (error) {
      console.error('[useNodePositions] Error leyendo localStorage:', error);
    }
    
    return {};
  }, [STORAGE_KEY, idSecuencia]);

  /**
   * Obtiene la posición para un nodo desde las posiciones ya cargadas
   */
  const getNodePosition = useCallback((
    nodeType: 'testing' | 'learning',
    nodeData: TestingCardData | LearningCardData,
    existingNodes: Node[] = [],
    parentId?: string,
    savedPositions: Record<string, { x: number; y: number }> = {}
  ) => {
    const nodeId = nodeType === 'testing' 
      ? `testing-${(nodeData as TestingCardData).id_testing_card}`
      : `learning-${(nodeData as LearningCardData).id_learning_card}`;

    // 1. Intentar obtener desde las posiciones ya cargadas
    if (savedPositions[nodeId]) {
      return savedPositions[nodeId];
    }

    // 2. Intentar obtener desde localStorage
    const localPositions = getNodePositionsFromLocalStorage();
    if (localPositions[nodeId]) {
      return localPositions[nodeId];
    }

    // 3. Calcular posición por defecto
    const isRoot = nodeType === 'testing' && !(nodeData as TestingCardData).padre_id;
    return calculateDefaultPosition(nodeType, parentId, existingNodes, isRoot);
  }, [getNodePositionsFromLocalStorage, calculateDefaultPosition]);

  /**
   * Limpia las posiciones guardadas en localStorage para esta secuencia
   */
  const clearSavedPositions = useCallback(() => {
    if (!idSecuencia) return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[useNodePositions] Error limpiando localStorage:', error);
    }
  }, [STORAGE_KEY, idSecuencia]);

  return {
    saveNodePositionsToDatabase,
    loadNodePositionsFromDatabase,
    saveNodePositionsToLocalStorage,
    getNodePositionsFromLocalStorage,
    getNodePosition,
    clearSavedPositions,
    calculateDefaultPosition
  };
};