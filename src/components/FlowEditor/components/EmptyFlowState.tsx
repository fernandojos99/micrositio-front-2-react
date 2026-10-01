import React from 'react';
import { Plus } from 'lucide-react';
import styles from './EmptyFlowState.module.css';

/**
 * Props para el componente EmptyFlowState
 */
interface EmptyFlowStateProps {
  /** Función que se ejecuta al hacer clic en el botón de crear Testing Card */
  onCreateFirstNode: () => void;
}

/**
 * Componente EmptyFlowState
 * 
 * Muestra un estado vacío atractivo e invitador cuando no hay nodos en el FlowEditor.
 * Incluye un llamado a la acción para crear la primera Testing Card con un diseño
 * moderno y características destacadas.
 * 
 * Características:
 * - Diseño atractivo con gradientes y animaciones
 * - Mensaje motivacional personalizado
 * - Lista de beneficios de crear Testing Cards
 * - Botón de acción prominente
 * - Efectos visuales sutiles (partículas, pulsos)
 * - Totalmente responsive y accesible
 * - Compatible con modo oscuro
 */
const EmptyFlowState: React.FC<EmptyFlowStateProps> = ({ onCreateFirstNode }) => {
  return (
    <div className={styles['empty-state']}>
      {/* Partículas decorativas de fondo */}
      <div className={styles.particles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>

      {/* Contenedor principal del contenido */}
      <div className={styles['content-container']}>
        {/* Icono principal con efectos visuales */}
        {/* Icono principal eliminado */}

        {/* Título principal */}
        <h2 className={styles.title}>
          ¡Haz tu primer Testing Card!
        </h2>

        {/* Subtítulo descriptivo */}
        <p className={styles.subtitle}>
          Comienza tu experimento creando una Testing Card para validar tus hipótesis 
          y obtener insights valiosos de manera estructurada.
        </p>

        {/* Botón de acción principal */}
        <div className={styles['action-container']}>
          <button
            onClick={onCreateFirstNode}
            className={styles['action-button']}
            aria-label="Crear primera Testing Card"
          >
            <Plus size={20} className={styles['button-icon']} />
            Crear Testing Card
          </button>
          {/* Si ocurre un error de creación, aquí podrías mostrar un mensaje de error personalizado */}
        </div>

        {/* Lista de características y beneficios 
        <div className={styles['features-list']}>
          <div className={styles['feature-item']}>
            <CheckCircle size={16} className={styles['feature-icon']} />
            <span className={styles['feature-text']}>
              Estructura tus experimentos de forma clara
            </span>
          </div>
          
          <div className={styles['feature-item']}>
            <Target size={16} className={styles['feature-icon']} />
            <span className={styles['feature-text']}>
              Define hipótesis y métricas de éxito
            </span>
          </div>
          
          <div className={styles['feature-item']}>
            <Zap size={16} className={styles['feature-icon']} />
            <span className={styles['feature-text']}>
              Conecta con Learning Cards automáticamente
            </span>
          </div>
          
          <div className={styles['feature-item']}>
            <Users size={16} className={styles['feature-icon']} />
            <span className={styles['feature-text']}>
              Colabora en tiempo real con tu equipo
            </span>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default EmptyFlowState;