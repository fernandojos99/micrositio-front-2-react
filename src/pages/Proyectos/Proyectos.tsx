// src/pages/Proyectos/Proyectos.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { Proyecto } from '../../types/proyecto';
import Button from '../../components/ui-propios/Button/Button';
import NuevoProyectoModal from './components/NuevoProyectoModal';
import ColaboradoresPreview from './components/ColaboradoresPreview';
import LiderProyecto from './components/LiderProyecto';
import styles from './Proyectos.module.css';
import { obtenerProyectos } from '../../services/proyectosService';

const Proyectos: React.FC = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setLoading(true);
      setError(null);
      const proyectosData = await obtenerProyectos();

      // Mapear datos del backend al formato que espera el frontend
      const proyectosMapeados = proyectosData.map(proyecto => ({
        id: proyecto.id_proyecto?.toString() || proyecto.id?.toString(),
        nombre: proyecto.titulo,
        descripcion: proyecto.descripcion || '',
        estado: proyecto.estado?.toLowerCase() || 'activo',
        fechaInicio: proyecto.fecha_inicio || proyecto.created_at,
        fechaCreacion: proyecto.created_at,
        colaboradores: [] // Por ahora vacío, después puedes agregar lógica para obtener colaboradores
      }));

      setProyectos(proyectosMapeados);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleProyectoClick = (proyectoId: string) => {
    navigate(`/proyectos/${proyectoId}`);
  };

  const handleNuevoProyecto = () => {
    setIsModalOpen(true);
  };

  const handleProyectoCreado = async (proyectoId: string) => {
    setIsModalOpen(false);
    // Recargar la lista de proyectos para mostrar el nuevo
    await cargarProyectos();
    navigate(`/proyecto-${proyectoId}`);
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles['proyectos-container']}>
        <div className={styles['proyectos-content']}>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['proyectos-container']}>
        <div className={styles['proyectos-content']}>
          <p>Error: {error}</p>
          <Button onClick={cargarProyectos}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['proyectos-container']}>
      <div className={styles['proyectos-content']}>
        <div className={styles['proyectos-header']}>
          <h1 className={styles['proyectos-title']}>Proyectos</h1>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleNuevoProyecto}
          >
            Nuevo Proyecto
          </Button>
        </div>

        {proyectos.length === 0 ? (
          <div className={styles['empty-state']}>
            <h2 className={styles['empty-state-title']}>No hay proyectos</h2>
            <p className={styles['empty-state-description']}>
              Comienza creando tu primer proyecto para organizar tu trabajo.
            </p>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleNuevoProyecto}
            >
              Crear Primer Proyecto
            </Button>
          </div>
        ) : (
          <div className={styles['proyectos-grid']}>
            {proyectos.map((proyecto) => (
              <div
                key={proyecto.id}
                className={styles['proyecto-card']}
                onClick={() => handleProyectoClick(proyecto.id)}
              >
                <div className={styles['proyecto-card-header']}>
                  <h3 className={styles['proyecto-nombre']}>{proyecto.nombre}</h3>
                  <p className={styles['proyecto-descripcion']}>{proyecto.descripcion}</p>
                </div>

                <div className={styles['proyecto-colaboradores']}>
                  <p className={styles['colaboradores-label']}>Colaboradores:</p>
                  <ColaboradoresPreview idProyecto={Number(proyecto.id)} />
                </div>
                <div className={styles['proyecto-lider']}>
                  <p className={styles['colaboradores-label']}>Líder:</p>
                  <LiderProyecto idProyecto={Number(proyecto.id)} />
                </div>

                <div className={styles['proyecto-footer']}>
                  <span className={styles['proyecto-fecha']}>
                    {formatearFecha(proyecto.fechaInicio)}
                  </span>
                  <span className={`${styles['proyecto-estado']} ${styles[`estado-${proyecto.estado}`]}`}>
                    {proyecto.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <NuevoProyectoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProyectoCreado={handleProyectoCreado}
        />
      </div>
    </div>
  );
};

export default Proyectos;