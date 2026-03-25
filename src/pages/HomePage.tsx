//
import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Zap, 
  Rocket, 
  Code, 
  FileText, 
  Share2, 
  Search, 
  BookOpen,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  Star,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FeatureCard from '../components/cards/FeatureCard';
import InnovationCard from '../components/cards/InnovationCard';
import LoginModal from '../components/auth/LoginModal';
import styles from './HomePage.module.css';
import { obtenerEmpleados } from '@/services/empleadosService';
import { listarTodasTestingCards } from '@/services/testingCardService';
import { obtenerProyectos } from '@/services/proyectosService';

/**
 * Datos de proyectos destacados para mostrar en el home
 * @constant featuredProjects
 */
const featuredProjects = [
  {
    id: '1',
    name: 'Sistema de Gestión de Inventario',
    description: 'Aplicación web para gestionar inventario con seguimiento en tiempo real',
    progress: 85,
    team: ['Ana García', 'Carlos Rodríguez'],
    status: 'En desarrollo'
  },
  {
    id: '2',
    name: 'Plataforma de E-learning',
    description: 'Plataforma educativa con cursos interactivos y evaluaciones',
    progress: 92,
    team: ['María López', 'David Martínez'],
    status: 'Casi completado'
  },
  {
    id: '3',
    name: 'Dashboard Analítico',
    description: 'Panel de control con visualizaciones de datos empresariales',
    progress: 60,
    team: ['Laura Sánchez', 'Ana García'],
    status: 'En progreso'
  }
];





/**
 * Temas de innovación disponibles
 * @constant innovationTopics
 */
const innovationTopics = [
  { 
    title: 'Inteligencia Artificial', 
    icon: <Brain size={32} />, 
    to: '/lecciones/inteligencia-artificial',
    description: 'Explora las últimas tendencias en IA'
  },
  { 
    title: 'Prompting Avanzado', 
    icon: <Lightbulb size={32} />, 
    to: '/lecciones/prompting-avanzado',
    description: 'Técnicas avanzadas de prompting'
  },
  { 
    title: 'Automatización', 
    icon: <Zap size={32} />, 
    to: '/lecciones/automatizacion',
    description: 'Automatiza procesos complejos'
  },
  { 
    title: 'Innovación Tecnológica', 
    icon: <Rocket size={32} />, 
    to: '/lecciones/innovacion-tecnologica',
    description: 'Últimas innovaciones tech'
  },
  { 
    title: 'Desarrollo Web', 
    icon: <Code size={32} />, 
    to: '/lecciones/desarrollo-web',
    description: 'Frameworks y herramientas modernas'
  },
  { 
    title: 'Documentación Efectiva', 
    icon: <FileText size={32} />, 
    to: '/lecciones/documentacion-efectiva',
    description: 'Mejores prácticas de documentación'
  }
];

/**
 * Componente HomePage rediseñado
 * 
 * @component HomePage
 * @description Página de inicio completamente rediseñada con diseño moderno y atractivo.
 * Incluye hero section, proyectos destacados, estadísticas y recursos de innovación.
 * 
 * Características principales:
 * - Hero section con CTA prominente
 * - Estadísticas destacadas con animaciones
 * - Proyectos destacados con progreso visual
 * - Tarjetas de recursos de innovación
 * - Diseño responsive y accesible
 * - Integración con sistema de autenticación
 * - Animaciones CSS sutiles
 * - Call-to-actions estratégicos
 * 
 * @returns {JSX.Element} Página de inicio rediseñada
 */
const HomePage: React.FC = () => {

   const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const empleados = await obtenerEmpleados();
        setTotal(empleados.length); // 🔥 aquí cuentas
      } catch (error) {
        console.error(error);
      }
    };

    fetch();
  }, []);

   const [totalEx, setTotalEx] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const testingCards = await listarTodasTestingCards();
        setTotalEx(testingCards.length); // 🔥 aquí cuentas
      } catch (error) {
        console.error(error);
      }
    };

    fetch();
  }, []);


   const [totalPr, setTotalPr] = useState(0);

    useEffect(() => {
    const fetch = async () => {
      try {
        const proyectos = await obtenerProyectos();
        setTotalPr(proyectos.length); // 🔥 aquí cuentas
      } catch (error) {
        console.error(error);
      }
    };

    fetch();
  }, []);




  /**
   * Estadísticas para mostrar en el hero section
   * @constant stats
   */
  const stats = [
    { label: 'Proyectos Activos', value: totalPr === 0 ? '30+' : `${totalPr}+`, icon: <Rocket size={20} /> },
    { label: 'Colaboradores Especialistas' , value: total === 0 ? '20+' : `${total}+`,  icon: <Users size={20} /> },
    { label: 'Experimentos', value: totalEx === 0 ? '200+' : `${totalEx}+`,  icon: <Zap size={20} /> },
    { label: 'Servicios de Innovación', value: '50+', icon: <TrendingUp size={20} /> }
  ];



  // @context: Contexto de autenticación
  const { user } = useAuth();
  
  // @state: Control del modal de login
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Maneja el clic en el CTA principal
   * @function handleMainCTA
   */
  const handleMainCTA = () => {
    if (user) {
      // @navigation: Si está logueado, ir a proyectos
      window.location.href = '/proyectos';
    } else {
      // @action: Si no está logueado, mostrar modal de login
      setShowLoginModal(true);
    }
  };

  return (
    <div className={styles['home-container']}>
      {/* @section: Hero Section */}
      <section className={styles['hero-section']}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-gradient']}></div>
          <div className={styles['hero-pattern']}></div>
        </div>
        
        <div className={styles['hero-content']}>
          <div className={styles['hero-text']}>
            <h1 className={styles['hero-title']}>
              Impulsa tu <span className={styles['hero-highlight']}>Proceso de Innovación</span>
              <br />
              {/*en tu Organización*/}
            </h1>
            <p className={styles['hero-description']}>
              Conoce nuestra plataforma para gestionar proyectos innovadores, experimentar con nuevas tecnologías 
              y acelerar el desarrollo de soluciones disruptivas en tu empresa.
            </p>
            
            {/* @section: Botones de acción */}
            <div className={styles['hero-actions']}>
              <button 
                onClick={handleMainCTA}
                className={styles['cta-primary']}
              >
                <Play size={20} />
                {user ? 'Ver Mis Proyectos' : 'Comenzar Ahora'}
                <ArrowRight size={16} />
              </button>
              
              <Link to="/agentes" className={styles['cta-secondary']}>
                <Brain size={20} />
                Explorar Agente
              </Link>
            </div>
          </div>

          {/* @section: Estadísticas destacadas */}
          <div className={styles['hero-stats']}>
            {stats.map((stat, index) => (
              <div key={index} className={styles['stat-item']}>
                <div className={styles['stat-icon']}>
                  {stat.icon}
                </div>
                <div className={styles['stat-content']}>
                  <span className={styles['stat-value']}>{stat.value}</span>
                  <span className={styles['stat-label']}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/**Esto aparece si se loguea el usuario , pero lo comentare 
       * porque aun no esta terminado 
       */}
      {/* @section: Proyectos Destacados */}
      {/*      {user && (
              <section className={styles['featured-projects']}>
                <div className={styles['section-container']}>
                  <div className={styles['section-header']}>
                    <h2 className={styles['section-title']}>
                      <Star size={24} />
                      Proyectos Destacados
                    </h2>
                    <p className={styles['section-description']}>
                      Tus proyectos más importantes y su progreso actual
                    </p>
                    <Link to="/proyectos" className={styles['section-link']}>
                      Ver todos <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className={styles['projects-grid']}>
                    {featuredProjects.map((project) => (
                      <div key={project.id} className={styles['project-card']}>
                        <div className={styles['project-header']}>
                          <h3 className={styles['project-name']}>{project.name}</h3>
                          <span className={styles['project-status']}>{project.status}</span>
                        </div>
                        
                        <p className={styles['project-description']}>
                          {project.description}
                        </p>
                        
                        <div className={styles['project-progress']}>
                          <div className={styles['progress-header']}>
                            <span>Progreso</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className={styles['progress-bar']}>
                            <div 
                              className={styles['progress-fill']}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className={styles['project-team']}>
                          <Users size={14} />
                          <span>{project.team.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
      */}



      {/* @section: Feature Cards 
      <section className={styles['features-section']}>
        <div className={styles['section-container']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <Rocket size={24} />
              Herramientas Principales
            </h2>
            <p className={styles['section-description']}>
              Descubre las herramientas que potenciarán tu innovación
            </p>
          </div>

          <div className={styles['features-grid']}>
            <FeatureCard 
              title="Gestión de Experimentos" 
              description="Organiza y ejecuta experimentos tecnológicos con metodologías probadas para maximizar el aprendizaje y minimizar riesgos." 
              linkTo="/proyectos"
              colorClass="from-primary-purple to-secondary-purple"
            />
            <FeatureCard 
              title="Biblioteca de Prompts" 
              description="Accede a una colección curada de prompts optimizados para diferentes casos de uso que potencian la productividad con IA." 
              linkTo="/prompts"
              colorClass="from-primary-yellow to-secondary-orange"
            />
          </div>
        </div>
      </section>
      */}

 {/* @section: Innovation Resources */}
 {/* Descomentar si quiero los recuadros de abajo del landingpage */}
{/*      
      <section className={styles['innovation-section']}>
        <div className={styles['section-container']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>
              <Brain size={24} />
              Recursos de Innovación
            </h2>
            <p className={styles['section-description']}>
              Explora conocimientos y herramientas para impulsar la innovación tecnológica
            </p>
          </div>

          <div className={styles['innovation-grid']}>
            {innovationTopics.map((topic, index) => (
              <div key={index} className={styles['innovation-card']}>
                <div className={styles['innovation-icon']}>
                  {topic.icon}
                </div>
                <h3 className={styles['innovation-title']}>{topic.title}</h3>
                <p className={styles['innovation-description']}>{topic.description}</p>
                <Link to={topic.to} className={styles['innovation-link']}>
                  Explorar <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
 */}
      {/* @component: Modal de login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default HomePage;
