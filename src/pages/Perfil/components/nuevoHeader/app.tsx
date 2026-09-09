"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "./profile2-header"
import { useAuth } from "@/contexts/AuthContext"
import { Empleado } from "@/services/empleadosService"
import { subirImagenUsuario } from "@/services/usuarioService" // ✅ AGREGADO

interface HeaderProps {
  initialUser: any
  correo: string
  tipo: "EDITOR" | "VISITANTE"
  empleado: Empleado | null
  imagen: string
  onImageChange: (nuevaUrl: string) => void
}

export default function Header({
  initialUser,
  correo,
  tipo,
  empleado,
  imagen,
  onImageChange,
}: HeaderProps) {
  const { user: authUser, updateUser } = useAuth();
  const [localUser, setLocalUser] = useState(initialUser || authUser);

  useEffect(() => {
    if (authUser) setLocalUser(authUser);
  }, [authUser]);

  const handleAvatarSave = async (originalFile: File, resizedBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("image", resizedBlob, originalFile.name)

      // ✅ REEMPLAZA todo el fetch hardcodeado con esto:
      const data = await subirImagenUsuario(formData)

      const imageUrl = data.image || data.url

      if (imageUrl) {
        if (updateUser && localUser) {
          const updatedUser = { ...localUser, image: imageUrl }
          updateUser(updatedUser)
          setLocalUser(updatedUser)
        } else {
          console.warn("updateUser o localUser es null:", { updateUser, localUser })
        }
        onImageChange(imageUrl)
      } else {
        console.warn("No vino image/url en la respuesta:", data)
      }

    } catch (error) {
      console.error("Error subiendo imagen:", error)
    }
  }

  if (!localUser) return <div>Cargando usuario...</div>

  return (
    <main className="flex flex-col items-center justify-center gap-8 bg-background">
      <ProfileHeader
        user={{ ...localUser, image: imagen }}
        empleado={empleado}
        onAvatarSave={handleAvatarSave}
        avatarSize={256}
      />
    </main>
  )
}