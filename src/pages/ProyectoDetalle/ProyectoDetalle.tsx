import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { Proyecto } from '../../types/proyecto';
import { Secuencia, CreateSecuenciaData } from '../../types/secuencia';
import ActionDropdown from '../../components/ui-propios/ActionDropdown/ActionDropdown';
import ConfirmationModal from '../../components/ui-propios/ConfirmationModal/ConfirmationModal';
import EditarProyectoModal from './components/EditarProyectoModal';
import SecuenciasSection from './components/SecuenciasSection';
import FlowEditorSection from './components/FlowEditorSection';
import NuevaSecuenciaModal from './components/NuevaSecuenciaModal';
import ColaboradoresProyecto from './ColaboradoresProyecto';
import LiderProyecto from '../Proyectos/components/LiderProyecto';
import styles from './ProyectoDetalle.module.css';
import { eliminarSecuencia, obtenerSecuenciasPorProyecto, crearSecuencia } from '../../services/secuenciaService';
import { obtenerProyectoPorId } from '../../services/proyectosService';
import { eliminarProyecto } from '../../services/proyectosService';
import { obtenerTestingCardsPorSecuencia } from '../../services/testingCardService';


/**
 * Componente ProyectoDetalle
 * 
 * @component ProyectoDetalle
 * @description Página de detalle de un proyecto que muestra información completa,
 * secuencias asociadas y editor de flujo. Incluye funcionalidades de edición,
 * eliminación con confirmación y gestión de secuencias.
 * 
 * Características principales:
 * - Visualización completa de información del proyecto
 * - Dropdown de acciones (Editar/Borrar) en lugar de botón simple
 * - Gestión de secuencias con borrado seguro
 * - Editor de flujo integrado
 * - Modales de confirmación para acciones destructivas
 * - Estados de carga y manejo de errores
 * - URLs dinámicas que reflejan secuencia y cards seleccionadas
 * 
 * Funcionalidades de URL:
 * - /proyecto/:proyectoId - Vista base del proyecto
 * - /proyecto/:proyectoId/secuencia/:secuenciaId - Proyecto con secuencia específica
 * - /proyecto/:proyectoId/secuencia/:secuenciaId/testing-card/:testingCardId - Con testing card
 * - /proyecto/:proyectoId/secuencia/:secuenciaId/learning-card/:learningCardId - Con learning card
 * 
 * Funcionalidades de seguridad:
 * - Confirmación modal para eliminación de proyecto
 * - Confirmación modal para eliminación de secuencias
 * - Mensajes claros sobre irreversibilidad de acciones
 * - Estados de carga durante operaciones
 * 
 * @returns {JSX.Element} Página de detalle del proyecto
 */
const ProyectoDetalle: React.FC = () => {
  const { 
    proyectoId, 
    secuenciaId, 
    testingCardId, 
    learningCardId 
  } = useParams<{ 
    proyectoId: string;
    secuenciaId?: string;
    testingCardId?: string;
    learningCardId?: string;
  }>();
  
  const navigate = useNavigate();
  const location = useLocation();

  // @state: Datos principales
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [secuencias, setSecuencias] = useState<Secuencia[]>([]);
  const [secuenciaSeleccionada, setSecuenciaSeleccionada] = useState<Secuencia | null>(null);

  // @state: Control de modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNuevaSecuenciaModalOpen, setIsNuevaSecuenciaModalOpen] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);

  // @state: Estados de carga
  const [loading, setLoading] = useState(true);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  /**
   * Actualiza la URL basada en la selección actual
   * @function updateURL
   * @param {string} newSecuenciaId - ID de la secuencia
   * @param {string} [cardId] - ID de la card (testing o learning)
   * @param {'testing' | 'learning'} [cardType] - Tipo de card
   */
  const updateURL = (
    newSecuenciaId: string, 
    cardId?: string, 
    cardType?: 'testing' | 'learning'
  ) => {
    let newPath = `/proyecto/${proyectoId}/secuencia/${newSecuenciaId}`;
    
    if (cardId && cardType) {
      newPath += `/${cardType}-card/${cardId}`;
    }
    
    // Solo navegar si la URL ha cambiado
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  };

  /**
   * Maneja la selección de una testing card y actualiza la URL
   * @function handleTestingCardSelect
   * @param {string} cardId - ID de la testing card
   */
  const handleTestingCardSelect = (cardId: string) => {
    if (secuenciaSeleccionada) {
      updateURL(secuenciaSeleccionada.id, cardId, 'testing');
    }
  };

  /**
   * Maneja la selección de una learning card y actualiza la URL
   * @function handleLearningCardSelect
   * @param {string} cardId - ID de la learning card
   */
  const handleLearningCardSelect = (cardId: string) => {
    if (secuenciaSeleccionada) {
      updateURL(secuenciaSeleccionada.id, cardId, 'learning');
    }
  };

  /**
   * Maneja cuando se deselecciona una card
   * @function handleCardDeselect
   */
  const handleCardDeselect = () => {
    if (secuenciaSeleccionada) {
      updateURL(secuenciaSeleccionada.id);
    }
  };

  /**
   * Helper para recalcular conteos de testing cards
   * @function recalcularTestingCardsCount
   * @param {any[]} secuenciasArray - Array de secuencias del backend
   * @returns {Promise<Secuencia[]>} Secuencias mapeadas con conteos actualizados
   */
  const recalcularTestingCardsCount = async (secuenciasArray: any[]): Promise<Secuencia[]> => {
    const secuenciasFiltradas = secuenciasArray.filter(s => s && s.id !== undefined);

    // Calcular conteos de testing cards en paralelo para cada secuencia
    return await Promise.all(
      secuenciasFiltradas.map(async (s: any) => {
        let testingCardsCount = 0;
        try {
          const testingCards = await obtenerTestingCardsPorSecuencia(s.id);
          testingCardsCount = Array.isArray(testingCards) ? testingCards.length : 0;
        } catch (error) {
          console.warn(`Error al obtener testing cards para secuencia ${s.id}:`, error);
          testingCardsCount = 0;
        }

        return {
          id: s.id?.toString() ?? '',
          nombre: s.nombre ?? '',
          descripcion: s.descripcion ?? '',
          proyectoId: s.id_proyecto?.toString() ?? '',
          fechaCreacion: s.created_at ?? '',
          estado: s.estado || 'EN PLANEACION',
          dia_inicio: s.dia_inicio && s.dia_inicio !== '1970-01-01' ? s.dia_inicio : undefined,
          dia_fin: s.dia_fin && s.dia_fin !== '1970-01-01' ? s.dia_fin : undefined,
          testing_cards_count: testingCardsCount,
        };
      })
    );
  };

  /**
   * Efecto para cargar datos del proyecto y secuencias
   * @function useEffect
   */
  useEffect(() => {
    // Guarda contra condicion de carrera: al navegar rapido entre secuencias
    // quedaban dos fetch en vuelo y, si el mas viejo resolvia despues, pisaba
    // con datos rancios lo que ya habia puesto el mas reciente.
    let cancelado = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (proyectoId) {
          const id = Number(proyectoId);

          // 1. Obtener proyecto
          const proyectoData = await obtenerProyectoPorId(id);
          const proyectoMapeado: Proyecto = {
            ...proyectoData,
            // Asegura que los campos requeridos por el tipo estén presentes
            id: proyectoData.id,
            nombre: proyectoData.titulo,
            descripcion: proyectoData.descripcion,
            estado: proyectoData.estado.toLowerCase(),
            fecha_inicio: proyectoData.fecha_inicio || proyectoData.creado,
            fecha_fin_estimada: proyectoData.fecha_fin_estimada || '',
            creado: proyectoData.creado,
            colaboradores: [],
          };
          if (cancelado) return;
          setProyecto(proyectoMapeado);

          // 2. Obtener secuencias y calcular conteos de testing cards
          const secuenciasData = await obtenerSecuenciasPorProyecto(id);

          // Asegúrate de que sea un array
          const secuenciasArray = Array.isArray(secuenciasData) ? secuenciasData : [];

          // Usar helper para calcular conteos
          const secuenciasMapeadas = await recalcularTestingCardsCount(secuenciasArray);
          if (cancelado) return;
          setSecuencias(secuenciasMapeadas);

          // 3. Sincronizar secuencia seleccionada con URL
          if (secuenciaId) {
            const secuenciaFromURL = secuenciasMapeadas.find(s => s.id === secuenciaId);
            if (secuenciaFromURL) {
              setSecuenciaSeleccionada(secuenciaFromURL);
            } else if (secuenciasMapeadas.length > 0) {
              // Si la secuencia de la URL no existe, seleccionar la primera y actualizar URL
              setSecuenciaSeleccionada(secuenciasMapeadas[0]);
              updateURL(secuenciasMapeadas[0].id);
            }
          } else if (secuenciasMapeadas.length > 0) {
            // Si no hay secuencia en URL, seleccionar la primera y actualizar URL
            setSecuenciaSeleccionada(secuenciasMapeadas[0]);
            updateURL(secuenciasMapeadas[0].id);
          }
        }
      } catch (err) {
        if (cancelado) return;
        console.error('Error al cargar datos:', err);
        setProyecto(null);
        setSecuencias([]);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelado = true;
    };
  }, [proyectoId, secuenciaId]);

  /**
   * Efecto para manejar cambios en los parámetros de cards
   * @function useEffect
   */
  useEffect(() => {
    // Este efecto se ejecuta cuando cambian los parámetros de las cards
    if (testingCardId) {
      // @todo: Implementar lógica para seleccionar la testing card específica
    }
    
    if (learningCardId) {
      // @todo: Implementar lógica para seleccionar la learning card específica
    }
  }, [testingCardId, learningCardId]);

  /**
   * Formatea una fecha para mostrar en formato localizado
   * @function formatearFecha
   * @param {string} fecha - Fecha en formato ISO string
   * @returns {string} Fecha formateada en español
   */
  // Restaba un dia por fecha UTC 
  // const formatearFecha = (fecha: string) => {
  //   return new Date(fecha).toLocaleDateString('es-ES', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('T')[0].split('-');
    
    const fechaLocal = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  
    return fechaLocal.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  /**
   * Maneja la actualización de datos del proyecto
   * @function handleProyectoActualizado
   * @param {Proyecto} proyectoActualizado - Proyecto con datos actualizados
   */
  const handleProyectoActualizado = (proyectoActualizado: Proyecto) => {
    setProyecto(proyectoActualizado);
    setIsEditModalOpen(false);
  };

  /**
   * Maneja la selección de una secuencia
   * @function handleSecuenciaSelect
   * @param {Secuencia} secuencia - Secuencia seleccionada
   */
  const handleSecuenciaSelect = (secuencia: Secuencia) => {
    setSecuenciaSeleccionada(secuencia);
    updateURL(secuencia.id);
  };

  /**
   * Abre el modal para crear nueva secuencia
   * @function handleNuevaSecuencia
   */
  const handleNuevaSecuencia = () => {
    setIsNuevaSecuenciaModalOpen(true);
  };

  /**
   * Maneja la creación de una nueva secuencia
   * @function handleSecuenciaCreada
   * @param {CreateSecuenciaData} nuevaSecuenciaData - Datos de la nueva secuencia
   */
  const handleSecuenciaCreada = async (nuevaSecuenciaData: CreateSecuenciaData) => {
    try {
      // Llamar al endpoint real para crear la secuencia
      const secuenciaData: any = {
        nombre: nuevaSecuenciaData.nombre,
        descripcion: nuevaSecuenciaData.descripcion,
        id_proyecto: nuevaSecuenciaData.id_proyecto,
        estado: nuevaSecuenciaData.estado
      };

      // Solo agregar fechas si tienen valores válidos (no undefined)
      if (nuevaSecuenciaData.dia_inicio) {
        secuenciaData.dia_inicio = nuevaSecuenciaData.dia_inicio;
      }
      
      if (nuevaSecuenciaData.dia_fin) {
        secuenciaData.dia_fin = nuevaSecuenciaData.dia_fin;
      }

      await crearSecuencia(secuenciaData);

      // Refrescar la lista de secuencias desde el backend
      if (proyectoId) {
        const secuenciasData = await obtenerSecuenciasPorProyecto(Number(proyectoId));
        const secuenciasArray = Array.isArray(secuenciasData) ? secuenciasData : [];

        // Usar helper para calcular conteos
        const secuenciasMapeadas = await recalcularTestingCardsCount(secuenciasArray);
        setSecuencias(secuenciasMapeadas);
        // Seleccionar la última secuencia creada y navegar a ella
        if (secuenciasMapeadas.length > 0) {
          const nuevaSecuencia = secuenciasMapeadas[secuenciasMapeadas.length - 1];
          setSecuenciaSeleccionada(nuevaSecuencia);
          updateURL(nuevaSecuencia.id);
        }
      }
      setIsNuevaSecuenciaModalOpen(false);
    } catch (error: any) {
      console.error('Error al crear secuencia:', error);
      if (error.response) {
        console.error('Backend response:', error.response.data);
        // Mostrar el mensaje de error del backend si existe
        if (error.response.data && error.response.data.message) {
          alert('Error del backend: ' + error.response.data.message);
        } else if (typeof error.response.data === 'string') {
          alert('Error del backend: ' + error.response.data);
        } else {
          alert('Error desconocido del backend. Revisa la consola para más detalles.');
        }
      } else {
        alert('Error desconocido al crear la secuencia. Revisa la consola para más detalles.');
      }
    }
  };

  /**
   * Maneja la eliminación de una secuencia
   * @function handleEliminarSecuencia
   * @param {string} secuenciaId - ID de la secuencia a eliminar
   */
  const handleEliminarSecuencia = async (secuenciaId: string) => {
    try {
      await eliminarSecuencia(Number(secuenciaId));

      // Refrescar la lista de secuencias desde el backend
      if (proyectoId) {
        const secuenciasData = await obtenerSecuenciasPorProyecto(Number(proyectoId));
        const secuenciasArray = Array.isArray(secuenciasData) ? secuenciasData : [];

        // Usar helper para calcular conteos
        const secuenciasMapeadas = await recalcularTestingCardsCount(secuenciasArray);
        setSecuencias(secuenciasMapeadas);
        
        // Seleccionar la primera secuencia si existe y actualizar URL
        if (secuenciasMapeadas.length > 0) {
          setSecuenciaSeleccionada(secuenciasMapeadas[0]);
          updateURL(secuenciasMapeadas[0].id);
        } else {
          setSecuenciaSeleccionada(null);
          // Si no hay secuencias, navegar solo al proyecto
          navigate(`/proyecto/${proyectoId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error al eliminar secuencia:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  /**
   * Inicia el proceso de eliminación del proyecto
   * @function handleDeleteProject
   */
  const handleDeleteProject = () => {
    setShowDeleteProjectModal(true);
  };

  /**
   * Función para actualizar conteos cuando se crean/eliminan testing cards
   * @function actualizarConteoTestingCards
   */
  const actualizarConteoTestingCards = async () => {
    if (proyectoId) {
      try {
        const secuenciasData = await obtenerSecuenciasPorProyecto(Number(proyectoId));
        const secuenciasArray = Array.isArray(secuenciasData) ? secuenciasData : [];

        // Usar helper para calcular conteos
        const secuenciasMapeadas = await recalcularTestingCardsCount(secuenciasArray);
        setSecuencias(secuenciasMapeadas);

        // Mantener la secuencia seleccionada actualizada
        if (secuenciaSeleccionada) {
          const secuenciaActualizada = secuenciasMapeadas.find(s => s.id === secuenciaSeleccionada.id);
          if (secuenciaActualizada) {
            setSecuenciaSeleccionada(secuenciaActualizada);
          }
        }
      } catch (error) {
        console.error('Error al actualizar conteos de testing cards:', error);
      }
    }
  };

  /**
   * Confirma y ejecuta la eliminación del proyecto
   * @function handleConfirmDeleteProject
   */
  const handleConfirmDeleteProject = async () => {
    if (!proyecto) return;

    setIsDeletingProject(true);

    try {
      // Llamada al servicio de eliminación
      await eliminarProyecto(Number(proyecto.id));
      
      // Feedback de éxito (podría implementarse con un toast/notificación)
      
      // Redirigir a la lista de proyectos
      //navigator('/proyectos');
      
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      
      // Mostrar feedback al usuario (podría implementarse con un modal/notificación)
      alert('No se pudo eliminar el proyecto. Por favor intente nuevamente.');
      
    } finally {
      setIsDeletingProject(false);
      setShowDeleteProjectModal(false);
    }
  };

  /**
   * Cancela la eliminación del proyecto
   * @function handleCancelDeleteProject
   */
  const handleCancelDeleteProject = () => {
    setShowDeleteProjectModal(false);
  };

  /**
   * Guarda los cambios del editor de flujo
   * @function handleGuardarCambios
   */
  const handleGuardarCambios = () => {
    // @todo: Implementar lógica para guardar los cambios del FlowEditor
  };

  /**
   * Configuración de acciones para el dropdown
   * @constant dropdownActions
   */
  const dropdownActions = [
    {
      id: 'edit',
      label: 'Editar',
      icon: <Edit size={16} />,
      onClick: () => setIsEditModalOpen(true),
      type: 'default' as const
    },
    {
      id: 'delete',
      label: 'Borrar',
      icon: <Trash2 size={16} />,
      onClick: handleDeleteProject,
      type: 'danger' as const
    }
  ];

  // @render: Estado de carga
  if (loading) {
    return (
      <div className={styles['proyecto-detalle-container']}>
        <div className={styles['proyecto-detalle-content']}>
          <div className={styles['loading-state']}>
            Cargando proyecto...
          </div>
        </div>
      </div>
    );
  }

  // @render: Proyecto no encontrado
  if (!proyecto) {
    return (
      <div className={styles['proyecto-detalle-container']}>
        <div className={styles['proyecto-detalle-content']}>
          <div className={styles['loading-state']}>
            Proyecto no encontrado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['proyecto-detalle-container']}>
      <div className={styles['proyecto-detalle-content']}>
        {/* @section: Header del proyecto */}
        <div className={styles['proyecto-header']}>
          <div className={styles['proyecto-header-top']}>
            <div className={styles['proyecto-info']}>
              <h1 className={styles['proyecto-nombre']}>{proyecto.nombre}</h1>
              <p className={styles['proyecto-descripcion']}>{proyecto.descripcion}</p>
            </div>

            {/* @component: Dropdown de acciones reemplazando botón Editar */}
            <ActionDropdown
              actions={dropdownActions}
              position="bottom-right"
            />
          </div>

          {/* @section: Metadata del proyecto */}
          <div className={styles['proyecto-meta']}>
            <div className={styles['meta-section']}>
              <span className={styles['meta-label']}>Colaboradores:</span>
              <ColaboradoresProyecto idProyecto={Number(proyecto.id)} />
            </div>

            <div className={styles['meta-section']}>
              <span className={styles['meta-label']}>Fecha de inicio:</span>
              <span className={styles['proyecto-fecha']}>
                {formatearFecha(proyecto.fecha_inicio)}
              </span>
            </div>

            <div className={styles['meta-section']}>
              <span className={styles['meta-label']}>Líder:</span>
              <LiderProyecto idProyecto={Number(proyecto.id)} />
            </div>
          </div>
        </div>

        {/* @section: Secuencias del proyecto */}
        <SecuenciasSection
          idProyecto={Number(proyecto.id)}
          secuencias={secuencias}
          secuenciaSeleccionada={secuenciaSeleccionada}
          tituloProyecto={proyecto.nombre}
          onSecuenciaSelect={handleSecuenciaSelect}
          onNuevaSecuencia={handleNuevaSecuencia}
          onEliminarSecuencia={handleEliminarSecuencia}
          onEditarSecuencia={async () => {
            if (proyectoId) {
              const secuenciasData = await obtenerSecuenciasPorProyecto(Number(proyectoId));
              const secuenciasArray = Array.isArray(secuenciasData) ? secuenciasData : [];

              // Usar helper para calcular conteos
              const secuenciasMapeadas = await recalcularTestingCardsCount(secuenciasArray);
              setSecuencias(secuenciasMapeadas);
              // Mantener la secuencia seleccionada si existe
              if (secuenciaSeleccionada) {
                const actualizada = secuenciasMapeadas.find(s => s.id === secuenciaSeleccionada.id);
                setSecuenciaSeleccionada(actualizada || (secuenciasMapeadas[0] ?? null));
                // Actualizar URL con la secuencia actualizada o la primera disponible
                if (actualizada) {
                  updateURL(actualizada.id);
                } else if (secuenciasMapeadas.length > 0) {
                  updateURL(secuenciasMapeadas[0].id);
                }
              } else if (secuenciasMapeadas.length > 0) {
                setSecuenciaSeleccionada(secuenciasMapeadas[0]);
                updateURL(secuenciasMapeadas[0].id);
              }
            }
          }}
        />

        {/* @section: Editor de flujo */}
        <FlowEditorSection
          secuenciaSeleccionada={secuenciaSeleccionada}
          onGuardarCambios={handleGuardarCambios}
          onTestingCardsChange={actualizarConteoTestingCards}
          onTestingCardSelect={handleTestingCardSelect}
          onLearningCardSelect={handleLearningCardSelect}
          onCardDeselect={handleCardDeselect}
          selectedTestingCardId={testingCardId}
          selectedLearningCardId={learningCardId}
        />

        {/* @component: Modal de edición de proyecto */}
        <EditarProyectoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          proyecto={proyecto}
          onProyectoActualizado={handleProyectoActualizado}
        />

        {/* @component: Modal de nueva secuencia */}
        <NuevaSecuenciaModal
          isOpen={isNuevaSecuenciaModalOpen}
          onClose={() => setIsNuevaSecuenciaModalOpen(false)}
          proyectoId={proyecto.id}
          onSecuenciaCreada={handleSecuenciaCreada}
        />

        {/* @component: Modal de confirmación de eliminación de proyecto */}
        <ConfirmationModal
          isOpen={showDeleteProjectModal}
          onClose={handleCancelDeleteProject}
          onConfirm={handleConfirmDeleteProject}
          title="Borrar Proyecto"
          message={`¿Estás seguro de que quieres borrar el proyecto "${proyecto.nombre}"? Esta acción eliminará todas las secuencias y datos asociados y no puede deshacerse.`}
          confirmText="Confirmar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeletingProject}
        />
      </div>
    </div>
  );
};

export default ProyectoDetalle;