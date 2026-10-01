import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button/Button';
import styles from './ConfirmationModal.module.css';

/**
 * Props para el componente ConfirmationModal
 * @interface ConfirmationModalProps
 */
interface ConfirmationModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función que se ejecuta al confirmar la acción */
  onConfirm: () => void;
  /** Título del modal */
  title: string;
  /** Mensaje descriptivo de la acción a confirmar */
  message: string;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Tipo de confirmación que determina el estilo visual */
  type?: 'danger' | 'warning' | 'info';
  /** Si está procesando la acción (deshabilita botones) */
  isLoading?: boolean;
}

/**
 * Modal de confirmación reutilizable para acciones destructivas
 * 
 * @component ConfirmationModal
 * @description Componente modal genérico para confirmar acciones importantes,
 * especialmente aquellas que son destructivas o irreversibles. Proporciona
 * una interfaz clara con iconografía apropiada y botones de acción.
 * 
 * Características principales:
 * - Diseño responsive y accesible
 * - Diferentes tipos visuales (danger, warning, info)
 * - Manejo de estados de carga
 * - Cierre con tecla ESC
 * - Prevención de scroll del body
 * - Enfoque automático en botones
 * 
 * @example
 * ```tsx
 * <ConfirmationModal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   onConfirm={handleDeleteSequence}
 *   title="Borrar Secuencia"
 *   message="¿Borrar toda la secuencia? Esta acción no puede deshacerse"
 *   type="danger"
 *   confirmText="Confirmar"
 *   cancelText="Cancelar"
 * />
 * ```
 * 
 * @param {ConfirmationModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de confirmación
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false
}) => {
  /**
   * Efecto para manejar el cierre con ESC y prevenir scroll
   * @function useEffect
   */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
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
  }, [isOpen, onClose, isLoading]);

  /**
   * Maneja el clic en el backdrop para cerrar el modal
   * @function handleBackdropClick
   * @param {React.MouseEvent} e - Evento de clic
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  /**
   * Obtiene el icono apropiado según el tipo de confirmación
   * @function getIcon
   * @returns {JSX.Element} Icono correspondiente al tipo
   */
  const getIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return <AlertTriangle size={24} />;
      default:
        return <AlertTriangle size={24} />;
    }
  };

  // @render: No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleBackdropClick}>
      <div className={styles['modal-container']}>
        {/* @section: Header con icono y título */}
        <div className={styles['modal-header']}>
          <div className={`${styles['modal-icon']} ${styles[`modal-icon-${type}`]}`}>
            {getIcon()}
          </div>
          <h2 className={styles['modal-title']}>{title}</h2>
          <button
            onClick={onClose}
            className={styles['modal-close-button']}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* @section: Cuerpo con mensaje */}
        <div className={styles['modal-body']}>
          <p className={styles['modal-message']}>{message}</p>
        </div>

        {/* @section: Footer con botones de acción */}
        <div className={styles['modal-footer']}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'error' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;