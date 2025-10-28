/**
 * @fileoverview Componente TemplateTestingCardNode - Testing Card simplificada para plantillas
 * 
 * Este archivo contiene una versión simplificada del componente TestingCardNode
 * específicamente diseñada para mostrar Testing Cards en modo de vista previa
 * de plantillas. Elimina todas las funcionalidades de edición y se enfoca
 * en proporcionar una vista limpia y clara del contenido.
 * 
 * Características principales:
 * - Vista de solo lectura sin botones de acción
 * - Diseño específico para modo plantilla
 * - Información condensada y clara
 * - Indicadores visuales de que es una plantilla
 * - Sin funcionalidades interactivas
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  ClipboardList, 
  Eye, 
  Target, 
  Calendar, 
  User, 
  Tag,
  Clock,
  CheckCircle2,
  Download
} from 'lucide-react';
import { TemplateTestingCardNodeProps, TEMPLATE_CONSTANTS } from './types';

/**
 * Componente TemplateTestingCardNode
 * 
 * Versión simplificada de TestingCardNode específicamente diseñada para
 * mostrar Testing Cards en plantillas. Proporciona una vista de solo lectura
 * con diseño optimizado para vista previa.
 * 
 * Diferencias con TestingCardNode regular:
 * - Sin botones de acción (editar, eliminar, agregar)
 * - Sin dropdown de plantillas
 * - Sin funcionalidades interactivas
 * - Diseño específico para modo plantilla
 * - Información condensada
 * 
 * @param props - Propiedades del componente
 * @returns Componente React de Testing Card para plantillas
 */
const TemplateTestingCardNode: React.FC<TemplateTestingCardNodeProps> = ({ 
  data, 
  selected = false,
  viewMode = TEMPLATE_CONSTANTS.VIEW_MODES.PREVIEW,
  onClick,
  onApplyTemplate,
  showApplyButton = true
}) => {

  /**
   * Formatea una fecha para mostrar en formato compacto
   * @param dateString - Fecha en formato string
   * @returns Fecha formateada para mostrar
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Obtiene el color asociado al estado de la Testing Card
   * @param status - Estado de la Testing Card
   * @returns Color CSS para el estado
   */
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'EN VALIDACION': '#facc15',
      'EN PLANEACION': '#22c55e', 
      'EN ANALISIS': '#2563eb',
      'TERMINADO': '#ef4444',
      'PAUSADO': '#9ca3af',
      'CANCELADO': '#6b7280'
    };
    return statusColors[status] || '#9ca3af';
  };

  /**
   * Obtiene el icono asociado al estado
   * @param status - Estado de la Testing Card
   * @returns Componente de icono para el estado
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TERMINADO':
        return <CheckCircle2 size={12} />;
      case 'EN ANALISIS':
        return <Eye size={12} />;
      case 'EN PLANEACION':
        return <Clock size={12} />;
      default:
        return <ClipboardList size={12} />;
    }
  };

  /**
   * Maneja el clic en el nodo (si está habilitado)
   */
  const handleNodeClick = () => {
    if (onClick) {
      onClick(`template-testing-${data.id_testing_card}`);
    }
  };

  /**
   * Maneja el clic en el botón "Aplicar"
   */
  const handleApplyClick = (e: React.MouseEvent) => {
    // Prevenir que el evento se propague al nodo padre
    e.stopPropagation();
    
    if (onApplyTemplate) {
      onApplyTemplate(data);
    }
  };

  /**
   * Obtiene las clases CSS basadas en el modo de vista
   */
  const getNodeClasses = (): string => {
    const baseClasses = 'template-testing-card';
    const modeClass = `template-testing-card--${viewMode}`;
    const selectedClass = selected ? 'template-testing-card--selected' : '';
    const clickableClass = onClick ? 'template-testing-card--clickable' : '';
    
    return [baseClasses, modeClass, selectedClass, clickableClass]
      .filter(Boolean)
      .join(' ');
  };

  // Renderizado del componente
  return (
    <div 
      className={getNodeClasses()}
      onClick={handleNodeClick}
      style={{
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Handles de conexión - solo para referencia visual */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="template-node-handle template-node-handle--target" 
        id="top" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="template-node-handle template-node-handle--target" 
        id="left" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="template-node-handle template-node-handle--source" 
        id="right" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="template-node-handle template-node-handle--source" 
        id="bottom" 
      />

      {/* Header de la plantilla */}
      <div className="template-card-header">
        <div className="template-card-type">
          <ClipboardList size={14} />
          <span className="template-card-type-text">PLANTILLA</span>
        </div>
        
        {/* Badge de categoría (si existe) */}
        {data.categoria && (
          <div className="template-card-category">
            <Tag size={12} />
            <span>{data.categoria}</span>
          </div>
        )}
      </div>

      {/* Cuerpo principal de la card */}
      <div className="template-card-body">
        {/* Título */}
        <h3 className="template-card-title">{data.titulo}</h3>
        
        {/* Descripción */}
        <p className="template-card-description">{data.descripcion}</p>

        {/* Hipótesis (si existe y el modo de vista lo permite) */}
        {data.hipotesis && viewMode === TEMPLATE_CONSTANTS.VIEW_MODES.DETAILED && (
          <div className="template-card-hypothesis">
            <div className="template-card-hypothesis-label">
              <Target size={12} />
              <span>Hipótesis</span>
            </div>
            <p className="template-card-hypothesis-text">{data.hipotesis}</p>
          </div>
        )}

        {/* Información de fechas */}
        <div className="template-card-dates">
          <div className="template-card-date-item">
            <Calendar size={12} />
            <span className="template-card-dates-text">
              {formatDate(data.dia_inicio)} - {formatDate(data.dia_fin)}
            </span>
          </div>
        </div>

        {/* Información del responsable (si existe) */}
        {data.id_responsable && viewMode !== TEMPLATE_CONSTANTS.VIEW_MODES.COMPACT && (
          <div className="template-card-responsible">
            <User size={12} />
            <span>Responsable #{data.id_responsable}</span>
          </div>
        )}
      </div>

      {/* Footer de la plantilla */}
      <div className="template-card-footer">
        <div className="template-card-footer-left">
          {/* Badge de estado */}
          <div 
            className="template-card-status"
            style={{
              backgroundColor: getStatusColor(data.status),
              color: '#fff'
            }}
          >
            {getStatusIcon(data.status)}
            <span>{data.status}</span>
          </div>

          {/* Badge de vista previa */}
          <div className="template-card-preview-badge">
            <Eye size={10} />
            <span>Vista previa</span>
          </div>
        </div>

        {/* Botón Aplicar (si está habilitado) */}
        {showApplyButton && onApplyTemplate && (
          <div className="template-card-footer-right">
            <button
              onClick={handleApplyClick}
              className="template-apply-btn"
              title="Aplicar esta Testing Card"
            >
              <Download size={12} />
              <span>Aplicar</span>
            </button>
          </div>
        )}
      </div>

      {/* Indicador de plantilla pública/privada */}
      {data.es_publica !== undefined && (
        <div className="template-card-access-indicator">
          <div 
            className={`template-access-badge ${data.es_publica ? 'public' : 'private'}`}
            title={data.es_publica ? 'Plantilla pública' : 'Plantilla privada'}
          >
            {data.es_publica ? '🌐' : '🔒'}
          </div>
        </div>
      )}

      {/* Información adicional para modo detallado */}
      {viewMode === TEMPLATE_CONSTANTS.VIEW_MODES.DETAILED && data.usos_count !== undefined && (
        <div className="template-card-usage-info">
          <small>Usada {data.usos_count} veces</small>
        </div>
      )}
    </div>
  );
};

// Exportar el componente como default
export default TemplateTestingCardNode;
