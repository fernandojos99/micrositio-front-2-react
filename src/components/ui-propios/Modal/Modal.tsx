import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles['modal-backdrop']} onClick={handleBackdropClick}>
      <div className={styles['modal-container']}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>{title}</h2>
          <button
            onClick={onClose}
            className={styles['modal-close-button']}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles['modal-body']}>
          {children}
        </div>

        {footer && (
          <div className={styles['modal-footer']}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;