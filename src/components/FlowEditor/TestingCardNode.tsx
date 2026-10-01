import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position } from 'reactflow';
import {
  Edit3,
  Trash2,
  Plus,
  ClipboardList,
  ChevronDown,
  Target,
  Calendar,
  BarChart3,
  ExternalLink,
  User
} from 'lucide-react';
import { TestingCardData } from './types';
import { MetricaTestingCard, obtenerPorTestingCard } from '../../services/metricaTestingCardService';
import { UrlTestingCard, obtenerPorTestingCard as obtenerUrlsPorTestingCard } from '../../services/urlTestingCardService';
import TestingCardPlaybookService from '../../services/TestingCardPlaybookService';
import { TestingCardPlaybook } from '../../types/testingCardPlaybook';
import { Empleado, obtenerEmpleados } from '../../services/empleadosService';
import TemplateDropdown from './components/Plantillas/TemplateDropdown';
import { TemplateViewerModal } from './components/Plantillas';
import './styles/TestingCardNode.css';

interface TestingCardNodeProps {
  data: TestingCardData & {
    onEdit: () => void;
    onDelete: () => void;
    onAddTesting: () => void;
    onAddLearning: () => void;
    onStatusChange: () => void;
  };
  selected?: boolean;
}

const TestingCardNode: React.FC<TestingCardNodeProps> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metricas, setMetricas] = useState<MetricaTestingCard[]>([]);
  const [loadingMetricas, setLoadingMetricas] = useState(false);
  
  // Estado para las URLs de la Testing Card
  const [urls, setUrls] = useState<UrlTestingCard[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  // Estado para el TestingCardPlaybook asociado
  const [playbook, setPlaybook] = useState<TestingCardPlaybook | null>(null);
  const [loadingPlaybook, setLoadingPlaybook] = useState(false);

  // Estados para responsable
  const [responsable, setResponsable] = useState<Empleado | null>(null);
  const [loadingResponsable, setLoadingResponsable] = useState(false);

  // Estados para el modal de plantillas
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  //const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  // Handlers para las acciones de plantillas
  const handleApplyTemplate = () => {
    // Por ahora, abrir modal con una plantilla de ejemplo
    //setSelectedTemplateId(1); // ID de plantilla de ejemplo
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      
      // Importar la función para crear plantilla
      const { crearPlantillaTestingCard } = await import('../../services/plantillaTestingCardService');
      
      // Por ahora usar un id_empleado por defecto (1)
      // TODO: Obtener el id_empleado del usuario actual desde el contexto de autenticación
      const id_empleado = 10;
      
      //  id_testing_card: data.id_testing_card,
      //  id_empleado: id_empleado
      //});
      
      // Llamar al servicio para crear la plantilla
      const plantillaCreada = await crearPlantillaTestingCard(data.id_testing_card, id_empleado);
      
      
      // Mostrar mensaje de éxito al usuario
      alert(`✅ Testing Card "${data.titulo}" guardada como plantilla exitosamente!\n\nID de plantilla: ${plantillaCreada.id_plantilla_testing_card}`);
      
    } catch (error) {
      console.error('Error al guardar como plantilla:', error);
      
      // Mostrar mensaje de error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar la plantilla';
      alert(`❌ Error al guardar como plantilla: ${errorMessage}`);
    }
  };

  // Handler para usar una plantilla seleccionada
  /** 
  const handleUseTemplate = (templateId: number) => {
    // TODO: Implementar lógica para aplicar la plantilla seleccionada
    alert(`Aplicar plantilla ${templateId} (pendiente de implementar)`);
  };*/

  // Handler para cerrar el modal de plantillas
  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false);
    //setSelectedTemplateId(null);
  };

  // Debug: Log cuando cambian los estados del modal
  /**useEffect(() => {
  }, [showTemplateModal, selectedTemplateId]);*/

  // Cargar métricas y URLs cuando se expande el componente
  useEffect(() => {
    //  isExpanded,
    //  id_testing_card: data.id_testing_card
    //});
    
    if (isExpanded && data.id_testing_card) {
      cargarMetricas();
      cargarUrls();
      cargarResponsable();
    } else {
      //  expandido: isExpanded,
      //  tieneId: !!data.id_testing_card
      //});
    }
  }, [isExpanded, data.id_testing_card]);

  // Cargar el playbook cuando cambie el id_experimento_tipo
  useEffect(() => {
    if (data.id_experimento_tipo && data.id_experimento_tipo > 0) {
      cargarPlaybook();
    }
  }, [data.id_experimento_tipo]);

  const cargarPlaybook = async () => {
    if (!data.id_experimento_tipo || data.id_experimento_tipo <= 0) return;
    
    try {
      setLoadingPlaybook(true);
      const playbookService = new TestingCardPlaybookService();
      const playbookData = await playbookService.obtenerPorPagina(data.id_experimento_tipo);
      setPlaybook(playbookData);
    } catch (error) {
      console.error('Error al cargar playbook:', error);
      setPlaybook(null);
    } finally {
      setLoadingPlaybook(false);
    }
  };

  const cargarMetricas = async () => {
    try {
      setLoadingMetricas(true);
      const metricasData = await obtenerPorTestingCard(data.id_testing_card);
      setMetricas(metricasData);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      setMetricas([]);
    } finally {
      setLoadingMetricas(false);
    }
  };

  /**
   * Carga las URLs desde la base de datos
   */
  const cargarUrls = async () => {
    if (!data.id_testing_card) return;
    
    try {
      setLoadingUrls(true);
      const urlsData = await obtenerUrlsPorTestingCard(data.id_testing_card);
      setUrls(urlsData || []);
    } catch (error) {
      setUrls([]);
    } finally {
      setLoadingUrls(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Trunca URLs de forma inteligente para mejor legibilidad
   */
  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    
    // Intentar mantener el dominio visible
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;
      
      if (domain.length < maxLength - 10) {
        const remainingLength = maxLength - domain.length - 3; // 3 para "..."
        return domain + (path.length > remainingLength ? `...${path.slice(-remainingLength)}` : path);
      }
    } catch (e) {
      // Si no es una URL válida, truncar normalmente
    }
    
    return url.substring(0, maxLength) + '...';
  };

  /**
   * Carga el empleado responsable de la testing card
   */
  const cargarResponsable = async () => {
    if (!data.id_responsable) return;
    
    try {
      setLoadingResponsable(true);
      const empleados = await obtenerEmpleados();
      const empleadoEncontrado = empleados.find((emp: Empleado) => emp.id_empleado === data.id_responsable);
      setResponsable(empleadoEncontrado || null);
    } catch (error) {
      console.error('Error al cargar responsable:', error);
      setResponsable(null);
    } finally {
      setLoadingResponsable(false);
    }
  };

  /**
   * Obtiene el nombre completo del empleado
   */
  const getNombreCompleto = (empleado: Empleado): string => {
    const apellidoCompleto = empleado.apellido_materno 
      ? `${empleado.apellido_paterno} ${empleado.apellido_materno}`
      : empleado.apellido_paterno;
    return `${empleado.nombre_pila} ${apellidoCompleto}`.trim();
  };

  /**
   * Obtiene las iniciales del empleado
   */
  const getIniciales = (empleado: Empleado): string => {
    const inicial1 = empleado.nombre_pila?.charAt(0) || '';
    const inicial2 = empleado.apellido_paterno?.charAt(0) || '';
    return (inicial1 + inicial2).toUpperCase();
  };

  /**
   * Renderiza la información del TestingCardPlaybook asociado
   */
  const renderPlaybookInfo = () => {
    if (loadingPlaybook) {
      return (
        <div className="playbook-info loading" style={{
          fontSize: '12px',
          color: 'var(--theme-text-secondary)',
          fontStyle: 'italic',
          marginBottom: '8px'
        }}>
          Cargando información del experimento...
        </div>
      );
    }

    if (!playbook) {
      return null; // No mostrar nada si no hay playbook
    }

    return (
      <div className="playbook-info" style={{
        marginBottom: '12px',
        padding: '8px 12px',
        backgroundColor: 'rgba(108, 99, 255, 0.05)',
        borderLeft: '3px solid #6C63FF',
        borderRadius: '4px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#6C63FF',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Tipo de Experimento
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--theme-text-primary)',
          marginBottom: '2px'
        }}>
          {playbook.titulo}
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--theme-text-secondary)',
          display: 'flex',
          gap: '12px'
        }}>
          <span><strong>Campo:</strong> {playbook.campo}</span>
          <span><strong>Tipo:</strong> {playbook.tipo}</span>
        </div>
      </div>
    );
  };

  const renderMetricas = () => {
    if (loadingMetricas) {
      return (
        <div className="metricas-loading">
          <span>Cargando métricas...</span>
        </div>
      );
    }

    if (metricas.length === 0) {
      return (
        <div className="metricas-empty">
          <span>No hay métricas definidas</span>
        </div>
      );
    }

    return (
      <div className="metricas-list">
        {metricas.map((metrica) => (
          <div key={metrica.id_metrica} className="metrica-item">
            <div className="metrica-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <BarChart3 size={14} />
              <span className="metrica-nombre" style={{ fontWeight: '600' }}>
                {metrica.nombre}
              </span>
              <span className="metrica-operador" style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '10px',
                border: '1px solid #2563eb',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {metrica.operador}
              </span>
              <span className="metrica-valor" style={{
                color: '#64748b',
                fontWeight: '500',
                fontSize: '11px'
              }}>
                {metrica.criterio}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`testing-card ${selected ? 'selected' : ''}`}>
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="node-handle" id="top" />
      <Handle type="target" position={Position.Left} className="node-handle" id="left" />
      <Handle type="source" position={Position.Right} className="node-handle" id="right" />
      <Handle type="source" position={Position.Bottom} className="node-handle" id="bottom" />

      <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="experiment-type">
            <ClipboardList size={14} />
            <span>TESTING CARD</span>
            {/*<span>Tipo #{data.id_experimento_tipo}</span> */}
          </div>
        </div>
        
        <TemplateDropdown
          onApplyTemplate={handleApplyTemplate}
          onSaveTemplate={handleSaveTemplate}
          className="compact"
        />
      </div>

      <div className="card-body">
        <h3 className="card-title">{data.titulo}</h3>
        <p className="card-description">{data.descripcion}</p>

        {/* Información del TestingCardPlaybook */}
        {renderPlaybookInfo()}

        <button
          onClick={toggleExpanded}
          className="expand-button"
          aria-label={isExpanded ? "Ocultar detalles" : "Ver más detalles"}
        >
          <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
          <ChevronDown size={16} className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
        </button>

        <div className={`expandable-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="hypothesis-section">
            <div className="hypothesis-label">
              <Target size={12} style={{ marginRight: '4px' }} />
              Hipótesis
            </div>
            <p className="hypothesis-text">{data.hipotesis}</p>
          </div>

          {/* Nueva sección de métricas */}
          <div className="metricas-section">
            <div className="metricas-label">
              <BarChart3 size={12} style={{ marginRight: '4px' }} />
              Métricas de Éxito
            </div>
            {renderMetricas()}
          </div>

          {/* Sección de URLs de documentación */}
          <div className="links-section">
            <div className="links-label">
              <ExternalLink size={12} style={{ marginRight: '4px' }} />
              URLs de referencia
            </div>
            
            {loadingUrls && (
              <div className="loading-urls" style={{ 
                fontSize: '12px', 
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                padding: '4px 0'
              }}>
                Cargando URLs...
              </div>
            )}

            {!loadingUrls && urls.length === 0 && (
              <div className="no-urls" style={{ 
                fontSize: '12px', 
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                padding: '4px 0'
              }}>
                No hay URLs registradas
              </div>
            )}

            {!loadingUrls && urls.length > 0 && (
              <div className="links-list">
                {urls.map((urlObj) => (
                  <div key={urlObj.id_url_tc} className="link-item">
                    <ExternalLink size={12} />
                    <a 
                      href={urlObj.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link-text"
                      onClick={(e) => e.stopPropagation()}
                      title={urlObj.url}
                    >
                      {truncateUrl(urlObj.url)}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección del Responsable */}
          <div className="responsable-section">
            <div className="responsable-label">
              <User size={12} style={{ marginRight: '4px' }} />
              Responsable
            </div>
            
            {loadingResponsable && (
              <div className="loading-responsable" style={{ 
                fontSize: '12px', 
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                padding: '4px 0'
              }}>
                Cargando responsable...
              </div>
            )}

            {!loadingResponsable && !responsable && data.id_responsable && (
              <div className="no-responsable" style={{ 
                fontSize: '12px', 
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                padding: '4px 0'
              }}>
                Responsable no encontrado
              </div>
            )}

            {!loadingResponsable && !data.id_responsable && (
              <div className="no-responsable" style={{ 
                fontSize: '12px', 
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                padding: '4px 0'
              }}>
                No hay responsable asignado
              </div>
            )}

            {!loadingResponsable && responsable && (
              <div className="responsable-info">
                <div className="responsable-avatar">
                  {getIniciales(responsable)}
                </div>
                <div className="responsable-details">
                  <div className="responsable-name">
                    {getNombreCompleto(responsable)}
                  </div>
                  <div className="responsable-email">
                    {responsable.correo}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="experiment-details">
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--theme-text-secondary)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              {/*<strong>ID Secuencia:</strong> {data.id_secuencia}*/}
            </div>
            
          </div>
        </div>

        <div className="card-dates">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            <span className="dates-text">
              {formatDate(data.dia_inicio)} - {formatDate(data.dia_fin)}
            </span>
          </div>

          <span
            className={`status-badge ${data.status.toLowerCase().replace(' ', '-')}`}
            style={{
              backgroundColor:
                data.status === 'EN VALIDACION'
                  ? '#facc15'
                  : data.status === 'EN PLANEACION'
                  ? '#22c55e'
                  : data.status === 'EN ANALISIS'
                  ? '#2563eb'
                  : data.status === 'TERMINADO'
                  ? '#ef4444'                  
                  : '#9ca3af',
              color: '#fff',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 10px',
              marginLeft: 8,
              minWidth: 80,
              textAlign: 'center',
              textTransform: 'capitalize',
              letterSpacing: 0.5,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              data.onStatusChange();
            }}
          >
            {data.status}
          </span>
        </div>
      </div>

      <div className="card-footer">
        <button onClick={(e) => { e.stopPropagation(); data.onAddTesting(); }} className="card-btn add-testing" title="Añadir Testing Card conectada">
          <Plus size={12} /> TC
        </button>
        <button onClick={(e) => { e.stopPropagation(); data.onAddLearning(); }} className="card-btn add-learning" title="Añadir Learning Card conectada">
          <Plus size={12} /> LC
        </button>
        <button onClick={(e) => { e.stopPropagation(); data.onEdit(); }} className="card-btn edit" title="Editar Testing Card">
          <Edit3 size={12} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); data.onDelete(); }} className="card-btn delete" title="Eliminar Testing Card">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Modal de plantillas usando portal para renderizar fuera del nodo */}
      {showTemplateModal && createPortal(
        <TemplateViewerModal
          isOpen={showTemplateModal}
          onClose={handleCloseTemplateModal}
          id_testing_card={data.id_testing_card}
        />,
        document.body
      )}
    </div>
  );
};

export default TestingCardNode;
