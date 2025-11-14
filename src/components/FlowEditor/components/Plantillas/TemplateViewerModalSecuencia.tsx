/**
 * @fileoverview Componente TemplateViewerModalSecuencia - Modal para visualización de plantillas de secuencias
 * 
 * Este archivo contiene el componente modal que permite a los usuarios
 * visualizar plantillas de Secuencias completas en una ventana emergente. 
 * Incluye FlowEditor para mostrar el flujo completo de la secuencia plantilla.
 * 
 * Características principales:
 * - Vista previa completa de la secuencia plantilla con FlowEditor
 * - Lista de secuencias disponibles como plantillas
 * - Opciones para aplicar plantilla de secuencia
 * - Manejo de estados de carga y error
 * - Diseño responsive y accesible
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-11-12
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Calendar } from 'lucide-react';
import FlowEditor from '../../FlowEditor';
import TemplateSecuenciasList from './TemplateSecuenciasList';
import { Secuencia } from '../../../../types/secuencia';
import { PlantillaSecuencia } from '../../../../services/plantillaSecuenciaService';
import './TemplateViewerModal.css';



/**
 * Estados de carga del modal
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Props del componente TemplateViewerModalSecuencia
 */
interface TemplateViewerModalSecuenciaProps {
  /** Control de visibilidad del modal */
  isOpen: boolean;
  /** Función de cierre del modal */
  onClose: () => void;
  /** ID de la secuencia donde se aplicará la plantilla */
  id_secuencia_destino: string;
  /** ID del proyecto para filtrar plantillas */
  id_proyecto?: number;
  /** Función callback al aplicar plantilla exitosamente */
  onTemplateApplied?: (secuenciaPlantilla: Secuencia) => void;
}

/**
 * Datos de respuesta del servicio de plantillas de secuencias
 */
interface TemplateSecuenciaServiceResponse {
  plantilla: PlantillaSecuencia;
  secuencia: Secuencia;
  metadata: {
    total_cards: number;
    //has_learning_cards: boolean;
    //complexity_level: 'simple' | 'medium' | 'complex';
  };
}

/**
 * Componente TemplateViewerModalSecuencia
 * 
 * Modal principal que contiene todo el sistema de visualización de plantillas de secuencias.
 * Permite a los usuarios ver una vista previa completa del flujo de la secuencia plantilla,
 * revisar su información y decidir si aplicarla a su secuencia actual.
 * 
 * @param props - Propiedades del componente
 * @returns Componente React del modal de visualización de plantillas de secuencias
 */
const TemplateViewerModalSecuencia: React.FC<TemplateViewerModalSecuenciaProps> = ({
  isOpen,
  onClose,
  id_secuencia_destino,
  id_proyecto,
  onTemplateApplied
}) => {
  // Estados locales para el manejo de datos y UI
  console.log('TemplateViewerModalSecuencia renderizado:', { isOpen, id_secuencia_destino, id_proyecto });
  
  const [templateData, setTemplateData] = useState<TemplateSecuenciaServiceResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  
  // Estados para la Secuencia seleccionada
  const [selectedSecuencia, setSelectedSecuencia] = useState<Secuencia | null>(null);
  const [loadingSelectedSecuencia, setLoadingSelectedSecuencia] = useState(false);

  // Log para confirmar que se recibe el id_secuencia_destino
  console.log('TemplateViewerModalSecuencia recibió id_secuencia_destino:', id_secuencia_destino);

  /**
   * Función para cargar datos de plantilla de secuencia
   */
  const loadTemplateData = async () => {
    try {
      setLoadingState('loading');
      setError(null);
      
      console.log('Cargando datos de plantilla para secuencia:', id_secuencia_destino);

      // Simular carga de datos de plantilla
      // TODO: Reemplazar con llamada real al servicio cuando esté disponible
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de API
      
      // Por ahora usar datos mock hasta que esté la API real
      const mockTemplateData: TemplateSecuenciaServiceResponse = {
        plantilla: {
          id_plantilla_secuencia: `plantilla-${id_secuencia_destino}`,
          id_secuencia: parseInt(id_secuencia_destino),
          id_empleado: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        secuencia: {
          id: id_secuencia_destino,
          nombre: `Plantilla de Secuencia ${id_secuencia_destino}`,
          descripcion: 'Secuencia plantilla con flujo de testing cards predefinido',
          dia_inicio: '2025-01-15',
          dia_fin: '2025-01-30',
          estado: 'TERMINADO',
          proyectoId: (id_proyecto || 1).toString(),
          fechaCreacion: new Date().toISOString(),
          testing_cards_count: 5
        },
        metadata: {
          total_cards: 5
          //has_learning_cards: true,
          //complexity_level: 'medium'
        }
      };

      setTemplateData(mockTemplateData);
      setLoadingState('success');
      
      console.log('Datos de plantilla de secuencia cargados exitosamente');
    } catch (err) {
      console.error('Error cargando datos de plantilla de secuencia:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error desconocido al cargar la plantilla de secuencia'
      );
      setLoadingState('error');
    }
  };

  /**
   * Effect para cargar los datos de la plantilla cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen && id_secuencia_destino) {
      loadTemplateData();
    }
  }, [isOpen, id_secuencia_destino]);

  /**
   * Maneja el cierre del modal y limpia el estado
   */
  const handleClose = () => {
    setTemplateData(null);
    setLoadingState('idle');
    setError(null);
    setSelectedSecuencia(null);
    onClose();
  };

  /**
   * Maneja la selección de una Secuencia para mostrar su flujo
   */
  const handleSelectSecuencia = async (secuenciaData: Secuencia) => {
    console.log('Secuencia seleccionada:', secuenciaData);
    setLoadingSelectedSecuencia(true);
    
    try {
      // Por ahora establecer directamente la secuencia seleccionada
      // TODO: Cargar detalles adicionales si es necesario
      setSelectedSecuencia(secuenciaData);
      
    } catch (error) {
      console.error('Error al cargar detalles de Secuencia:', error);
      setSelectedSecuencia(null);
    } finally {
      setLoadingSelectedSecuencia(false);
    }
  };

  /**
   * Maneja la aplicación de una Secuencia como plantilla
   */
  const handleApplySecuencia = (secuenciaData: Secuencia) => {
    console.log('Aplicar secuencia como plantilla:', secuenciaData);
    
    // Notificar al componente padre
    if (onTemplateApplied) {
      onTemplateApplied(secuenciaData);
    }
    
    // Cerrar el modal
    handleClose();
  };

  /**
   * Renderiza el FlowEditor con la secuencia seleccionada
   */
  const renderSelectedSecuenciaFlow = () => {
    if (loadingSelectedSecuencia) {
      return (
        <div className="selected-card-loading">
          <div className="loading-spinner animate-spin"></div>
          <p>Cargando flujo de la secuencia...</p>
        </div>
      );
    }

    if (!selectedSecuencia) {
      return (
        <div className="selected-card-placeholder">
          <FileText size={48} />
          <h3>Selecciona una secuencia</h3>
          <p>Elige una secuencia de la lista para ver su flujo completo</p>
        </div>
      );
    }

    return (
      <div className="selected-card-details">
        <div className="selected-card-header">
          <h3>{selectedSecuencia.nombre}</h3>
          {/*<p>{selectedSecuencia.descripcion}</p>*/}
        </div>

        {/* Información meta de la secuencia */}
        {/*
        <div className="selected-card-meta">
          <div className="selected-card-meta-item">
            <FileText size={16} />
            <span>{selectedSecuencia.testing_cards_count || 0} testing cards</span>
          </div>
        </div>**}

        {/* FlowEditor para mostrar el flujo de la secuencia */}
        <div className="flow-editor-container" style={{ height: '400px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <FlowEditor 
            idSecuencia={selectedSecuencia.id}
            onTestingCardsChange={() => {}}
          />
        </div>
      </div>
    );
  };

  // No renderizar nada si el modal no está abierto
  if (!isOpen) {
    console.log('TemplateViewerModalSecuencia: Modal no está abierto, retornando null');
    return null;
  }

  console.log('TemplateViewerModalSecuencia: Modal está abierto, renderizando contenido');
  
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
            <h2 className="template-modal-title">Plantillas de Secuencias</h2>
          </div>
          
          <div className="template-modal-header-actions">
            <button
              type="button"
              className="template-modal-close-btn"
              onClick={handleClose}
              title="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido principal del modal */}
        <div className="template-modal-content">
          {loadingState === 'loading' && (
            <div className="template-flow-loading">
              <div className="loading-spinner animate-spin"></div>
              <p>Cargando plantillas de secuencias...</p>
            </div>
          )}

          {loadingState === 'error' && (
            <div className="template-flow-error">
              <p>{error}</p>
              <button onClick={loadTemplateData}>Reintentar</button>
            </div>
          )}

          {loadingState === 'success' && (
            <div 
              className={`template-flow-container ${showDetails ? 'with-sidebar' : 'full-width'}`}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', // Cambiar a columna para layout vertical
                flex: 1, 
                minHeight: '400px',
                background: '#fff'
              }}
            >
              {/* Panel superior - Lista de Secuencias */}
              <div 
                className="template-cards-section"
                style={{ 
                  flex: '0 0 40%', // 40% de altura
                  borderBottom: '1px solid #e5e7eb', // Cambiar border a bottom
                  background: '#f9fafb',
                  overflow: 'auto'
                }}
              >
                <TemplateSecuenciasList
                  id_secuencia_destino={id_secuencia_destino}
                  id_proyecto={id_proyecto}
                  onApplySecuencia={handleApplySecuencia}
                  onSelectSecuencia={handleSelectSecuencia}
                  className="template-secuencias-list"
                />
              </div>

              {/* Panel inferior - FlowEditor con la secuencia seleccionada */}
              <div 
                className="template-selected-card-panel"
                style={{ 
                  flex: '0 0 60%', // 60% de altura para el FlowEditor
                  background: '#fff',
                  overflow: 'auto'
                }}
              >
                {renderSelectedSecuenciaFlow()}
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal 
        <div className="template-modal-footer">
          <div className="template-modal-footer-info">
            <div className="template-usage-info">
              <Users size={16} />
              <span>Plantillas disponibles para aplicar</span>
            </div>
          </div>
          
          <div className="template-modal-footer-actions">
            <button
              type="button"
              className="template-btn template-btn-secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

// Exportar el componente como default
export default TemplateViewerModalSecuencia;
