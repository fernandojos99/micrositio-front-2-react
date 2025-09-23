import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Proyecto } from '../../../types/proyecto';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import styles from './EditarProyectoModal.module.css';
import { actualizarProyecto } from '../../../services/proyectosService';
import { obtenerEmpleados } from '../../../services/empleadosService';
import { obtenerTodas } from '../../../services/categoriaService'; // Nuevo import
import EmpleadoSelector from '../../Proyectos/components/EmpleadoSelector';
import EquipoSelector from '../../Proyectos/components/EquipoSelector';
import { 
  obtenerPorProyecto, 
  crear as crearCelulaProyecto, 
  actualizarActivo,
  eliminar 
} from '../../../services/celulaProyectoService';

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

// Nueva interfaz para categoría
interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

interface EditarProyectoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: Proyecto;
  onProyectoActualizado: (proyecto: Proyecto) => void;
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

const EditarProyectoModal: React.FC<EditarProyectoModalProps> = ({
  isOpen,
  onClose,
  proyecto,
  onProyectoActualizado
}) => {
  const [formData, setFormData] = useState({
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    id_lider: proyecto.id_lider,
    id_categoria: proyecto.id_categoria || 1, // Nueva propiedad
    fecha_inicio: proyecto.fecha_inicio || '',
    fecha_fin_estimada: proyecto.fecha_fin_estimada || '',
    estado: proyecto.estado || 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'COMPLETADO'
  });
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Nuevo estado
  const [equipoIds, setEquipoIds] = useState<number[]>([]);
  const [equipoIdsOriginales, setEquipoIdsOriginales] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false); // Nuevo estado

  // Cargar empleados, categorías y equipo actual cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const liderId = proyecto.id_lider || 0;
      
      setFormData({
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        id_lider: liderId,
        id_categoria: proyecto.id_categoria || 0, // Cargar categoría actual
        fecha_inicio: proyecto.fecha_inicio || '',
        fecha_fin_estimada: proyecto.fecha_fin_estimada || '',
        estado: proyecto.estado || 'ACTIVO' 
      });
      setErrors({});
      
      cargarEmpleados();
      cargarCategorias(); // Nueva función
      cargarEquipoActual();
    }
  }, [isOpen, proyecto]);

  const cargarEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      setErrors(prev => ({ ...prev, empleados: '' }));
      const empleadosData = await obtenerEmpleados();

      const empleadosMapeados: Empleado[] = empleadosData.map((empleado: any) => ({
        id_empleado: empleado.id_empleado,
        nombre_pila: empleado.nombre_pila,
        apellido_paterno: empleado.apellido_paterno,
        apellido_materno: empleado.apellido_materno,
        correo: empleado.correo,
        activo: empleado.activo
      }));

      setEmpleados(empleadosMapeados);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
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
      const categoriasData = await obtenerTodas();

      const categoriasMapeadas: Categoria[] = categoriasData.map((categoria: any) => ({
        id_categoria: categoria.id_categoria,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion
      }));

      setCategorias(categoriasMapeadas);
      //console.log('📂 Categorías cargadas:', categoriasMapeadas);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setErrors(prev => ({ ...prev, categorias: 'Error al cargar categorías' }));
    } finally {
      setLoadingCategorias(false);
    }
  };

  const cargarEquipoActual = async () => {
    try {
      setErrors(prev => ({ ...prev, equipo: '' }));
      const relaciones = await obtenerPorProyecto(Number(proyecto.id));
      
      // Filtrar solo las relaciones activas y excluir al líder
      const equipoActivo = relaciones
        .filter(rel => rel.activo && rel.id_empleado !== proyecto.id_lider)
        .map(rel => rel.id_empleado);
      
      setEquipoIds(equipoActivo);
      setEquipoIdsOriginales([...equipoActivo]); // Hacer una copia para evitar problemas de referencia

      //console.log('📋 Equipo actual cargado:', equipoActivo);
      //console.log('📋 Equipo IDs originales:', equipoActivo);
    } catch (error) {
      console.error('Error al cargar equipo actual:', error);
      setErrors(prev => ({ ...prev, equipo: 'Error al cargar el equipo actual' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del proyecto es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.id_lider || formData.id_lider === 0) {
      newErrors.id_lider = 'Debes seleccionar un líder para el proyecto';
    }

    if (!formData.id_categoria || formData.id_categoria === 0) {
      newErrors.id_categoria = 'Debes seleccionar una categoría para el proyecto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Nueva función para actualizar el equipo del proyecto
  const actualizarEquipoProyecto = async () => {
    try {
      const equipoIdsActuales = equipoIds.filter(id => id !== formData.id_lider);
      
      // Empleados que se agregaron (están en equipoIdsActuales pero no en equipoIdsOriginales)
      const empleadosAgregar = equipoIdsActuales.filter(id => !equipoIdsOriginales.includes(id));
      
      // Empleados que se quitaron (están en equipoIdsOriginales pero no en equipoIdsActuales)
      const empleadosQuitar = equipoIdsOriginales.filter(id => !equipoIdsActuales.includes(id));

      //console.log('👥 Actualizando equipo:');
      //console.log('  ➕ Agregar:', empleadosAgregar);
      //console.log('  ➖ Quitar:', empleadosQuitar);

      // Crear relaciones para nuevos empleados
      if (empleadosAgregar.length > 0) {
        await crearCelulaProyecto(empleadosAgregar, Number(proyecto.id), true);
        console.log('✅ Empleados agregados exitosamente');
      }

      // Eliminar relaciones de empleados quitados usando el endpoint eliminar
      if (empleadosQuitar.length > 0) {
        try {
          // Obtener las relaciones actuales para encontrar los IDs de las relaciones a eliminar
          const relacionesActuales = await obtenerPorProyecto(Number(proyecto.id));
          
          for (const empleadoId of empleadosQuitar) {
            const relacion = relacionesActuales.find(rel => 
              rel.id_empleado === empleadoId && rel.activo
            );
            
            if (relacion) {
              // Usar eliminar en lugar de actualizarActivo
              await eliminar(relacion.id);
              //console.log(`✅ Empleado ${empleadoId} eliminado exitosamente (ID relación: ${relacion.id})`);
            } else {
              //console.warn(`⚠️ No se encontró relación activa para empleado ${empleadoId}`);
            }
          }
        } catch (eliminarError) {
          console.error('❌ Error al eliminar empleados:', eliminarError);
          
          // Fallback: intentar con actualizarActivo
          console.log('🔄 Intentando desactivar en lugar de eliminar...');
          const relacionesActuales = await obtenerPorProyecto(Number(proyecto.id));
          
          for (const empleadoId of empleadosQuitar) {
            const relacion = relacionesActuales.find(rel => 
              rel.id_empleado === empleadoId && rel.activo
            );
            
            if (relacion) {
              try {
                await actualizarActivo(relacion.id, false);
                console.log(`✅ Empleado ${empleadoId} desactivado exitosamente (fallback)`);
              } catch (fallbackError) {
                console.error(`❌ Error al desactivar empleado ${empleadoId}:`, fallbackError);
                throw new Error(`No se pudo eliminar ni desactivar al empleado ${empleadoId}`);
              }
            }
          }
        }
      }

      if (empleadosAgregar.length === 0 && empleadosQuitar.length === 0) {
        console.log('ℹ️ No hay cambios en el equipo');
      }

    } catch (error) {
      console.error('❌ Error al actualizar equipo:', error);
      throw new Error('Error al actualizar el equipo del proyecto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //console.log('📤 Datos a enviar:', formData);

    if (!validateForm()) return;

    try {
      setLoading(true);

      // 1. Actualizar datos básicos del proyecto
      const data = {
        titulo: formData.nombre,
        descripcion: formData.descripcion,
        id_lider: formData.id_lider,
        id_categoria: formData.id_categoria, // Incluir categoría
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin_estimada: formData.fecha_fin_estimada || null,
        estado: formData.estado.toUpperCase()
      };

      //console.log('🚀 Enviando al backend:', data);

      const proyectoActualizado = await actualizarProyecto(Number(proyecto.id), data);

      console.log('✅ Proyecto actualizado correctamente');
      //console.log('✅ Proyecto actualizado:', proyectoActualizado);

      // 2. Actualizar equipo del proyecto
      await actualizarEquipoProyecto();

      // 3. Mapear la respuesta al tipo Proyecto del front
      const proyectoMapeado = {
        ...proyecto,
        nombre: proyectoActualizado.titulo,
        descripcion: proyectoActualizado.descripcion,
        id_lider: proyectoActualizado.id_lider,
        id_categoria: proyectoActualizado.id_categoria, // Incluir categoría
        estado: proyectoActualizado.estado,
        fecha_inicio: proyectoActualizado.fecha_inicio,
        fecha_fin_estimada: proyectoActualizado.fecha_fin_estimada
      };

      //console.log('📦 Proyecto mapeado para el frontend:', proyectoMapeado);

      onProyectoActualizado(proyectoMapeado);
      console.log('🎉 Proyecto y equipo actualizados exitosamente!');
      
      onClose();
    } catch (error) {
      console.error('❌ Error al actualizar proyecto:', error);
      setErrors({ general: 'Error al actualizar el proyecto' });
    } finally {
      setLoading(false);
    }
  };

  const handleLiderSelect = (empleadoId: number) => {
    setFormData(prev => ({ ...prev, id_lider: empleadoId }));
    
    // Si el nuevo líder estaba en el equipo, quitarlo del equipo
    if (equipoIds.includes(empleadoId)) {
      setEquipoIds(prev => prev.filter(id => id !== empleadoId));
    }
  };

  // Nueva función para manejar cambios en el equipo
  const handleEquipoChange = (ids: number[]) => {
    // Asegurarse de que el líder no esté en el equipo
    const equipoSinLider = ids.filter(id => id !== formData.id_lider);
    setEquipoIds(equipoSinLider);
  };

  const getNombreCompleto = (empleado: Empleado) => {
    return `${empleado.nombre_pila} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.trim();
  };

  const getIniciales = (empleado: Empleado) => {
    return `${empleado.nombre_pila.charAt(0)}${empleado.apellido_paterno.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
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
        disabled={loading || loadingEmpleados}
      >
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Proyecto"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.general && <div className={styles.error}>{errors.general}</div>}

        <div className={styles['form-group']}>
          <label htmlFor="nombre" className={styles.label}>
            Nombre del Proyecto *
          </label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            className={`${styles.input} ${errors.nombre ? styles['input-error'] : ''}`}
            placeholder="Ingresa el nombre del proyecto"
            disabled={loading}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre}</span>}
        </div>

        <div className={styles['form-group']}>
          <label htmlFor="descripcion" className={styles.label}>
            Descripción *
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            className={`${styles.input} ${styles.textarea} ${errors.descripcion ? styles['input-error'] : ''}`}
            placeholder="Describe el proyecto"
            rows={3}
            disabled={loading}
          />
          {errors.descripcion && <span className={styles.error}>{errors.descripcion}</span>}
        </div>

        {/* Nuevo: Selector de categoría */}
        <div className={styles['form-group']}>
          <label htmlFor="id_categoria" className={styles.label}>
            Categoría del Proyecto *
            {categorias.length > 0 && formData.id_categoria ? (
              (() => {
                const cat = categorias.find(c => c.id_categoria === formData.id_categoria);
                return cat ? (
                  <span style={{ marginLeft: 8, fontWeight: 500, color: '#6C63FF' }}>
                    (Seleccionado: {cat.nombre})
                  </span>
                ) : null;
              })()
            ) : null}
          </label>
          <select
            id="id_categoria"
            value={formData.id_categoria}
            onChange={(e) => setFormData(prev => ({ ...prev, id_categoria: parseInt(e.target.value) }))}
            className={`${styles.input} ${styles.select} ${errors.id_categoria ? styles['input-error'] : ''}`}
            disabled={loading || loadingCategorias}
          >
            <option value={0}>Selecciona una categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
                {categoria.descripcion && ` - ${categoria.descripcion}`}
              </option>
            ))}
          </select>
          {loadingCategorias && (
            <span className={styles.info}>Cargando categorías...</span>
          )}
          {errors.categorias && <span className={styles.error}>{errors.categorias}</span>}
          {errors.id_categoria && <span className={styles.error}>{errors.id_categoria}</span>}
        </div>

        {/* Selector de líder */}
        <div className={styles['form-group']}>
          <label htmlFor="id_lider" className={styles.label}>
            Líder del Proyecto *
            {empleados.length > 0 && formData.id_lider ? (
              (() => {
                const emp = empleados.find(e => e.id_empleado === formData.id_lider);
                return emp ? (
                  <span style={{ marginLeft: 8, fontWeight: 500, color: '#6C63FF' }}>
                    (Seleccionado: {getNombreCompleto(emp)})
                  </span>
                ) : null;
              })()
            ) : null}
          </label>
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
            hideLabel={true}
          />
          {errors.id_lider && <span className={styles.error}>{errors.id_lider}</span>}
        </div>

        {/* Selector de equipo */}
        <EquipoSelector
          empleados={empleados.filter(emp => emp.id_empleado !== formData.id_lider && emp.activo)}
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
        {errors.equipo && <span className={styles.error}>{errors.equipo}</span>}

        <div className={styles['form-group']}>
          <label htmlFor="estado" className={styles.label}>
            Estado del Proyecto *
          </label>
          <select
            id="estado"
            value={formData.estado}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              estado: e.target.value.toUpperCase() as 'ACTIVO' | 'INACTIVO' | 'COMPLETADO' 
            }))}
            className={`${styles.input} ${styles.select}`}
            disabled={loading}
            required
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="COMPLETADO">COMPLETADO</option>
          </select>
        </div>

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

export default EditarProyectoModal;