import { useState } from "react"
import { ChevronDown, ChevronUp, Mail } from "lucide-react"

type ColorConfig = {
  avatarBorder: string
  badge: string
  button: string
  skill: string
}

const defaultColors: ColorConfig = {
  avatarBorder: "bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-700 dark:to-violet-800",
  badge: "text-cyan-700 bg-cyan-100 dark:bg-purple-900/50 dark:text-purple-200",
  button: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-900",
  skill: "text-cyan-700 bg-cyan-50 border-cyan-100 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
}

export interface ProfileCardProps {
  id_empleado?: string
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
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = accentColor ?? defaultColors

  return (
    <div className="w-full bg-white dark:bg-[#1e1b3a] rounded-xl shadow-md border border-gray-100 dark:border-purple-900/40 overflow-hidden">

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
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {name}
            </h2>

            <p className="text-sm text-gray-500 dark:text-white">
              {role}
            </p>

            {/* Email */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-white text-sm mt-2">
              <Mail className="w-4 h-4" />
              <a
                href={`mailto:${email}`}
                className="hover:text-purple-400 transition-colors cursor-pointer break-all"
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
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-purple-900/40">
          <span className="text-sm font-medium text-gray-700 dark:text-white">
            Proyectos
          </span>

          <div className="flex gap-2">
            <div className="px-3 py-1 border border-gray-200 dark:border-purple-800 dark:bg-purple-950/40 rounded text-center text-xs">
              <div className="font-semibold text-gray-800 dark:text-white">{projectsCompleted}</div>
              <div className="text-gray-500 dark:text-white">Concluidos</div>
            </div>

            <div className="px-3 py-1 border border-gray-200 dark:border-purple-800 dark:bg-purple-950/40 rounded text-center text-xs">
              <div className="font-semibold text-gray-800 dark:text-white">{projectsActive}</div>
              <div className="text-gray-500 dark:text-white">Activos</div>
            </div>
          </div>

          {/* Fecha de ingreso */}
          <div className="ml-auto w-full sm:w-auto text-center sm:text-right text-xs">
            <div className="text-gray-500 dark:text-white">Miembro desde</div>
            <div className="font-semibold text-gray-800 dark:text-white">{memberSince}</div>
          </div>
        </div>
      </div>

      {/* ================= BOTÓN EXPANDIR ================= */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full py-2 text-xs text-white flex items-center justify-center gap-1 transition-colors ${colors.button}`}
      >
        {isExpanded ? "Cerrar" : "Ver más"}
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* ================= CONTENIDO EXPANDIDO ================= */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100 dark:border-purple-900/40 dark:bg-[#1a1730]">
          <div className="flex flex-col gap-4">

            {/* Habilidades */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
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

            {/* Acerca de */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                Acerca de mi
              </h3>
              <p className="text-gray-600 dark:text-white text-xs">
                {aboutMe}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}