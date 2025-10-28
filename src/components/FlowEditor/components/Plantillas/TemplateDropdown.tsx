/**
 * @fileoverview Componente TemplateDropdown para gestión de plantillas en Testing Cards
 * 
 * Este archivo contiene un componente dropdown reutilizable que permite a los usuarios
 * aplicar plantillas existentes o guardar la configuración actual como una nueva plantilla
 * para las Testing Cards en el editor de flujo.
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, FileText, Save } from 'lucide-react';
import './styles/TemplateDropdown.css';

/**
 * Props del componente TemplateDropdown
 */
interface TemplateDropdownProps {
  /** Función que se ejecuta al seleccionar "Aplicar plantilla" */
  onApplyTemplate: () => void;
  /** Función que se ejecuta al seleccionar "Guardar como plantilla" */
  onSaveTemplate: () => void;
  /** Indica si el dropdown está deshabilitado */
  disabled?: boolean;
  /** Clases CSS adicionales para personalizar el estilo */
  className?: string;
}

/**
 * Componente TemplateDropdown
 * 
 * Dropdown elegante y reutilizable que proporciona opciones para manejar plantillas
 * en las Testing Cards. Incluye las opciones "Aplicar plantilla" y "Guardar como plantilla".
 * 
 * Características:
 * - Cierre automático al hacer clic fuera del componente
 * - Animaciones suaves de apertura y cierre
 * - Soporte para estado deshabilitado
 * - Diseño responsive y accesible
 * - Variante compacta disponible
 * 
 * @param props - Propiedades del componente
 * @returns Componente React de dropdown para plantillas
 */
const TemplateDropdown: React.FC<TemplateDropdownProps> = ({
  onApplyTemplate,
  onSaveTemplate,
  disabled = false,
  className = ''
}) => {
  // Estado para controlar si el dropdown está abierto o cerrado
  // Utiliza useState para gestionar el estado local del componente
  const [isOpen, setIsOpen] = useState(false);
  
  // Referencia al contenedor del dropdown para detectar clics fuera del componente
  // useRef permite acceder directamente al elemento DOM sin causar re-renders
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Effect para manejar el cierre del dropdown al hacer clic fuera del componente
   * Implementa el patrón "click outside to close" común en dropdowns y modales
   */
  useEffect(() => {
    /**
     * Maneja los clics fuera del dropdown para cerrarlo automáticamente
     * @param event - Evento de click del mouse
     */
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica si el clic fue fuera del contenedor del dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Agregar el listener cuando el componente se monta
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar el listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Maneja la apertura y cierre del dropdown al hacer clic en el botón principal
   * @param e - Evento de click del mouse
   */
  const handleToggle = (e: React.MouseEvent) => {
    // Prevenir que el evento se propague a elementos padre
    e.stopPropagation();
    
    // Solo cambiar el estado si el componente no está deshabilitado
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  /**
   * Maneja la selección de "Aplicar plantilla"
   * @param e - Evento de click del mouse
   */
  const handleApplyTemplate = (e: React.MouseEvent) => {
    // Prevenir propagación del evento
    e.stopPropagation();
    
    // Cerrar el dropdown
    setIsOpen(false);
    
    // Ejecutar la función de callback proporcionada por el padre
    onApplyTemplate();
  };

  /**
   * Maneja la selección de "Guardar como plantilla"
   * @param e - Evento de click del mouse
   */
  const handleSaveTemplate = (e: React.MouseEvent) => {
    // Prevenir propagación del evento
    e.stopPropagation();
    
    // Cerrar el dropdown
    setIsOpen(false);
    
    // Ejecutar la función de callback proporcionada por el padre
    onSaveTemplate();
  };

  // Renderizado del componente
  return (
    <div 
      ref={dropdownRef} 
      className={`template-dropdown ${className} ${disabled ? 'disabled' : ''}`}
    >
      {/* Botón principal que activa el dropdown */}
      <button
        type="button"
        className="template-dropdown__trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Opciones de plantillas"
      >
        {/* Icono de archivo/plantilla */}
        <FileText size={16} />
        
        {/* Texto del botón */}
        <span>Plantillas</span>
        
        {/* Icono de flecha con rotación animada */}
        <ChevronDown 
          size={14} 
          className={`template-dropdown__chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {/* Menú desplegable - solo se muestra cuando isOpen es true */}
      {isOpen && (
        <div className="template-dropdown__menu">
          {/* Opción: Aplicar plantilla */}
          <button
            type="button"
            className="template-dropdown__item"
            onClick={handleApplyTemplate}
            title="Aplicar una plantilla existente a esta Testing Card"
          >
            <FileText size={14} />
            <span>Aplicar plantilla</span>
          </button>
          
          {/* Opción: Guardar como plantilla */}
          <button
            type="button"
            className="template-dropdown__item"
            onClick={handleSaveTemplate}
            title="Guardar la configuración actual como una nueva plantilla"
          >
            <Save size={14} />
            <span>Guardar como plantilla</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Exportar el componente como default para facilitar la importación
export default TemplateDropdown;
