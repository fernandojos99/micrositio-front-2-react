/**
 * Componente específico para renderizar usuarios de tipo VISITANTE.
 * Incluye información del usuario, sus proyectos asignados y dropdown de acciones específicas.
 */

import React, { useState } from 'react';
import { UserPlus, UserX, FolderPlus } from 'lucide-react';
import { Usuario, eliminarUsuario, actualizarTipoUsuario } from '../../services/usuarioService';
import ActionDropdown from '../ui-propios/ActionDropdown/ActionDropdown';
import ConfirmationModal from '../ui-propios/ConfirmationModal/ConfirmationModal';
import UserProjectsList from './UserProjectsList';
import AssignProjectModal from './AssignProjectModal';
import styles from './VisitanteUserItem.module.css';

/**
 * Props para el componente VisitanteUserItem
 * @interface VisitanteUserItemProps
 */
interface VisitanteUserItemProps {
  /** Datos del usuario visitante */
  usuario: Usuario;
  /** Callback que se ejecuta cuando se selecciona el usuario */
  onUserSelect?: (userId: string) => void;
  /** Callback que se ejecuta cuando el usuario es eliminado */
  onUserDeleted?: () => void;
  /** Callback que se ejecuta cuando se actualiza la información del usuario */
  onUserUpdated?: () => void;
  /** ID del usuario actualmente seleccionado */
  selectedUserId?: string;
}

/**
 * Componente para renderizar un usuario de tipo VISITANTE
 * 
 * @component VisitanteUserItem
 * @description Este componente se especializa en mostrar usuarios de tipo VISITANTE
 * con sus acciones específicas disponibles. Incluye funcionalidad para eliminar
 * usuario, promover a editor y asignar proyectos. Cada visitante se muestra con
 * su información básica y la lista de proyectos asignados.
 * 
 * Características principales:
 * - Información específica de usuarios visitantes
 * - Dropdown de acciones contextual (eliminar, promover, asignar)
 * - Lista de proyectos asignados integrada
 * - Modales de confirmación para acciones críticas
 * - Modal de asignación de proyectos
 * - Estados visuales para usuario seleccionado
 * 
 * Acciones disponibles para visitantes:
 * - Asignar proyecto: Abre modal para asignar nuevos proyectos
 * - Promover a editor: Muestra mensaje de funcionalidad en desarrollo
 * - Eliminar usuario: Elimina permanentemente al usuario (con confirmación)
 * 
 * @example
 * ```tsx
 * <VisitanteUserItem
 *   usuario={visitanteUser}
 *   onUserSelect={(userId) => setSelectedUser(userId)}
 *   onUserDeleted={() => reloadUsers()}
 *   onUserUpdated={() => reloadUsers()}
 *   selectedUserId={selectedUserId}
 * />
 * ```
 * 
 * @param {VisitanteUserItemProps} props - Props del componente
 * @returns {JSX.Element} Item de usuario visitante
 */
const VisitanteUserItem: React.FC<VisitanteUserItemProps> = ({
  usuario,
  onUserSelect,
  onUserDeleted,
  onUserUpdated,
  selectedUserId
}) => {
  // @state: Control del modal de confirmación para eliminar usuario
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // @state: Control del modal para asignar proyectos
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // @state: Control del estado de carga durante la eliminación
  const [isDeleting, setIsDeleting] = useState(false);

  // @state: Control del estado de carga durante la promoción a editor
  const [isPromoting, setIsPromoting] = useState(false);

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
   * Maneja la promoción del usuario a EDITOR
   * Utiliza el endpoint actualizarTipoUsuario para cambiar el tipo a "EDITOR"
   */
  const handlePromoteToEditor = async () => {
    if (isPromoting) return;
    
    setIsPromoting(true);
    
    try {
      // Llamar al endpoint para actualizar el tipo de usuario
      await actualizarTipoUsuario(usuario.id_usuario, 'EDITOR');
      
      // Notificar al componente padre que el usuario fue actualizado
      onUserUpdated?.();
      
      
    } catch (error) {
      console.error('❌ Error al promover usuario a EDITOR:', error);
      alert('No se pudo promover el usuario a EDITOR. Por favor, intenta nuevamente.');
    } finally {
      setIsPromoting(false);
    }
  };

  /**
   * Maneja la eliminación del usuario
   * Utiliza el servicio de eliminación y notifica al componente padre
   */
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    
    try {
      // Eliminar usuario usando el servicio
      await eliminarUsuario(usuario.id_usuario);
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      
      // Notificar al componente padre que el usuario fue eliminado
      onUserDeleted?.();
      
      
    } catch (error) {
      console.error('❌ Error al eliminar usuario visitante:', error);
      alert('No se pudo eliminar el usuario. Por favor, intenta nuevamente.');
    } finally {
      setIsDeleting(false);
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

  // Determinar si este usuario está seleccionado
  const isSelected = selectedUserId === usuario.id_usuario;

  // Configuración de acciones del dropdown para usuarios visitantes
  const dropdownActions = [
    {
      id: 'assign-project',
      label: 'Asignar proyecto',
      icon: <FolderPlus size={16} />,
      onClick: handleAssignProject,
      type: 'default' as const,
      disabled: isPromoting
    },
    {
      id: 'promote-to-editor',
      label: isPromoting ? 'Promocionando...' : 'Promover a Editor',
      icon: <UserPlus size={16} />,
      onClick: handlePromoteToEditor,
      type: 'default' as const,
      disabled: isPromoting
    },
    {
      id: 'delete-user',
      label: 'Eliminar usuario',
      icon: <UserX size={16} />,
      onClick: () => setShowDeleteModal(true),
      type: 'danger' as const,
      disabled: isPromoting
    }
  ];

  return (
    <>
      <div className={`${styles.visitanteItem} ${isSelected ? styles.selected : ''}`}>
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
              <strong className={styles.userAlias}>{usuario.alias}</strong>
              <span className={styles.userType}>VISITANTE</span>
            </div>
            
            {/* Información adicional del usuario 
            <div className={styles.userDetails}>
              <span className={styles.userStatus}>
                Estado: {usuario.activo ? 'Activo' : 'Inactivo'}
              </span>
              <span className={styles.userId}>
                ID: {usuario.id_usuario}
              </span>
            </div>*/}
          </div>

          {/* Dropdown de acciones específicas para visitantes */}
          <div className={styles.userActions}>
            <ActionDropdown
              actions={dropdownActions}
              position="bottom-right"
              className={styles.actionDropdown}
            />
          </div>
        </div>

        {/* @section: Lista de proyectos asignados al usuario */}
        <div className={styles.projectsSection}>
          <UserProjectsList
            userId={usuario.id_usuario}
            onProjectRemoved={handleProjectRemoved}
            className={styles.projectsList}
          />
        </div>
      </div>

      {/* @section: Modal de confirmación para eliminar usuario */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Eliminar Usuario Visitante"
        message={`¿Estás seguro de que quieres eliminar al usuario "${usuario.alias}"? Esta acción eliminará permanentemente el usuario y todas sus asignaciones de proyectos. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
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

export default VisitanteUserItem;
