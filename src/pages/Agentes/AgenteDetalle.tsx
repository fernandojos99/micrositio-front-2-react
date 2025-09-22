import { useParams } from 'react-router-dom';
import { Agente, obtenerAgentePorId } from '../../services/agenteService';
import { useState, useEffect } from 'react';
import { ExternalLink, FileText, MessageSquare, Copy, Check } from 'lucide-react';
import styles from './AgenteDetalle.module.css';

const AgenteDetalle: React.FC = () => {
    const { agenteId } = useParams<{ agenteId: string }>();

    // @state: Datos principales
    const [agente, setAgente] = useState<Agente | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const cargarAgente = async () => {
            if (agenteId) {
                try {
                    setLoading(true);
                    setError(null);
                    const data = await obtenerAgentePorId(Number(agenteId));
                    setAgente(data);
                } catch (error) {
                    console.error('Error al cargar agente:', error);
                    setError('No se pudo cargar la información del agente');
                } finally {
                    setLoading(false);
                }
            }
        };

        cargarAgente();
    }, [agenteId]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
        }
    };


    // @render: Estado de carga
    if (loading) {
        return (
            <div className={styles['agente-detalle-container']}>
                <div className={styles['agente-detalle-content']}>
                    <div className={styles['loading-state']}>
                        Cargando información del agente...
                    </div>
                </div>
            </div>
        );
    }

    // @render: Estado de error
    if (error || !agente) {
        return (
            <div className={styles['agente-detalle-container']}>
                <div className={styles['agente-detalle-content']}>
                    <div className={styles['error-state']}>
                        <h2 className={styles['error-title']}>
                            {error || 'Agente no encontrado'}
                        </h2>
                        <p className={styles['error-message']}>
                            Verifica que el ID del agente sea correcto e intenta nuevamente.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['agente-detalle-container']}>
            <div className={styles['agente-detalle-content']}>
                {/* Header del agente */}
                <div className={styles['agente-header']}>
                    <h1 className={styles['agente-nombre']}>{agente.nombre}</h1>
                    {/* <p className={styles['agente-id']}>Agente ID: {agente.id_agente}</p> */}
                </div>

                {/* Cuerpo con la información */}
                <div className={styles['agente-body']}>
                    
                    {/* Descripción */}
                    {agente.descripcion && (
                        <div className={styles['campo-section']}>
                            <label className={styles['campo-label']}>
                                <span className={styles['campo-icono']}>
                                    <FileText size={16} />
                                    Descripción
                                </span>
                            </label>
                            <p className={`${styles['campo-valor']} ${styles['descripcion-valor']}`}>
                                {agente.descripcion}
                            </p>
                        </div>
                    )}

                    {/* Link */}
                    {agente.link && (
                        <div className={styles['campo-section']}>
                            <label className={styles['campo-label']}>
                                <span className={styles['campo-icono']}>
                                    <ExternalLink size={16} />
                                    Enlace
                                </span>
                            </label>
                            <a 
                                href={agente.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`${styles['campo-valor']} ${styles['link-valor']}`}
                            >
                                {agente.link}
                            </a>
                        </div>
                    )}

                    {/* Prompt */}
                    {agente.prompt && (
                        <div className={styles['campo-section']}>
                            <div className={styles['campo-label-with-button']}>
                                <label className={styles['campo-label']}>
                                    <span className={styles['campo-icono']}>
                                        <MessageSquare size={16} />
                                        Prompt del Agente
                                    </span>
                                </label>
                                <button
                                    className={`${styles['copy-button']} ${copied ? styles['copied'] : ''}`}
                                    onClick={() => agente.prompt && copyToClipboard(agente.prompt)}
                                    title={copied ? 'Copiado!' : 'Copiar prompt'}
                                >
                                    {copied ? (
                                        <>
                                            <Check className={styles['copy-button-icon']} />
                                            Copiado
                                        </>
                                    ) : (
                                        <>
                                            <Copy className={styles['copy-button-icon']} />
                                            Copiar
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className={`${styles['campo-valor']} ${styles['prompt-valor']}`}>
                                {agente.prompt}
                            </div>
                        </div>
                    )}

                
                </div>
            </div>
        </div>
    );
};

export default AgenteDetalle;