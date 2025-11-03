import React, { useEffect, useState } from 'react';
import { obtenerTodosUsuarios, Usuario } from '../../services/usuarioService';
import { obtenerProyectosPorUsuario, eliminarUsuarioProyecto } from '../../services/usuarioProyectoServices';
import { obtenerProyectos } from '../../services/proyectosService';
import styles from './UsersProjectsList.module.css';

interface Proyecto { id_proyecto: number; nombre: string }

const UsersProjectsList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [proyectosPorUsuario, setProyectosPorUsuario] = useState<Record<string, Proyecto[]>>({});
  const [allProyectos, setAllProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsuarios();
    loadAllProyectos();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await obtenerTodosUsuarios();
      setUsuarios(data);
      // por cada usuario cargar sus proyectos
      await Promise.all(data.map(async (u) => {
        const projs = await obtenerProyectosPorUsuario(u.id_usuario);
        setProyectosPorUsuario(prev => ({ ...prev, [u.id_usuario]: projs }));
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProyectos = async () => {
    try {
      const data = await obtenerProyectos();
      setAllProyectos(data);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  const handleRemoveProject = async (userId: string, proyectoId: number) => {
    try {
      await eliminarUsuarioProyecto({ id_usuario: Number(userId), id_proyecto: proyectoId });
      // actualizar estado local
      setProyectosPorUsuario(prev => ({
        ...prev,
        [userId]: prev[userId]?.filter(p => p.id_proyecto !== proyectoId) || []
      }));
    } catch (error) {
      console.error('Error al eliminar relación:', error);
      alert('No se pudo eliminar el proyecto del usuario');
    }
  };

  const handleAssignProject = (userId: string) => {
    // Mostrar un prompt simple para asignar por id de proyecto.
    const proyectoIdStr = prompt('Ingrese el id del proyecto a asignar:');
    if (!proyectoIdStr) return;
    const proyectoId = Number(proyectoIdStr);
    if (!proyectoId) return alert('Id de proyecto inválido');

    // Llamar al endpoint de creación de relación
    import('../../services/usuarioProyectoServices').then(mod => {
      mod.crearUsuarioProyecto({ id_usuario: Number(userId), id_proyecto: proyectoId })
        .then(() => {
          // recargar proyectos del usuario
          return obtenerProyectosPorUsuario(userId);
        })
        .then(projs => {
          setProyectosPorUsuario(prev => ({ ...prev, [userId]: projs }));
        })
        .catch(err => {
          console.error(err);
          alert('No se pudo asignar el proyecto');
        });
    });
  };

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <div className={styles.container}>
      <h2>Usuarios y proyectos</h2>
      <ul className={styles.userList}>
        {usuarios.map(u => (
          <li key={u.id_usuario} className={styles.userItem}>
            <div className={styles.userHeader}>
              <strong>{u.alias}</strong>
              <button onClick={() => handleAssignProject(u.id_usuario)} className={styles.assignBtn}>Asignar proyecto</button>
            </div>

            <div className={styles.proyectosList}>
              {(proyectosPorUsuario[u.id_usuario] || []).map(p => (
                <div key={p.id_proyecto} className={styles.proyectoItem}>
                  <span>{p.nombre || `Proyecto ${p.id_proyecto}`}</span>
                  <select onChange={(e) => {
                    if (e.target.value === 'remove') handleRemoveProject(u.id_usuario, p.id_proyecto);
                  }} value="">
                    <option value="">Acciones</option>
                    <option value="remove">Dar de baja</option>
                  </select>
                </div>
              ))}
              {(!proyectosPorUsuario[u.id_usuario] || proyectosPorUsuario[u.id_usuario].length === 0) && (
                <div className={styles.noProjects}>Sin proyectos</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersProjectsList;
