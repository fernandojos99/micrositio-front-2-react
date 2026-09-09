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

interface EquipoSelectorProps {
  empleados: Empleado[];
  loading: boolean;
  loadingEmpleados: boolean;
  errors: Record<string, string>;
  selectedIds: number[];
  onSelect: (ids: number[]) => void;
  cargarEmpleados: () => void;
  getNombreCompleto: (empleado: Empleado) => string;
  getIniciales: (empleado: Empleado) => string;
  getAvatarColor: (index: number) => string;
  label?: string;
}

const EquipoSelector: React.FC<EquipoSelectorProps> = ({
  empleados,
  loading,
  loadingEmpleados,
  errors,
  selectedIds,
  onSelect,
  cargarEmpleados,
  getNombreCompleto,
  getIniciales,
  getAvatarColor,
  label = 'Equipo del Proyecto',
}) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.equipo-dropdown')) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggleEmpleado = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(eid => eid !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className={styles['form-group']}>
      <label className={styles.label}>
        {label} *
        {selectedIds.length > 0 && (
          <span className={styles['selected-info']}>
            {' '}(Seleccionados: {selectedIds.length})
          </span>
        )}
      </label>
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
        <div className={`equipo-dropdown ${styles['dropdown-container']}`} style={{ position: 'relative' }}>
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
              {selectedIds.length > 0 ? (
                <span style={{ color: 'var(--theme-text-primary)' }}>{selectedIds.length} colaboradores seleccionados</span>
              ) : (
                <span style={{ color: 'var(--theme-text-secondary)' }}>Selecciona colaboradores</span>
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
                  className={`${styles['colaborador-item']} ${selectedIds.includes(empleado.id_empleado) ? styles['colaborador-selected'] : ''} ${!empleado.activo ? styles['colaborador-inactivo'] : ''}`}
                  onClick={() => empleado.activo && handleToggleEmpleado(empleado.id_empleado)}
                  title={!empleado.activo ? 'Empleado inactivo' : 'Seleccionar como colaborador'}
                  style={{
                    cursor: empleado.activo ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    background: selectedIds.includes(empleado.id_empleado)
                      ? 'color-mix(in srgb, var(--color-primary-purple) 10%, transparent)'
                      : 'var(--theme-bg-primary)',
                  }}
                  role="option"
                  aria-selected={selectedIds.includes(empleado.id_empleado)}
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
                  {selectedIds.includes(empleado.id_empleado) && (
                    <span className={styles['colaborador-check']}>✓</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {errors.equipo && <span className={styles.error}>{errors.equipo}</span>}
    </div>
  );
};

export default EquipoSelector;
