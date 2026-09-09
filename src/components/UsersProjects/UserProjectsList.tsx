/**
 * Componente para renderizar y gestionar los proyectos asociados a un usuario específico.
 * Permite visualizar todos los proyectos asignados al usuario y eliminar la relación usuario-proyecto.
 */

import React, { useEffect, useState } from 'react';
import { eliminarUsuarioProyecto } from '../../services/usuarioProyectoServices';
import { obtenerProyectoPorId, obtenerProyectosPorIdUsuario } from '../../services/proyectosService';
import styles from './UserProjectsList.module.css';

/**
 * Interfaz que define la estructura de un proyecto con su información completa
 * @interface ProyectoCompleto
 * @property {number} id_proyecto - Identificador único del proyecto
 * @property {string} nombre - Nombre descriptivo del proyecto
 */
interface ProyectoCompleto {
  id_proyecto: number;
  nombre: string;
}

/**
 * Props para el componente UserProjectsList
 * @interface UserProjectsListProps
 */
interface UserProjectsListProps {
  /** ID del usuario cuyos proyectos se van a mostrar */
  userId: string;
  /** Callback que se ejecuta cuando se selecciona un proyecto */
  onProjectSelect?: (projectId: number) => void;
  /** Callback que se ejecuta cuando se elimina un proyecto del usuario */
  onProjectRemoved?: () => void;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente para gestionar la lista de proyectos de un usuario específico
 * 
 * @component UserProjectsList
 * @description Este componente se encarga de mostrar todos los proyectos asignados
 * a un usuario específico. Para cada proyecto muestra su nombre y proporciona
 * funcionalidad para eliminarlo de la asignación del usuario.
 * 
 * Características principales:
 * - Carga proyectos asignados al usuario desde el backend
 * - Obtiene información completa de cada proyecto (nombre, etc.)
 * - Permite eliminar la relación usuario-proyecto
 * - Maneja estados de carga y error
 * - Interfaz responsive con botones de acción
 * 
 * @example
 * ```tsx
 * <UserProjectsList
 *   userId="123e4567-e89b-12d3-a456-426614174000"
 *   onProjectSelect={(projectId) => console.log('Proyecto seleccionado:', projectId)}
 *   onProjectRemoved={() => console.log('Proyecto eliminado, recargar datos')}
 * />
 * ```
 * 
 * @param {UserProjectsListProps} props - Props del componente
 * @returns {JSX.Element} Lista de proyectos del usuario
 */
const UserProjectsList: React.FC<UserProjectsListProps> = ({
  userId,
  onProjectSelect,
  onProjectRemoved,
  className = ''
}) => {
  // @state: Lista de proyectos completos asignados al usuario
  const [proyectos, setProyectos] = useState<ProyectoCompleto[]>([]);
  
  // @state: Control del estado de carga durante las operaciones asíncronas
  const [loading, setLoading] = useState(false);
  
  // @state: Control del proyecto que se está eliminando para mostrar estado de carga
  const [removingProjectId, setRemovingProjectId] = useState<number | null>(null);

  /**
   * Effect que se ejecuta al montar el componente o cuando cambia el userId
   * Carga los proyectos asignados al usuario especificado
   */
  useEffect(() => {
    if (userId) {
      loadUserProjects();
    }
  }, [userId]);

  /**
   * Función asíncrona para cargar todos los proyectos asignados al usuario
   * Primero obtiene los IDs de proyectos asignados, luego carga la información
   * completa de cada proyecto para mostrar nombres descriptivos
   */
  const loadUserProjects = async () => {
    setLoading(true);
    try {
      // Obtener IDs de proyectos asignados al usuario
      const response = await obtenerProyectosPorIdUsuario(userId);
      
      // Extraer el array de proyectos de la respuesta
      const proyectosIds = (response as any)?.data || [];

      // Validar que se obtuvieron proyectos
      if (!Array.isArray(proyectosIds) || proyectosIds.length === 0) {
        setProyectos([]);
        return;
      }

      // Para cada ID de proyecto, obtener la información completa
      const proyectosCompletos = await Promise.all(
        proyectosIds.map(async (p: any) => {
          try {
            // Obtener información completa del proyecto
            const proyectoCompleto = await obtenerProyectoPorId(p.id_proyecto);
            return {
              id_proyecto: p.id_proyecto,
              // Manejar tanto 'titulo' como 'nombre' que pueden venir del backend
              nombre: p.titulo || proyectoCompleto.nombre || `Proyecto ${p.id_proyecto}`
            };
          } catch (error) {
            console.error(`Error cargando proyecto ${p.id_proyecto}:`, error);
            // En caso de error, usar titulo si está disponible o mostrar solo el ID
            return {
              id_proyecto: p.id_proyecto,
              nombre: p.titulo || `Proyecto ${p.id_proyecto}`
            };
          }
        })
      );

      setProyectos(proyectosCompletos);

    } catch (error) {
      console.error('❌ Error cargando proyectos del usuario:', error);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la eliminación de un proyecto de la asignación del usuario
   * Utiliza el servicio para eliminar la relación usuario-proyecto y actualiza la UI
   * 
   * @param {number} projectId - ID del proyecto a eliminar de la asignación
   */
  const handleRemoveProject = async (projectId: number) => {
    // Confirmación antes de eliminar
    const confirmRemoval = window.confirm(
      '¿Estás seguro de que quieres eliminar este proyecto del usuario? ' +
      'Esta acción no se puede deshacer.'
    );

    if (!confirmRemoval) return;

    setRemovingProjectId(projectId);
    
    try {
      // Eliminar la relación usuario-proyecto usando el servicio
      await eliminarUsuarioProyecto(userId, projectId);

      // Actualizar la lista local removiendo el proyecto eliminado
      setProyectos(prev => prev.filter(p => p.id_proyecto !== projectId));

      // Notificar al componente padre que se eliminó un proyecto
      onProjectRemoved?.();


    } catch (error) {
      console.error('❌ Error al eliminar proyecto del usuario:', error);
      alert('No se pudo eliminar el proyecto. Por favor, intenta nuevamente.');
    } finally {
      setRemovingProjectId(null);
    }
  };

  /**
   * Maneja el clic en un proyecto para notificar la selección
   * 
   * @param {number} projectId - ID del proyecto seleccionado
   */
  const handleProjectClick = (projectId: number) => {
    onProjectSelect?.(projectId);
  };

  // @render: Mostrar indicador de carga durante la carga inicial
  if (loading) {
    return (
      <div className={`${styles.projectsList} ${className}`}>
        <div className={styles.loading}>
          Cargando proyectos...
        </div>
      </div>
    );
  }

  // @render: Mostrar mensaje cuando no hay proyectos asignados
  if (proyectos.length === 0) {
    return (
      <div className={`${styles.projectsList} ${className}`}>
        <div className={styles.noProjects}>
          Sin proyectos asignados
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.projectsList} ${className}`}>
      {proyectos.map((proyecto) => (
        <div key={proyecto.id_proyecto} className={styles.projectItem}>
          {/* @section: Información del proyecto clickeable */}
          <button
            className={styles.projectInfo}
            onClick={() => handleProjectClick(proyecto.id_proyecto)}
            title={`Ver detalles del proyecto: ${proyecto.nombre}`}
          >
            <span className={styles.projectName}>
              {proyecto.nombre}
            </span>
            {/*<span className={styles.projectId}>
              ID: {proyecto.id_proyecto}
            </span>*/}
          </button>

          {/* @section: Botón para eliminar proyecto de la asignación */}
          <button
            className={`${styles.removeButton} ${removingProjectId === proyecto.id_proyecto ? styles.removing : ''}`}
            onClick={() => handleRemoveProject(proyecto.id_proyecto)}
            disabled={removingProjectId === proyecto.id_proyecto}
            title="Eliminar proyecto del usuario"
          >
            {removingProjectId === proyecto.id_proyecto ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserProjectsList;
