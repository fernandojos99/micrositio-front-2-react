/**
 * Componente para gestionar la lista de usuarios y sus proyectos asignados.
 * Permite visualizar todos los usuarios del sistema junto con los proyectos 
 * que tienen asignados, así como asignar nuevos proyectos y dar de baja proyectos existentes.
 */

import React, { useEffect, useState } from 'react';
import { obtenerTodosUsuarios, Usuario } from '../../services/usuarioService';
import { obtenerProyectosPorUsuario, eliminarUsuarioProyecto } from '../../services/usuarioProyectoServices';
import { obtenerProyectos } from '../../services/proyectosService';
import styles from './UsersProjectsList.module.css';

/**
 * Interfaz que define la estructura básica de un proyecto
 * @interface Proyecto
 * @property {number} id_proyecto - Identificador único del proyecto
 * @property {string} nombre - Nombre descriptivo del proyecto
 */
interface Proyecto { id_proyecto: number; nombre: string }

/**
 * Componente principal para la gestión de usuarios y proyectos
 * @returns {React.FC} Componente de React que renderiza la lista de usuarios con sus proyectos
 */
const UsersProjectsList: React.FC = () => {
  // Estado para almacenar la lista completa de usuarios del sistema
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estado que mantiene un mapeo de id_usuario -> array de proyectos asignados
  const [proyectosPorUsuario, setProyectosPorUsuario] = useState<Record<string, Proyecto[]>>({});
  
  // Estado para almacenar todos los proyectos disponibles (para futuras funcionalidades)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allProyectos, setAllProyectos] = useState<Proyecto[]>([]);
  
  // Estado para controlar el indicador de carga durante las operaciones asíncronas
  const [loading, setLoading] = useState(false);

  /**
   * Effect que se ejecuta al montar el componente
   * Carga la lista inicial de usuarios y todos los proyectos disponibles
   */
  useEffect(() => {
    loadUsuarios();
    loadAllProyectos();
  }, []);

  /**
   * Función asíncrona para cargar todos los usuarios y sus proyectos asignados
   * Establece el estado de carga mientras se ejecutan las operaciones
   * Para cada usuario obtenido, consulta sus proyectos asignados en paralelo
   */
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      // Obtener lista completa de usuarios
      const response = await obtenerTodosUsuarios();
      console.log('🔍 Respuesta del servicio obtenerTodosUsuarios:', response);
      
      // Validar que la respuesta sea un array válido
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
          console.warn('⚠️ Respuesta del servicio no es un array válido:', response);
          usuariosData = [];
        }
      } else {
        console.warn('⚠️ Respuesta del servicio no es un array válido:', response);
        usuariosData = [];
      }
      
      console.log('✅ Usuarios procesados:', usuariosData);
      setUsuarios(usuariosData);
      
      // Para cada usuario, cargar sus proyectos asignados de forma paralela
      if (usuariosData.length > 0) {
        await Promise.all(usuariosData.map(async (u) => {
          try {
            const projs = await obtenerProyectosPorUsuario(u.id_usuario);
            // Actualizar el estado manteniendo los datos existentes de otros usuarios
            setProyectosPorUsuario(prev => ({ ...prev, [u.id_usuario]: Array.isArray(projs) ? projs : [] }));
          } catch (projError) {
            console.error(`Error cargando proyectos para usuario ${u.id_usuario}:`, projError);
            // Establecer array vacío en caso de error
            setProyectosPorUsuario(prev => ({ ...prev, [u.id_usuario]: [] }));
          }
        }));
      }
    } catch (error) {
      console.error('Error cargando usuarios y proyectos:', error);
      // En caso de error, establecer array vacío para evitar crashes
      setUsuarios([]);
      setProyectosPorUsuario({});
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función asíncrona para cargar todos los proyectos disponibles en el sistema
   * Estos datos pueden ser utilizados para funcionalidades futuras como 
   * mostrar un dropdown con proyectos disponibles para asignar
   */
  const loadAllProyectos = async () => {
    try {
      const data = await obtenerProyectos();
      setAllProyectos(data);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  /**
   * Maneja la eliminación de un proyecto asignado a un usuario específico
   * @param {string} userId - ID del usuario del cual se removerá el proyecto
   * @param {number} proyectoId - ID del proyecto a remover
   */
  const handleRemoveProject = async (userId: string, proyectoId: number) => {
    try {
      // Llamar al servicio para eliminar la relación usuario-proyecto
      await eliminarUsuarioProyecto({ id_usuario: Number(userId), id_proyecto: proyectoId });
      
      // Actualizar el estado local removiendo el proyecto de la lista del usuario
      setProyectosPorUsuario(prev => ({
        ...prev,
        [userId]: prev[userId]?.filter(p => p.id_proyecto !== proyectoId) || []
      }));
    } catch (error) {
      console.error('Error al eliminar relación usuario-proyecto:', error);
      alert('No se pudo eliminar el proyecto del usuario');
    }
  };

  /**
   * Maneja la promoción de un usuario VISITANTE a EDITOR
   * @param {string} userId - ID del usuario a promocionar
   */
  const handlePromoteUser = async (userId: string) => {
    const confirmPromotion = window.confirm(
      '¿Estás seguro de que quieres convertir este usuario VISITANTE en EDITOR? ' +
      'Esto le dará acceso completo a todas las funcionalidades del sistema.'
    );
    
    if (!confirmPromotion) return;

    try {
      // Importar dinámicamente el servicio de usuarios
      const { actualizarUsuario } = await import('../../services/usuarioService');
      
      // Actualizar el tipo de usuario a EDITOR
      await actualizarUsuario(userId, { tipo: 'EDITOR' });
      
      // Recargar usuarios para reflejar los cambios
      await loadUsuarios();
      
      alert('Usuario promocionado a EDITOR exitosamente');
    } catch (error) {
      console.error('Error al promocionar usuario:', error);
      alert('No se pudo promocionar el usuario. Intenta nuevamente.');
    }
  };

  /**
   * Maneja la asignación de un nuevo proyecto a un usuario
   * Utiliza un prompt simple para solicitar el ID del proyecto
   * @param {string} userId - ID del usuario al cual se asignará el proyecto
   */
  const handleAssignProject = (userId: string) => {
    // Mostrar prompt para que el usuario ingrese el ID del proyecto a asignar
    const proyectoIdStr = prompt('Ingrese el id del proyecto a asignar:');
    if (!proyectoIdStr) return;
    
    // Validar que el ID sea un número válido
    const proyectoId = Number(proyectoIdStr);
    if (!proyectoId) return alert('Id de proyecto inválido');

    // Importar dinámicamente el servicio y crear la relación usuario-proyecto
    import('../../services/usuarioProyectoServices').then(mod => {
      mod.crearUsuarioProyecto({ id_usuario: Number(userId), id_proyecto: proyectoId })
        .then(() => {
          // Recargar los proyectos del usuario para reflejar la nueva asignación
          return obtenerProyectosPorUsuario(userId);
        })
        .then(projs => {
          // Actualizar el estado local con la nueva lista de proyectos
          setProyectosPorUsuario(prev => ({ ...prev, [userId]: projs }));
        })
        .catch(err => {
          console.error('Error al asignar proyecto:', err);
          alert('No se pudo asignar el proyecto');
        });
    });
  };

  // Mostrar indicador de carga mientras se obtienen los datos
  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className={styles.container}>
      <h2>Usuarios y proyectos</h2>
      
      {/* Lista de usuarios con sus proyectos asignados */}
      <ul className={styles.userList}>
        {Array.isArray(usuarios) && usuarios.length > 0 ? usuarios.map(u => (
          <li key={u.id_usuario} className={styles.userItem}>
            
            {/* Encabezado del usuario con información y botones de acción */}
            <div className={styles.userHeader}>
              <div className={styles.userInfo}>
                <strong>{u.alias}</strong>
                <span className={`${styles.userType} ${u.tipo === 'EDITOR' ? styles.editor : styles.visitante}`}>
                  {u.tipo}
                </span>
              </div>
              <div className={styles.userActions}>
                {u.tipo === 'VISITANTE' && (
                  <button 
                    onClick={() => handlePromoteUser(u.id_usuario)} 
                    className={styles.promoteBtn}
                    title="Promocionar a EDITOR"
                  >
                    Promover a Editor
                  </button>
                )}
                <button 
                  onClick={() => handleAssignProject(u.id_usuario)} 
                  className={styles.assignBtn}
                >
                  Asignar proyecto
                </button>
              </div>
            </div>

            {/* Lista de proyectos asignados al usuario */}
            <div className={styles.proyectosList}>
              {(proyectosPorUsuario[u.id_usuario] || []).map(p => (
                <div key={p.id_proyecto} className={styles.proyectoItem}>
                  {/* Mostrar nombre del proyecto o ID si no tiene nombre */}
                  <span>{p.nombre || `Proyecto ${p.id_proyecto}`}</span>
                  
                  {/* Dropdown para acciones sobre el proyecto */}
                  <select 
                    onChange={(e) => {
                      if (e.target.value === 'remove') {
                        handleRemoveProject(u.id_usuario, p.id_proyecto);
                      }
                    }} 
                    value=""
                  >
                    <option value="">Acciones</option>
                    <option value="remove">Dar de baja</option>
                  </select>
                </div>
              ))}
              
              {/* Mensaje cuando el usuario no tiene proyectos asignados */}
              {(!proyectosPorUsuario[u.id_usuario] || proyectosPorUsuario[u.id_usuario].length === 0) && (
                <div className={styles.noProjects}>Sin proyectos</div>
              )}
            </div>
          </li>
        )) : (
          <li className={styles.noUsers}>
            <div className={styles.noUsersMessage}>
              {loading ? 'Cargando usuarios...' : 'No hay usuarios disponibles'}
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default UsersProjectsList;
