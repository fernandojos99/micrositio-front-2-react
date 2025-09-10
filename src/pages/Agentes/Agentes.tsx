import React, { useState, useEffect } from 'react';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';
import FeatureCard from '../../components/cards/FeatureCard';
import { obtenerAgentes, Agente } from '../../services/agenteService';
import styles from './Agentes.module.css';

const Agentes: React.FC = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className={styles['agentes-title']}>Agentes de IA</h1>
        <p className={styles['agentes-description']}>
          Explora y gestiona los agentes de inteligencia artificial disponibles en tu sistema.
        </p>
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {agentes.map((agente) => (
              <FeatureCard
                key={agente.id_agente}
                nombre={agente.nombre}
                descripcion={agente.descripcion || 'Agente de IA especializado'}
                link={agente.link || `/agentes/${agente.id_agente}`}
                icon="bot"
                colorClass="from-purple-600 to-blue-600"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Agentes;