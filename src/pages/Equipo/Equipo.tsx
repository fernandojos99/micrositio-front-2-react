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
 * Estadísticas del equipo
 * @constant teamStats
 */
const teamStats = [
  // { label: 'Miembros Activos', value: equipoExtendido.length, icon: <Users size={20} /> },
  { label: 'Miembros Activos', value: 100, icon: <Users size={20} /> },
  { label: 'Proyectos Totales', value:120, icon: <Star size={20} /> },
  { label: 'Departamentos', value: 4, icon: <Award size={20} /> },
  { label: 'Tasa de Retención', value: '96%', icon: <TrendingUp size={20} /> }
];



// Arreglo de colores segun el badge(Departamento)
const badgeColorMap = {
  "Experimentos": {
    avatarBorder: "bg-gradient-to-br from-blue-400 to-blue-500",
    badge: "text-blue-700 bg-blue-100",
    button: "bg-blue-500 hover:bg-blue-600",
    skill: "text-blue-700 bg-blue-50 border-blue-200",
  },
  "Direccion General": {
    avatarBorder: "bg-gradient-to-br from-purple-400 to-purple-500",
    badge: "text-purple-700 bg-purple-100",
    button: "bg-purple-500 hover:bg-purple-600",
    skill: "text-purple-700 bg-purple-50 border-purple-200",
  },
  "Investigacion": {
    avatarBorder: "bg-gradient-to-br from-green-400 to-green-500",
    badge: "text-green-700 bg-green-100",
    button: "bg-green-500 hover:bg-green-600",
    skill: "text-green-700 bg-green-50 border-green-200",
  },
  "Portafolio": {
    avatarBorder: "bg-gradient-to-br from-orange-400 to-orange-500",
    badge: "text-orange-700 bg-orange-100",
    button: "bg-orange-500 hover:bg-orange-600",
    skill: "text-orange-700 bg-orange-50 border-orange-200",
  },
  "DepartamentoExtra": {
    avatarBorder: "bg-gradient-to-br from-rose-400 to-rose-500",
    badge: "text-rose-700 bg-rose-100",
    button: "bg-rose-500 hover:bg-rose-600",
    skill: "text-rose-700 bg-rose-50 border-rose-200",
  },
} as const;



// Por si algun empleado no tiene definido el departamento
const defaultColor = {
  avatarBorder: "bg-gradient-to-br from-gray-400 to-gray-500",
  badge: "text-gray-700 bg-gray-100",
  button: "bg-gray-500 hover:bg-gray-600",
  skill: "text-gray-700 bg-gray-50 border-gray-200",
};


// Normaliza texto: quita acentos y pasa a minúsculas
const normalizeText = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");



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
 
// @state: término de búsqueda
const [searchTerm, setSearchTerm] = useState("");

// @state: filtro de departamento
const [departmentFilter, setDepartmentFilter] = useState("");


/**Mapea de resumen empleado a ProfileCardProps para poder 
 * construir las cartas perfiles
 */
const mapToProfileCard = (emp: EmpleadoResumen, index: number): ProfileCardProps => {


      const departamento = emp.departamento ?? "";

      //Normalizamos por si las palabras en el backend vienen con acentos 
      const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const key = normalize(departamento);  



      const colors = badgeColorMap[key as keyof typeof badgeColorMap] || defaultColor;


    
      // Esto se hace para convertir la fecha de ingreso a un formato legible y mostrar solo el mes y año.
      // ademas porque  restaba un mes por la zona horaria 
      // console.log("Fecha original (backend):", emp.fecha_ingreso);
      const date = emp.fecha_ingreso
      ? new Date(emp.fecha_ingreso + "T00:00:00")
      : null;

      // console.log("Date parseada:", date);
      // console.log("Mes (getMonth):", date ? date.getMonth() + 1 : null);

/*       const formattedDate = date
        ? date.toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
          }).replace(/^./, (c) => c.toUpperCase())
        : ""; */
        const formattedDate = date
        ? date
          .toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
          })
          // Para quitar la palabra "de" ya que se agrega segun el entorno
          .replace(" de ", " ")
          .replace(/^./, (c) => c.toUpperCase())
      : "";

      // console.log("Fecha formateada FINAL:", formattedDate);

      return {

        id_empleado: String(emp.id_empleado),
        //avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${index + 1}`,
        avatarUrl: emp.image || `https://api.dicebear.com/9.x/adventurer/svg?seed=${index + 1}`,

        name: `${emp.nombre_pila ?? ""} ${emp.apellido_paterno ?? ""} ${emp.apellido_materno ?? ""}`.trim(),

        role: emp.cargo || "Pendiente",
        email: emp.correo || "Pendiente",
        badge: emp.departamento || "Pendiente",

        projectsCompleted: emp.projectsCompleted,
        projectsActive: emp.projectsActive,

        memberSince: formattedDate,

        aboutMe: emp.infopersonal ?? "",
        skills: emp.skills ?? [],

        //accentColor: ["cyan", "blue", "green", "purple", "orange", "rose"][index % 6] as any,
        accentColor: colors,
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
  

const departments = Array.from(
  new Set(users.map((u) => u.badge).filter(Boolean))
);



/* 
Filtrado de usuarios según búsqueda y departamento
*/
const filteredUsers = users.filter((user) => {
  const search = normalizeText(searchTerm);
  //console.log("texto normalizado," , search)

  // Normalizamos campos del usuario
  const name = normalizeText(user.name || "");
  const role = normalizeText(user.role || "");
  const dept = normalizeText(user.badge || "");
  const skills = (user.skills || []).map(normalizeText);

  // Coincidencia por texto
  const matchesSearch =
    search === "" ||
    name.includes(search) ||
    role.includes(search) ||
    dept.includes(search) ||
    skills.some((skill) => skill.includes(search));

  // Coincidencia por departamento
  const matchesDepartment =
    departmentFilter === "" || user.badge === departmentFilter;

  return matchesSearch && matchesDepartment;
});


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
                placeholder="Buscar por nombre, rol, departamento o habilidades..."
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

        </div>

     

        {/* @section: Lista de miembros del equipo */}




        {/*<div className="w-full px-4 sm:px-6 lg:px-8 py-6"> ; esto le generaba mucho padding al componente */  }
        <div className="w-full p-0 m-0">
         {/*   <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">*/}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2  items-start">
            
            {filteredUsers.map((user) => (
              
              <ProfileCard
              key={user.id_empleado}
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