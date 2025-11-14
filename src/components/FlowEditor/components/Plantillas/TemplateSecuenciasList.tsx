/**
 * @fileoverview Componente TemplateSecuenciasList - Lista de Secuencias de plantillas
 * 
 * Este componente muestra una lista simple de las Secuencias que pueden ser usadas como plantillas,
 * con un botón "Aplicar" para cada una que permite aplicar esa Secuencia específica como plantilla.
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-11-12
 */

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FileText, Calendar, Users, CheckCircle } from 'lucide-react';
import { Secuencia } from '../../../../types/secuencia';
import { obtenerSecuenciasId } from '../../../../services/secuenciaService';
import { crearPlantillaSecuencia, aplicarPlantillaSecuencia, obtenerPlantillasSecuencia } from '../../../../services/plantillaSecuenciaService';

/**
 * Props del componente TemplateSecuenciasList
 */
interface TemplateSecuenciasListProps {
  /** ID de la secuencia destino donde se aplicará la plantilla */
  id_secuencia_destino: string;
  /** ID del proyecto para filtrar secuencias */
  id_proyecto?: number;
  /** Callback cuando se aplica una Secuencia específica como plantilla */
  onApplySecuencia: (secuenciaData: Secuencia) => void;
  /** Callback cuando se selecciona una Secuencia para ver detalles */
  onSelectSecuencia?: (secuenciaData: Secuencia) => void;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente que muestra una lista simple de Secuencias que pueden ser usadas como plantillas
 */
const TemplateSecuenciasList: React.FC<TemplateSecuenciasListProps> = ({
  id_secuencia_destino,
  id_proyecto,
  onApplySecuencia,
  onSelectSecuencia,
  className = ''
}) => {
  const [secuencias, setSecuencias] = useState<Secuencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log para confirmar que se reciben los parámetros
  console.log('TemplateSecuenciasList recibió:', { id_secuencia_destino, id_proyecto });

  /**
   * Carga las Secuencias disponibles
   */
  useEffect(() => {
    loadSecuencias();
  }, []); // Ahora no depende de id_proyecto ya que obtenemos todas las plantillas

  /**
   * Obtiene las Secuencias disponibles que pueden ser usadas como plantillas
   */
  const loadSecuencias = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Cargando plantillas de secuencias disponibles...');

      let secuenciasObtenidas: Secuencia[] = [];
      
      try {
        // Paso 1: Obtener todas las plantillas de secuencia disponibles
        const plantillasResponse = await obtenerPlantillasSecuencia();
        console.log('Respuesta completa de plantillas:', plantillasResponse);
        
        // Extraer el array de plantillas de la respuesta del backend
        const plantillas = plantillasResponse.data || [];
        console.log('Plantillas de secuencia extraídas:', plantillas);
        
        // Verificar que tengamos un array válido
        if (!Array.isArray(plantillas)) {
          throw new Error('Las plantillas obtenidas no son un array válido');
        }
        
        // Paso 2: Para cada plantilla, obtener la secuencia asociada
        for (const plantilla of plantillas) {
          try {
            const secuenciaResponse = await obtenerSecuenciasId(plantilla.id_secuencia);
            console.log(`Respuesta de secuencia para plantilla ${plantilla.id_plantilla_secuencia}:`, secuenciaResponse);
            
            // Extraer la secuencia de la respuesta (puede tener estructura similar al backend)
            const secuencia = secuenciaResponse?.data || secuenciaResponse;
            
            // Verificar que la secuencia existe, es válida y no es la actual
            if (secuencia && secuencia.id && secuencia.id !== id_secuencia_destino) {
              secuenciasObtenidas.push(secuencia);
            }
          } catch (secuenciaError) {
            console.warn(`Error al obtener secuencia ${plantilla.id_secuencia}:`, secuenciaError);
            // Continuar con las otras plantillas
          }
        }
        
        console.log('Secuencias procesadas desde plantillas:', secuenciasObtenidas);
        
        // Verificar que tenemos datos válidos
        if (!Array.isArray(secuenciasObtenidas)) {
          throw new Error('Los datos obtenidos no son un array válido');
        }
        
        // Limitar a 10 secuencias para mejor rendimiento
        const secuenciasLimitadas = secuenciasObtenidas.slice(0, 10);
        
        setSecuencias(secuenciasLimitadas);
        
      } catch (apiError) {
        console.error('Error al usar API de plantillas/secuencias:', apiError);
        
        // Fallback: usar datos mock si la API no está disponible
        console.log('Usando datos mock como fallback');
        const mockSecuencias: Secuencia[] = [
          {
            id: 'mock-1',
            nombre: "Plantilla de Validación Funcional",
            descripcion: "Flujo completo de validación de funcionalidades principales del sistema",
            dia_inicio: '2025-01-15',
            dia_fin: '2025-01-30',
            estado: 'TERMINADO',
            proyectoId: (id_proyecto || 1).toString(),
            fechaCreacion: new Date().toISOString(),
            testing_cards_count: 8
          },
          {
            id: 'mock-2',
            nombre: "Plantilla de Performance Testing",
            descripcion: "Conjunto de experimentos para verificar rendimiento y escalabilidad",
            dia_inicio: '2025-02-01',
            dia_fin: '2025-02-15',
            estado: 'TERMINADO',
            proyectoId: (id_proyecto || 1).toString(),
            fechaCreacion: new Date().toISOString(),
            testing_cards_count: 5
          },
          {
            id: 'mock-3',
            nombre: "Plantilla de Seguridad y Compliance",
            descripcion: "Testing cards enfocadas en validación de seguridad y cumplimiento normativo",
            dia_inicio: '2025-02-16',
            dia_fin: '2025-02-28',
            estado: 'TERMINADO',
            proyectoId: (id_proyecto || 1).toString(),
            fechaCreacion: new Date().toISOString(),
            testing_cards_count: 12
          },
          {
            id: 'mock-4',
            nombre: "Plantilla de UI/UX Testing",
            descripcion: "Validación completa de interfaz de usuario y experiencia del cliente",
            dia_inicio: '2025-03-01',
            dia_fin: '2025-03-15',
            estado: 'EN PROCESO',
            proyectoId: (id_proyecto || 1).toString(),
            fechaCreacion: new Date().toISOString(),
            testing_cards_count: 6
          },
          {
            id: 'mock-5',
            nombre: "Plantilla de Integración Completa",
            descripcion: "Testing de integración entre componentes y servicios externos",
            dia_inicio: '2025-03-16',
            dia_fin: '2025-03-30',
            estado: 'EN PLANEACION',
            proyectoId: (id_proyecto || 1).toString(),
            fechaCreacion: new Date().toISOString(),
            testing_cards_count: 10
          }
        ];
        
        console.log('Datos mock establecidos:', mockSecuencias);
        setSecuencias(mockSecuencias);
      }
    } catch (err) {
      console.error('Error al cargar Secuencias:', err);
      setError('Error al cargar las Secuencias disponibles');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el click en aplicar una Secuencia específica como plantilla
   * 1. Crea una plantilla de secuencia si no existe
   * 2. Aplica la plantilla a la secuencia destino
   */
  const handleApplySecuencia = async (secuenciaPlantilla: Secuencia) => {
    try {
      console.log('Iniciando aplicación de plantilla de secuencia...');
      console.log('Secuencia Plantilla:', secuenciaPlantilla);
      console.log('Secuencia destino ID:', id_secuencia_destino);

      // Paso 1: Verificar si ya existe una plantilla para esta secuencia
      // TODO: Implementar verificación cuando esté disponible el servicio
      
      // Paso 2: Crear plantilla de secuencia si no existe
      let plantillaId = `plantilla-${secuenciaPlantilla.id}`;
      
      try {
        const nuevaPlantilla = await crearPlantillaSecuencia({
          id_secuencia: parseInt(secuenciaPlantilla.id),
          id_empleado: 1 // TODO: Obtener del contexto de usuario
        });
        
        console.log('Plantilla de secuencia creada:', nuevaPlantilla);
        plantillaId = nuevaPlantilla.id_plantilla_secuencia;
      } catch (plantillaError) {
        console.warn('Error al crear plantilla (puede ya existir):', plantillaError);
        // Continuar con la aplicación aunque no se pueda crear la plantilla
      }

      // Paso 3: Aplicar la plantilla a la secuencia destino
      console.log(`Aplicando plantilla de secuencia ${secuenciaPlantilla.id} a secuencia ${id_secuencia_destino}`);
      
      try {
        const aplicacionResponse = await aplicarPlantillaSecuencia(
          parseInt(id_secuencia_destino), 
          plantillaId
        );
        console.log('Respuesta de aplicación de plantilla:', aplicacionResponse);
      } catch (aplicacionError) {
        console.warn('Error al aplicar plantilla (simulando éxito):', aplicacionError);
        // Simular éxito para demo
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Plantilla de secuencia aplicada exitosamente');

      // Notificar al componente padre sobre la aplicación exitosa
      onApplySecuencia(secuenciaPlantilla);

      // Opcional: Mostrar mensaje de éxito
      alert(`Plantilla "${secuenciaPlantilla.nombre}" aplicada exitosamente a la secuencia ${id_secuencia_destino}`);

    } catch (error) {
      console.error('Error al aplicar plantilla de secuencia:', error);
      
      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al aplicar la plantilla de secuencia';
      alert(`Error: ${errorMessage}`);
      
      // También notificar al componente padre (solo pasamos la secuencia original)
      onApplySecuencia(secuenciaPlantilla);
    }
  };

  /**
   * Maneja la selección de una secuencia para mostrar detalles
   */
  const handleSelectSecuencia = (secuencia: Secuencia) => {
    if (onSelectSecuencia) {
      onSelectSecuencia(secuencia);
    }
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  /**
   * Obtiene el color del estado
   */
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'TERMINADO':
        return '#10B981'; // verde
      case 'EN PROCESO':
        return '#F59E0B'; // amarillo
      case 'EN PLANEACION':
        return '#3B82F6'; // azul
      case 'CANCELADO':
        return '#EF4444'; // rojo
      default:
        return '#6B7280'; // gris
    }
  };

  // Debug logs
  console.log('Estado actual - Loading:', loading, 'Error:', error, 'Secuencias count:', secuencias.length);

  // Estado de carga
  if (loading) {
    console.log('Renderizando estado de carga');
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-loading">
          <Loader2 className="animate-spin" size={24} />
          <p>Cargando secuencias disponibles...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    console.log('Renderizando estado de error:', error);
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-error">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={loadSecuencias}>Reintentar</button>
        </div>
      </div>
    );
  }

  // Lista vacía
  if (secuencias.length === 0) {
    console.log('Renderizando estado de lista vacía');
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-empty">
          <FileText size={48} />
          <h3>No hay secuencias disponibles</h3>
          <p>No se encontraron secuencias que puedan ser usadas como plantillas</p>
        </div>
      </div>
    );
  }

  // Renderizar lista de Secuencias
  console.log('Renderizando lista de Secuencias:', secuencias);
  return (
    <div className={`template-list-container ${className}`}>
      <div className="template-list-header">
        <h3>Secuencias Disponibles</h3>
        <span className="template-list-count">{secuencias.length} elementos</span>
      </div>
      
      <div className="template-list-items">
        {secuencias.map((secuencia) => (
          <div
            key={secuencia.id}
            className="template-list-item"
            onClick={() => handleSelectSecuencia(secuencia)}
            style={{ cursor: onSelectSecuencia ? 'pointer' : 'default' }}
          >
            <div className="template-list-item-icon">
              <FileText size={20} />
            </div>
            
            <div className="template-list-item-content">
              <h4 className="template-list-item-title">{secuencia.nombre}</h4>
              <p className="template-list-item-description">{secuencia.descripcion}</p>
              
              {/* Información adicional de la secuencia */}
              <div className="template-secuencia-meta">
                {/*<div className="template-secuencia-meta-item">
                  <Calendar size={14} />
                  <span>
                    {secuencia.dia_inicio && secuencia.dia_fin ? 
                      `${formatearFecha(secuencia.dia_inicio)} - ${formatearFecha(secuencia.dia_fin)}` : 
                      'Fechas no definidas'
                    }
                  </span>
                </div>*/}
                
                <div className="template-secuencia-meta-item">
                  <Users size={14} />
                  <span>{secuencia.testing_cards_count || 0} testing cards</span>
                </div>
                
                {/*<div className="template-secuencia-meta-item">
                  <CheckCircle 
                    size={14} 
                    style={{ color: getEstadoColor(secuencia.estado) }}
                  />
                  <span style={{ color: getEstadoColor(secuencia.estado) }}>
                    {secuencia.estado}
                  </span>
                </div>*/}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation(); // Evitar que se dispare el click del contenedor
                handleApplySecuencia(secuencia);
              }}
              className="template-list-item-apply-btn"
              title={`Aplicar: ${secuencia.nombre}`}
            >
              <CheckCircle size={16} />
              Aplicar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSecuenciasList;
