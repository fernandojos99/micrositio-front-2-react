/**
 * Componente específico para renderizar usuarios de tipo EDITOR.
 * Incluye información del empleado asociado, estado activo/inactivo y dropdown de acciones específicas.
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, FolderPlus } from 'lucide-react';
import { Usuario, darBajaUsuario, darAltaUsuario } from '../../services/usuarioService';
import ActionDropdown from '../ui/ActionDropdown/ActionDropdown';
import ConfirmationModal from '../ui/ConfirmationModal/ConfirmationModal';
import UserProjectsList from './UserProjectsList';
import AssignProjectModal from './AssignProjectModal';
import useEmpleados from '../../hooks/useEmpleados';
import styles from './EditorUserItem.module.css';

/**
 * Props para el componente EditorUserItem
 * @interface EditorUserItemProps
 */
interface EditorUserItemProps {
  /** Datos del usuario editor */
  usuario: Usuario;
  /** Callback que se ejecuta cuando se selecciona el usuario */
  onUserSelect?: (userId: string) => void;
  /** Callback que se ejecuta cuando se actualiza el estado del usuario */
  onUserUpdated?: () => void;
  /** ID del usuario actualmente seleccionado */
  selectedUserId?: string;
}

/**
 * Componente para renderizar un usuario de tipo EDITOR
 * 
 * @component EditorUserItem
 * @description Este componente se especializa en mostrar usuarios de tipo EDITOR
 * con información del empleado asociado y acciones específicas disponibles.
 * Incluye funcionalidad para cambiar estado activo/inactivo y asignar proyectos.
 * Cada editor se muestra con información del empleado y su estado actual.
 * 
 * Características principales:
 * - Información del empleado asociado (nombre completo)
 * - Indicador visual del estado activo/inactivo
 * - Dropdown de acciones contextual (asignar, activar/desactivar)
 * - Lista de proyectos asignados integrada
 * - Modales de confirmación para cambios de estado
 * - Modal de asignación de proyectos
 * - Estados visuales diferenciados por estado del usuario
 * 
 * Acciones disponibles para editores:
 * - Asignar proyecto: Abre modal para asignar nuevos proyectos
 * - Pasar a inactivo: Desactiva al usuario (con confirmación)
 * - Pasar a activo: Activa al usuario (con confirmación)
 * 
 * @example
 * ```tsx
 * <EditorUserItem
 *   usuario={editorUser}
 *   onUserSelect={(userId) => setSelectedUser(userId)}
 *   onUserUpdated={() => reloadUsers()}
 *   selectedUserId={selectedUserId}
 * />
 * ```
 * 
 * @param {EditorUserItemProps} props - Props del componente
 * @returns {JSX.Element} Item de usuario editor
 */
const EditorUserItem: React.FC<EditorUserItemProps> = ({
  usuario,
  onUserSelect,
  onUserUpdated,
  selectedUserId
}) => {
  // @hook: Manejo de empleados para obtener información del empleado asociado
  const { empleadosMap, obtenerEmpleado } = useEmpleados();
  
  // @state: Control del modal de confirmación para cambiar estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // @state: Control del modal para asignar proyectos
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // @state: Control del estado de carga durante cambios de estado
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // @state: Tipo de acción de estado que se va a ejecutar
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('deactivate');

  /**
   * Effect para cargar información del empleado asociado si existe
   * Se ejecuta cuando cambia el usuario o cuando se actualiza el mapeo de empleados
   */
  useEffect(() => {
    if (usuario.id_empleado && !empleadosMap[usuario.id_empleado]) {
      // Cargar empleado si no está en cache
      obtenerEmpleado(usuario.id_empleado).catch(error => {
        console.error('Error cargando empleado asociado:', error);
      });
    }
  }, [usuario.id_empleado, empleadosMap, obtenerEmpleado]);

  /**
   * Maneja el clic en el usuario para seleccionarlo
   * Notifica al componente padre sobre la selección
   */
  const handleUserClick = () => {
    onUserSelect?.(usuario.id_usuario);
  };

  /**
   * Maneja la asignación de proyectos al usuario
   * Abre el modal de asignación de proyectos
   */
  const handleAssignProject = () => {
    setShowAssignModal(true);
  };

  /**
   * Prepara y muestra el modal para pasar usuario a inactivo
   */
  const handleDeactivateUser = () => {
    setStatusAction('deactivate');
    setShowStatusModal(true);
  };

  /**
   * Prepara y muestra el modal para pasar usuario a activo
   */
  const handleActivateUser = () => {
    setStatusAction('activate');
    setShowStatusModal(true);
  };

  /**
   * Ejecuta el cambio de estado del usuario (activo/inactivo)
   * Utiliza los servicios correspondientes según la acción
   */
  const handleStatusChange = async () => {
    setIsUpdatingStatus(true);
    
    try {
      if (statusAction === 'deactivate') {
        // Dar de baja al usuario (pasar a inactivo)
        await darBajaUsuario(usuario.id_usuario);
        console.log('✅ Usuario desactivado exitosamente');
      } else {
        // Dar de alta al usuario (pasar a activo)
        await darAltaUsuario(usuario.id_usuario);
        console.log('✅ Usuario activado exitosamente');
      }
      
      // Cerrar modal de confirmación
      setShowStatusModal(false);
      
      // Notificar al componente padre que se actualizó el usuario
      onUserUpdated?.();
      
    } catch (error) {
      console.error(`❌ Error al ${statusAction === 'deactivate' ? 'desactivar' : 'activar'} usuario:`, error);
      alert(`No se pudo ${statusAction === 'deactivate' ? 'desactivar' : 'activar'} el usuario. Por favor, intenta nuevamente.`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Maneja cuando se asigna exitosamente un proyecto
   * Notifica al componente padre para recargar datos
   */
  const handleProjectAssigned = () => {
    onUserUpdated?.();
  };

  /**
   * Maneja cuando se elimina un proyecto del usuario
   * Notifica al componente padre para recargar datos
   */
  const handleProjectRemoved = () => {
    onUserUpdated?.();
  };

  // Obtener información del empleado asociado
  const empleadoAsociado = usuario.id_empleado ? empleadosMap[usuario.id_empleado] : null;

  // Determinar si este usuario está seleccionado
  const isSelected = selectedUserId === usuario.id_usuario;

  // Configuración de acciones del dropdown para usuarios editores
  const dropdownActions = [
    {
      id: 'assign-project',
      label: 'Asignar proyecto',
      icon: <FolderPlus size={16} />,
      onClick: handleAssignProject,
      type: 'default' as const
    },
    ...(usuario.activo ? [
      {
        id: 'deactivate-user',
        label: 'Pasar a inactivo',
        icon: <UserX size={16} />,
        onClick: handleDeactivateUser,
        type: 'default' as const
      }
    ] : [
      {
        id: 'activate-user',
        label: 'Pasar a activo',
        icon: <UserCheck size={16} />,
        onClick: handleActivateUser,
        type: 'default' as const
      }
    ])
  ];

  return (
    <>
      <div className={`${styles.editorItem} ${isSelected ? styles.selected : ''} ${!usuario.activo ? styles.inactive : ''}`}>
        {/* @section: Encabezado del usuario con información y dropdown de acciones */}
        <div className={styles.userHeader}>
          <div 
            className={styles.userInfo}
            onClick={handleUserClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserClick();
              }
            }}
          >
            <div className={styles.userMainInfo}>
              <div className={styles.userIdentity}>
                <strong className={styles.userAlias}>{usuario.alias}</strong>
                {empleadoAsociado && (
                  <span className={styles.empleadoName}>
                    ({empleadoAsociado.nombreCompleto})
                  </span>
                )}
              </div>
              
              <div className={styles.userBadges}>
                <span className={styles.userType}>EDITOR</span>
                <span className={`${styles.userStatus} ${usuario.activo ? styles.active : styles.inactive}`}>
                  {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
            
            {/* Información adicional del usuario */}
            <div className={styles.userDetails}>
              {empleadoAsociado && (
                <span className={styles.empleadoInfo}>
                 {/* Empleado #{empleadoAsociado.numero_empleado} |*/} {empleadoAsociado.correo}
                </span>
              )}
              {/*<span className={styles.userId}>
                ID: {usuario.id_usuario}
              </span>*/}
            </div>
          </div>

          {/* Dropdown de acciones específicas para editores */}
          <div className={styles.userActions}>
            <ActionDropdown
              actions={dropdownActions}
              position="bottom-right"
            />
          </div>
        </div>

        {/* @section: Lista de proyectos asignados al usuario */}
        <div className={styles.projectsSection}>
          <UserProjectsList
            userId={usuario.id_usuario}
            onProjectRemoved={handleProjectRemoved}
          />
        </div>
      </div>

      {/* @section: Modal de confirmación para cambiar estado */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
        title={statusAction === 'deactivate' ? 'Desactivar Usuario Editor' : 'Activar Usuario Editor'}
        message={
          statusAction === 'deactivate'
            ? `¿Estás seguro de que quieres desactivar al usuario "${usuario.alias}"? El usuario no podrá acceder al sistema mientras esté inactivo.`
            : `¿Estás seguro de que quieres activar al usuario "${usuario.alias}"? El usuario podrá acceder nuevamente al sistema.`
        }
        confirmText={statusAction === 'deactivate' ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        type={statusAction === 'deactivate' ? 'warning' : 'info'}
        isLoading={isUpdatingStatus}
      />

      {/* @section: Modal para asignar proyectos */}
      <AssignProjectModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        userId={usuario.id_usuario}
        onProjectAssigned={handleProjectAssigned}
      />
    </>
  );
};

export default EditorUserItem;
