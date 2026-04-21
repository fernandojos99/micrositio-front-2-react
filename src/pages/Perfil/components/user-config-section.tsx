import { useState } from "react"
import { Shield, User, Key, Edit3, Save, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui-shadcn2/button"
import { Input } from "@/components/ui-shadcn/input"
import { useToast } from "./../hooks/use-toast"
import type { User as UserType, PasswordChangeData } from "./../types/profile"

interface UserConfigSectionProps {
  user: UserType | null
  onSaveAlias: (alias: string) => Promise<void>
  onChangePassword: (data: PasswordChangeData) => Promise<void>
}

export function UserConfigSection({
  user,
  onSaveAlias,
  onChangePassword,
}: UserConfigSectionProps) {
  const { toast } = useToast()
  
  // Estados para el alias
  const [isEditingAlias, setIsEditingAlias] = useState(false)
  const [aliasValue, setAliasValue] = useState("")
  const [aliasError, setAliasError] = useState("")
  const [isSavingAlias, setIsSavingAlias] = useState(false)

  // Estados para la contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Funciones para el alias
  const startAliasEdit = () => {
    setAliasValue(user?.alias || "")
    setIsEditingAlias(true)
    setAliasError("")
  }

  const cancelAliasEdit = () => {
    setIsEditingAlias(false)
    setAliasValue("")
    setAliasError("")
  }





  // Save alias 
  const saveAliasChanges = async () => {
    if (!aliasValue.trim()) {
      setAliasError("El alias no puede estar vacío")
      return
    }

    if (aliasValue.trim().length < 3) {
      setAliasError("El alias debe tener al menos 3 caracteres")
      return
    }

    setIsSavingAlias(true)
    setAliasError("")

    try {
      await onSaveAlias(aliasValue.trim())
      setIsEditingAlias(false)
      setAliasError("")
      toast({
        title: "Alias actualizado",
        description: "Tu alias de usuario se ha actualizado correctamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAliasError(`Error al actualizar el alias: ${error.message}`)
      } else {
        setAliasError("Error al actualizar el alias. Intenta nuevamente.")
      }
    } finally {
      setIsSavingAlias(false)
    }
  }

  // Funciones para la contraseña
  const startPasswordEdit = () => {
    setIsEditingPassword(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  const cancelPasswordEdit = () => {
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  const savePasswordChanges = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(
        "Todos los campos son obligatorios: contraseña actual, nueva y confirmación"
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setIsSavingPassword(true)
    setPasswordError("")

    try {
      await onChangePassword({
        password_actual: currentPassword,
        password_nueva: newPassword,
      })
      setIsEditingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordError("")
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente.",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPasswordError(`Error al actualizar la contraseña: ${error.message}`)
      } else {
        setPasswordError(
          "Error al actualizar la contraseña. Intenta nuevamente."
        )
      }
    } finally {
      setIsSavingPassword(false)
    }
  }








  return (
    <div className="bg-card rounded-b-xl border-x border-b border-border p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="size-4 text-[#844484]" />
        <h3 className="font-semibold text-card-foreground">
          Configuración de Usuario
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Gestiona tu alias y contraseña de acceso al sistema
      </p>

      <div className="space-y-4">
        {/* Alias de Usuario */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <User className="size-3.5" />
            Alias de Usuario
          </label>

          {isEditingAlias ? (
            <div className="space-y-2">
              <Input
                type="text"
                value={aliasValue}
                onChange={(e) => setAliasValue(e.target.value)}
                placeholder="Ingresa tu nuevo alias"
                disabled={isSavingAlias}
                maxLength={50}
                className={aliasError ? "border-destructive" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveAliasChanges()
                  if (e.key === "Escape") cancelAliasEdit()
                }}
              />
              {aliasError && (
                <p className="text-sm text-destructive">{aliasError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={saveAliasChanges}
                  disabled={isSavingAlias}
                  size="sm"
                  className="bg-[#844484] hover:bg-[#8C37F7] text-white"
                >
                  <Save className="size-4 mr-1" />
                  {isSavingAlias ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelAliasEdit}
                  disabled={isSavingAlias}
                >
                  <X className="size-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md">
              <span className="text-card-foreground">
                {user?.alias || "No disponible"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={startAliasEdit}
                className="text-[#844484] hover:text-[#8C37F7] hover:bg-[#844484]/10"
              >
                <Edit3 className="size-4 mr-1" />
                Editar
              </Button>
            </div>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Key className="size-3.5" />
            Contraseña
          </label>

          {isEditingPassword ? (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  disabled={isSavingPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  disabled={isSavingPassword}
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  disabled={isSavingPassword}
                  minLength={6}
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePasswordChanges()
                    if (e.key === "Escape") cancelPasswordEdit()
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={savePasswordChanges}
                  disabled={isSavingPassword}
                  size="sm"
                  className="bg-[#844484] hover:bg-[#8C37F7] text-white"
                >
                  <Save className="size-4 mr-1" />
                  {isSavingPassword ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelPasswordEdit}
                  disabled={isSavingPassword}
                >
                  <X className="size-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md">
              <span className="text-card-foreground tracking-widest">
                ••••••••••
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={startPasswordEdit}
                className="text-[#844484] hover:text-[#8C37F7] hover:bg-[#844484]/10"
              >
                <Edit3 className="size-4 mr-1" />
                Cambiar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
