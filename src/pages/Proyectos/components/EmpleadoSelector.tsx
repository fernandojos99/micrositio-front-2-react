import React from 'react';
import Button from '../../../components/ui-propios/Button/Button';
import styles from './NuevoProyectoModal.module.css';

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

interface EmpleadoSelectorProps {
  empleados: Empleado[];
  loading: boolean;
  loadingEmpleados: boolean;
  errors: Record<string, string>;
  selectedId: number;
  onSelect: (id: number) => void;
  cargarEmpleados: () => void;
  getNombreCompleto: (empleado: Empleado) => string;
  getIniciales: (empleado: Empleado) => string;
  getAvatarColor: (index: number) => string;
  hideLabel?: boolean; // Nueva prop para ocultar el label
}

const EmpleadoSelector: React.FC<EmpleadoSelectorProps> = ({
  empleados,
  loading,
  loadingEmpleados,
  errors,
  selectedId,
  onSelect,
  cargarEmpleados,
  getNombreCompleto,
  getIniciales,
  getAvatarColor,
  hideLabel = false, // Valor por defecto es false
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedEmpleado = empleados.find(emp => emp.id_empleado === selectedId);

  // Cierra el menú al hacer click fuera
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.empleado-dropdown')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      {!hideLabel && (
        <div className={styles['form-group']}>
          <label className={styles.label}>
            Líder del Proyecto *
            {selectedEmpleado && (
              <span className={styles['selected-info']}>
                {' '}(Seleccionado: {getNombreCompleto(selectedEmpleado)})
              </span>
            )}
          </label>
        </div>
      )}
      {loadingEmpleados ? (
        <div className={styles['loading-empleados']}>
          <p>Cargando empleados...</p>
        </div>
      ) : errors.empleados ? (
        <div className={styles.error}>
          {errors.empleados}
          <Button
            variant="outline"
            onClick={cargarEmpleados}
            disabled={loadingEmpleados}
            style={{ marginLeft: '10px', fontSize: '12px', padding: '4px 8px' }}
          >
            Reintentar
          </Button>
        </div>
      ) : empleados.length === 0 ? (
        <div className={styles['no-empleados']}>
          <p>No hay empleados disponibles</p>
        </div>
      ) : (
        <div className={`empleado-dropdown ${styles['dropdown-container']}`} style={{ position: 'relative' }}>
          <button
            type="button"
            className={`${styles.input} ${styles.select} ${open ? styles['select-open'] : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            onClick={() => setOpen(o => !o)}
            disabled={loading}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedEmpleado ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className={styles['colaborador-avatar']}
                    style={{
                      background: getAvatarColor(empleados.findIndex(e => e.id_empleado === selectedEmpleado.id_empleado)),
                      color: '#fff',
                      border: '2.5px solid #fff',
                      marginRight: 8,
                    }}
                  >
                    {getIniciales(selectedEmpleado)}
                  </span>
                  <span style={{ fontWeight: 500 }}>{getNombreCompleto(selectedEmpleado)}</span>
                </span>
              ) : (
                <span style={{ color: 'var(--theme-text-secondary)' }}>Selecciona un líder</span>
              )}
            </span>
            <span style={{ fontSize: 18, color: 'var(--theme-text-secondary)' }}>{open ? '▲' : '▼'}</span>
          </button>
          {open && (
            <ul
              className={styles['colaboradores-grid']}
              style={{
                position: 'absolute',
                zIndex: 10,
                width: '100%',
                background: 'var(--theme-bg-primary)',
                boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)',
                maxHeight: '16rem',
                overflowY: 'auto',
                marginTop: 4,
                border: '1px solid var(--theme-border)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 0,
              }}
              role="listbox"
            >
              {empleados.map((empleado, idx) => (
                <li
                  key={empleado.id_empleado}
                  className={`${styles['colaborador-item']} ${selectedId === empleado.id_empleado ? styles['colaborador-selected'] : ''} ${!empleado.activo ? styles['colaborador-inactivo'] : ''}`}
                  onClick={() => {
                    if (!loading && empleado.activo) {
                      onSelect(empleado.id_empleado);
                      setOpen(false);
                    }
                  }}
                  title={!empleado.activo ? 'Empleado inactivo' : 'Seleccionar como líder'}
                  style={{
                    cursor: empleado.activo ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    background: selectedId === empleado.id_empleado
                      ? 'color-mix(in srgb, var(--color-primary-purple) 10%, transparent)'
                      : 'var(--theme-bg-primary)',
                  }}
                  role="option"
                  aria-selected={selectedId === empleado.id_empleado}
                >
                  <span
                    className={styles['colaborador-avatar']}
                    style={{
                      background: getAvatarColor(idx),
                      color: '#fff',
                      border: '2.5px solid #fff',
                    }}
                  >
                    {getIniciales(empleado)}
                  </span>
                  <span className={styles['colaborador-info']} style={{ flex: 1, minWidth: 0 }}>
                    <span className={styles['colaborador-nombre']}>
                      {getNombreCompleto(empleado)}
                      {!empleado.activo && <span className={styles['inactive-badge']}> (Inactivo)</span>}
                    </span>
                    <span className={styles['colaborador-email']}>{empleado.correo}</span>
                  </span>
                  {selectedId === empleado.id_empleado && (
                    <span className={styles['colaborador-check']}>✓</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!hideLabel && errors.id_lider && <span className={styles.error}>{errors.id_lider}</span>}
    </>
  );
};

export default EmpleadoSelector;
