import React, { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle, FileText, Calendar, Settings } from 'lucide-react';
import { CreateSecuenciaData } from '../../../types/secuencia';
import styles from './NuevaSecuenciaModal.module.css';

/**
 * Props para el componente NuevaSecuenciaModal
 * Define las propiedades que recibe el modal para crear nuevas secuencias
 */
interface NuevaSecuenciaModalProps {
  /** Controla si el modal está visible o no */
  isOpen: boolean;
  /** Función que se ejecuta al cerrar el modal */
  onClose: () => void;
  /** ID del proyecto al que pertenecerá la nueva secuencia */
  proyectoId: string;
  /**
   * Callback asíncrono que se ejecuta cuando se crea exitosamente una nueva secuencia.
   * Debe retornar una promesa y cerrar el modal solo cuando la operación haya terminado.
   */
  onSecuenciaCreada: (secuencia: CreateSecuenciaData) => Promise<void>;
}

/**
 * Modal para crear una nueva secuencia en un proyecto
 * 
 * Este componente renderiza un modal con un formulario que permite al usuario
 * crear una nueva secuencia proporcionando un nombre y descripción.
 * 
 * Características:
 * - Validación de campos en tiempo real
 * - Contador de caracteres para la descripción
 * - Manejo de estados de error
 * - Cierre con tecla ESC
 * - Prevención de scroll del body cuando está abierto
 * - Diseño responsive y accesible
 */
const NuevaSecuenciaModal: React.FC<NuevaSecuenciaModalProps> = ({
  isOpen,
  onClose,
  proyectoId,
  onSecuenciaCreada
}) => {
  // Estado del formulario con valores iniciales
  const [formData, setFormData] = useState<CreateSecuenciaData>({
    nombre: '',
    descripcion: '',
    id_proyecto: Number(proyectoId),
    dia_inicio: undefined,
    dia_fin: undefined,
    estado: 'EN PLANEACION'
  });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para controlar si el formulario está siendo enviado
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Efecto para manejar el cierre del modal con la tecla ESC
   * y prevenir el scroll del body cuando el modal está abierto
   */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  /**
   * Actualiza el proyectoId en el formData cuando cambia la prop
   */
  useEffect(() => {
    setFormData(prev => ({ ...prev, id_proyecto: Number(proyectoId) }));
  }, [proyectoId]);

  /**
   * Valida los campos del formulario
   * @returns true si todos los campos son válidos, false en caso contrario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación del nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la secuencia es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    // Validación de la descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcion.trim().length > 200) {
      newErrors.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    // Validación de fechas
    if (formData.dia_inicio && formData.dia_fin) {
      const fechaInicio = new Date(formData.dia_inicio);
      const fechaFin = new Date(formData.dia_fin);
      
      if (fechaInicio >= fechaFin) {
        newErrors.dia_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validación de estado
    if (!formData.estado) {
      newErrors.estado = 'Debe seleccionar un estado para la secuencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   * Valida los datos y llama a la función de callback si todo es correcto
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Crear objeto de secuencia con datos limpios
      const nuevaSecuencia: CreateSecuenciaData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        id_proyecto: Number(proyectoId),
        dia_inicio: formData.dia_inicio || undefined,
        dia_fin: formData.dia_fin || undefined,
        estado: formData.estado
      };
      // Esperar a que el callback termine (debe refrescar la lista y cerrar el modal)
      await onSecuenciaCreada(nuevaSecuencia);
      // Resetear el formulario solo si todo salió bien
      resetForm();
    } catch (error) {
      console.error('Error al crear la secuencia:', error);
      // Aquí se podría mostrar un mensaje de error al usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      id_proyecto: Number(proyectoId),
      dia_inicio: undefined,
      dia_fin: undefined,
      estado: 'EN PLANEACION'
    });
    setErrors({});
    setIsSubmitting(false);
  };

  /**
   * Maneja el clic en el backdrop del modal para cerrarlo
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Maneja el cierre del modal y resetea el formulario
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Calcula el color del contador de caracteres basado en la longitud
   */
  const getCharacterCountClass = (length: number, maxLength: number) => {
    const percentage = (length / maxLength) * 100;
    if (percentage >= 100) return styles['character-count-error'];
    if (percentage >= 80) return styles['character-count-warning'];
    return styles['character-count'];
  };

  // No renderizar nada si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleBackdropClick}>
      <div className={styles['modal-container']}>
        {/* Header del modal con título y botón de cerrar */}
        <div className={styles['modal-header']}>
          <div className={styles['modal-title-container']}>
            <div className={styles['modal-icon']}>
              <Plus size={20} />
            </div>
            <h2 className={styles['modal-title']}>Nueva Secuencia</h2>
          </div>
          <button
            onClick={handleClose}
            className={styles['modal-close-button']}
            aria-label="Cerrar modal"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del modal con el formulario */}
        <div className={styles['modal-body']}>
          <p className={styles['modal-description']}>
            Crea una nueva secuencia para organizar el flujo de trabajo de tu proyecto.
            Proporciona un nombre descriptivo y una breve descripción de su propósito.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Campo de nombre */}
            <div className={styles['form-group']}>
              <label htmlFor="nombre" className={styles['form-label']}>
                <FileText size={16} className={styles['form-label-icon']} />
                Nombre de la Secuencia
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                className={`${styles['form-input']} ${errors.nombre ? styles['form-input-error'] : ''}`}
                placeholder="Ej: Flujo de validación de usuarios"
                maxLength={50}
                disabled={isSubmitting}
              />
              {errors.nombre && (
                <span className={styles['form-error']}>
                  <AlertCircle size={14} className={styles['form-error-icon']} />
                  {errors.nombre}
                </span>
              )}
              <div className={getCharacterCountClass(formData.nombre.length, 50)}>
                {formData.nombre.length}/50 caracteres
              </div>
            </div>

            {/* Campo de descripción */}
            <div className={styles['form-group']}>
              <label htmlFor="descripcion" className={styles['form-label']}>
                <FileText size={16} className={styles['form-label-icon']} />
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                className={`${styles['form-input']} ${styles['form-textarea']} ${errors.descripcion ? styles['form-input-error'] : ''}`}
                placeholder="Describe el propósito y objetivos de esta secuencia..."
                rows={4}
                maxLength={200}
                disabled={isSubmitting}
              />
              {errors.descripcion && (
                <span className={styles['form-error']}>
                  <AlertCircle size={14} className={styles['form-error-icon']} />
                  {errors.descripcion}
                </span>
              )}
              <div className={getCharacterCountClass(formData.descripcion.length, 200)}>
                {formData.descripcion.length}/200 caracteres
              </div>
              <p className={styles['form-help']}>
                Proporciona una descripción clara que ayude a otros colaboradores a entender
                el propósito de esta secuencia.
              </p>
            </div>

            {/* Campo de estado */}
            <div className={styles['form-group']}>
              <label htmlFor="estado" className={styles['form-label']}>
                <Settings size={16} className={styles['form-label-icon']} />
                Estado de la Secuencia
              </label>
              <select
                id="estado"
                value={formData.estado || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estado: e.target.value as 'EN PLANEACION'| 'EN VALIDACION'| 'EN ANALISIS' |'CANCELADO' | 'TERMINADO' | 'EN PROCESO'
                }))}
                className={`${styles['form-input']} ${errors.estado ? styles['form-input-error'] : ''}`}
                disabled={isSubmitting}
              >
                <option value="EN PLANEACION">En Planeación</option>
                <option value="EN PROCESO">En Proceso</option>
                <option value="EN VALIDACION">En Validación</option>
                <option value="EN ANALISIS">En Análisis</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="TERMINADO">Terminado</option>
              </select>
              {errors.estado && (
                <span className={styles['form-error']}>
                  <AlertCircle size={14} className={styles['form-error-icon']} />
                  {errors.estado}
                </span>
              )}
              <p className={styles['form-help']}>
                Define el estado inicial en el que se creará esta secuencia.
              </p>
            </div>

            {/* Campo de fecha de inicio */}
            <div className={styles['form-group']}>
              <label htmlFor="dia_inicio" className={styles['form-label']}>
                <Calendar size={16} className={styles['form-label-icon']} />
                Fecha de Inicio (Opcional)
              </label>
              <input
                type="date"
                id="dia_inicio"
                value={formData.dia_inicio || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dia_inicio: e.target.value || undefined 
                }))}
                className={`${styles['form-input']} ${errors.dia_inicio ? styles['form-input-error'] : ''}`}
                disabled={isSubmitting}
              />
              {errors.dia_inicio && (
                <span className={styles['form-error']}>
                  <AlertCircle size={14} className={styles['form-error-icon']} />
                  {errors.dia_inicio}
                </span>
              )}
              <p className={styles['form-help']}>
                Define cuándo planeas comenzar esta secuencia.
              </p>
            </div>

            {/* Campo de fecha de fin */}
            <div className={styles['form-group']}>
              <label htmlFor="dia_fin" className={styles['form-label']}>
                <Calendar size={16} className={styles['form-label-icon']} />
                Fecha de Finalización (Opcional)
              </label>
              <input
                type="date"
                id="dia_fin"
                value={formData.dia_fin || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dia_fin: e.target.value || undefined 
                }))}
                className={`${styles['form-input']} ${errors.dia_fin ? styles['form-input-error'] : ''}`}
                disabled={isSubmitting}
              />
              {errors.dia_fin && (
                <span className={styles['form-error']}>
                  <AlertCircle size={14} className={styles['form-error-icon']} />
                  {errors.dia_fin}
                </span>
              )}
              <p className={styles['form-help']}>
                Establece una fecha límite estimada para completar esta secuencia.
              </p>
            </div>
          </form>
        </div>

        {/* Footer del modal con botones de acción */}
        <div className={styles['modal-footer']}>
          <button
            type="button"
            onClick={handleClose}
            className={`${styles['modal-button']} ${styles['modal-button-secondary']}`}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`${styles['modal-button']} ${styles['modal-button-primary']}`}
            disabled={isSubmitting || !formData.nombre.trim() || !formData.descripcion.trim()}
          >
            <Save size={16} className={styles['modal-button-icon']} />
            {isSubmitting ? 'Guardando...' : 'Crear Secuencia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaSecuenciaModal;