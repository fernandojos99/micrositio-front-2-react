"use client"

import { useState } from "react"
import { User, Mail, Edit3, Save, X } from "lucide-react"
import { Button } from "@/components/ui-shadcn/button"
import { Input } from "@/components/ui-shadcn/input"
import { useToast } from "@/hooks/use-toast"
// import type { Empleado, User as UserType } from "./../types/profile"
import type {  User as UserType } from "./../types/profile"
import { Empleado } from "@/services/empleadosService"

interface PersonalInfoSectionProps {
  user: UserType | null
  empleado: Empleado | null
  onSaveEmail: (correo: string) => Promise<void>
}

export function PersonalInfoSection({
  user,
  empleado,
  onSaveEmail,
}: PersonalInfoSectionProps) {
  const { toast } = useToast()
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isSavingEmail, setIsSavingEmail] = useState(false)

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

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError("El email es requerido")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Ingresa un email válido")
      return false
    }
    setEmailError("")
    return true
  }

  const startEmailEdit = () => {
    setEmailValue(getEmail())
    setIsEditingEmail(true)
    setEmailError("")
  }

  const cancelEmailEdit = () => {
    setIsEditingEmail(false)
    setEmailValue("")
    setEmailError("")
  }

  const saveEmailChanges = async () => {
    if (!validateEmail(emailValue)) return

    setIsSavingEmail(true)
    try {
      await onSaveEmail(emailValue)
      setIsEditingEmail(false)
      setEmailError("")
      toast({
        title: "Correo actualizado",
        description: "Tu correo electrónico se ha actualizado correctamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      if (error instanceof Error) {
        setEmailError(`Error al actualizar el correo: ${error.message}`)
      } else {
        setEmailError("Error al actualizar el correo. Intenta nuevamente.")
      }
    } finally {
      setIsSavingEmail(false)
    }
  }

  const canEditEmail = user?.role !== "VISITANTE"

  return (
    <div className="bg-card rounded-t-xl border border-border p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <User className="size-4 text-[#844484]" />
        <h3 className="font-semibold text-card-foreground">
          Información Personal
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Información del empleado registrada en el sistema
      </p>

      <div className="space-y-4">
        {/* Nombre Completo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="size-3.5" />
            Nombre Completo
          </label>
          <div className="px-3 py-2 bg-muted/50 rounded-md text-card-foreground">
            {getNombreCompleto()}
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Mail className="size-3.5" />
            Correo Electrónico
          </label>

          {isEditingEmail ? (
            <div className="space-y-2">
              <Input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={isSavingEmail}
                className={emailError ? "border-destructive" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEmailChanges()
                  if (e.key === "Escape") cancelEmailEdit()
                }}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={saveEmailChanges}
                  disabled={isSavingEmail}
                  size="sm"
                  className="bg-[#844484] hover:bg-[#8C37F7] text-white"
                >
                  <Save className="size-4 mr-1" />
                  {isSavingEmail ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEmailEdit}
                  disabled={isSavingEmail}
                >
                  <X className="size-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md">
              <span className="text-card-foreground">
                {getEmail() || "No disponible"}
              </span>
              {canEditEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEmailEdit}
                  className="text-[#844484] hover:text-[#8C37F7] hover:bg-[#844484]/10"
                >
                  <Edit3 className="size-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Teléfono */}
{/*         {empleado?.celular && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="size-3.5" />
              Teléfono de Contacto
            </label>
            <div className="px-3 py-2 bg-muted/50 rounded-md text-card-foreground">
              {empleado.celular}
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}
