"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Mail } from "lucide-react"

/**
 * @type ColorConfig
 * @description Define la estructura de estilos que se aplican dinámicamente
 * al componente según el tema o color seleccionado.
 */
type ColorConfig = {
  avatarBorder: string
  badge: string
  button: string
  skill: string
}

/**
 * @constant defaultColors
 * @description Configuración de colores por defecto en caso de que
 * no se proporcione un tema personalizado desde el componente padre.
 */
const defaultColors: ColorConfig = {
  avatarBorder: "bg-gradient-to-br from-cyan-400 to-cyan-500",
  badge: "text-cyan-700 bg-cyan-100",
  button: "bg-cyan-400 hover:bg-cyan-500",
  skill: "text-cyan-700 bg-cyan-50 border-cyan-100",
}

/**
 * @interface ProfileCardProps
 * @description Props que recibe el componente ProfileCard
 */
export interface ProfileCardProps {
  id_empleado?:string
  avatarUrl?: string
  name?: string
  role?: string
  email?: string
  badge?: string
  memberSince?: string
  aboutMe?: string
  skills?: string[]
  accentColor?: ColorConfig
  projectsCompleted?: number
  projectsActive?: number
}

/**
 * @component ProfileCard
 * @description Componente visual que representa el perfil de un usuario
 * mostrando información básica, estadísticas y detalles expandibles.
 * 
 * Características:
 * - Soporte para estilos dinámicos (theming)
 * - Vista expandible (acerca de y habilidades)
 * - Diseño responsive
 * - Integración con Tailwind CSS
 * 
 * @param {ProfileCardProps} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export function ProfileCard({
  avatarUrl,
  name,
  role,
  email,
  badge,
  memberSince,
  aboutMe,
  skills = [],
  accentColor,
  projectsCompleted,
  projectsActive,
}: ProfileCardProps) {

  /**
   * @state isExpanded
   * @description Controla si la tarjeta está expandida o contraída
   */
  const [isExpanded, setIsExpanded] = useState(false)

  /**
   * @constant colors
   * @description Determina los estilos a utilizar.
   * Si no se recibe `accentColor`, se usan los colores por defecto.
   */
  const colors = accentColor ?? defaultColors

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">

          {/* Avatar */}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 ${colors.avatarBorder}`}>
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* Información básica */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {name}
            </h2>

            <p className="text-sm text-gray-500">
              {role}
            </p>

            {/* Email */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm mt-2">
              <Mail className="w-4 h-4" />

              <a
                href={`mailto:${email}`}
                className="hover:text-blue-600 transition-colors cursor-pointer break-all"
              >
                {email}
              </a>
            </div>

            {/* Badge */}
            <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${colors.badge}`}>
              {badge}
            </span>
          </div>
        </div>

        {/* ================= PROYECTOS ================= */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Proyectos</span>

          <div className="flex gap-2">
            <div className="px-3 py-1 border rounded text-center text-xs">
              <div className="font-semibold">{projectsCompleted}</div>
              <div className="text-gray-500">Concluidos</div>
            </div>

            <div className="px-3 py-1 border rounded text-center text-xs">
              <div className="font-semibold">{projectsActive}</div>
              <div className="text-gray-500">Activos</div>
            </div>
          </div>

          {/* Fecha de ingreso */}
          <div className="ml-auto w-full sm:w-auto text-center sm:text-right text-xs">
            <div className="text-gray-500">Miembro desde</div>
            <div className="font-semibold">{memberSince}</div>
          </div>
        </div>
      </div>

      {/* ================= BOTÓN EXPANDIR ================= */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full py-2 text-xs text-white flex items-center justify-center gap-1 ${colors.button}`}
      >
        {isExpanded ? "Cerrar" : "Ver más"}
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* ================= CONTENIDO EXPANDIDO ================= */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Acerca de */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Acerca de mi
              </h3>
              <p className="text-gray-600 text-xs">
                {aboutMe}
              </p>
            </div>

            {/* Habilidades */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 text-[10px] rounded border ${colors.skill}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}