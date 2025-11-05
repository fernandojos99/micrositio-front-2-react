/**
 * Modal para asignar proyectos a un usuario específico.
 * Muestra todos los proyectos disponibles y permite asignar uno o varios al usuario.
 */

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { obtenerProyectos, obtenerProyectosPorIdUsuario } from '../../services/proyectosService';
import { crearUsuarioProyecto } from '../../services/usuarioProyectoServices';
import Button from '../ui/Button/Button';
import styles from './AssignProjectModal.module.css';

/**
 * Interfaz que define la estructura básica de un proyecto
 * @interface Proyecto
 * @property {number} id_proyecto - Identificador único del proyecto
 * @property {string} nombre - Nombre descriptivo del proyecto
 */
interface Proyecto {
  id_proyecto: number;
  nombre: string;
}

/**
 * Props para el componente AssignProjectModal
 * @interface AssignProjectModalProps
 */
interface AssignProjectModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** ID del usuario al que se van a asignar proyectos */
  userId: string;
  /** Callback que se ejecuta cuando se asigna exitosamente un proyecto */
  onProjectAssigned?: () => void;
}

/**
 * Modal para la asignación de proyectos a usuarios
 * 
 * @component AssignProjectModal
 * @description Este componente proporciona una interfaz modal para asignar
 * proyectos disponibles a un usuario específico. Muestra todos los proyectos
 * del sistema, excluyendo aquellos que ya están asignados al usuario actual.
 * 
 * Características principales:
 * - Carga todos los proyectos disponibles del sistema
 * - Filtra proyectos ya asignados al usuario actual
 * - Permite asignar múltiples proyectos de forma individual
 * - Maneja estados de carga y error
 * - Interfaz modal accesible con cierre por ESC
 * - Actualización automática tras asignaciones exitosas
 * 
 * @example
 * ```tsx
 * <AssignProjectModal
 *   isOpen={showAssignModal}
 *   onClose={() => setShowAssignModal(false)}
 *   userId="123e4567-e89b-12d3-a456-426614174000"
 *   onProjectAssigned={() => {
 *     // Recargar datos del usuario
 *     loadUserData();
 *   }}
 * />
 * ```
 * 
 * @param {AssignProjectModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de asignación de proyectos
 */
const AssignProjectModal: React.FC<AssignProjectModalProps> = ({
  isOpen,
  onClose,
  userId,
  onProjectAssigned
}) => {
  // @state: Lista de todos los proyectos disponibles en el sistema
  const [allProjects, setAllProjects] = useState<Proyecto[]>([]);
  
  // @state: Lista de proyectos ya asignados al usuario actual
  const [assignedProjectIds, setAssignedProjectIds] = useState<number[]>([]);
  
  // @state: Control del estado de carga durante la carga inicial
  const [loading, setLoading] = useState(false);
  
  // @state: Control del proyecto que se está asignando para mostrar estado de carga
  const [assigningProjectId, setAssigningProjectId] = useState<number | null>(null);

  /**
   * Effect que se ejecuta cuando el modal se abre
   * Carga todos los proyectos disponibles y los ya asignados al usuario
   */
  useEffect(() => {
    if (isOpen && userId) {
      loadModalData();
    }
  }, [isOpen, userId]);

  /**
   * Effect para manejar el cierre del modal con la tecla ESC
   * y prevenir el scroll del body cuando el modal está abierto
   */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !assigningProjectId) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, assigningProjectId]);

  /**
   * Función asíncrona para cargar todos los datos necesarios del modal
   * Carga tanto los proyectos disponibles como los ya asignados al usuario
   */
  const loadModalData = async () => {
    setLoading(true);
    try {
      // Cargar todos los proyectos disponibles y los asignados al usuario en paralelo
      const [todosProyectos, proyectosAsignados] = await Promise.all([
        obtenerProyectos(),
        obtenerProyectosPorIdUsuario(userId)
      ]);

      console.log('🔍 Todos los proyectos:', todosProyectos);
      console.log('🔍 Proyectos asignados al usuario:', proyectosAsignados);

      // Procesar proyectos disponibles
      const proyectosFormateados = Array.isArray(todosProyectos) 
        ? todosProyectos.map(p => ({
            id_proyecto: p.id_proyecto,
            nombre: p.nombre || `Proyecto ${p.id_proyecto}`
          }))
        : [];

      // Extraer IDs de proyectos ya asignados - manejar la estructura de respuesta
      const proyectosAsignadosArray = (proyectosAsignados as any)?.data || [];
      const idsAsignados = Array.isArray(proyectosAsignadosArray)
        ? proyectosAsignadosArray.map((p: any) => p.id_proyecto)
        : [];

      setAllProjects(proyectosFormateados);
      setAssignedProjectIds(idsAsignados);

    } catch (error) {
      console.error('❌ Error cargando datos del modal:', error);
      alert('Error al cargar los proyectos disponibles');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la asignación de un proyecto específico al usuario
   * Utiliza el servicio para crear la relación usuario-proyecto
   * 
   * @param {number} projectId - ID del proyecto a asignar
   */
  const handleAssignProject = async (projectId: number) => {
    setAssigningProjectId(projectId);

    try {
      // Crear la relación usuario-proyecto usando el servicio
      await crearUsuarioProyecto({
        id_usuario: Number(userId),
        id_proyecto: projectId
      });

      // Actualizar la lista local de proyectos asignados
      setAssignedProjectIds(prev => [...prev, projectId]);

      // Notificar al componente padre que se asignó un proyecto
      onProjectAssigned?.();

      console.log('✅ Proyecto asignado exitosamente al usuario');

    } catch (error) {
      console.error('❌ Error al asignar proyecto al usuario:', error);
      alert('No se pudo asignar el proyecto. Por favor, intenta nuevamente.');
    } finally {
      setAssigningProjectId(null);
    }
  };

  /**
   * Maneja el clic en el backdrop para cerrar el modal
   * Solo cierra si no hay una operación en progreso
   * 
   * @param {React.MouseEvent} e - Evento de clic
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !assigningProjectId) {
      onClose();
    }
  };

  // Filtrar proyectos disponibles (no asignados al usuario)
  const availableProjects = allProjects.filter(
    project => !assignedProjectIds.includes(project.id_proyecto)
  );

  // @render: No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        {/* @section: Header del modal con título y botón de cierre */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Asignar Proyecto al Usuario
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={assigningProjectId !== null}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* @section: Cuerpo del modal con lista de proyectos */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loading}>
              Cargando proyectos disponibles...
            </div>
          ) : availableProjects.length === 0 ? (
            <div className={styles.noProjects}>
              {allProjects.length === 0 
                ? 'No hay proyectos disponibles en el sistema'
                : 'Todos los proyectos ya están asignados a este usuario'
              }
            </div>
          ) : (
            <div className={styles.projectsList}>
              <p className={styles.instruction}>
                Selecciona los proyectos que deseas asignar al usuario:
              </p>
              
              {availableProjects.map((project) => (
                <div key={project.id_proyecto} className={styles.projectItem}>
                  {/* @section: Información del proyecto */}
                  <div className={styles.projectInfo}>
                    <span className={styles.projectName}>
                      {project.nombre}
                    </span>
                    <span className={styles.projectId}>
                      ID: {project.id_proyecto}
                    </span>
                  </div>

                  {/* @section: Botón para asignar proyecto */}
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleAssignProject(project.id_proyecto)}
                    disabled={assigningProjectId !== null}
                    className={styles.assignButton}
                  >
                    {assigningProjectId === project.id_proyecto ? 'Asignando...' : 'Asignar'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* @section: Footer del modal con botón de cerrar */}
        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assigningProjectId !== null}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectModal;
