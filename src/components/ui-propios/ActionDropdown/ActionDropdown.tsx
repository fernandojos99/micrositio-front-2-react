import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import styles from './ActionDropdown.module.css';

/**
 * Interfaz para definir una acción del dropdown
 * @interface DropdownAction
 */
interface DropdownAction {
  /** ID único de la acción */
  id: string;
  /** Etiqueta visible de la acción */
  label: string;
  /** Icono de la acción */
  icon: React.ReactNode;
  /** Función que se ejecuta al hacer clic */
  onClick: () => void;
  /** Tipo de acción que determina el estilo visual */
  type?: 'default' | 'danger';
  /** Si la acción está deshabilitada */
  disabled?: boolean;
}

/**
 * Props para el componente ActionDropdown
 * @interface ActionDropdownProps
 */
interface ActionDropdownProps {
  /** Lista de acciones disponibles en el dropdown */
  actions: DropdownAction[];
  /** Posición del dropdown relativa al trigger */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Si el dropdown está deshabilitado */
  disabled?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente ActionDropdown
 * 
 * @component ActionDropdown
 * @description Dropdown de acciones con trigger de tres puntos (kebab menu).
 * Proporciona una interfaz consistente para mostrar acciones contextuales
 * como editar, borrar, etc. Incluye manejo completo de accesibilidad.
 * 
 * Características principales:
 * - Trigger con icono de tres puntos verticales
 * - Posicionamiento configurable del dropdown
 * - Soporte para acciones de diferentes tipos (default, danger)
 * - Navegación por teclado (Tab, Enter, Escape, Arrow keys)
 * - Cierre automático al hacer clic fuera
 * - Estados de hover y focus
 * - Iconografía consistente
 * 
 * @example
 * ```tsx
 * const actions = [
 *   {
 *     id: 'edit',
 *     label: 'Editar',
 *     icon: <Edit size={16} />,
 *     onClick: handleEdit,
 *     type: 'default'
 *   },
 *   {
 *     id: 'delete',
 *     label: 'Borrar',
 *     icon: <Trash2 size={16} />,
 *     onClick: handleDelete,
 *     type: 'danger'
 *   }
 * ];
 * 
 * <ActionDropdown actions={actions} position="bottom-right" />
 * ```
 * 
 * @param {ActionDropdownProps} props - Props del componente
 * @returns {JSX.Element} Dropdown de acciones
 */
const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  position = 'bottom-right',
  disabled = false,
  className = ''
}) => {
  // @state: Control de apertura del dropdown
  const [isOpen, setIsOpen] = useState(false);
  
  // @state: Índice del elemento enfocado para navegación por teclado
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // @ref: Referencia al contenedor para detectar clics fuera
  const containerRef = useRef<HTMLDivElement>(null);
  
  // @ref: Referencia al botón trigger
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // @ref: Referencias a los elementos del dropdown para navegación
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Efecto para manejar clics fuera del componente
   * @function useEffect
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * Efecto para manejar navegación por teclado
   * @function useEffect
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          closeDropdown();
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev < actions.length - 1 ? prev + 1 : 0;
            itemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : actions.length - 1;
            itemRefs.current[nextIndex]?.focus();
            return nextIndex;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < actions.length) {
            const action = actions[focusedIndex];
            if (!action.disabled) {
              action.onClick();
              closeDropdown();
            }
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, actions]);

  /**
   * Abre el dropdown y enfoca el primer elemento
   * @function openDropdown
   */
  const openDropdown = () => {
    if (disabled) return;
    
    setIsOpen(true);
    setFocusedIndex(0);
    
    // @accessibility: Enfocar el primer elemento después de abrir
    setTimeout(() => {
      itemRefs.current[0]?.focus();
    }, 0);
  };

  /**
   * Cierra el dropdown y resetea el estado
   * @function closeDropdown
   */
  const closeDropdown = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  /**
   * Alterna el estado del dropdown
   * @function toggleDropdown
   */
  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  /**
   * Maneja el clic en una acción
   * @function handleActionClick
   * @param {DropdownAction} action - Acción a ejecutar
   */
  const handleActionClick = (action: DropdownAction) => {
    if (action.disabled) return;
    
    action.onClick();
    closeDropdown();
  };

  /**
   * Maneja el enfoque en un elemento del dropdown
   * @function handleItemFocus
   * @param {number} index - Índice del elemento enfocado
   */
  const handleItemFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <div 
      className={`${styles['action-dropdown']} ${className}`}
      ref={containerRef}
    >
      {/* @section: Botón trigger con tres puntos */}
      <button
        ref={triggerRef}
        className={`${styles['dropdown-trigger']} ${isOpen ? styles['trigger-active'] : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-label="Más acciones"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical size={16} />
      </button>

      {/* @section: Dropdown con lista de acciones */}
      {isOpen && (
        <div 
          className={`${styles['dropdown-menu']} ${styles[`dropdown-${position}`]}`}
          role="menu"
          aria-orientation="vertical"
        >
          {actions.map((action, index) => (
            <button
              key={action.id}
              ref={el => itemRefs.current[index] = el}
              className={`${styles['dropdown-item']} ${styles[`item-${action.type || 'default'}`]} ${
                action.disabled ? styles['item-disabled'] : ''
              }`}
              onClick={() => handleActionClick(action)}
              onFocus={() => handleItemFocus(index)}
              disabled={action.disabled}
              role="menuitem"
              tabIndex={-1}
            >
              <span className={styles['item-icon']}>
                {action.icon}
              </span>
              <span className={styles['item-label']}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;