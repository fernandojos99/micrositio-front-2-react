"use client"

import { useState, useCallback, useEffect } from "react"
import { ProfileHeader } from "./components/profile-header"
import { PersonalInfoSection } from "./components/personal-info-section"
import { UserConfigSection } from "./components/user-config-section"
import { ProfileSection } from "./components/profile-section"

import {
  actualizarUsuario,
  cambiarPasswordUsuario,
} from "@/services/usuarioService"

import {
  obtenerEmpleadoPorId,
  actualizarEmpleado,
} from "@/services/empleadosService"

import type {
  Empleado,
  AboutMeData,
  SkillsData,
  WorkInfoData,
  PasswordChangeData,
} from "./types/profile"

import { useAuth } from "@/contexts/AuthContext";

const departmentOptions = [
  { value: "tecnologia", label: "Tecnología" },
  { value: "marketing", label: "Marketing" },
  { value: "ventas", label: "Ventas" },
  { value: "recursos-humanos", label: "Recursos Humanos" },
  { value: "finanzas", label: "Finanzas" },
]

const roleOptions = [
  { value: "desarrollador", label: "Desarrollador" },
  { value: "disenador", label: "Diseñador" },
  { value: "gerente", label: "Gerente" },
  { value: "analista", label: "Analista" },
  { value: "coordinador", label: "Coordinador" },
]

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)

  const [aboutMe, setAboutMe] = useState<AboutMeData>({ description: "" })
  const [skills, setSkills] = useState<SkillsData>({ skills: [] })
  const [workInfo, setWorkInfo] = useState<WorkInfoData>({ departamento: "", rol: "" })

  // Convertimos el id a número de forma segura para usar en los servicios
  const userIdNumber = user?.id ? Number(user.id) : null;
  const idEmpleado = user?.id_empleado;

  useEffect(() => {
    const loadData = async () => {
      if (!idEmpleado) return;
      try {
        setLoading(true)
        const empleadoRes = await obtenerEmpleadoPorId(idEmpleado)
        setEmpleado(empleadoRes)
      } catch (error) {
        console.error("❌ Error cargando datos del empleado:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [idEmpleado])

  const handleSaveEmail = useCallback(async (correo: string) => {
    if (!empleado) return
    try {
      const updated = await actualizarEmpleado({
        id: empleado.id_empleado,
        correo,
      })
      setEmpleado(updated)
    } catch (error) {
      console.error("❌ Error actualizando correo:", error)
    }
  }, [empleado])

  const handleSaveAlias = useCallback(async (alias: string) => {
    // Validamos que exista el usuario y el ID sea válido
    if (!user || userIdNumber === null || isNaN(userIdNumber)) return
    
    try {
      // ✅ Pasamos userIdNumber (tipo number) al servicio
      const updated = await actualizarUsuario(userIdNumber, { alias })
      
      if (updateUser) {
        updateUser({ 
          ...user, 
          alias: updated.alias,
          name: updated.alias 
        });
      }
    } catch (error) {
      console.error("❌ Error actualizando alias:", error)
    }
  }, [user, userIdNumber, updateUser])

  const handleChangePassword = useCallback(async (data: PasswordChangeData) => {
    if (!user || userIdNumber === null || isNaN(userIdNumber)) return
    
    try {
      // ✅ Pasamos userIdNumber (tipo number) al servicio
      await cambiarPasswordUsuario(userIdNumber, data)
    } catch (error) {
      console.error("❌ Error cambiando contraseña:", error)
    }
  }, [user, userIdNumber])

  const handleSaveAboutMe = useCallback((data: AboutMeData) => setAboutMe(data), [])
  const handleSaveSkills = useCallback((data: SkillsData) => setSkills(data), [])
  
  const handleAddSkill = useCallback(() => {
    setSkills((prev) => ({
      skills: [...prev.skills, { id: Date.now().toString(), name: "" }],
    }))
  }, [])

  const handleRemoveSkill = useCallback((id: string) => {
    setSkills((prev) => ({
      skills: prev.skills.filter((s) => s.id !== id),
    }))
  }, [])

  const handleUpdateSkill = useCallback((id: string, name: string) => {
    setSkills((prev) => ({
      skills: prev.skills.map((s) => s.id === id ? { ...s, name } : s),
    }))
  }, [])

  const handleSaveWorkInfo = useCallback((data: WorkInfoData) => setWorkInfo(data), [])
  const handleDepartmentChange = useCallback((value: string) => {
    setWorkInfo((prev) => ({ ...prev, departamento: value }))
  }, [])
  const handleRoleChange = useCallback((value: string) => {
    setWorkInfo((prev) => ({ ...prev, rol: value }))
  }, [])


// Creamos una versión del usuario compatible con los componentes de la UI
const mappedUserForUI = user ? {
  ...user,
  id: Number(user.id), // Aseguramos que sea number
  id_empleado: user.id_empleado ?? undefined // Convertimos null a undefined
} : null;

if (authLoading || loading || !mappedUserForUI || !empleado) {
  return <div className="p-6 text-center">Cargando perfil...</div>
}

return (
  <main className="min-h-screen bg-background py-8 px-4">
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* ✅ Ahora usamos mappedUserForUI que cumple con el contrato de tipos */}
      <ProfileHeader 
        user={mappedUserForUI} 
        empleado={empleado} 
        loading={loading} 
      />

      <div className="flex flex-col gap-6">
        <PersonalInfoSection
          user={mappedUserForUI}
          empleado={empleado}
          onSaveEmail={handleSaveEmail}
        />

        <UserConfigSection
          user={mappedUserForUI}
          onSaveAlias={handleSaveAlias}
          onChangePassword={handleChangePassword}
        />
      </div>

      <ProfileSection
        aboutMe={aboutMe}
        skills={skills}
        workInfo={workInfo}
        departmentOptions={departmentOptions}
        roleOptions={roleOptions}
        onSaveAboutMe={handleSaveAboutMe}
        onCancelAboutMe={() => {}}
        onSaveSkills={handleSaveSkills}
        onCancelSkills={() => {}}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onUpdateSkill={handleUpdateSkill}
        onSaveWorkInfo={handleSaveWorkInfo}
        onCancelWorkInfo={() => {}}
        onDepartmentChange={handleDepartmentChange}
        onRoleChange={handleRoleChange}
      />
    </div>
  </main>
)}