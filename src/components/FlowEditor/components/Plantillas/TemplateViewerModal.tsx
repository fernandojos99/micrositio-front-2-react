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
import { X, Copy, Eye, FileText, Calendar, Target } from 'lucide-react';
import TemplateTestingCardList from './TemplateTestingCardList';
import { 
  TemplateViewerModalProps, 
  TemplateServiceResponse, 
  LoadingState, 
  TEMPLATE_CONSTANTS 
} from './types';
import { obtenerTestingCardPorId } from '../../../../services/testingCardService';
import TestingCardPlaybookService from '../../../../services/TestingCardPlaybookService';
import { TestingCardPlaybook } from '../../../../types/testingCardPlaybook';
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
}) => {
  // Estados locales para el manejo de datos y UI
  console.log('TemplateViewerModal renderizado:', { isOpen, plantillaId, plantillaNombre });
  const [templateData, setTemplateData] = useState<TemplateServiceResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(TEMPLATE_CONSTANTS.LOADING_STATES.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  
  // Estados para la Testing Card seleccionada
  const [selectedTestingCard, setSelectedTestingCard] = useState<any | null>(null);
  const [selectedTestingCardPlaybook, setSelectedTestingCardPlaybook] = useState<TestingCardPlaybook | null>(null);
  const [loadingSelectedCard, setLoadingSelectedCard] = useState(false);

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
   * Maneja la aplicación de una Testing Card individual
   */
  const handleApplyTestingCard = (testingCardData: any) => {
    console.log('Aplicar Testing Card individual:', testingCardData);
    // TODO: Implementar lógica para crear una nueva Testing Card basada en la plantilla
    // Por ahora, usar el callback general de usar plantilla
    if (onUseTemplate && plantillaId) {
      onUseTemplate(plantillaId);
      handleClose();
    }
  };

  /**
   * Maneja la selección de una Testing Card para mostrar detalles
   */
  const handleSelectTestingCard = async (testingCardData: any) => {
    console.log('Testing Card seleccionada:', testingCardData);
    setLoadingSelectedCard(true);
    
    try {
      // Cargar los detalles completos de la Testing Card
      const fullTestingCard = await obtenerTestingCardPorId(testingCardData.id_testing_card);
      setSelectedTestingCard(fullTestingCard);
      
      // Cargar el playbook si existe id_experimento_tipo
      if (fullTestingCard.id_experimento_tipo && fullTestingCard.id_experimento_tipo > 0) {
        const playbookService = new TestingCardPlaybookService();
        const playbookData = await playbookService.obtenerPorPagina(fullTestingCard.id_experimento_tipo);
        setSelectedTestingCardPlaybook(playbookData);
      } else {
        setSelectedTestingCardPlaybook(null);
      }
    } catch (error) {
      console.error('Error al cargar detalles de Testing Card:', error);
      setSelectedTestingCard(null);
      setSelectedTestingCardPlaybook(null);
    } finally {
      setLoadingSelectedCard(false);
    }
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

  /**
   * Renderiza los detalles de la Testing Card seleccionada
   */
  const renderSelectedTestingCardDetails = () => {
    if (loadingSelectedCard) {
      return (
        <div className="selected-card-loading">
          <div className="template-loading-spinner"></div>
          <p>Cargando detalles...</p>
        </div>
      );
    }

    if (!selectedTestingCard) {
      return (
        <div className="selected-card-placeholder">
          <FileText size={48} />
          <h3>Selecciona una Testing Card</h3>
          <p>Haz clic en una Testing Card de la lista para ver sus detalles completos.</p>
        </div>
      );
    }

    return (
      <div className="selected-card-details">
        <div className="selected-card-header">
          <h3 className="selected-card-title">{selectedTestingCard.titulo}</h3>
          <p className="selected-card-description">{selectedTestingCard.descripcion}</p>
        </div>

        {/* Información del experimento */}
        {selectedTestingCardPlaybook && (
          <div className="selected-card-experiment" style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: 'rgba(108, 99, 255, 0.05)',
            borderLeft: '3px solid #6C63FF',
            borderRadius: '4px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#6C63FF',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Tipo de Experimento
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              marginBottom: '4px'
            }}>
              {selectedTestingCardPlaybook.titulo}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--theme-text-secondary)',
              display: 'flex',
              gap: '12px'
            }}>
              <span><strong>Campo:</strong> {selectedTestingCardPlaybook.campo}</span>
              <span><strong>Tipo:</strong> {selectedTestingCardPlaybook.tipo}</span>
            </div>
          </div>
        )}

        {/* Hipótesis */}
        <div className="selected-card-hypothesis" style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--theme-text-primary)'
          }}>
            <Target size={14} />
            Hipótesis
          </div>
          <p style={{
            fontSize: '13px',
            color: 'var(--theme-text-secondary)',
            lineHeight: '1.5',
            margin: 0
          }}>
            {selectedTestingCard.hipotesis}
          </p>
        </div>

        {/* Información adicional */}
        <div className="selected-card-meta">
          <div className="selected-card-meta-item">
            <Calendar size={14} />
            <span>
              {new Date(selectedTestingCard.dia_inicio).toLocaleDateString('es-ES')} - {' '}
              {new Date(selectedTestingCard.dia_fin).toLocaleDateString('es-ES')}
            </span>
          </div>
          
          <div className="selected-card-status">
            <span
              className={`status-badge ${selectedTestingCard.status?.toLowerCase().replace(' ', '-')}`}
              style={{
                backgroundColor:
                  selectedTestingCard.status === 'EN VALIDACION'
                    ? '#facc15'
                    : selectedTestingCard.status === 'EN PLANEACION'
                    ? '#22c55e'
                    : selectedTestingCard.status === 'EN ANALISIS'
                    ? '#2563eb'
                    : selectedTestingCard.status === 'TERMINADO'
                    ? '#ef4444'                  
                    : '#9ca3af',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                textAlign: 'center',
                textTransform: 'capitalize',
                letterSpacing: '0.5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {selectedTestingCard.status}
            </span>
          </div>
        </div>

        {/* Botón para aplicar esta Testing Card específica */}
        <div className="selected-card-actions" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => handleApplyTestingCard(selectedTestingCard)}
            className="template-btn template-btn-primary"
            style={{ width: '100%' }}
          >
            <FileText size={16} />
            Aplicar esta Testing Card
          </button>
        </div>
      </div>
    );
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


          </div>


        </div>

        {/* Contenido principal del modal */}
        <div className="template-modal-content">
          {/* Área principal - Lista de Testing Cards y detalles */}
          <div className={`template-flow-container ${showDetails ? 'with-sidebar' : 'full-width'}`}>
            {/* Lista de Testing Cards (lado izquierdo) */}
            <div className="template-cards-section">
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
                  onSelectTestingCard={handleSelectTestingCard}
                  className="template-testing-card-list"
                />
              )}
            </div>

            {/* Panel de detalles de Testing Card seleccionada (lado derecho) */}
            <div className="template-selected-card-panel">
              {renderSelectedTestingCardDetails()}
            </div>
          </div>
        </div>

        {/* Footer del modal con acciones */}
        <div className="template-modal-footer">


          <div className="template-modal-footer-actions">
            <button 
              onClick={handleClose} 
              className="template-btn template-btn-secondary"
            >
              Cancelar
            </button>

           

          </div>
        </div>
      </div>
    </div>
  );
};

// Exportar el componente como default
export default TemplateViewerModal;
