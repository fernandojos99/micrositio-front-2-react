/**
 * Componente principal para gestionar la lista de usuarios y sus proyectos asignados.
 * Renderiza dos secciones separadas: una para usuarios VISITANTE y otra para usuarios EDITOR.
 * Cada sección tiene funcionalidades específicas según el tipo de usuario.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { obtenerTodosUsuarios, Usuario } from '../../services/usuarioService';
import VisitanteUserItem from './VisitanteUserItem';
import EditorUserItem from './EditorUserItem';
import styles from './UsersProjectsList.module.css';

/**
 * Componente principal para la gestión de usuarios y proyectos
 * 
 * @component UsersProjectsList
 * @description Este es el componente principal que gestiona y organiza la visualización
 * de usuarios en el sistema. Separa automáticamente los usuarios en dos secciones
 * distintas según su tipo: VISITANTE y EDITOR, proporcionando interfaces y
 * funcionalidades específicas para cada tipo.
 * 
 * Características principales:
 * - Separación automática de usuarios por tipo (VISITANTE/EDITOR)
 * - Secciones independientes con funcionalidades específicas
 * - Gestión unificada del estado de selección de usuario
 * - Recarga automática de datos tras operaciones
 * - Interfaz responsive con indicadores de carga
 * - Manejo de estados vacíos y errores
 * 
 * Secciones renderizadas:
 * 
 * **Sección Visitantes:**
 * - Usuarios de tipo VISITANTE
 * - Acciones: Asignar proyecto, Promover a editor, Eliminar usuario
 * 
 * **Sección Editores:**
 * - Usuarios de tipo EDITOR con información de empleado asociado
 * - Indicador de estado activo/inactivo
 * - Acciones: Asignar proyecto, Activar/Desactivar usuario
 * 
 * @example
 * ```tsx
 * // Uso básico del componente
 * <UsersProjectsList />
 * ```
 * 
 * @returns {JSX.Element} Componente completo de gestión de usuarios
 */
const UsersProjectsList: React.FC = () => {
  // @state: Lista completa de usuarios cargados desde el backend
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // @state: Control del estado de carga durante las operaciones asíncronas
  const [loading, setLoading] = useState(false);
  
  // @state: Control del usuario actualmente seleccionado para operaciones
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // @state: Almacena mensajes de error si ocurren problemas durante la carga
  const [error, setError] = useState<string | null>(null);

  /**
   * Separación automática de usuarios por tipo usando useMemo para optimización
   * Filtra la lista completa de usuarios y los separa en visitantes y editores
   */
  const { usuariosVisitantes, usuariosEditores } = useMemo(() => {
    const visitantes = usuarios.filter(u => u.tipo === 'VISITANTE');
    const editores = usuarios.filter(u => u.tipo === 'EDITOR');
    
    return {
      usuariosVisitantes: visitantes,
      usuariosEditores: editores
    };
  }, [usuarios]);

  /**
   * Effect que se ejecuta al montar el componente
   * Carga la lista inicial de usuarios del sistema
   */
  useEffect(() => {
    loadUsuarios();
  }, []);

  /**
   * Función asíncrona para cargar todos los usuarios del sistema
   * Maneja la validación de respuestas y el procesamiento de datos
   */
  const loadUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando usuarios del sistema...');
      
      // Obtener lista completa de usuarios
      const response = await obtenerTodosUsuarios();
      console.log('📊 Respuesta del servicio obtenerTodosUsuarios:', response);
      
      // Validar y procesar la respuesta del servicio
      let usuariosData: Usuario[] = [];
      
      if (Array.isArray(response)) {
        usuariosData = response;
      } else if (response && typeof response === 'object') {
        // Intentar extraer datos de diferentes estructuras posibles
        const responseObj = response as any;
        if (Array.isArray(responseObj.data)) {
          usuariosData = responseObj.data;
        } else if (Array.isArray(responseObj.usuarios)) {
          usuariosData = responseObj.usuarios;
        } else {
          console.warn('⚠️ Respuesta del servicio no contiene array válido:', response);
          usuariosData = [];
        }
      } else {
        console.warn('⚠️ Respuesta del servicio no es válida:', response);
        usuariosData = [];
      }
      
      console.log('✅ Usuarios procesados exitosamente:', usuariosData.length);
      console.log('📈 Distribución:', {
        visitantes: usuariosData.filter(u => u.tipo === 'VISITANTE').length,
        editores: usuariosData.filter(u => u.tipo === 'EDITOR').length
      });
      
      setUsuarios(usuariosData);
      
    } catch (err) {
      const errorMessage = 'Error al cargar usuarios del sistema';
      console.error('❌', errorMessage, err);
      setError(errorMessage);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la selección de un usuario específico
   * Actualiza el estado global de usuario seleccionado
   * 
   * @param {string} userId - ID del usuario seleccionado
   */
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(prevId => prevId === userId ? null : userId);
    console.log('👤 Usuario seleccionado:', userId);
  };

  /**
   * Maneja la recarga de datos tras operaciones que afectan a usuarios
   * Se ejecuta cuando se eliminan usuarios, cambian estados, etc.
   */
  const handleUserUpdated = () => {
    console.log('🔄 Recargando usuarios tras actualización...');
    loadUsuarios();
  };

  /**
   * Maneja cuando un usuario es eliminado del sistema
   * Limpia la selección si el usuario eliminado estaba seleccionado y recarga datos
   */
  const handleUserDeleted = () => {
    console.log('🗑️ Usuario eliminado, recargando datos...');
    setSelectedUserId(null); // Limpiar selección
    loadUsuarios();
  };

  // @render: Mostrar indicador de carga durante la carga inicial
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Cargando usuarios del sistema...</span>
        </div>
      </div>
    );
  }

  // @render: Mostrar mensaje de error si ocurrió algún problema
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadUsuarios} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* @section: Título principal del componente */}
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Usuarios y Proyectos</h1>
        <p className={styles.subtitle}>
          Administra usuarios, proyectos asignados y permisos del sistema
        </p>
      </div>

      {/* @section: Estadísticas generales */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{usuarios.length}</span>
          <span className={styles.statLabel}>Total Usuarios</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{usuariosVisitantes.length}</span>
          <span className={styles.statLabel}>Visitantes</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{usuariosEditores.length}</span>
          <span className={styles.statLabel}>Editores</span>
        </div>
      </div>

      {/* @section: Sección de usuarios VISITANTE */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Usuarios Visitantes
            <span className={styles.sectionCount}>({usuariosVisitantes.length})</span>
          </h2>
          <p className={styles.sectionDescription}>
            Usuarios con acceso limitado al sistema. Pueden ser promovidos a editores.
          </p>
        </div>
        
        <div className={styles.usersList}>
          {usuariosVisitantes.length > 0 ? (
            usuariosVisitantes.map((usuario) => (
              <VisitanteUserItem
                key={usuario.id_usuario}
                usuario={usuario}
                onUserSelect={handleUserSelect}
                onUserDeleted={handleUserDeleted}
                onUserUpdated={handleUserUpdated}
                selectedUserId={selectedUserId || undefined}
              />
            ))
          ) : (
            <div className={styles.emptySection}>
              <p>No hay usuarios visitantes registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* @section: Sección de usuarios EDITOR */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Usuarios Editores
            <span className={styles.sectionCount}>({usuariosEditores.length})</span>
          </h2>
          <p className={styles.sectionDescription}>
            Usuarios con acceso completo al sistema. Asociados a empleados de la organización.
          </p>
        </div>
        
        <div className={styles.usersList}>
          {usuariosEditores.length > 0 ? (
            usuariosEditores.map((usuario) => (
              <EditorUserItem
                key={usuario.id_usuario}
                usuario={usuario}
                onUserSelect={handleUserSelect}
                onUserUpdated={handleUserUpdated}
                selectedUserId={selectedUserId || undefined}
              />
            ))
          ) : (
            <div className={styles.emptySection}>
              <p>No hay usuarios editores registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersProjectsList;
