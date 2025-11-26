/**
 * Modal para asignar un empleado a un usuario.
 * Muestra una lista de empleados que no tienen usuario asignado.
 */

import React, { useState, useEffect } from 'react';
import { X, User, Search } from 'lucide-react';
import { Empleado, obtenerEmpleadosSinUsuario } from '../../services/empleadosService';
import { asignarEmpleadoUsuario } from '../../services/usuarioService';
import styles from './AssignEmployeeModal.module.css';

/**
 * Props para el componente AssignEmployeeModal
 * @interface AssignEmployeeModalProps
 */
interface AssignEmployeeModalProps {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** ID del usuario al que se le asignará el empleado */
  userId: string;
  /** Callback que se ejecuta cuando se asigna exitosamente un empleado */
  onEmployeeAssigned?: () => void;
}

/**
 * Componente modal para asignar empleado a usuario
 * 
 * @component AssignEmployeeModal
 * @description Modal que permite seleccionar y asignar un empleado que no tenga usuario
 * asociado a un usuario específico. Incluye búsqueda por nombre y confirmación de asignación.
 * 
 * Características principales:
 * - Lista de empleados sin usuario asignado
 * - Búsqueda en tiempo real por nombre
 * - Información detallada de cada empleado
 * - Confirmación de asignación
 * - Estados de carga y error
 * - Validación de selección
 * 
 * @example
 * ```tsx
 * <AssignEmployeeModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   userId={selectedUserId}
 *   onEmployeeAssigned={() => reloadUsers()}
 * />
 * ```
 */
const AssignEmployeeModal: React.FC<AssignEmployeeModalProps> = ({
  isOpen,
  onClose,
  userId,
  onEmployeeAssigned
}) => {
  // @state: Lista de empleados sin usuario
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  
  // @state: Empleado seleccionado para asignar
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null);
  
  // @state: Término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // @state: Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // @state: Estado de error
  const [error, setError] = useState<string | null>(null);

  /**
   * Función auxiliar para establecer empleados de forma segura
   * Asegura que siempre se establezca un array válido y transforma los datos si es necesario
   */
  const setEmpleadosSafely = (data: any) => {
    if (Array.isArray(data)) {
      // Transformar los datos para asegurar compatibilidad con la interfaz Empleado
      const transformedData = data.map(empleado => ({
        ...empleado,
        id_empleado: empleado.id_empleado || empleado.id // Mapear 'id' a 'id_empleado' si es necesario
      }));
      setEmpleados(transformedData);
      console.log('📦 Empleados transformados y establecidos:', transformedData.length);
    } else {
      console.warn('⚠️ Intentando establecer empleados con datos no válidos:', data);
      setEmpleados([]);
    }
  };

  /**
   * Carga la lista de empleados sin usuario cuando se abre el modal
   */
  useEffect(() => {
    if (isOpen) {
      loadEmpleadosSinUsuario();
      // Limpiar estado al abrir
      setSelectedEmployee(null);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  /**
   * Carga empleados que no tienen usuario asignado
   */
  const loadEmpleadosSinUsuario = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando empleados sin usuario...');
      const response = await obtenerEmpleadosSinUsuario();
      console.log('📋 Respuesta completa del servidor:', response);
      console.log('📊 Tipo de respuesta:', typeof response, 'Es array?', Array.isArray(response));
      
      // Verificar que los datos sean un array o un objeto con la propiedad data
      if (Array.isArray(response)) {
        setEmpleadosSafely(response);
        console.log('✅ Empleados cargados exitosamente (array directo):', response.length, 'empleados');
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        // El backend devuelve {success: true, data: [...], total: number}
        const responseData = (response as any).data;
        const responseTotal = (response as any).total;
        setEmpleadosSafely(responseData);
        console.log('✅ Empleados cargados exitosamente (objeto con data):', responseData.length, 'empleados');
        console.log('📊 Total disponibles según backend:', responseTotal);
      } else {
        console.error('❌ Los datos recibidos no tienen el formato esperado:', response);
        
        // Intentar verificar si hay una propiedad que contenga el array
        if (response && typeof response === 'object') {
          console.log('🔍 Propiedades del objeto respuesta:', Object.keys(response));
          
          // Buscar propiedades comunes que podrían contener el array
          const possibleArrayProps = ['empleados', 'results', 'items'];
          let foundArray = false;
          
          for (const prop of possibleArrayProps) {
            if ((response as any)[prop] && Array.isArray((response as any)[prop])) {
              console.log(`✅ Array encontrado en la propiedad '${prop}':`, (response as any)[prop]);
              setEmpleadosSafely((response as any)[prop]);
              foundArray = true;
              break;
            }
          }
          
          if (!foundArray) {
            setError('Error: Los datos recibidos no tienen el formato esperado');
            setEmpleadosSafely([]);
          }
        } else {
          setError('Error: Respuesta inválida del servidor');
          setEmpleadosSafely([]);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando empleados sin usuario:', error);
      setError('Error al cargar la lista de empleados disponibles');
      setEmpleadosSafely([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtra empleados según el término de búsqueda
   */
  const filteredEmpleados = (() => {
    console.log('🔍 Filtrando empleados:', {
      empleadosType: typeof empleados,
      isArray: Array.isArray(empleados),
      empleadosLength: Array.isArray(empleados) ? empleados.length : 'N/A',
      empleados: empleados
    });
    
    return Array.isArray(empleados) ? empleados.filter(empleado => {
      const fullName = `${empleado.nombre_pila} ${empleado.apellido_paterno} ${empleado.apellido_materno || ''}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || 
             empleado.correo.toLowerCase().includes(searchLower) ||
             empleado.numero_empleado.toLowerCase().includes(searchLower);
    }) : [];
  })();

  /**
   * Obtiene el ID del empleado de forma consistente
   */
  const getEmpleadoId = (empleado: any) => {
    return empleado.id_empleado || empleado.id;
  };

  /**
   * Maneja la selección de un empleado
   */
  const handleSelectEmployee = (empleado: Empleado) => {
    // Si el empleado ya está seleccionado, lo deseleccionamos
    if (selectedEmployee && getEmpleadoId(selectedEmployee) === getEmpleadoId(empleado)) {
      setSelectedEmployee(null);
      console.log('🚫 Empleado deseleccionado');
    } else {
      setSelectedEmployee(empleado);
      console.log('✅ Empleado seleccionado:', {
        id: getEmpleadoId(empleado),
        nombre: `${empleado.nombre_pila} ${empleado.apellido_paterno}`,
        correo: empleado.correo
      });
    }
  };

  /**
   * Maneja la asignación del empleado seleccionado al usuario
   */
  const handleAssignEmployee = async () => {
    if (!selectedEmployee) {
      console.warn('⚠️ No hay empleado seleccionado para asignar');
      return;
    }

    // Obtener el ID del empleado (puede ser id_empleado o id)
    const empleadoId = selectedEmployee.id_empleado || (selectedEmployee as any).id;
    
    if (!empleadoId) {
      console.error('❌ No se pudo obtener el ID del empleado seleccionado:', selectedEmployee);
      setError('Error: No se pudo identificar el empleado seleccionado');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      console.log('🔗 Asignando empleado al usuario:', {
        empleadoId: empleadoId,
        empleadoNombre: `${selectedEmployee.nombre_pila} ${selectedEmployee.apellido_paterno}`,
        usuarioId: userId
      });
      
      const resultado = await asignarEmpleadoUsuario(userId, empleadoId);
      
      console.log('✅ Empleado asignado exitosamente:', resultado);
      
      // Notificar éxito
      onEmployeeAssigned?.();
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error asignando empleado:', error);
      setError(`Error al asignar el empleado "${selectedEmployee.nombre_pila} ${selectedEmployee.apellido_paterno}". Por favor, intenta nuevamente.`);
    } finally {
      setIsAssigning(false);
    }
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    if (!isAssigning) {
      onClose();
    }
  };

  // No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* @section: Header del modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <User size={24} className={styles.headerIcon} />
            <div>
              <h2 className={styles.modalTitle}>Asignar Empleado</h2>
              <p className={styles.modalSubtitle}>
                Selecciona un empleado para asignar a este usuario
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={isAssigning}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* @section: Contenido del modal */}
        <div className={styles.modalBody}>
          {/* Barra de búsqueda */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar empleado por nombre, correo o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading}
            />
          </div>

          {/* Estados de carga y error */}
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Cargando empleados disponibles...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <p className={styles.errorMessage}>{error}</p>
              <button
                onClick={loadEmpleadosSinUsuario}
                className={styles.retryButton}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Lista de empleados */}
          {!isLoading && !error && (
            <div className={styles.employeesList}>
              {filteredEmpleados.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchTerm ? (
                    <p>No se encontraron empleados que coincidan con tu búsqueda.</p>
                  ) : (
                    <p>No hay empleados disponibles para asignar.</p>
                  )}
                </div>
              ) : (
                filteredEmpleados.map((empleado) => (
                  <div
                    key={getEmpleadoId(empleado)}
                    className={`${styles.employeeItem} ${
                      selectedEmployee && getEmpleadoId(selectedEmployee) === getEmpleadoId(empleado) ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectEmployee(empleado)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectEmployee(empleado);
                      }
                    }}
                  >
                    <div className={styles.employeeInfo}>
                      <h3 className={styles.employeeName}>
                        {empleado.nombre_pila} {empleado.apellido_paterno} {empleado.apellido_materno || ''}
                      </h3>
                      <div className={styles.employeeDetails}>
                        <span className={styles.employeeEmail}>
                          {empleado.correo}
                        </span>
                        <span className={styles.employeeNumber}>
                          #{empleado.numero_empleado}
                        </span>
                        {empleado.celular && (
                          <span className={styles.employeePhone}>
                            📱 {empleado.celular}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.selectionIndicator}>
                      {selectedEmployee && getEmpleadoId(selectedEmployee) === getEmpleadoId(empleado) ? (
                        <div className={styles.checkmark}>✓</div>
                      ) : (
                        <div className={styles.unchecked}></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* @section: Footer con botones de acción */}
        <div className={styles.modalFooter}>
          <div className={styles.footerContent}>
            {selectedEmployee && (
              <div className={styles.selectedInfo}>
                <span className={styles.selectedLabel}>Empleado seleccionado:</span>
                <span className={styles.selectedName}>
                  {selectedEmployee.nombre_pila} {selectedEmployee.apellido_paterno} {selectedEmployee.apellido_materno || ''}
                </span>
                <span className={styles.selectedEmail}>({selectedEmployee.correo})</span>
              </div>
            )}
          </div>
          <div className={styles.footerActions}>
            <button
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isAssigning}
            >
              Cancelar
            </button>
            <button
              onClick={handleAssignEmployee}
              className={styles.assignButton}
              disabled={!selectedEmployee || isAssigning}
            >
              {isAssigning ? (
                <>
                  <div className={styles.buttonSpinner}></div>
                  Asignando...
                </>
              ) : (
                'Asignar Empleado'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;
