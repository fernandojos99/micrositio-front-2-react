import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Edit3, 
  Trash2, 
  BookOpen, 
  ChevronDown,
  FileText,
  Lightbulb,
  ExternalLink,
  BarChart3,
  User
} from 'lucide-react';
import { LearningCardData } from './types';
import { UrlLearningCard, obtenerPorLearningCard } from '../../services/urlLearningCardService';
import { MetricaTestingCard, obtenerPorTestingCard } from '../../services/metricaTestingCardService';
import { Empleado, obtenerEmpleados } from '../../services/empleadosService';
import './styles/LearningCardNode.css';
import { obtenerAccionablesPorLearningCard, obtenerAccionablesPorSecuencia } from '@/services/accionableService';
import { Accionable } from '@/pages/Interfaces/accionablesPoints';

/**
 * Props para el componente LearningCardNode
 */
interface LearningCardNodeProps {
  /** Datos de la Learning Card */
  data: LearningCardData & {
    onEdit: () => void;
    onDelete: () => void;
  };
  /** Indica si el nodo está seleccionado */
  selected?: boolean;
}


/**
 * Componente LearningCardNode
 * 
 * Renderiza una Learning Card con diseño elegante y funcionalidad expandible.
 * Muestra resultados y hallazgos de experimentos con contenido adicional
 * que se puede mostrar/ocultar. Ahora incluye sección de colaboradores
 * (co-autores) en la sección derecha superior.
 * 
 * Características:
 * - Diseño moderno con tema verde para diferenciarse de Testing Cards
 * - Sección de co-autores en la parte superior derecha
 * - Contenido expandible con animaciones suaves
 * - Secciones diferenciadas para resultados e insights
 * - Enlaces y archivos adjuntos en contenido expandible
 * - Handle superior para conexiones desde Testing Cards
 * - Responsive y compatible con modo oscuro
 */
const LearningCardNode: React.FC<LearningCardNodeProps> = ({ data, selected }) => {
  // Estado visual para la Learning Card: Aceptada, Rechazada, Reiterar, Mal planteada
  const statusMap: Record<string, { label: string; className: string }> = {
    'ACEPTADA': { label: 'ACEPTADA', className: 'learning-status-cumplido' },
    'RECHAZADA': { label: 'RECHAZADA', className: 'learning-status-rechazado' },
    'REITERAR': { label: 'REITERAR', className: 'learning-status-repetir' },
    'MAL PLANTEADA': { label: 'MAL PLANTEADA', className: 'learning-status-validada' },
  };
  const statusInfo = statusMap[data.estado];
  // Estado para controlar si el contenido está expandido
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estado para las URLs de la Learning Card
  const [urls, setUrls] = useState<UrlLearningCard[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);

  // Estado para las métricas asociadas al Testing Card
  const [metricas, setMetricas] = useState<MetricaTestingCard[]>([]);
  const [loadingMetricas, setLoadingMetricas] = useState(false);

  // Estado para el empleado responsable
  const [responsable, setResponsable] = useState<Empleado | null>(null);
  const [loadingResponsable, setLoadingResponsable] = useState(false);

  /**
   * Carga las URLs y métricas cuando se expande el contenido y hay un ID válido
   */
  useEffect(() => {
    if (isExpanded && data.id_learning_card) {
      cargarUrls();
      // Cargar métricas usando el id_testing_card de la LearningCard
      if (data.id_testing_card) {
        cargarMetricas();
      }
      // Cargar información del responsable
      if (data.id_responsable) {
        cargarResponsable();
      }
    }
    // eslint-disable-next-line
  }, [isExpanded, data.id_learning_card, data.id_testing_card, data.id_responsable]);


    // Obtener accionables de cada secuencia y guardarlos en un nuevo estado que combine
  // ambos datos para facilitar el acceso a la hora de generar los puntos del grafico.
  // const [accionables, setAccionables] = useState(Accionable[]); (MAL)
  const [accionables, setAccionables] = useState<Accionable[]>([]);

  useEffect(() => {
    const fetchAccionables = async () => {
      try {
        const result = await obtenerAccionablesPorLearningCard(Number(data.id_learning_card));
        setAccionables(result);
      } catch (error) {
        console.error("Error al obtener accionables:", error);
      }
    };
  
    fetchAccionables();
  }, [data.id_learning_card]);

  /**
   * Carga las URLs desde la base de datos
   */
  const cargarUrls = async () => {
    if (!data.id_learning_card) return;
    
    try {
      setLoadingUrls(true);
      const urlsData = await obtenerPorLearningCard(data.id_learning_card);
      setUrls(urlsData || []);
    } catch (error) {
      console.error('[LearningCardNode] Error al cargar URLs:', error);
      setUrls([]);
    } finally {
      setLoadingUrls(false);
    }
  };

  /**
   * Carga las métricas desde la base de datos usando el id_testing_card
   */
  const cargarMetricas = async () => {
    if (!data.id_testing_card) return;
    
    try {
      setLoadingMetricas(true);
      const metricasData = await obtenerPorTestingCard(data.id_testing_card);
      setMetricas(metricasData || []);
    } catch (error) {
      console.error('[LearningCardNode] Error al cargar métricas:', error);
      setMetricas([]);
    } finally {
      setLoadingMetricas(false);
    }
  };

  /**
   * Carga la información del empleado responsable
   */
  const cargarResponsable = async () => {
    if (!data.id_responsable) return;
    
    try {
      setLoadingResponsable(true);
      const empleados = await obtenerEmpleados();
      const empleadoEncontrado = empleados.find((emp: Empleado) => emp.id_empleado === data.id_responsable);
      setResponsable(empleadoEncontrado || null);
    } catch (error) {
      console.error('[LearningCardNode] Error al cargar responsable:', error);
      setResponsable(null);
    } finally {
      setLoadingResponsable(false);
    }
  };

  /**
   * Obtiene el nombre completo de un empleado
   */
  const getNombreCompleto = (empleado: Empleado) => {
    return `${empleado.nombre_pila} ${empleado.apellido_paterno}${empleado.apellido_materno ? ' ' + empleado.apellido_materno : ''}`;
  };

  /**
   * Obtiene las iniciales de un empleado
   */
  const getIniciales = (empleado: Empleado) => {
    const nombres = [empleado.nombre_pila, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean);
    return nombres.map(n => (n ? n[0] : '')).join('').toUpperCase();
  };

  /**
   * Alterna el estado de expansión del contenido
   */
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  /**
   * Trunca texto para la vista previa
   */
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
   * Renderiza las métricas del Testing Card asociado con sus resultados
   */
  const renderMetricas = () => {
    if (loadingMetricas) {
      return (
        <div className="metricas-loading" style={{
          fontSize: '12px',
          color: 'var(--theme-text-secondary)',
          fontStyle: 'italic',
          padding: '8px 0'
        }}>
          <span>Cargando métricas...</span>
        </div>
      );
    }

    if (metricas.length === 0) {
      return (
        <div className="metricas-empty" style={{
          fontSize: '12px',
          color: 'var(--theme-text-secondary)',
          fontStyle: 'italic',
          padding: '8px 0'
        }}>
          <span>No hay métricas definidas para el Testing Card asociado</span>
        </div>
      );
    }

    return (
      <div className="metricas-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {metricas.map((metrica) => (
          <div 
            key={metrica.id_metrica} 
            //key={metrica.id_metrica} 

            className="metrica-item"
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--theme-bg-secondary)',
              borderRadius: '6px',
              border: '1px solid var(--theme-border)',
              fontSize: '12px'
            }}
          >
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
                color: 'var(--theme-text-secondary)',
                fontSize: '11px'
              }}>
                {metrica.operador}
              </span>
              <span className="metrica-valor" style={{
                color: 'var(--theme-text-secondary)',
                fontSize: '11px'
              }}>
                {metrica.criterio}
              </span>
            </div>
            {/* Mostrar el resultado si existe */}
            {metrica.resultado && (
              <div className="metrica-resultado" style={{
                padding: '4px 8px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '4px',
                color: 'var(--theme-text-primary)',
                fontSize: '11px',
                marginTop: '4px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <strong>Resultado obtenido:</strong> {metrica.resultado}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`learning-card ${selected ? 'selected' : ''}`}>
      {/* Handle superior para conexiones desde Testing Cards */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="node-handle" 
      />
      
      {/* Handle inferior opcional para futuras conexiones */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="node-handle" 
      />
      
      {/* Header de la card con tipo, estado e ID */}
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-type">
            <BookOpen size={14} />
            <span>Learning Card</span>
          </div>
          {/* Estado visual */}
          {statusInfo && (
            <span className={`learning-status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
          )}
        </div>
        {/*<div className="card-id">#{data.id_learning_card.toString().slice(-4)}</div>*/}
      </div>

      {/* @section: Co-autores - Posición: Sección derecha superior 
      {assignedCollaborators.length > 0 && (
        <div className="card-collaborators">
          <div className="collaborators-label">
            <Users size={12} />
            <span>Co-autores</span>
          </div>
          <div className="collaborators-list">
            {assignedCollaborators.slice(0, 3).map((collaborator) => (
              <div key={collaborator.id} className="collaborator-avatar-container">
                {collaborator.avatar ? (
                  <img 
                    src={collaborator.avatar} 
                    alt={collaborator.name}
                    className="collaborator-avatar"
                    title={collaborator.name}
                  />
                ) : (
                  <div 
                    className="collaborator-avatar-placeholder"
                    title={collaborator.name}
                  >
                    {getInitials(collaborator.name)}
                  </div>
                )}
              </div>
            ))}
            {assignedCollaborators.length > 3 && (
              <div className="collaborator-counter" title={`${assignedCollaborators.length - 3} más`}>
                +{assignedCollaborators.length - 3}
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Cuerpo principal con información */}
      <div className="card-body">
        {/* Sección de resultados */}
        <div className="result-section">
          <h4>
            <FileText size={12} style={{ marginRight: '4px' }} />
            Resultados
          </h4>
          <p className={isExpanded ? 'section-text-expanded' : 'section-text-collapsed'}>
            {isExpanded ? data.resultado : truncateText(data.resultado || 'Sin resultados registrados')}
          </p>
        </div>
        
     
        {/* Sección de hallazgos accionables */}
        {/* Sección de hallazgos accionables */}
        <div className="insight-section">
          <h4>
            <Lightbulb size={12} style={{ marginRight: '4px' }} />
            Hallazgo Accionable
          </h4>

          {!accionables?.length ? (
            <div className={isExpanded ? 'section-text-expanded' : 'section-text-collapsed'}>
              Sin hallazgos registrados
            </div>
          ) : isExpanded ? (
            <ul style={{
              margin: '8px 0 0 0',
              paddingLeft: '20px',
              listStyleType: 'disc',
              listStylePosition: 'outside'
            }}>
              {accionables.map((accionable, index) => {
                return (
                  <li key={index} style={{
                    marginBottom: '12px',
                    display: 'list-item',
                    whiteSpace: 'normal'
                  }}>
                    <div style={{ marginBottom: '4px', fontWeight: '500' }}>
                      {accionable.contenido}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '11px',
                      color: 'var(--theme-text-secondary)',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontWeight: '600' }}>Impacto:</span> {accionable.impacto}/10
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontWeight: '600' }}>Esfuerzo:</span> {accionable.esfuerzo}/10
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="section-text-collapsed" style={{
              whiteSpace: 'normal',
              overflow: 'hidden',    // trucaso para esconder todo lo que este afuera del contenedor 
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              {(() => {
                // Truncar a 3 palabras en la vista colapsada
                const truncarAPalabras = (texto: string, maxPalabras: number = 3) => {
                  if (!texto) return '';
                  const palabras = texto.split(' ');
                  if (palabras.length <= maxPalabras) return texto;
                  return palabras.slice(0, maxPalabras).join(' ') + '...';
                };
                
                const contenidos = accionables.map(a => truncarAPalabras(a.contenido));
                const primeros3 = contenidos.slice(0, 3);
                const textoMostrado = primeros3.join(', ');
                return contenidos.length > 3 
                  ? `${textoMostrado}... (+${contenidos.length - 3} más)`
                  : textoMostrado;
              })()}
            </div>
          )}
        </div>


        {/* Botón para expandir/contraer contenido adicional */}
        <button 
          onClick={toggleExpanded}
          className="expand-button"
          aria-label={isExpanded ? "Ocultar detalles" : "Ver más detalles"}
        >
          <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
          <ChevronDown 
            size={16} 
            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          />
        </button>


        {/* Contenido expandible con información adicional */}
        <div className={`expandable-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
          
          {/* Sección de métricas del Testing Card asociado */}
          {isExpanded && (
            <div className="metricas-section" style={{ marginBottom: '16px' }}>
              <div className="metricas-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--theme-text-primary)',
                marginBottom: '8px'
              }}>
                <BarChart3 size={12} style={{ marginRight: '4px' }} />
                Métricas 
              </div>
              {renderMetricas()}
            </div>
          )}

          {/* Sección del responsable */}
          {isExpanded && (
            <div className="responsable-section" style={{ marginBottom: '16px' }}>
              <div className="responsable-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--theme-text-primary)',
                marginBottom: '8px'
              }}>
                <User size={12} style={{ marginRight: '4px' }} />
                Siguiente Responsable
              </div>
              
              {loadingResponsable && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--theme-text-secondary)',
                  fontStyle: 'italic',
                  padding: '4px 0'
                }}>
                  Cargando responsable...
                </div>
              )}

              {!loadingResponsable && !responsable && data.id_responsable && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--theme-text-secondary)',
                  fontStyle: 'italic',
                  padding: '4px 0'
                }}>
                  No se encontró información del responsable
                </div>
              )}

              {!loadingResponsable && !data.id_responsable && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--theme-text-secondary)',
                  fontStyle: 'italic',
                  padding: '4px 0'
                }}>
                  No hay responsable asignado
                </div>
              )}

              {!loadingResponsable && responsable && (
                <div className="responsable-info" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--theme-border)',
                  fontSize: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#6C63FF',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {getIniciales(responsable)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--theme-text-primary)' }}>
                      {getNombreCompleto(responsable)}
                    </div>
                    {/*<div style={{ color: 'var(--theme-text-secondary)', fontSize: '11px' }}>
                      {responsable.correo}
                    </div>*/}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Sección de URLs de documentación */}
          {isExpanded && (
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
                    <div key={urlObj.id_url_lc} className="link-item">
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
          )}

          {/* Sección de archivos adjuntos 
          {data.attachments && data.attachments.length > 0 && (
            <div className="attachments-section">
              <div className="attachments-label">
                <Paperclip size={12} style={{ marginRight: '4px' }} />
                Archivos adjuntos
              </div>
              <div className="attachments-list">
                {data.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <Paperclip size={12} />
                    <span>{attachment.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}*/}

          {/* Información adicional */}
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--theme-text-secondary)',
            marginTop: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm)',
            background: 'var(--theme-bg-secondary)',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--theme-border)'
          }}>
            {/*<strong>Testing Card asociada:</strong> #{data.id_testing_card.toString().slice(-4)}*/}
          </div>
        </div>
      </div>

      {/* Footer con botones de acción */}
      <div className="card-footer">
        {/* Botón para editar la Learning Card */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            data.onEdit(); 
          }} 
          className="card-btn edit"
          title="Editar Learning Card"
        >
          <Edit3 size={12} />
        </button>
        
        {/* Botón para eliminar la Learning Card */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            data.onDelete(); 
          }} 
          className="card-btn delete"
          title="Eliminar Learning Card"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default LearningCardNode;