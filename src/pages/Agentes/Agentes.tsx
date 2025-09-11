import React, { useState, useEffect } from 'react';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../../components/cards/FeatureCard';
import { obtenerAgentes, Agente } from '../../services/agenteService';
import styles from './Agentes.module.css';

// Configuración de colores y iconos para diferentes tipos de agentes
const agenteConfig = [
  { bgColor: "bg-gradient-to-br from-teal-50 to-cyan-100", icon: "trending" },
  { bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100", icon: "users" },
  { bgColor: "bg-gradient-to-br from-gray-50 to-slate-100", icon: "target" },
  { bgColor: "bg-gradient-to-br from-purple-50 to-violet-100", icon: "bot" },
  { bgColor: "bg-gradient-to-br from-yellow-50 to-amber-100", icon: "lightbulb" },
  { bgColor: "bg-gradient-to-br from-green-50 to-emerald-100", icon: "layers" },
  { bgColor: "bg-gradient-to-br from-pink-50 to-rose-100", icon: "test" },
  { bgColor: "bg-gradient-to-br from-indigo-50 to-blue-100", icon: "test" },
  { bgColor: "bg-gradient-to-br from-purple-50 to-pink-100", icon: "usercheck" }
];

const Agentes: React.FC = () => {
  const navigate = useNavigate();
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAgenteClick = (agenteId: number) => {
    navigate(`/agentes/${agenteId}`);
  };

  useEffect(() => {
    const cargarAgentes = async () => {
      try {
        setLoading(true);
        setError(null);
        const agentesData = await obtenerAgentes();
        setAgentes(agentesData);
      } catch (err: any) {
        console.error('Error al cargar agentes:', err);
        setError(`Error al cargar los agentes: ${err?.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    cargarAgentes();
  }, []);

  if (loading) {
    return (
      <div className={styles['agentes-container']}>
        <div className={styles['agentes-content']}>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-purple mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Cargando agentes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['agentes-container']}>
        <div className={styles['agentes-content']}>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['agentes-container']}>
      <div className={styles['agentes-content']}>
        {/* Header centralizado similar a la imagen */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
             Descubre nuestro agentes para innovación
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Agentes de IA especializados que te guiarán en cada aspecto del proceso de innovación.
          </p>
        </div>
        
        {agentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12">
            <Bot className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
              No hay agentes disponibles en este momento.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-2">
              Los agentes aparecerán aquí una vez que sean creados.
            </p>
          </div>
        ) : (
          <div className={styles['agentes-grid']}>
            {agentes.map((agente, index) => {
              const config = agenteConfig[index % agenteConfig.length];
              
              return (
                <div
                  key={agente.id_agente}
                  className={styles['agente-card']}
                  onClick={() => handleAgenteClick(agente.id_agente)}
                >
                <FeatureCard
                  key={agente.id_agente}
                  nombre={agente.nombre}
                  descripcion={agente.descripcion || 'Agente de IA especializado para guiarte en procesos de innovación'}
                  link={agente.link || `/agentes/${agente.id_agente}`}
                  icon={config.icon}
                  bgColor={config.bgColor}
                />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agentes;