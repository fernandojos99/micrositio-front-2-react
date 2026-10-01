import { useState, useRef, useCallback, useEffect } from "react"
import { User, Briefcase, Camera, Loader2, Check, X, ZoomIn } from "lucide-react"

// Tipos locales para evitar dependencias externas
interface UserType {
  name?: string
  email?: string
  role?: string
  image?: string
}

interface Empleado {
  nombre_pila: string
  apellido_paterno?: string
  apellido_materno?: string
  correo: string
}

interface ProfileHeaderProps {
  user: UserType | null
  empleado: Empleado | null
  loading?: boolean
  onAvatarSave?: (file: File, resizedBlob: Blob) => void | Promise<void>
  avatarSize?: number // Tamaño final de la imagen (default 256)
}

// Función para redimensionar imagen (útil para fotos de perfil)
const resizeImage = (
  file: File,
  maxSize: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        reject(new Error("No se pudo crear el contexto del canvas"))
        return
      }

      // Calcular dimensiones manteniendo aspecto cuadrado (crop centrado)
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      canvas.width = maxSize
      canvas.height = maxSize

      // Dibujar imagen recortada y redimensionada
      ctx.drawImage(
        img,
        offsetX, offsetY, size, size, // Source (crop cuadrado centrado)
        0, 0, maxSize, maxSize // Destination
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Error al crear el blob"))
          }
        },
        "image/jpeg",
        0.9
      )
    }

    img.onerror = () => reject(new Error("Error al cargar la imagen"))
    img.src = URL.createObjectURL(file)
  })
}

export function ProfileHeader({ 
  user, 
  empleado, 
  loading,
  onAvatarSave,
  avatarSize = 256
}: ProfileHeaderProps) 
{
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Indica si hay cambios pendientes por guardar
  const hasPendingChanges = pendingBlob !== null

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen valida")
      return
    }

    // Validar tamano (maximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen no debe superar los 10MB")
      return
    }

    setIsUploading(true)

    try {
      // Redimensionar imagen para foto de perfil
      const resizedBlob = await resizeImage(file, avatarSize)
      
      // Crear preview y guardar pendientes
      const url = URL.createObjectURL(resizedBlob)
      setPreviewUrl(url)
      //
      setCurrentAvatar(url) // Actualizar avatar mostrado inmediatamente
      setPendingFile(file)
      setPendingBlob(resizedBlob)
    } catch (error) {
      console.error("Error al procesar la imagen:", error)
      alert("Error al procesar la imagen")
    } finally {
      setIsUploading(false)
      // Limpiar input para permitir subir la misma imagen
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [avatarSize])

  // Guardar la imagen
  const handleSave = async () => {
    if (!pendingFile || !pendingBlob) {
      return
    }

    setIsSaving(true)
    try {
      if (onAvatarSave) {
        await onAvatarSave(pendingFile, pendingBlob)
      }
      // Limpiar pendientes despues de guardar
      setPreviewUrl(null)
      setPendingFile(null)
      setPendingBlob(null)
    } catch (error) {
      console.error("Error al guardar la imagen:", error)
      alert("Error al guardar la imagen")
    } finally {
      setIsSaving(false)
    }
  }

  // Cancelar cambios
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setPendingFile(null)
    setPendingBlob(null)
    setCurrentAvatar(user?.image || null) // Revertir al avatar original del usuario
  }

  // Imagen actual a mostrar
  //const currentAvatar = previewUrl || user?.image

    // DESPUÉS (estado que escucha cambios del padre)
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(user?.image || null)

    // Agregar este useEffect para sincronizar cuando el padre actualice user.image
    useEffect(() => {
    if (!previewUrl && user?.image) {
        setCurrentAvatar(user.image)
    }
    }, [user?.image])


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
          {/* Avatar con opcion de subir */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Contenedor del avatar */}
            <div className="relative group">
              {/* Boton principal del avatar */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading || isSaving}
                className="relative size-24 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center overflow-hidden shadow-lg cursor-pointer transition-all hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed"
              >
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={user?.name || "Avatar"}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-12 text-white" />
                )}
                
                {/* Overlay de hover - cambiar foto */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="size-6 text-white animate-spin" />
                  ) : (
                    <Camera className="size-6 text-white" />
                  )}
                </div>
              </button>

              {/* Boton para ver foto grande (solo si hay avatar) */}
              {currentAvatar && !isUploading && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="absolute -top-1 -right-1 size-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                  title="Ver foto"
                >
                  <ZoomIn className="size-4 text-[#8C37F7]" />
                </button>
              )}
            </div>

            {/* Botones de guardar/cancelar cuando hay cambios pendientes */}
            {hasPendingChanges && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="size-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  title="Guardar"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 text-white animate-spin" />
                  ) : (
                    <Check className="size-4 text-white" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="size-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                  title="Cancelar"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            )}

            {/* Indicador de carga */}
            {isUploading && (
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-white flex items-center justify-center shadow-md">
                <Loader2 className="size-4 text-[#8C37F7] animate-spin" />
              </div>
            )}
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

        {/* Modal de preview de foto */}
        {showPreviewModal && currentAvatar && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          >
            <div 
              className="relative max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentAvatar}
                alt={user?.name || "Avatar"}
                className="w-full rounded-xl shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="absolute -top-3 -right-3 size-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg transition-colors"
              >
                <X className="size-5 text-gray-700" />
              </button>
              <p className="text-center text-white/80 mt-4 text-sm">
                {getNombreCompleto()}
              </p>
            </div>
          </div>
        )}
    
    </div>
    )
}
