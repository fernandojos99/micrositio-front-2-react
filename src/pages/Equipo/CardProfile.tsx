"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Mail } from "lucide-react"

type AccentColor = "cyan" | "blue" | "green" | "purple" | "orange" | "rose"

const colorClasses: Record<AccentColor, {
  avatarBorder: string
  badge: string
  button: string
  skill: string
}> = {
  cyan: {
    avatarBorder: "bg-gradient-to-br from-cyan-400 to-cyan-500",
    badge: "text-cyan-700 bg-cyan-100",
    button: "bg-cyan-400 hover:bg-cyan-500",
    skill: "text-cyan-700 bg-cyan-50 border-cyan-100",
  },
  blue: {
    avatarBorder: "bg-gradient-to-br from-blue-400 to-blue-500",
    badge: "text-blue-700 bg-blue-100",
    button: "bg-blue-400 hover:bg-blue-500",
    skill: "text-blue-700 bg-blue-50 border-blue-100",
  },
  green: {
    avatarBorder: "bg-gradient-to-br from-green-400 to-green-500",
    badge: "text-green-700 bg-green-100",
    button: "bg-green-400 hover:bg-green-500",
    skill: "text-green-700 bg-green-50 border-green-100",
  },
  purple: {
    avatarBorder: "bg-gradient-to-br from-purple-400 to-purple-500",
    badge: "text-purple-700 bg-purple-100",
    button: "bg-purple-400 hover:bg-purple-500",
    skill: "text-purple-700 bg-purple-50 border-purple-100",
  },
  orange: {
    avatarBorder: "bg-gradient-to-br from-orange-400 to-orange-500",
    badge: "text-orange-700 bg-orange-100",
    button: "bg-orange-400 hover:bg-orange-500",
    skill: "text-orange-700 bg-orange-50 border-orange-100",
  },
  rose: {
    avatarBorder: "bg-gradient-to-br from-rose-400 to-rose-500",
    badge: "text-rose-700 bg-rose-100",
    button: "bg-rose-400 hover:bg-rose-500",
    skill: "text-rose-700 bg-rose-50 border-rose-100",
  },
}

export interface ProfileCardProps {
  avatarUrl?: string
  name?: string
  role?: string
  email?: string
  badge?: string
  memberSince?: string
  aboutMe?: string
  skills?: string []
  accentColor?: AccentColor
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
  accentColor = "cyan",
  projectsCompleted,
  projectsActive,
}: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const colors = colorClasses[accentColor]

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

      {/* Header */}
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

          {/* Info */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-semibold text-gray-800 leading-tight">
              {name}
            </h2>

            <p className="text-sm text-gray-500">
              {role}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm mt-2">
              <Mail className="w-4 h-4" />

              <a
                href={`mailto:${email}`}
                className="hover:text-blue-600 transition-colors cursor-pointer break-all"
              >
                {email}
              </a>
            </div>

            <span
              className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${colors.badge}`}
            >
              {badge}
            </span>
          </div>

        </div> {/* ✅ ESTE DIV FALTABA */}

        {/* Projects */}
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

          <div className="ml-auto w-full sm:w-auto text-center sm:text-right text-xs">
            <div className="text-gray-500">Miembro desde</div>
            <div className="font-semibold">{memberSince}</div>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full py-2 text-xs text-white flex items-center justify-center gap-1 ${colors.button}`}
      >
        {isExpanded ? "Cerrar" : "Ver más"}
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* About Me */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Acerca de mi
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {aboutMe}
              </p>
            </div>

            {/* Skills */}
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