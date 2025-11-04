/**
 * Hook personalizado para manejar la carga y mapeo de empleados.
 * Proporciona funcionalidades para obtener información de empleados asociados a usuarios editores.
 */

import { useState, useEffect, useCallback } from 'react';
import { Empleado, obtenerEmpleados, obtenerEmpleadoPorId } from '../services/empleadosService';

/**
 * Interfaz que define la estructura de un empleado con información completa
 * @interface EmpleadoCompleto
 */
interface EmpleadoCompleto extends Empleado {
  /** Nombre completo formateado del empleado */
  nombreCompleto: string;
}

/**
 * Interfaz que define el valor de retorno del hook useEmpleados
 * @interface UseEmpleadosReturn
 */
interface UseEmpleadosReturn {
  /** Mapeo de id_empleado a información completa del empleado */
  empleadosMap: Record<number, EmpleadoCompleto>;
  /** Lista de todos los empleados disponibles */
  empleados: EmpleadoCompleto[];
  /** Estado de carga durante las operaciones */
  loading: boolean;
  /** Mensaje de error si ocurre algún problema */
  error: string | null;
  /** Función para obtener un empleado específico por ID */
  obtenerEmpleado: (id: number) => Promise<EmpleadoCompleto | null>;
  /** Función para recargar todos los empleados */
  recargarEmpleados: () => void;
}

/**
 * Hook personalizado para gestionar empleados y su mapeo con usuarios
 * 
 * @hook useEmpleados
 * @description Este hook proporciona una interfaz completa para manejar
 * la información de empleados en el contexto de usuarios editores. Mantiene
 * un cache de empleados, maneja la carga de datos y proporciona utilidades
 * para obtener información específica de empleados.
 * 
 * Características principales:
 * - Cache automático de empleados cargados
 * - Mapeo eficiente por ID de empleado
 * - Formateo automático de nombres completos
 * - Manejo de estados de carga y error
 * - Funciones para carga individual y masiva
 * - Recarga manual de datos
 * 
 * @example
 * ```tsx
 * const {
 *   empleadosMap,
 *   empleados,
 *   loading,
 *   error,
 *   obtenerEmpleado,
 *   recargarEmpleados
 * } = useEmpleados();
 * 
 * // Obtener empleado por ID
 * const empleado = empleadosMap[123];
 * 
 * // Cargar empleado específico
 * const empleado = await obtenerEmpleado(456);
 * ```
 * 
 * @returns {UseEmpleadosReturn} Objeto con datos y funciones de empleados
 */
const useEmpleados = (): UseEmpleadosReturn => {
  // @state: Mapeo de id_empleado a información completa del empleado
  const [empleadosMap, setEmpleadosMap] = useState<Record<number, EmpleadoCompleto>>({});
  
  // @state: Lista de todos los empleados disponibles
  const [empleados, setEmpleados] = useState<EmpleadoCompleto[]>([]);
  
  // @state: Control del estado de carga durante las operaciones
  const [loading, setLoading] = useState(false);
  
  // @state: Almacena mensajes de error si ocurren problemas
  const [error, setError] = useState<string | null>(null);

  /**
   * Función utilitaria para formatear el nombre completo de un empleado
   * Combina nombre_pila, apellido_paterno y apellido_materno (opcional)
   * 
   * @param {Empleado} empleado - Datos del empleado
   * @returns {string} Nombre completo formateado
   */
  const formatearNombreCompleto = useCallback((empleado: Empleado): string => {
    const { nombre_pila, apellido_paterno, apellido_materno } = empleado;
    
    let nombreCompleto = `${nombre_pila} ${apellido_paterno}`;
    
    if (apellido_materno && apellido_materno.trim()) {
      nombreCompleto += ` ${apellido_materno}`;
    }
    
    return nombreCompleto.trim();
  }, []);

  /**
   * Función para procesar un empleado y añadir información calculada
   * 
   * @param {Empleado} empleado - Datos básicos del empleado
   * @returns {EmpleadoCompleto} Empleado con información adicional
   */
  const procesarEmpleado = useCallback((empleado: Empleado): EmpleadoCompleto => {
    return {
      ...empleado,
      nombreCompleto: formatearNombreCompleto(empleado)
    };
  }, [formatearNombreCompleto]);

  /**
   * Función asíncrona para cargar todos los empleados del sistema
   * Actualiza tanto el array de empleados como el mapeo por ID
   */
  const cargarTodosEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando todos los empleados...');
      
      // Obtener todos los empleados del sistema
      const empleadosData = await obtenerEmpleados();
      
      console.log('📋 Empleados obtenidos:', empleadosData);
      
      // Procesar empleados y añadir información calculada
      const empleadosProcesados = empleadosData.map(procesarEmpleado);
      
      // Crear mapeo por ID para acceso rápido
      const mapeo: Record<number, EmpleadoCompleto> = {};
      empleadosProcesados.forEach(emp => {
        mapeo[emp.id_empleado] = emp;
      });
      
      // Actualizar estados
      setEmpleados(empleadosProcesados);
      setEmpleadosMap(mapeo);
      
      console.log('✅ Empleados cargados exitosamente:', empleadosProcesados.length);
      
    } catch (err) {
      const errorMessage = 'Error al cargar empleados del sistema';
      console.error('❌', errorMessage, err);
      setError(errorMessage);
      
      // Resetear datos en caso de error
      setEmpleados([]);
      setEmpleadosMap({});
      
    } finally {
      setLoading(false);
    }
  }, [procesarEmpleado]);

  /**
   * Función para obtener un empleado específico por ID
   * Primero verifica el cache, si no existe lo carga del servidor
   * 
   * @param {number} id - ID del empleado a obtener
   * @returns {Promise<EmpleadoCompleto | null>} Empleado encontrado o null
   */
  const obtenerEmpleado = useCallback(async (id: number): Promise<EmpleadoCompleto | null> => {
    // Verificar si ya tenemos el empleado en cache
    if (empleadosMap[id]) {
      console.log(`✅ Empleado ${id} encontrado en cache`);
      return empleadosMap[id];
    }
    
    try {
      console.log(`🔍 Cargando empleado ${id} desde servidor...`);
      
      // Cargar empleado específico desde el servidor
      const empleadoData = await obtenerEmpleadoPorId(id);
      
      // Procesar empleado y añadir información calculada
      const empleadoProcesado = procesarEmpleado(empleadoData);
      
      // Actualizar cache
      setEmpleadosMap(prev => ({
        ...prev,
        [id]: empleadoProcesado
      }));
      
      // Actualizar lista si no existe
      setEmpleados(prev => {
        const existe = prev.some(emp => emp.id_empleado === id);
        return existe ? prev : [...prev, empleadoProcesado];
      });
      
      console.log('✅ Empleado cargado exitosamente:', empleadoProcesado);
      return empleadoProcesado;
      
    } catch (err) {
      console.error(`❌ Error al cargar empleado ${id}:`, err);
      return null;
    }
  }, [empleadosMap, procesarEmpleado]);

  /**
   * Función para recargar todos los empleados manualmente
   * Útil para actualizar datos después de cambios
   */
  const recargarEmpleados = useCallback(() => {
    cargarTodosEmpleados();
  }, [cargarTodosEmpleados]);

  /**
   * Effect que se ejecuta al montar el hook
   * Carga automáticamente todos los empleados disponibles
   */
  useEffect(() => {
    cargarTodosEmpleados();
  }, [cargarTodosEmpleados]);

  return {
    empleadosMap,
    empleados,
    loading,
    error,
    obtenerEmpleado,
    recargarEmpleados
  };
};

export default useEmpleados;
