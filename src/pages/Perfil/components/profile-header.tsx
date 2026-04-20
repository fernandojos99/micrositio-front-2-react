"use client"

import { User, Briefcase } from "lucide-react"
import type { Empleado, User as UserType } from "./../types/profile"

interface ProfileHeaderProps {
  user: UserType | null
  empleado: Empleado | null
  loading?: boolean
}

export function ProfileHeader({ user, empleado, loading }: ProfileHeaderProps) {
  const getNombreCompleto = (): string => {
    if (empleado) {
      return `${empleado.nombre_pila} ${empleado.apellido_paterno} ${empleado.apellido_materno || ""}`.trim()
    }
    return user?.name || "Usuario"
  }

  const getEmail = (): string => {
    if (empleado) {
      return empleado.correo
    }
    const userEmail = user?.email || ""
    if (userEmail.includes("@sistema.com")) {
      return userEmail.replace("@sistema.com", "")
    }
    return userEmail
  }

  const getRole = (): string => {
    return user?.role || "Empleado"
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#844484] to-[#8C37F7]">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          <div className="relative px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="size-24 rounded-full bg-white/20 animate-pulse" />
            <div className="text-center sm:text-left space-y-2">
              <div className="h-7 w-48 bg-white/20 rounded animate-pulse" />
              <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#844484] to-[#8C37F7]">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
        <div className="relative px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center overflow-hidden shadow-lg">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Avatar"}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">
              {getNombreCompleto()}
            </h1>
            <p className="text-white/80 mt-1">{getEmail()}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-white/70">
              <Briefcase className="size-4" />
              <span className="text-sm">{getRole()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
