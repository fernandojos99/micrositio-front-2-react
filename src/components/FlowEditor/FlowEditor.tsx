import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import TestingCardNode from './TestingCardNode';
import LearningCardNode from './LearningCardNode';
import LearningCardEditModal from './LearningCardEditModal';
import TestingCardEditModal from './TestingCardEditModal';
import EmptyFlowState from './components/EmptyFlowState';
import ConfirmationModal from '../ui/ConfirmationModal/ConfirmationModal';

import { TestingCardData, LearningCardData, NodeData } from './types';
import { useNodePositions } from '../../hooks/useNodePositions';
import './styles/FlowEditor.css';

import {
  obtenerTestingCardsPorSecuencia,
  crearTestingCard,
  eliminarTestingCard 
} from '../../services/testingCardService';

import {
  crear as crearLearningCard,
  eliminar as eliminarLearningCard,
  obtenerPorTestingCard,
  LearningCard
} from '../../services/learningCardService';

interface FlowEditorProps {
  idSecuencia?: string | number;
  onTestingCardsChange?: () => void;
}

export interface FlowEditorRef {
  saveCurrentPositions: () => Promise<void>;
  getCurrentNodes: () => Node<NodeData>[];
}

const nodeTypes: any = {
  testing: TestingCardNode,
  learning: LearningCardNode,
};

const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(({ idSecuencia, onTestingCardsChange }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node<NodeData> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteLearningModal, setShowDeleteLearningModal] = useState(false);
  const [deleteLearningId, setDeleteLearningId] = useState<string | null>(null);
  const [isDeletingLearning, setIsDeletingLearning] = useState(false);

  // Hook para manejar posiciones de nodos
  const {
    saveNodePositionsToDatabase,
    getNodePosition,
    calculateDefaultPosition,
    loadNodePositionsFromDatabase
  } = useNodePositions(idSecuencia);

  // Exponer métodos al componente padre a través de ref
  useImperativeHandle(ref, () => ({
    saveCurrentPositions: async () => {
      await saveNodePositionsToDatabase(nodes);
    },
    getCurrentNodes: () => nodes,
  }), [nodes, saveNodePositionsToDatabase]);

  // Función para convertir LearningCard del servicio a LearningCardData del componente
  const convertToLearningCardData = (lc: LearningCard): LearningCardData => {
    // console.log('[convertToLearningCardData] Input:', lc);
    // console.log('[convertToLearningCardData] id_responsable input:', lc.id_responsable, 'tipo:', typeof lc.id_responsable);
    
    const result = {
      id_learning_card: lc.id_learning_card,
      id_testing_card: lc.id_testing_card,
      resultado: lc.resultado || null,
      hallazgo: lc.hallazgo || null,
      estado: lc.estado,
      id_responsable: lc.id_responsable,
      created_at: new Date().toISOString(), // Valor por defecto
      updated_at: new Date().toISOString(), // Valor por defecto
    };
    
    // console.log('[convertToLearningCardData] Output:', result);
    // console.log('[convertToLearningCardData] id_responsable output:', result.id_responsable);
    return result;
  };

  const fetchInitialData = async () => {
    if (!idSecuencia) return;
    try {
      // console.log('[FlowEditor] Solicitando Testing Cards con idSecuencia:', idSecuencia);
      const testingCards = await obtenerTestingCardsPorSecuencia(idSecuencia);
      // console.log('[FlowEditor] Respuesta de obtenerTestingCardsPorSecuencia:', testingCards);
      
      // Cargar posiciones guardadas
      const savedPositions = await loadNodePositionsFromDatabase();
      // console.log('[FlowEditor] Posiciones cargadas:', savedPositions);
      
      // Debug: Ver estructura exacta de los datos
      if (testingCards && testingCards.length > 0) {
        // console.log('[FlowEditor] Primera Testing Card estructura:', testingCards[0]);
        // console.log('[FlowEditor] Campos disponibles:', Object.keys(testingCards[0]));
      }

      const nodesAccum: Node[] = [];
      for (const card of testingCards) {
        // console.log('[FlowEditor] Procesando card:', {
        //   id: card.id,
        //   id_testing_card: card.id_testing_card,
        //   titulo: card.titulo,
        //   padre_id: card.padre_id
        // });
        
        // Obtener Learning Cards de esta Testing Card usando el endpoint
        let learningCards: any[] = [];
        try {
          // console.log('[FlowEditor] Obteniendo Learning Cards para testing card:', card.id_testing_card);
          // console.log('[FlowEditor] Tipo de id_testing_card:', typeof card.id_testing_card, 'Valor:', card.id_testing_card);
          const response = await obtenerPorTestingCard(card.id_testing_card);
          // console.log('[FlowEditor] Learning Cards obtenidas exitosamente:', response);
          // console.log('[FlowEditor] Tipo de response:', typeof response, 'Es array:', Array.isArray(response));
          
          // Verificar si la respuesta es un array o un objeto individual
          if (Array.isArray(response)) {
            // console.log('[FlowEditor] Response es array, asignando directamente');
            learningCards = response;
          } else if (response && typeof response === 'object' && 'id_learning_card' in response) {
            // Si es un objeto individual con id_learning_card, convertirlo en array
            // console.log('[FlowEditor] Response es objeto individual, convirtiendo a array');
            learningCards = [response];
          } else {
            // console.log('[FlowEditor] Response no es array ni objeto válido, asignando array vacío');
            learningCards = [];
          }
          // console.log('[FlowEditor] Learning Cards procesadas como array:', learningCards, 'Longitud:', learningCards.length);
        } catch (error) {
          // console.error('[FlowEditor] Error obteniendo Learning Cards para testing card:', card.id_testing_card);
          // console.error('[FlowEditor] Error completo:', error);
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            // console.error('[FlowEditor] Response status:', axiosError.response?.status);
            // console.error('[FlowEditor] Response data:', axiosError.response?.data);
            
            // Si es un 404, significa que no hay learning cards para esta testing card
            if (axiosError.response?.status === 404) {
              // console.log('[FlowEditor] No hay Learning Cards para este Testing Card, continuando...');
            }
          }
          learningCards = [];
        }
        
        // Garantizar que learningCards sea siempre un array antes de continuar
        if (!Array.isArray(learningCards)) {
          // console.warn('[FlowEditor] FORZANDO learningCards a array vacío porque no es array:', learningCards);
          learningCards = [];
        }

        // Obtener posición del nodo testing
        const testingNodeId = `testing-${card.id_testing_card}`;
        const testingPosition = getNodePosition('testing', card, nodesAccum, card.padre_id?.toString(), savedPositions);

        const testingNode: Node = {
          id: testingNodeId,
          type: 'testing',
          position: testingPosition,
          data: {
            ...card,
            onAddTesting: () => handleAddTestingChild(card.id_testing_card.toString()),
            onAddLearning: () => handleAddLearningChild(card.id_testing_card.toString()),
            onEdit: () => {
              // Log para ver el id cuando se edita
              // console.log('[FlowEditor] Editar Testing Card id_testing_card:', card.id_testing_card);
              setEditingNode({
                id: `testing-${card.id_testing_card}`,
                type: 'testing',
                position: { x: 250, y: 100 + nodesAccum.length * 100 },
                data: {
                  ...card,
                  onAddTesting: () => handleAddTestingChild(card.id_testing_card.toString()),
                  onAddLearning: () => handleAddLearningChild(card.id_testing_card.toString()),
                  onEdit: () => {},
                  onDelete: () => {
                    // console.log('[FlowEditor] onDelete llamado con id_testing_card:', card.id_testing_card);
                    handleDeleteTestingCard(card.id_testing_card.toString());
                  },
                  onStatusChange: () => handleStatusChange(card.id_testing_card.toString()),
                }
              });
              setIsModalOpen(true);
            },
            onDelete: () => {
              // console.log('[FlowEditor] onDelete llamado con id_testing_card:', card.id_testing_card);
              handleDeleteTestingCard(card.id_testing_card.toString());
            },
            onStatusChange: () => handleStatusChange(card.id_testing_card.toString()),
          },
        };

        // console.log('[FlowEditor] Creando nodo con ID:', testingNode.id, 'para id_testing_card:', card.id_testing_card);
        nodesAccum.push(testingNode);

        // Crear nodos para Learning Cards
        // console.log('[FlowEditor] Tipo de learningCards:', typeof learningCards, 'Es array:', Array.isArray(learningCards), 'Valor:', learningCards);
        
        // Asegurar que learningCards sea un array válido antes del bucle
        if (!Array.isArray(learningCards)) {
          // console.warn('[FlowEditor] learningCards no es un array, convirtiendo...', learningCards);
          learningCards = [];
        }
        
        // console.log('[FlowEditor] learningCards final antes del bucle:', learningCards, 'Longitud:', learningCards.length);
        
        for (const lc of learningCards) {
          // console.log('[FlowEditor] Learning Card RAW desde API:', lc);
          // console.log('[FlowEditor] Campos disponibles en LC:', Object.keys(lc));
          // console.log('[FlowEditor] id_responsable RAW:', lc.id_responsable, 'tipo:', typeof lc.id_responsable);
          
          const learningCardData = convertToLearningCardData(lc);
          // console.log('[FlowEditor] Creando Learning Card:', {
          //   id_learning_card: learningCardData.id_learning_card,
          //   id_testing_card: learningCardData.id_testing_card,
          //   resultado: learningCardData.resultado,
          //   id_responsable: learningCardData.id_responsable
          // });
          
          // Obtener posición del nodo learning
          const learningNodeId = `learning-${learningCardData.id_learning_card}`;
          const learningPosition = getNodePosition('learning', learningCardData, nodesAccum, card.id_testing_card.toString(), savedPositions);
          
          nodesAccum.push({
            id: learningNodeId,
            type: 'learning',
            position: learningPosition,
            data: { 
              ...learningCardData,
              onEdit: () => {
                // console.log('[FlowEditor] Editar Learning Card id_learning_card:', learningCardData.id_learning_card);
                setEditingNode({
                  id: `learning-${learningCardData.id_learning_card}`,
                  type: 'learning',
                  position: { x: 450, y: testingNode.position.y + 200 + (learningCards.indexOf(lc) * 150) },
                  data: { ...learningCardData, onEdit: () => {}, onDelete: () => handleDeleteLearningCard(learningCardData.id_learning_card.toString()) }
                });
                setIsModalOpen(true);
              },
              onDelete: () => {
                // console.log('[FlowEditor] Eliminar Learning Card id_learning_card:', learningCardData.id_learning_card);
                handleDeleteLearningCard(learningCardData.id_learning_card.toString());
              }
            },
          });
        }
      }

      setNodes(nodesAccum);
      generarConexiones(testingCards, nodesAccum);
    } catch (error) {
      console.error('[FlowEditor] Error cargando datos:', error);
    }
  };

  useEffect(() => {
    // Solo intenta cargar datos si no acabas de crear la primera Testing Card
    if (nodes.length === 0) {
      fetchInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSecuencia]);

  const crearPrimeraTestingCard = async () => {
    if (!idSecuencia) return;
    try {
      const payload = {
        id_secuencia: Number(idSecuencia),
        titulo: 'Primer experimento', // >= 3 caracteres
        hipotesis: 'Hipótesis inicial de prueba', // >= 10 caracteres
        id_experimento_tipo: 15, // Debe existir en tu catálogo
        descripcion: 'Descripción inicial de prueba', // >= 10 caracteres
        dia_inicio: new Date().toISOString().slice(0, 10),
        dia_fin: new Date().toISOString().slice(0, 10),
        id_responsable: 13, // Cambia por el id de usuario real si lo tienes
        status: 'EN PLANEACION'
      };
      // console.log('[FlowEditor] Enviando payload para crear Testing Card:', payload);
      const nuevaCard = await crearTestingCard(payload);
      // console.log('[FlowEditor] Respuesta al crear Testing Card:', nuevaCard);
      // En vez de fetchInitialData, agrega el nodo directamente
      const testingNode = {
        id: `testing-${nuevaCard.id_testing_card}`,
        type: 'testing',
        position: calculateDefaultPosition('testing', undefined, [], true),
        data: {
          ...nuevaCard,
          onAddTesting: () => handleAddTestingChild(nuevaCard.id_testing_card.toString()),
          onAddLearning: () => handleAddLearningChild(nuevaCard.id_testing_card.toString()),
          onEdit: () => {
            setEditingNode({
              id: `testing-${nuevaCard.id_testing_card}`,
              type: 'testing',
              position: { x: 250, y: 100 },
              data: {
                ...nuevaCard,
                onAddTesting: () => handleAddTestingChild(nuevaCard.id_testing_card.toString()),
                onAddLearning: () => handleAddLearningChild(nuevaCard.id_testing_card.toString()),
                onEdit: () => {},
                onDelete: () => handleDeleteTestingCard(nuevaCard.id_testing_card.toString()),
                onStatusChange: () => handleStatusChange(nuevaCard.id_testing_card.toString()),
              }
            });
            setIsModalOpen(true);
          },
          onDelete: () => handleDeleteTestingCard(nuevaCard.id_testing_card.toString()),
          onStatusChange: () => handleStatusChange(nuevaCard.id_testing_card.toString()),
        },
      };
      setNodes([testingNode]);
      setEdges([]); // Sin conexiones al inicio

      // Notificar al componente padre que cambió el conteo
      if (onTestingCardsChange) {
        onTestingCardsChange();
      }
    } catch (error) {
      console.error('[FlowEditor] Error creando primera Testing Card:', error);
    }
  };

  const handleAddTestingChild = async (padreId: string) => {
    try {
      // console.log('[FlowEditor] Creando Testing Card hija con padre_id:', padreId);
      
      const payload = {
        padre_id: parseInt(padreId, 10),
        id_secuencia: Number(idSecuencia), // Mismo id_secuencia que el padre
        titulo: `Nueva Testing Card ${Date.now()}`,
        hipotesis: 'Hipótesis (creemos que . . .) ',
        descripcion: 'Descripción (para eso haremos . . .)',
        dia_inicio: new Date().toISOString().slice(0, 10),
        dia_fin: new Date().toISOString().slice(0, 10),
        id_responsable: 13, // Valor por defecto
        id_experimento_tipo: 15, // Valor por defecto
        status: 'EN PLANEACION',
      };
      
      // console.log('[FlowEditor] Payload para Testing Card hija:', payload);
      const nuevaCard = await crearTestingCard(payload);
      // console.log('[FlowEditor] Nueva Testing Card hija creada:', nuevaCard);

      const nuevoNodo = {
        id: `testing-${nuevaCard.id_testing_card}`,
        type: 'testing',
        position: calculateDefaultPosition('testing', padreId, nodes),
        data: {
          ...nuevaCard,
          onAddTesting: () => handleAddTestingChild(nuevaCard.id_testing_card.toString()),
          onAddLearning: () => handleAddLearningChild(nuevaCard.id_testing_card.toString()),
          onEdit: () => {
            setEditingNode({
              id: `testing-${nuevaCard.id_testing_card}`,
              type: 'testing',
              position: { x: 250, y: 100 },
              data: {
                ...nuevaCard,
                onAddTesting: () => handleAddTestingChild(nuevaCard.id_testing_card.toString()),
                onAddLearning: () => handleAddLearningChild(nuevaCard.id_testing_card.toString()),
                onEdit: () => {},
                onDelete: () => handleDeleteTestingCard(nuevaCard.id_testing_card.toString()),
                onStatusChange: () => handleStatusChange(nuevaCard.id_testing_card.toString()),
              }
            });
            setIsModalOpen(true);
          },
          onDelete: () => handleDeleteTestingCard(nuevaCard.id_testing_card.toString()),
          onStatusChange: () => handleStatusChange(nuevaCard.id_testing_card.toString()),
        },
      };

      setNodes(nds => [...nds, nuevoNodo]);
      
      // Crear la conexión entre el padre y el hijo
      setEdges(eds => [
        ...eds,
        {
          id: `edge-testing-${padreId}-to-${nuevaCard.id_testing_card}`,
          source: `testing-${padreId}`,
          target: `testing-${nuevaCard.id_testing_card}`,
          sourceHandle: 'right',
          targetHandle: 'left',
          style: { stroke: '#6C63FF' },
        },
      ]);
      
      // Notificar al componente padre que cambió el conteo
      if (onTestingCardsChange) {
        onTestingCardsChange();
      }
      
    } catch (error) {
      console.error('[FlowEditor] Error creando Testing Card hija:', error);
    }
  };

  const handleAddLearningChild = async (testingCardId: string) => {
    try {
      const testingCardIdNumber = parseInt(testingCardId, 10);
      const nuevaLC = await crearLearningCard({
        id_testing_card: testingCardIdNumber,
        resultado: 'Nuevo aprendizaje',
        estado: 'ACEPTADA',
        id_responsable: 13, // Valor por defecto - puedes cambiar esto según tu lógica
      });

      // console.log('[FlowEditor] Nueva Learning Card creada:', nuevaLC);
      const learningCardData = convertToLearningCardData(nuevaLC);

      const nuevoNodo: Node = {
        id: `learning-${learningCardData.id_learning_card}`,
        type: 'learning',
        position: calculateDefaultPosition('learning', testingCardId, nodes),
        data: { 
          ...learningCardData,
          onEdit: () => {
            // console.log('[FlowEditor] Editar Learning Card id_learning_card:', learningCardData.id_learning_card);
            setEditingNode({
              id: `learning-${learningCardData.id_learning_card}`,
              type: 'learning',
              position: { x: 450, y: 300 + nodes.length * 100 },
              data: { ...learningCardData, onEdit: () => {}, onDelete: () => handleDeleteLearningCard(learningCardData.id_learning_card.toString()) }
            });
            setIsModalOpen(true);
          },
          onDelete: () => {
            // console.log('[FlowEditor] Eliminar Learning Card id_learning_card:', learningCardData.id_learning_card);
            handleDeleteLearningCard(learningCardData.id_learning_card.toString());
          }
        },
      };

      setNodes(nds => [...nds, nuevoNodo]);
      setEdges(eds => [
        ...eds,
        {
          id: `edge-${testingCardId}-to-learning-${learningCardData.id_learning_card}`,
          source: `testing-${testingCardId}`,
          target: `learning-${learningCardData.id_learning_card}`,
          sourceHandle: 'bottom',
          targetHandle: 'top',
        },
      ]);
    } catch (error) {
      console.error('Error creando Learning Card:', error);
    }
  };

  const generarConexiones = (testingCards: any[], allNodes: Node[]) => {
    const edges: Edge[] = [];

    testingCards.forEach(card => {
      if (card.padre_id) {
        edges.push({
          id: `edge-testing-${card.padre_id}-to-${card.id_testing_card}`,
          source: `testing-${card.padre_id}`,
          target: `testing-${card.id_testing_card}`,
          sourceHandle: 'right',
          targetHandle: 'left',
          style: { stroke: '#6C63FF' },
        });
      }

      const learningCards = allNodes.filter(n =>
        n.type === 'learning' && 
        (n.data as LearningCardData).id_testing_card === card.id_testing_card
      );

      learningCards.forEach(lc => {
        edges.push({
          id: `edge-testing-${card.id_testing_card}-to-learning-${(lc.data as LearningCardData).id_learning_card}`,
          source: `testing-${card.id_testing_card}`,
          target: lc.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          style: { stroke: '#06D6A0' },
        });
      });
    });

    setEdges(edges);
  };

  // Métodos de acción para nodos (implementaciones mínimas)
  const handleDeleteTestingCard = (id?: string) => {
    if (!id) {
      console.error('[FlowEditor] ID de Testing Card no definido');
      return;
    }
    
    // console.log('[FlowEditor] ==========================================');
    // console.log('[FlowEditor] INICIANDO ELIMINACIÓN');
    // console.log('[FlowEditor] ID de testing card a eliminar:', id);
    // console.log('[FlowEditor] ==========================================');
    
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      // Buscar el nodo a eliminar
      const nodeToDelete = nodes.find(n => 
        n.type === 'testing' && 
        (n.data as TestingCardData).id_testing_card?.toString() === deleteId
      );
      
      if (!nodeToDelete) {
        console.error('[FlowEditor] No se encontró el nodo a eliminar con id:', deleteId);
        return;
      }
      
      // console.log('[FlowEditor] Eliminando nodo:', nodeToDelete.id, 'con id_testing_card:', deleteId);
      
      // Eliminar del backend
      await eliminarTestingCard(parseInt(deleteId, 10));
      
      // Eliminar del frontend
      setNodes(nds => nds.filter(node => node.id !== nodeToDelete.id));
      setEdges(eds => eds.filter(edge => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id));
      
      // Notificar al componente padre que cambió el conteo
      if (onTestingCardsChange) {
        onTestingCardsChange();
      }
      
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error('[FlowEditor] Error eliminando Testing Card:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Métodos de eliminación para Learning Cards
  const handleDeleteLearningCard = (id?: string) => {
    if (!id) {
      console.error('[FlowEditor] ID de Learning Card no definido');
      return;
    }
    
    // console.log('[FlowEditor] ==========================================');
    // console.log('[FlowEditor] INICIANDO ELIMINACIÓN LEARNING CARD');
    // console.log('[FlowEditor] ID de learning card a eliminar:', id);
    // console.log('[FlowEditor] ==========================================');
    
    setDeleteLearningId(id);
    setShowDeleteLearningModal(true);
  };

  const handleConfirmDeleteLearning = async () => {
    if (!deleteLearningId) return;
    setIsDeletingLearning(true);
    try {
      // Buscar el nodo a eliminar
      const nodeToDelete = nodes.find(n => 
        n.type === 'learning' && 
        (n.data as LearningCardData).id_learning_card?.toString() === deleteLearningId
      );
      
      if (!nodeToDelete) {
        console.error('[FlowEditor] No se encontró el nodo Learning Card a eliminar con id:', deleteLearningId);
        return;
      }
      
      // console.log('[FlowEditor] Eliminando Learning Card nodo:', nodeToDelete.id, 'con id_learning_card:', deleteLearningId);
      
      // Eliminar del backend
      await eliminarLearningCard(parseInt(deleteLearningId, 10));
      
      // Eliminar del frontend
      setNodes(nds => nds.filter(node => node.id !== nodeToDelete.id));
      setEdges(eds => eds.filter(edge => edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id));
      
      setShowDeleteLearningModal(false);
      setDeleteLearningId(null);
    } catch (error) {
      console.error('[FlowEditor] Error eliminando Learning Card:', error);
    } finally {
      setIsDeletingLearning(false);
    }
  };

  const handleCancelDeleteLearning = () => {
    setShowDeleteLearningModal(false);
    setDeleteLearningId(null);
  };

  const handleStatusChange = (id: string) => {
    // Aquí puedes implementar la lógica real de cambio de estado
    // console.log('[FlowEditor] Cambiar status de Testing Card:', id);
    setNodes(nds => nds.map(node => {
      if (node.id === `testing-${id}` && node.type === 'testing' && 'status' in node.data) {
        const currentStatus = (node.data as TestingCardData).status;
        return {
          ...node,
          data: {
            ...node.data,
            status: currentStatus === 'EN PLANEACION' ? 'EN VALIDACION' : currentStatus === 'EN VALIDACION' ? 'EN ANALISIS' : currentStatus === 'EN ANALISIS' ? 'TERMINADO' : 'CANCELADO',
          },
        };
      }
      return node;
    }));
  };

  return (
    <div className="flow-editor">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_) => {
            // console.log('=== INFORMACIÓN DEL NODO ===');
            // console.log('Tipo:', node.type);
            // console.log('ID del nodo:', node.id);
            
            // if (node.type === 'learning') {
            //   const learningData = node.data as LearningCardData;
            //   console.log('--- Learning Card ---');
            //   console.log('ID Learning Card:', learningData.id_learning_card);
            //   console.log('ID Testing Card:', learningData.id_testing_card);
            //   console.log('Resultado:', learningData.resultado);
            //   console.log('Hallazgo:', learningData.hallazgo);
            //   console.log('Estado:', learningData.estado);
            //   console.log('ID Responsable:', learningData.id_responsable);
            //   console.log('Creado:', learningData.created_at);
            //   console.log('Actualizado:', learningData.updated_at);
            // } else if (node.type === 'testing') {
            //   const testingData = node.data as TestingCardData;
            //   console.log('--- Testing Card ---');
            //   console.log('ID Testing Card:', testingData.id_testing_card);
            //   console.log('Título:', testingData.titulo);
            //   console.log('Hipótesis:', testingData.hipotesis);
            //   console.log('Status:', testingData.status);
            //   console.log('ID Responsable:', testingData.id_responsable);
            //   console.log('Descripción:', testingData.descripcion);
            // }
            
            // console.log('Objeto completo:', node);
            // console.log('===========================');
          }}
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>

        {nodes.length === 0 && (
          <EmptyFlowState onCreateFirstNode={crearPrimeraTestingCard} />
        )}
      </ReactFlowProvider>

      {isModalOpen && editingNode && (
        editingNode.type === 'testing' ? (
          <TestingCardEditModal
            node={editingNode as Node<TestingCardData>}
            editingId={(editingNode.data as TestingCardData).id_testing_card} // <-- Aquí debe ir el id_testing_card
            onSave={(updatedData) => {
              // console.log('[FlowEditor] Objeto enviado para actualizar:', updatedData);
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === editingNode.id
                    ? { ...node, data: { ...node.data, ...updatedData } }
                    : node
                )
              );
              setIsModalOpen(false);
            }}
            onClose={() => setIsModalOpen(false)}
          />
        ) : (
          <LearningCardEditModal
            node={editingNode as Node<LearningCardData>}
            editingIdLC={(editingNode.data as LearningCardData).id_learning_card}
            onSave={(updatedData) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === editingNode.id
                    ? { ...node, data: { ...node.data, ...updatedData } }
                    : node
                )
              );
              setIsModalOpen(false);
            }}
            onClose={() => setIsModalOpen(false)}
          />
        )
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Testing Card"
        message={`¿Eliminar la Testing Card "${
          deleteId ? 
            (nodes.find(n => 
              n.type === 'testing' && 
              (n.data as TestingCardData).id_testing_card?.toString() === deleteId
            )?.data as TestingCardData)?.titulo || `con ID ${deleteId}`
            : ''
        }"? Esta acción no se puede deshacer. Considere que las testing card hijas se borraran también`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={showDeleteLearningModal}
        onClose={handleCancelDeleteLearning}
        onConfirm={handleConfirmDeleteLearning}
        title="Eliminar Learning Card"
        message={`¿Eliminar la Learning Card "${
          deleteLearningId ? 
            (nodes.find(n => 
              n.type === 'learning' && 
              (n.data as LearningCardData).id_learning_card?.toString() === deleteLearningId
            )?.data as LearningCardData)?.resultado || `con ID ${deleteLearningId}`
            : ''
        }"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeletingLearning}
      />
    </div>
  );
});

FlowEditor.displayName = 'FlowEditor';

export default FlowEditor;