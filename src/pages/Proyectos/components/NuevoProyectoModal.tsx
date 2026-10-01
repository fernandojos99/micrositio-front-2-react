import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

import { obtenerEmpleados } from '../../../services/empleadosService';
import { obtenerTodas as obtenerCategorias } from '../../../services/categoriaService'; // Nuevo import
import Modal from '../../../components/ui-propios/Modal/Modal';
import Button from '../../../components/ui-propios/Button/Button';
import styles from './NuevoProyectoModal.module.css';
import { crearProyecto } from '../../../services/proyectosService';
import EmpleadoSelector from './EmpleadoSelector';
import EquipoSelector from './EquipoSelector';
import { crear as crearCelulaProyecto } from '../../../services/celulaProyectoService';

interface Empleado {
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  celular?: string;
  correo: string;
  numero_empleado: string;
  activo: boolean;
}

interface Categoria { // Nueva interfaz
  id_categoria: number;
  nombre: string;
  created_at: string;
  updated_at: string;
}

interface CreateProyectoData {
  titulo: string;
  descripcion: string;
  id_categoria: number;
  id_lider: number;
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin_estimada?: string; // YYYY-MM-DD
}

const avatarColors = [
  '#10b981', // verde
  '#3b82f6', // azul
  '#f59e42', // naranja
  '#f43f5e', // rosa
  '#a78bfa', // morado
  '#fbbf24', // amarillo
  '#6366f1', // azul oscuro
  '#14b8a6', // turquesa
  '#ef4444', // rojo
  '#8b5cf6', // violeta
];

const NuevoProyectoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProyectoCreado: (proyectoId: string) => void;
}> = ({ isOpen, onClose, onProyectoCreado }) => {
  const [formData, setFormData] = useState<CreateProyectoData>({
    titulo: '',
    descripcion: '',
    id_categoria: 1,
    id_lider: 0,
    fecha_inicio: '',
    fecha_fin_estimada: ''
  });
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Nuevo estado
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false); // Nuevo estado de carga
  const [equipoIds, setEquipoIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      cargarEmpleados();
      cargarCategorias(); // Nueva función
      setFormData({
        titulo: '',
        descripcion: '',
        id_categoria: 1, // Cambiado a 0 para forzar selección
        id_lider: 0
      });
      setEquipoIds([]); // Limpiar equipo al abrir
      setErrors({});
    }
  }, [isOpen]);

  const cargarEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      setErrors(prev => ({ ...prev, empleados: '' }));
      const empleadosData = await obtenerEmpleados();
      setEmpleados(empleadosData);
    } catch (error) {
      setErrors(prev => ({ ...prev, empleados: 'Error al cargar empleados' }));
    } finally {
      setLoadingEmpleados(false);
    }
  };

  // Nueva función para cargar categorías
  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      setErrors(prev => ({ ...prev, categorias: '' }));
      const categoriasData = await obtenerCategorias();
      setCategorias(categoriasData);
    } catch (error) {
      setErrors(prev => ({ ...prev, categorias: 'Error al cargar categorías' }));
    } finally {
      setLoadingCategorias(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'El nombre del proyecto es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.id_lider || formData.id_lider === 0) newErrors.id_lider = 'Debes seleccionar un líder para el proyecto';
    // Validación de fechas
    if (formData.fecha_inicio && formData.fecha_fin_estimada && formData.fecha_inicio > formData.fecha_fin_estimada) {
      newErrors.fecha_fin_estimada = 'La fecha estimada debe ser posterior a la fecha de inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      // 1. Crear el proyecto
      const nuevoProyecto = await crearProyecto(formData);
      const id_proyecto = nuevoProyecto.id_proyecto || nuevoProyecto.id;
      // 2. Crear relaciones celula-proyecto para todos los colaboradores seleccionados (nuevo backend)
      if (equipoIds.length > 0 && id_proyecto) {
        await crearCelulaProyecto(equipoIds, id_proyecto, true);
      }
      // 3. (Opcional) Puedes mostrar un mensaje de éxito aquí
      onClose();
      onProyectoCreado(id_proyecto?.toString());
    } catch (error) {
      setErrors({ general: 'Error al crear el proyecto y/o asignar colaboradores. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLiderSelect = (empleadoId: number) => {
    setFormData(prev => ({ ...prev, id_lider: empleadoId }));
  };

  // Nueva función para manejar cambio de categoría
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id_categoria = Number(e.target.value); // Usa Number en lugar de parseInt
    setFormData(prev => ({ ...prev, id_categoria }));
  };

  const handleEquipoChange = (ids: number[]) => {
    setEquipoIds(ids);
  };

  const getNombreCompleto = (empleado: Empleado) =>
    `${empleado.nombre_pila} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim();

  const getIniciales = (empleado: Empleado) =>
    `${empleado.nombre_pila.charAt(0)}${empleado.apellido_paterno.charAt(0)}`.toUpperCase();

  const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

  const handleClose = () => {
    if (!loading) onClose();
  };

  const footer = (
    <>
      <Button variant="outline" onClick={handleClose} disabled={loading}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        icon={<Save size={16} />}
        onClick={handleSubmit}
        disabled={loading || loadingEmpleados || loadingCategorias}
      >
        {loading ? 'Creando...' : 'Crear Proyecto'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Proyecto"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.general && <div className={styles.error}>{errors.general}</div>}

        <div className={styles['form-group']}>
          <label htmlFor="titulo" className={styles.label}>
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            id="titulo"
            value={formData.titulo}
            onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            className={`${styles.input} ${errors.titulo ? styles['input-error'] : ''}`}
            placeholder="Ingresa el nombre del proyecto"
            disabled={loading}
          />
          {errors.titulo && <span className={styles.error}>{errors.titulo}</span>}
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción *
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            className={`${styles.input} ${styles.textarea} ${errors.descripcion ? styles['input-error'] : ''}`}
            placeholder="Describe el proyecto"
            rows={3}
            disabled={loading}
          />
          {errors.descripcion && <span className={styles.error}>{errors.descripcion}</span>}
        </div>

        {/* Nuevo selector de categorías */}
        <div className={styles['form-group']}>
          <label htmlFor="categoria" className={styles.label}>
            Categoría *
            {formData.id_categoria > 0 && categorias.length > 0 && (
              <span className={styles['selected-info']}>
                {' '}(Seleccionada: {categorias.find(cat => cat.id_categoria === formData.id_categoria)?.nombre || 'Categoría no encontrada'})
              </span>
            )}
          </label>
          {loadingCategorias ? (
            <div className={styles['loading-empleados']}>
              <p>Cargando categorías...</p>
            </div>
          ) : errors.categorias ? (
            <div className={styles.error}>
              {errors.categorias}
              <Button
                variant="outline"
                onClick={cargarCategorias}
                disabled={loadingCategorias}
                style={{ marginLeft: '10px', fontSize: '12px', padding: '4px 8px' }}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <select
              id="categoria"
              value={formData.id_categoria}
              onChange={handleCategoriaChange}
              className={`${styles.input} ${styles.select} ${errors.id_categoria ? styles['input-error'] : ''}`}
              disabled={loading || loadingCategorias}
            >
              <option value="0">Selecciona una categoría</option>
              <option value="1">Proyecto Libre</option> {/* Valor por defecto */}
              {categorias.filter(cat => cat.id_categoria !== 1).map(categoria => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          )}
          {errors.id_categoria && <span className={styles.error}>{errors.id_categoria}</span>}
        </div>

        {/* Selector de líder con grid bonito y colores */}
        <EmpleadoSelector
          empleados={empleados}
          loading={loading}
          loadingEmpleados={loadingEmpleados}
          errors={errors}
          selectedId={formData.id_lider}
          onSelect={handleLiderSelect}
          cargarEmpleados={cargarEmpleados}
          getNombreCompleto={getNombreCompleto}
          getIniciales={getIniciales}
          getAvatarColor={getAvatarColor}
        />
        {/* Selector de equipo/célula */}
        <EquipoSelector
          empleados={empleados.filter(emp => emp.id_empleado !== formData.id_lider)}
          loading={loading}
          loadingEmpleados={loadingEmpleados}
          errors={errors}
          selectedIds={equipoIds}
          onSelect={handleEquipoChange}
          cargarEmpleados={cargarEmpleados}
          getNombreCompleto={getNombreCompleto}
          getIniciales={getIniciales}
          getAvatarColor={getAvatarColor}
          label="Colaboradores del Proyecto"
        />

        {/* Fechas de inicio y fin estimada */}
        <div className={styles['form-group']}>
          <label htmlFor="fecha_inicio" className={styles.label}>
            Fecha de inicio
          </label>
          <input
            type="date"
            id="fecha_inicio"
            value={formData.fecha_inicio || ''}
            onChange={e => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
            className={styles.input}
            disabled={loading}
          />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="fecha_fin_estimada" className={styles.label}>
            Fecha estimada de finalización
          </label>
          <input
            type="date"
            id="fecha_fin_estimada"
            value={formData.fecha_fin_estimada || ''}
            onChange={e => setFormData(prev => ({ ...prev, fecha_fin_estimada: e.target.value }))}
            className={styles.input}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default NuevoProyectoModal;