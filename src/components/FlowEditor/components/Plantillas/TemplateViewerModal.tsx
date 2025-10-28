/**
 * @fileoverview Componente TemplateViewerModal - Modal principal para visualización de plantillas
 * 
 * Este archivo contiene el componente modal principal que permite a los usuarios
 * visualizar plantillas de Testing Cards en una ventana emergente. Proporciona
 * una vista previa completa de la plantilla antes de decidir aplicarla.
 * 
 * Características principales:
 * - Vista previa completa de la plantilla
 * - Información detallada de la plantilla
 * - Opciones para usar o duplicar la plantilla
 * - Manejo de estados de carga y error
 * - Diseño responsive y accesible
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import React, { useState, useEffect } from 'react';
import { X, Copy, Eye, FileText, Calendar, User, Hash, Heart } from 'lucide-react';
import TemplateTestingCardList from './TemplateTestingCardList';
import { 
  TemplateViewerModalProps, 
  TemplateServiceResponse, 
  LoadingState, 
  TEMPLATE_CONSTANTS 
} from './types';
import './TemplateViewerModal.css';

/**
 * Componente TemplateViewerModal
 * 
 * Modal principal que contiene todo el sistema de visualización de plantillas.
 * Permite a los usuarios ver una vista previa completa de la plantilla,
 * revisar su información y decidir si aplicarla a su flujo actual.
 * 
 * @param props - Propiedades del componente
 * @returns Componente React del modal de visualización de plantillas
 */
const TemplateViewerModal: React.FC<TemplateViewerModalProps> = ({
  isOpen,
  onClose,
  plantillaId,
  plantillaNombre,
  plantillaDescripcion,
  onUseTemplate,
  onDuplicateTemplate
}) => {
  // Estados locales para el manejo de datos y UI
  console.log('TemplateViewerModal renderizado:', { isOpen, plantillaId, plantillaNombre });
  const [templateData, setTemplateData] = useState<TemplateServiceResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(TEMPLATE_CONSTANTS.LOADING_STATES.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  /**
   * Effect para cargar los datos de la plantilla cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen && plantillaId) {
      loadTemplateData();
    }
  }, [isOpen, plantillaId]);

  /**
   * Carga los datos completos de la plantilla desde el servicio
   */
  const loadTemplateData = async () => {
    try {
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.LOADING);
      setError(null);

      // TODO: Reemplazar con llamada real al servicio
      // const response = await TemplateService.getTemplateById(plantillaId);
      
      // Datos mock para desarrollo
      const mockResponse: TemplateServiceResponse = {
        plantilla: {
          id_plantilla: plantillaId,
          nombre: plantillaNombre,
          descripcion: plantillaDescripcion || 'Plantilla de Testing Cards',
          categoria: 'Marketing',
          es_publica: true,
          creado_por: 1,
          fecha_creacion: '2025-10-28T10:00:00Z',
          fecha_modificacion: '2025-10-28T10:00:00Z',
          usos_count: 15
        },
        testing_cards: [],
        metadata: {
          total_cards: 3,
          has_learning_cards: true,
          complexity_level: 'medium'
        }
      };

      setTemplateData(mockResponse);
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.SUCCESS);
    } catch (err) {
      console.error('Error cargando datos de plantilla:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error desconocido al cargar la plantilla'
      );
      setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.ERROR);
    }
  };

  /**
   * Maneja el cierre del modal y limpia el estado
   */
  const handleClose = () => {
    setTemplateData(null);
    setLoadingState(TEMPLATE_CONSTANTS.LOADING_STATES.IDLE);
    setError(null);
    onClose();
  };

  /**
   * Maneja la acción de usar la plantilla
   */
  const handleUseTemplate = () => {
    if (onUseTemplate && plantillaId) {
      onUseTemplate(plantillaId);
      handleClose();
    }
  };

  /**
   * Maneja la acción de duplicar la plantilla
   */
  const handleDuplicateTemplate = () => {
    if (onDuplicateTemplate && plantillaId) {
      onDuplicateTemplate(plantillaId);
      handleClose();
    }
  };

  /**
   * Maneja la aplicación de una Testing Card individual
   */
  const handleApplyTestingCard = (testingCardData: TemplateTestingCardData) => {
    console.log('Aplicar Testing Card individual:', testingCardData);
    // TODO: Implementar lógica para crear una nueva Testing Card basada en la plantilla
    // Por ahora, usar el callback general de usar plantilla
    if (onUseTemplate && plantillaId) {
      onUseTemplate(plantillaId);
      handleClose();
    }
  };

  /**
   * Formatea una fecha para mostrar en la UI
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Obtiene el color de la categoría para la UI
   */
  const getCategoryColor = (categoria: string): string => {
    const colors: Record<string, string> = {
      'Marketing': '#ff6b6b',
      'Producto': '#4ecdc4',
      'UX/UI': '#45b7d1',
      'Tecnología': '#96ceb4',
      'Ventas': '#feca57',
      'Customer Success': '#ff9ff3',
      'Operaciones': '#a29bfe',
      'General': '#6c5ce7'
    };
    return colors[categoria] || '#6c5ce7';
  };

  /**
   * Obtiene el icono para el nivel de complejidad
   */
  const getComplexityIcon = (level: string) => {
    switch (level) {
      case 'simple': return '●';
      case 'medium': return '●●';
      case 'complex': return '●●●';
      default: return '●';
    }
  };

  // Debug: Log del estado del modal
  console.log('TemplateViewerModal renderizando:', { isOpen, plantillaId });

  // No renderizar nada si el modal no está abierto
  if (!isOpen) {
    console.log('TemplateViewerModal: Modal no está abierto, retornando null');
    return null;
  }

  console.log('TemplateViewerModal: Modal está abierto, renderizando contenido');
  
  // Renderizado del componente
  return (
    <div className="template-modal-backdrop" onClick={handleClose}>
      <div 
        className="template-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="template-modal-header">
          <div className="template-modal-title-section">
            <h2 className="template-modal-title">
              <Eye size={24} />
              Vista previa de plantilla
            </h2>
            
            {templateData && (
              <div className="template-info-badges">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(templateData.plantilla.categoria) }}
                >
                  {templateData.plantilla.categoria}
                </span>
                
                <span className="complexity-badge">
                  {getComplexityIcon(templateData.metadata?.complexity_level || 'simple')} 
                  {templateData.metadata?.complexity_level || 'Simple'}
                </span>
              </div>
            )}
          </div>

          {/* Botón para mostrar/ocultar detalles */}
          <div className="template-modal-header-actions">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="template-toggle-details-btn"
              title={showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            >
              <FileText size={18} />
              {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            </button>

            <button 
              onClick={handleClose} 
              className="template-modal-close-btn"
              title="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido principal del modal */}
        <div className="template-modal-content">
          {/* Panel de información lateral (condicional) */}
          {showDetails && templateData && (
            <div className="template-info-panel">
              <div className="template-info-section">
                <h3 className="template-info-title">{templateData.plantilla.nombre}</h3>
                <p className="template-info-description">
                  {templateData.plantilla.descripcion}
                </p>
              </div>

              <div className="template-info-section">
                <h4 className="template-info-subtitle">Información general</h4>
                
                <div className="template-info-item">
                  <Calendar size={16} />
                  <span>Creada: {formatDate(templateData.plantilla.fecha_creacion)}</span>
                </div>

                <div className="template-info-item">
                  <User size={16} />
                  <span>Creador: Usuario #{templateData.plantilla.creado_por}</span>
                </div>

                <div className="template-info-item">
                  <Hash size={16} />
                  <span>Testing Cards: {templateData.metadata?.total_cards || 0}</span>
                </div>

                <div className="template-info-item">
                  <Heart size={16} />
                  <span>Usos: {templateData.plantilla.usos_count}</span>
                </div>
              </div>

              {templateData.metadata && (
                <div className="template-info-section">
                  <h4 className="template-info-subtitle">Características</h4>
                  
                  <div className="template-features">
                    <div className="template-feature">
                      <span>Complejidad:</span>
                      <span className="feature-value">
                        {templateData.metadata.complexity_level}
                      </span>
                    </div>
                    
                    <div className="template-feature">
                      <span>Learning Cards:</span>
                      <span className="feature-value">
                        {templateData.metadata.has_learning_cards ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Área principal - Lista de Testing Cards */}
          <div className={`template-flow-container ${showDetails ? 'with-sidebar' : 'full-width'}`}>
            {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.LOADING && (
              <div className="template-loading-state">
                <div className="template-loading-spinner"></div>
                <p>Cargando plantilla...</p>
              </div>
            )}

            {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.ERROR && (
              <div className="template-error-state">
                <X size={48} />
                <h3>Error al cargar plantilla</h3>
                <p>{error}</p>
                <button 
                  onClick={loadTemplateData}
                  className="template-retry-btn"
                >
                  Reintentar
                </button>
              </div>
            )}

            {loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.SUCCESS && (
              <TemplateTestingCardList
                plantillaId={plantillaId}
                onApplyTestingCard={handleApplyTestingCard}
                className="template-testing-card-list"
              />
            )}
          </div>
        </div>

        {/* Footer del modal con acciones */}
        <div className="template-modal-footer">
          <div className="template-modal-footer-info">
            {templateData && (
              <span className="template-usage-info">
                Esta plantilla ha sido usada {templateData.plantilla.usos_count} veces
              </span>
            )}
          </div>

          <div className="template-modal-footer-actions">
            <button 
              onClick={handleClose} 
              className="template-btn template-btn-secondary"
            >
              Cancelar
            </button>

            {onDuplicateTemplate && (
              <button 
                onClick={handleDuplicateTemplate}
                className="template-btn template-btn-outline"
                disabled={loadingState === TEMPLATE_CONSTANTS.LOADING_STATES.LOADING}
              >
                <Copy size={16} />
                Duplicar
              </button>
            )}

            <button 
              onClick={handleUseTemplate}
              className="template-btn template-btn-primary"
              disabled={loadingState !== TEMPLATE_CONSTANTS.LOADING_STATES.SUCCESS}
            >
              <FileText size={16} />
              Usar esta plantilla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportar el componente como default
export default TemplateViewerModal;
