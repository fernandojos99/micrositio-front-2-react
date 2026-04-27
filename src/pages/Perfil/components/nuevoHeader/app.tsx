"use client"

import { ProfileHeader } from "./profile2-header"

//import { ProfileHeader } from "@/compo/profile-header"

export default function Home() {
  // Datos de ejemplo
  const mockUser = {
    name: "Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "Desarrollador Senior",
    avatar: undefined // Sin avatar inicial
  }

  const mockEmpleado = {
    nombre_pila: "Juan",
    apellido_paterno: "Pérez",
    apellido_materno: "García",
    correo: "juan.perez@empresa.com"
  }

  // Callback cuando el usuario confirma guardar la imagen
  const handleAvatarSave = async (originalFile: File, resizedBlob: Blob) => {
    console.log("Guardando avatar...")
    console.log("Archivo original:", originalFile.name, originalFile.size)
    console.log("Blob redimensionado:", resizedBlob.size)

    // Enviar al backend con FormData
    const formData = new FormData()
    formData.append("avatar", resizedBlob, "avatar.jpg")
    
    // Descomentar cuando tengas el backend listo:
    // const response = await fetch("http://localhost:3001/api/avatar", {
    //   method: "POST",
    //   body: formData
    // })
    // const data = await response.json()
    // console.log("Respuesta del servidor:", data)

    // Simular delay de guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log("Avatar guardado exitosamente!")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Profile Header</h1>
        <p className="mt-2 text-muted-foreground">
          Haz clic en el avatar para cambiar la foto de perfil
        </p>
      </div>

      <ProfileHeader
        user={mockUser}
        empleado={mockEmpleado}
        onAvatarSave={handleAvatarSave}
        avatarSize={256} // La imagen se recortara y redimensionara a 256x256
      />

      <div className="mt-4 max-w-2xl rounded-lg border border-border bg-card p-6 text-card-foreground">
        <h2 className="mb-4 text-xl font-semibold">Backend Express - Avatar</h2>
        
        <pre className="overflow-x-auto rounded bg-muted p-3 text-sm text-muted-foreground">
{`// Express + Multer
const multer = require('multer')
const upload = multer({ 
  dest: 'uploads/avatars/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

app.post('/api/avatar', upload.single('avatar'), (req, res) => {
  // req.file contiene:
  // - filename: nombre único generado
  // - path: ruta donde se guardó
  // - mimetype: tipo de imagen
  // - size: tamaño en bytes
  
  // La imagen ya viene redimensionada a 256x256 desde el frontend
  // Solo necesitas guardarla y actualizar la DB del usuario
  
  res.json({ 
    success: true, 
    avatarUrl: \`/uploads/avatars/\${req.file.filename}\` 
  })
})`}
        </pre>
      </div>
    </main>
  )
}
