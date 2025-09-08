import React, { useState } from 'react';
import { Plus, Trash2, Edit, FlaskConical } from 'lucide-react';
import { Secuencia } from '../../../types/secuencia';
import Button from '../../../components/ui/Button/Button';
import ConfirmationModal from '../../../components/ui/ConfirmationModal/ConfirmationModal';
import styles from './SecuenciasSection.module.css';
import ActionDropdown from '../../../components/ui/ActionDropdown/ActionDropdown';
import EditSecuenciaModal from './EditSecuenciaModal';

/**
 * Props para el componente SecuenciasSection
 * @interface SecuenciasSectionProps
 */
interface SecuenciasSectionProps {
  /** Lista de secuencias del proyecto */
  secuencias: Secuencia[];
  /** Secuencia actualmente seleccionada */
  secuenciaSeleccionada: Secuencia | null;
  /** Título del proyecto */
  tituloProyecto?: string;
  /** Función callback para seleccionar una secuencia */
  onSecuenciaSelect: (secuencia: Secuencia) => void;
  /** Función callback para crear una nueva secuencia */
  onNuevaSecuencia?: () => void;
  /** Función callback para eliminar una secuencia */
  onEliminarSecuencia?: (secuenciaId: string) => void;
  /** Función callback para editar una secuencia (refresca la lista) */
  onEditarSecuencia?: () => Promise<void>;
}

/**
 * Componente SecuenciasSection
 * 
 * @component SecuenciasSection
 * @description Sección que muestra la lista de secuencias de un proyecto con
 * funcionalidades de selección, creación y eliminación. Incluye confirmación
 * de borrado seguro para prevenir eliminaciones accidentales.
 * 
 * Características principales:
 * - Grid responsive de tarjetas de secuencias
 * - Indicador visual de secuencia seleccionada
 * - Botón de eliminación con confirmación modal
 * - Estados de secuencia con colores diferenciados
 * - Formateo de fechas localizado
 * - Estado vacío con call-to-action
 * 
 * Funcionalidades de seguridad:
 * - Modal de confirmación para eliminación
 * - Mensaje claro sobre irreversibilidad
 * - Botones diferenciados (Cancelar/Confirmar)
 * 
 * @example
 * ```tsx
 * <SecuenciasSection
 *   secuencias={secuenciasDelProyecto}
 *   secuenciaSeleccionada={secuenciaActual}
 *   onSecuenciaSelect={handleSelectSecuencia}
 *   onNuevaSecuencia={handleCreateSecuencia}
 *   onEliminarSecuencia={handleDeleteSecuencia}
 * />
 * ```
 * 
 * @param {SecuenciasSectionProps} props - Props del componente
 * @returns {JSX.Element} Sección de secuencias
 */
const SecuenciasSection: React.FC<SecuenciasSectionProps> = ({
  secuencias,
  secuenciaSeleccionada,
  tituloProyecto,
  onSecuenciaSelect,
  onNuevaSecuencia,
  onEliminarSecuencia,
  onEditarSecuencia
}) => {
  // @state: Control del modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // @state: Secuencia pendiente de eliminación
  const [secuenciaToDelete, setSecuenciaToDelete] = useState<Secuencia | null>(null);

  // @state: Estado de carga durante eliminación
  const [isDeleting, setIsDeleting] = useState(false);

  // @state: Control del modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [secuenciaToEdit, setSecuenciaToEdit] = useState<Secuencia | null>(null);

  /**
   * Formatea fecha de día específico (dia_inicio/dia_fin)
   * @function formatearDia
   * @param {string} dia - Fecha en formato ISO string o fecha simple
   * @returns {string} Fecha formateada en español
   */
  const formatearDia = (dia: string) => {
    if (!dia || dia === '' || dia === '1970-01-01') {
      return 'Fecha no disponible';
    }
    try {
      // Para evitar problemas de zona horaria, parseamos la fecha como fecha local
      // Si la fecha viene en formato YYYY-MM-DD, la tratamos como fecha local
      const fechaParts = dia.split('-');
      if (fechaParts.length === 3) {
        const year = parseInt(fechaParts[0]);
        const month = parseInt(fechaParts[1]) - 1; // Los meses en JS son 0-indexed
        const day = parseInt(fechaParts[2]);
        
        // Validar que la fecha no sea 1970
        if (year === 1970) {
          return '';
        }
        
        const fecha = new Date(year, month, day);
        
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else {
        // Fallback para otros formatos
        const fecha = new Date(dia);
        
        // Validar que la fecha no sea inválida o de 1970
        if (isNaN(fecha.getTime()) || fecha.getFullYear() === 1970) {
          return '';
        }
        
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  /**
   * Inicia el proceso de eliminación de una secuencia
   * @function handleDeleteClick
   * @param {React.MouseEvent} e - Evento de clic para prevenir propagación
   * @param {Secuencia} secuencia - Secuencia a eliminar
   */
  const handleDeleteClick = (e: React.MouseEvent, secuencia: Secuencia) => {
    e.stopPropagation(); // @prevent: Evitar selección de la secuencia
    setSecuenciaToDelete(secuencia);
    setShowDeleteModal(true);
  };

  /**
   * Confirma y ejecuta la eliminación de la secuencia
   * @function handleConfirmDelete
   */
  const handleConfirmDelete = async () => {
    if (!secuenciaToDelete || !onEliminarSecuencia) return;

    setIsDeleting(true);

    try {
      // @action: Simular delay de API para mostrar estado de carga
      await new Promise(resolve => setTimeout(resolve, 1000));

      // @action: Ejecutar eliminación
      onEliminarSecuencia(secuenciaToDelete.id);

      // @cleanup: Limpiar estado
      setShowDeleteModal(false);
      setSecuenciaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar secuencia:', error);
      // @todo: Mostrar mensaje de error al usuario
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancela el proceso de eliminación
   * @function handleCancelDelete
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSecuenciaToDelete(null);
  };

  // Handler para abrir modal de edición
  const handleEditClick = (secuencia: Secuencia) => {
    setSecuenciaToEdit(secuencia);
    setShowEditModal(true);
  };

  // Handler para cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSecuenciaToEdit(null);
  };

  // Handler para cuando se edita una secuencia (refresca la lista en el padre)
  const handleSecuenciaEditada = async () => {
    if (typeof onEditarSecuencia === 'function') {
      await onEditarSecuencia();
    }
    handleCloseEditModal();
  };

  /**
   * Convierte el estado a un nombre de clase CSS válido
   * @function getEstadoClassName
   * @param {string} estado - Estado de la secuencia
   * @returns {string} Nombre de clase CSS válido
   */
  const getEstadoClassName = (estado: string) => {
    return estado.replace(/\s+/g, '_');
  };

  return (
    <div className={styles['secuencias-section']}>
      {/* @section: Header de la sección */}
      <div className={styles['secuencias-header']}>
        <div className={styles['secuencias-title-container']}>
          <h2 className={styles['secuencias-title']}>Secuencias del Proyecto:</h2>
          <h3 className={styles['proyecto-titulo']}>
            {tituloProyecto || 'Sin título'}
          </h3>
          <p className={styles['secuencias-description']}>
            Selecciona una secuencia para visualizar y editar su flujo de trabajo
          </p>
        </div>
      </div>

      {/* @section: Contenido principal */}
      <div className={styles['secuencias-content']}>
        {secuencias.length === 0 ? (
          /* @section: Estado vacío */
          <div className={styles['empty-secuencias']}>
            <h3 className={styles['empty-secuencias-title']}>No hay secuencias</h3>
            <p className={styles['empty-secuencias-description']}>
              Crea tu primera secuencia para comenzar a organizar el flujo de trabajo del proyecto.
            </p>
            {onNuevaSecuencia && (
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={onNuevaSecuencia}
              >
                Crear Primera Secuencia
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* @section: Grid de secuencias */}
            <div className={styles['secuencias-grid']}>
              {secuencias.map((secuencia) => (
                <div
                  key={secuencia.id}
                  className={`${styles['secuencia-card']} ${secuenciaSeleccionada?.id === secuencia.id ? styles['secuencia-card-selected'] : ''}`}
                  onClick={() => onSecuenciaSelect(secuencia)}
                >
                  {/* @component: Indicador de selección */}
                  {secuenciaSeleccionada?.id === secuencia.id && (
                    <div className={styles['selected-indicator']} />
                  )}

                  {/* @section: Header de la card */}
                  <div className={styles['secuencia-header']}>
                    <h3 className={styles['secuencia-nombre']}>{secuencia.nombre}</h3>
                    <div className={styles['secuencia-actions']}>
                      {/* @component: Badge de estado */}
                      <span className={`${styles['secuencia-estado']} ${styles[`estado-${getEstadoClassName(secuencia.estado)}`]}`}>
                        {secuencia.estado}
                      </span>

                      {/* @component: Dropdown de acciones */}
                      <ActionDropdown
                        actions={[
                          {
                            id: 'edit',
                            label: 'Editar',
                            icon: <Edit size={16} />,
                            onClick: () => handleEditClick(secuencia),
                            type: 'default',
                          },
                          {
                            id: 'delete',
                            label: 'Borrar',
                            icon: <Trash2 size={16} />,
                            onClick: () => handleDeleteClick({ stopPropagation: () => {} } as any, secuencia),
                            type: 'danger',
                          },
                        ]}
                        position="bottom-right"
                      />
                    </div>
                  </div>

                  {/* @section: Descripción */}
                  <p className={styles['secuencia-descripcion']}>
                    {secuencia.descripcion}
                  </p>

                  {/* @section: Información de fechas */}
                  <div className={styles['secuencia-fechas']}>
                    {/* Día de inicio - solo mostrar si tiene fecha */}
                    {secuencia.dia_inicio && (
                      <div className={styles['secuencia-fecha-item']}>
                        <span className={styles['secuencia-fecha-label']}>Inicio:</span>
                        <span className={styles['secuencia-fecha-valor']}>
                          {formatearDia(secuencia.dia_inicio)}
                        </span>
                      </div>
                    )}

                    {/* Día de fin - solo mostrar si tiene fecha */}
                    {secuencia.dia_fin && (
                      <div className={styles['secuencia-fecha-item']}>
                        <span className={styles['secuencia-fecha-label']}>Fin:</span>
                        <span className={styles['secuencia-fecha-valor']}>
                          {formatearDia(secuencia.dia_fin)}
                        </span>
                      </div>
                    )}

                    {/* @section: Contador de testing cards */}
                    <div className={styles['secuencia-testing-counter']}>
                      <FlaskConical size={14} className={styles['secuencia-testing-counter-icon']} />
                      <span className={styles['secuencia-testing-counter-text']}>
                        {secuencia.testing_cards_count || 0} experimentos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* @section: Botón para nueva secuencia */}
            {onNuevaSecuencia && (
              <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                <Button
                  variant="outline"
                  icon={<Plus size={16} />}
                  onClick={onNuevaSecuencia}
                >
                  Nueva Secuencia
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* @component: Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Borrar Secuencia"
        message={`¿Borrar toda la secuencia "${secuenciaToDelete?.nombre}"? Esta acción no puede deshacerse y se perderán todos los datos asociados.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="danger"
        isLoading={isDeleting}
      />
      {/* @component: Modal de edición de secuencia */}
      <EditSecuenciaModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        secuencia={secuenciaToEdit}
        onSecuenciaEditada={handleSecuenciaEditada}
      />
    </div>
  );
};

export default SecuenciasSection;