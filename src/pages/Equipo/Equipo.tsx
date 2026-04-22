import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase,
  Search,
  Filter,
  UserPlus,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import { colaboradoresDisponibles } from '../../data/mockData';
import Button from '../../components/ui/Button/Button';
import styles from './Equipo.module.css';
import { ProfileCard, ProfileCardProps } from './CardProfile';
import { EmpleadoResumen, obtenerEmpleadosResumen } from '@/services/empleadosService';

/**
 * Datos extendidos del equipo con información adicional
 * @constant equipoExtendido
 */
const equipoExtendido = colaboradoresDisponibles.map((colaborador, index) => ({
  ...colaborador,
  role: ['Product Manager', 'UX Designer', 'Developer', 'Data Analyst', 'QA Engineer'][index],
  department: ['Producto', 'Diseño', 'Desarrollo', 'Datos', 'Calidad'][index],
  location: ['Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España', 'Bilbao, España'][index],
  joinDate: ['2023-01-15', '2023-03-20', '2023-06-10', '2023-09-05', '2024-01-12'][index],
  projectsCount: [8, 6, 12, 4, 7][index],
  status: 'Activo' as const,
  skills: [
    ['Product Strategy', 'Agile', 'Analytics'],
    ['UI/UX', 'Figma', 'User Research'],
    ['React', 'TypeScript', 'Node.js'],
    ['Python', 'SQL', 'Machine Learning'],
    ['Testing', 'Automation', 'Quality Assurance']
  ][index],
  bio: [
    'Especialista en estrategia de producto con 5+ años de experiencia en startups tecnológicas.',
    'Diseñadora UX/UI apasionada por crear experiencias digitales intuitivas y accesibles.',
    'Desarrollador full-stack con expertise en tecnologías modernas y arquitecturas escalables.',
    'Analista de datos enfocado en convertir información en insights accionables para el negocio.',
    'Ingeniera QA con experiencia en automatización y mejora continua de procesos de calidad.'
  ][index]
}));

/**
 * Estadísticas del equipo
 * @constant teamStats
 */
const teamStats = [
  { label: 'Miembros Activos', value: equipoExtendido.length, icon: <Users size={20} /> },
  { label: 'Proyectos Totales', value: equipoExtendido.reduce((sum, member) => sum + member.projectsCount, 0), icon: <Star size={20} /> },
  { label: 'Departamentos', value: new Set(equipoExtendido.map(m => m.department)).size, icon: <Award size={20} /> },
  { label: 'Tasa de Retención', value: '96%', icon: <TrendingUp size={20} /> }
];

/**
 * Componente Equipo
 * 
 * @component Equipo
 * @description Página que muestra información completa del equipo de trabajo,
 * incluyendo perfiles detallados, estadísticas y funcionalidades de búsqueda.
 * 
 * Características principales:
 * - Lista completa de miembros del equipo
 * - Perfiles detallados con información profesional
 * - Estadísticas del equipo
 * - Búsqueda y filtrado por nombre, rol o departamento
 * - Diseño de tarjetas moderno y responsive
 * - Información de contacto y habilidades
 * - Estados de actividad y métricas de rendimiento
 * 
 * Funcionalidades:
 * - Búsqueda en tiempo real
 * - Filtrado por departamento
 * - Vista de perfil expandida
 * - Estadísticas agregadas del equipo
 * 
 * @returns {JSX.Element} Página del equipo
 */
const Equipo: React.FC = () => {
  // @state: Término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // @state: Filtro de departamento
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // @state: Miembro seleccionado para vista detallada
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  /**
   * Filtra los miembros del equipo basado en búsqueda y filtros
   * @function filteredTeam
   * @returns {Array} Lista filtrada de miembros
   */
  const filteredTeam = equipoExtendido.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  /**
   * Obtiene la lista única de departamentos
   * @function departments
   * @returns {Array} Lista de departamentos únicos
   */
  const departments = Array.from(new Set(equipoExtendido.map(member => member.department)));

  /**
   * Formatea la fecha de ingreso
   * @function formatJoinDate
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatJoinDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  /**
   * Genera las iniciales de un nombre
   * @function getInitials
   * @param {string} name - Nombre completo
   * @returns {string} Iniciales
   */
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  


/**Mapea de resumen empleado a ProfileCardProps para poder 
 * construir las cartas perfiles
 */
const mapToProfileCard = (emp: EmpleadoResumen, index: number): ProfileCardProps => {

  // 🔥 DEBUG
  // console.log("──────────────");
  // console.log("Fecha original (backend):", emp.fecha_ingreso);

  const date = emp.fecha_ingreso
  ? new Date(emp.fecha_ingreso + "T00:00:00")
  : null;

  // console.log("Date parseada:", date);
  // console.log("Mes (getMonth):", date ? date.getMonth() + 1 : null);

  const formattedDate = date
    ? date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
      }).replace(/^./, (c) => c.toUpperCase())
    : "";

  // console.log("Fecha formateada FINAL:", formattedDate);

  return {
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${index + 1}`,

    name: `${emp.nombre_pila ?? ""} ${emp.apellido_paterno ?? ""} ${emp.apellido_materno ?? ""}`.trim(),

    role: emp.cargo ?? "",
    email: emp.correo ?? "",
    badge: emp.departamento ?? "",

    projectsCompleted: emp.projectsCompleted,
    projectsActive: emp.projectsActive,

    memberSince: formattedDate,

    aboutMe: emp.infopersonal ?? "",
    skills: emp.skills ?? [],

    accentColor: ["cyan", "blue", "green", "purple", "orange", "rose"][index % 6] as any,
  };
};



/**
 * Administra la informacion de los usuarios que se 
 * coloca en las cartas de perfiles.
 * 
 */
const [users, setUsers] = useState<ProfileCardProps[]>([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const empleados = await obtenerEmpleadosResumen();
      // console.log(empleados)

      const mappedUsers = empleados.map(mapToProfileCard);

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error cargando empleados:", error);
    }
  };

  fetchData();
}, []);
  
 /*  const users: ProfileCardProps[] = [
  {

    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=1",
    name: "Carlos Rodríguez",
    role: "Senior Developer",
    email: "carlos.rodriguez@empresa.com",
    badge: "Desarrollo",
    projectsCompleted: 45,
    projectsActive: 5,
    memberSince: "Enero/2024",
    aboutMe: "Desarrollador con más de 10 años de experiencia...",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
    accentColor: "blue",
  },
  {
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=2",
    name: "Ana López",
    role: "UX Designer",
    email: "ana.lopez@empresa.com",
    badge: "Diseño",
    projectsCompleted: 30,
    projectsActive: 3,
    memberSince: "Febrero/2024",
    aboutMe: "Diseñadora enfocada en experiencia de usuario...",
    skills: ["Figma", "UX Research", "Prototyping"],
    accentColor: "purple",
  },
    {
    avatarUrl: "https://api.dicebear.com/9.x/adventurer/svg?seed=2",
    name: "Ana Lópezd",
    role: "UX Designer",
    email: "ana.lopez@empresa.com",
    badge: "Diseño",
    projectsCompleted: 30,
    projectsActive: 3,
    memberSince: "Febrero/2024",
    aboutMe: "Diseñadora enfocada en experiencia de usuario...",
    skills: ["Figma", "UX Research", "Prototyping"],
    accentColor: "purple",
  },
];
 */



  return (
    <div className={styles['equipo-container']}>
      <div className={styles['equipo-content']}>
        {/* @section: Header con estadísticas */}
        <div className={styles['equipo-header']}>
          <div className={styles['header-content']}>
            <div className={styles['header-text']}>
              <h1 className={styles['equipo-title']}>
                <Users size={32} />
                Nuestro Equipo
              </h1>
              <p className={styles['equipo-description']}>
                Conoce a los profesionales que hacen posible la innovación en nuestra organización
              </p>
            </div>

            {/* @section: Estadísticas del equipo */}
            <div className={styles['team-stats']}>
              {teamStats.map((stat, index) => (
                <div key={index} className={styles['stat-card']}>
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
        </div>

        {/* @section: Controles de búsqueda y filtrado */}
        <div className={styles['controls-section']}>
          <div className={styles['search-controls']}>
            {/* @component: Barra de búsqueda */}
            <div className={styles['search-container']}>
              <Search size={20} className={styles['search-icon']} />
              <input
                type="text"
                placeholder="Buscar por nombre, rol o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['search-input']}
              />
            </div>

            {/* @component: Filtro de departamento */}
            <div className={styles['filter-container']}>
              <Filter size={20} className={styles['filter-icon']} />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="">Todos los departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* @component: Botón para añadir miembro 
          <Button
            variant="primary"
            icon={<UserPlus size={16} />}
            onClick={() => // console.log('Añadir nuevo miembro')}
          >
            Añadir Miembro
          </Button>
          */}
        </div>

        {/* @section: Resultados de búsqueda */}
        <div className={styles['results-info']}>
          <p className={styles['results-text']}>
            Mostrando {filteredTeam.length} de {equipoExtendido.length} miembros
            {searchTerm && ` para "${searchTerm}"`}
            {departmentFilter && ` en ${departmentFilter}`}
          </p>
        </div>

        {/* @section: Lista de miembros del equipo */}




        {/*<div className="w-full px-4 sm:px-6 lg:px-8 py-6"> ; esto le generaba mucho padding al componente */  }
        <div className="w-full p-0 m-0">
         {/*   <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">*/}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2  items-start">
            
            {users.map((user) => (
              <ProfileCard
              key={user.email}
              avatarUrl={user.avatarUrl}
              name={user.name}
              role={user.role}
              email={user.email}
              badge={user.badge}
              projectsCompleted={user.projectsCompleted}
              projectsActive={user.projectsActive}
              memberSince={user.memberSince}
              aboutMe={user.aboutMe}
              skills={user.skills}
              accentColor={user.accentColor}
            />
            ))}
          </div>

        </div> 


      </div>
    </div>
  );
};

export default Equipo;