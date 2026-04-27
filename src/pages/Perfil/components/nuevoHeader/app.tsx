"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "./profile2-header"
import { useAuth } from "@/contexts/AuthContext" // Importamos el contexto

interface HomeProps {
  initialUser: any // Ajusta al tipo real de tu User
}

export default function Home({ initialUser }: HomeProps) {
  const { user: authUser, updateUser } = useAuth(); // Usamos el contexto global
  const [localUser, setLocalUser] = useState(initialUser || authUser);

  // Sincronizar localUser si initialUser cambia o el authUser cambia
  useEffect(() => {
    if (authUser) setLocalUser(authUser);
  }, [authUser]);

  const handleAvatarSave = async (originalFile: File, resizedBlob: Blob) => {
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("image", resizedBlob, originalFile.name)

      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // Usa el token real dinámicamente
        },
        body: formData
      })

      const data = await response.json()

      if (data.url) {
        // ACTUALIZACIÓN CRÍTICA: Actualizamos el contexto global
        if (updateUser && localUser) {
          const updatedUser = { ...localUser, image: data.url };
          updateUser(updatedUser);
          setLocalUser(updatedUser);
        }
      }

    } catch (error) {
      console.error("Error subiendo imagen:", error)
    }
  }

  if (!localUser) return <div>Cargando usuario...</div>

  const empleadoSimplificado = {
    nombre_pila: localUser.name || localUser.alias || "Usuario",
    correo: localUser.email || ""
  }

  return (
    <main className="flex flex-col items-center justify-center gap-8 bg-background p-4">
      <ProfileHeader
        user={localUser}
        empleado={empleadoSimplificado as any}
        onAvatarSave={handleAvatarSave}
        avatarSize={256}
      />
    </main>
  )
}