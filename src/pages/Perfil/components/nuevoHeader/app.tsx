"use client"

import { useEffect, useState } from "react"
import { ProfileHeader } from "./profile2-header"
import { useAuth } from "@/contexts/AuthContext" // Importamos el contexto
import { Empleado } from "@/services/empleadosService"

interface HeaderProps {
  initialUser: any // Ajusta al tipo real de tu User
  correo: string
  tipo: "EDITOR" | "VISITANTE"
  //alias: string
  //nombreEmpleado: string 
  empleado: Empleado | null 
  imagen: string
  onImageChange: (nuevaUrl: string) => void
}

export default function Header({
  initialUser,
  correo,
  tipo,
  //alias,
  //nombreEmpleado,
  empleado,
  imagen,
  onImageChange,
}: HeaderProps) {
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
          //Authorization: `Bearer ${token}` // Usa el token real dinámicamente
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc3MzM3NDU4LCJleHAiOjE3Nzc0MjM4NTh9.shJ4jywZEZnnU3ugtwz5ESpEuTJwp5W-VdFoTLy6_Os`
        },
        body: formData
      })

      const data = await response.json()
      console.log("Respuesta completa del backend:", data)
      console.log("Claves de data:", Object.keys(data))
      if (data.image) {
        console.log("URL recibida:", data.image)
        console.log("localUser antes:", localUser)
        // ACTUALIZACIÓN CRÍTICA: Actualizamos el contexto global
        if (updateUser && localUser) {
          const updatedUser = { ...localUser, image: data.image };
          updateUser(updatedUser);
          setLocalUser(updatedUser);
          console.log("updateUser llamado con:", updatedUser)
        }
        else {
            console.warn("updateUser o localUser es null:", { updateUser, localUser })
          }

        // Notificamos al padre con la nueva URL de imagen
        onImageChange(data.image);
      }

    } catch (error) {
      console.error("Error subiendo imagen:", error)
    }
  }

  if (!localUser) return <div>Cargando usuario...</div>

  // ya no lo ocupo porque se manda completo
  // Usamos las props explícitas para construir el empleado que ve ProfileHeader
//   const empleadoSimplificado = {
//     //nombre_pila: alias || localUser.name || localUser.alias || "Usuario",
//     nombre_pila: nombreEmpleado || localUser.name || localUser.alias || "Usuario",
//     correo: correo || localUser.email || "",
//     tipo: tipo,
//   }

  return (
    <main className="flex flex-col items-center justify-center gap-8 bg-background ">
      <ProfileHeader
        user={{ ...localUser, image: imagen }} // imagen siempre viene del padre
        empleado={empleado}
        onAvatarSave={handleAvatarSave}
        avatarSize={256}
      />
    </main>
  )
}