import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Dropdown.module.css';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  width?: 'auto' | 'full' | string;
  position?: 'bottom' | 'top';
  searchable?: boolean;
}

/**
 * Componente Dropdown reutilizable
 * 
 * @component Dropdown
 * @description Dropdown personalizable con búsqueda opcional, soporte para 
 * posicionamiento y diferentes tamaños. Incluye manejo completo de accesibilidad.
 * 
 * @example
 * ```tsx
 * const options = [
 *   { value: 'option1', label: 'Opción 1' },
 *   { value: 'option2', label: 'Opción 2' },
 *   { value: 'option3', label: 'Opción 3', disabled: true }
 * ];
 * 
 * <Dropdown
 *   options={options}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   placeholder="Selecciona una opción"
 *   searchable
 * />
 * ```
 */
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  width = 'auto',
  position = 'bottom',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Encontrar la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Manejo de navegación por teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            const option = filteredOptions[focusedIndex];
            if (!option.disabled) {
              handleOptionSelect(option.value);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, filteredOptions]);

  // Enfocar elemento cuando cambie el índice
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleToggle = () => {
    if (disabled) return;
    
    setIsOpen(!isOpen);
    setSearchTerm('');
    setFocusedIndex(-1);

    // Enfocar input de búsqueda si está habilitada
    if (!isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  const getWidthClass = () => {
    if (width === 'full') return styles['dropdown-full'];
    if (width === 'auto') return styles['dropdown-auto'];
    return '';
  };

  const getPositionClass = () => {
    return position === 'top' ? styles['dropdown-top'] : styles['dropdown-bottom'];
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.dropdown} ${getWidthClass()} ${className}`}
      style={typeof width === 'string' && width !== 'auto' && width !== 'full' 
        ? { width } 
        : undefined
      }
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`${styles['dropdown-trigger']} ${
          isOpen ? styles['trigger-open'] : ''
        } ${disabled ? styles['trigger-disabled'] : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles['trigger-text']}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`${styles['trigger-icon']} ${isOpen ? styles['icon-rotated'] : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`${styles['dropdown-menu']} ${getPositionClass()}`}>
          {/* Search input */}
          {searchable && (
            <div className={styles['search-container']}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className={styles['search-input']}
              />
            </div>
          )}

          {/* Options list */}
          <div className={styles['options-container']} role="listbox">
            {filteredOptions.length === 0 ? (
              <div className={styles['no-options']}>
                {searchable && searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  ref={el => optionRefs.current[index] = el}
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  disabled={option.disabled}
                  className={`${styles['dropdown-option']} ${
                    option.value === value ? styles['option-selected'] : ''
                  } ${option.disabled ? styles['option-disabled'] : ''} ${
                    index === focusedIndex ? styles['option-focused'] : ''
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
