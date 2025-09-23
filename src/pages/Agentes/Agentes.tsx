import React, { useState, useEffect } from 'react';
import { Bot, AlertCircle, Loader2, Filter, ChevronDown, Layers, Target, Users, Lightbulb, TrendingUp, TestTube, UserCheck, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../../components/cards/FeatureCard';
import { obtenerAgentes, listarPorCategoria, Agente } from '../../services/agenteService';
import { obtenerCategoriasAgentes, CategoriaAgente } from '../../services/agenteCategoriaService';
import { useTheme } from '../../hooks/useTheme';
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
  const { isDarkMode } = useTheme();
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaAgente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Función para obtener el icono de una categoría
  const getCategoriaIcon = (nombreCategoria: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Análisis': <TrendingUp size={16} />,
      'Diseño': <Target size={16} />,
      'Experimentación': <TestTube size={16} />,
      'Ideación': <Lightbulb size={16} />,
      'Investigación': <Users size={16} />,
      'Planeación': <Layers size={16} />,
      'Prototipado': <Zap size={16} />,
      'Revisión': <UserCheck size={16} />,
    };
    
    return iconMap[nombreCategoria] || <Bot size={16} />;
  };

  const handleAgenteClick = (agenteId: number) => {
    navigate(`/agentes/${agenteId}`);
  };

  const handleExplorarPromptClick = (agenteId: number) => {
    // Puedes personalizar esta función para ir a una página específica de prompts
    // Por ejemplo: navigate(`/agentes/${agenteId}/prompts`);
    // O mostrar un modal, etc.
    navigate(`/agentes/${agenteId}`);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primero cargar las categorías
        const categoriasData = await obtenerCategoriasAgentes();
        setCategorias(categoriasData);
        
        // Si no hay categoría seleccionada, cargar todos los agentes
        if (categoriaSeleccionada === null) {
          const agentesData = await obtenerAgentes();
          setAgentes(agentesData);
        } else {
          // Si hay categoría seleccionada, cargar agentes de esa categoría
          const agentesData = await listarPorCategoria(categoriaSeleccionada);
          setAgentes(agentesData);
        }
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(`Error al cargar los datos: ${err?.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [categoriaSeleccionada]); // Dependencia cambiada para recargar cuando cambie la categoría

  // Filtrar agentes por término de búsqueda (nombre y descripción)
  const agentesFiltrados = agentes.filter(agente =>
    agente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agente.descripcion && agente.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

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
          {/*<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Agentes de IA especializados que te guiarán en cada aspecto del proceso de innovación.
          </p>*/}
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className={styles['filter-section']}>
          {/* Barra de búsqueda */}
          <div className={`${styles['dropdown-container']} ${isDarkMode ? 'dark' : ''}`}>
            <div className={styles['dropdown-trigger']}>
              <Search 
                size={16} 
                className={styles['dropdown-trigger-icon']}
              />
              <input
                type="text"
                placeholder="Buscar agentes . . ."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['search-input']}
              />
            </div>
          </div>

          {/* Dropdown de categorías */}
          <div className={`${styles['dropdown-container']} ${isDarkMode ? 'dark' : ''} dropdown-container`}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={styles['dropdown-trigger']}
            >
              <Filter size={16} className={styles['dropdown-trigger-icon']} />
              <span className={styles['dropdown-trigger-text']}>
                {categoriaSeleccionada 
                  ? `Categoría: ${categorias.find(c => c.id_categoria === categoriaSeleccionada)?.nombre_categoria}` 
                  : 'Filtrar por categoría'}
              </span>
              <ChevronDown 
                size={16} 
                className={`${styles['dropdown-trigger-arrow']} ${dropdownOpen ? styles['rotated'] : ''}`}
              />
            </button>
            
            {dropdownOpen && (
              <div 
                className={styles['dropdown-menu']}
                style={{
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDarkMode ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.2)',
                }}
              >
                <div className={styles['dropdown-menu-content']}>
                  <button
                    onClick={() => {
                      setCategoriaSeleccionada(null);
                      setDropdownOpen(false);
                    }}
                    className={`${styles['dropdown-option']} ${categoriaSeleccionada === null ? styles['active'] : ''}`}
                    style={{
                      color: isDarkMode ? '#f8fafc' : 'var(--theme-text-primary)',
                    }}
                  >
                    <span 
                      className={styles['dropdown-option-icon']}
                      style={{ color: isDarkMode ? 'rgb(196, 181, 253)' : 'rgb(147, 51, 234)' }}
                    >
                      <Layers size={16} />
                    </span>
                    <span className={styles['dropdown-option-text']}>
                      Todas las categorías
                    </span>
                  </button>
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id_categoria}
                      onClick={() => {
                        setCategoriaSeleccionada(categoria.id_categoria);
                        setDropdownOpen(false);
                      }}
                      className={`${styles['dropdown-option']} ${categoriaSeleccionada === categoria.id_categoria ? styles['active'] : ''}`}
                      style={{
                        color: isDarkMode ? '#f8fafc' : 'var(--theme-text-primary)',
                      }}
                    >
                      <span 
                        className={styles['dropdown-option-icon']}
                        style={{ color: isDarkMode ? 'rgb(196, 181, 253)' : 'rgb(147, 51, 234)' }}
                      >
                        {getCategoriaIcon(categoria.nombre_categoria)}
                      </span>
                      <span className={styles['dropdown-option-text']}>
                        {categoria.nombre_categoria}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {agentesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12">
            <Bot className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
              {agentes.length === 0 
                ? 'No hay agentes disponibles en este momento.' 
                : searchTerm 
                  ? `No se encontraron agentes que coincidan con "${searchTerm}".`
                  : 'No se encontraron agentes con el filtro seleccionado.'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center mt-2">
              {agentes.length === 0 
                ? 'Los agentes aparecerán aquí una vez que sean creados.' 
                : searchTerm
                  ? 'Intenta con otro término de búsqueda o elimina la búsqueda actual.'
                  : 'Intenta con otro filtro o elimina los filtros actuales.'
              }
            </p>
          </div>
        ) : (
          <div className={styles['agentes-grid']}>
            {agentesFiltrados.map((agente, index) => {
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
                  onExplorarClick={() => handleExplorarPromptClick(agente.id_agente)}
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