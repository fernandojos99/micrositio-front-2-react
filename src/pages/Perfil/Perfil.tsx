"use client"

import { useState, useCallback, useEffect } from "react"
import { ProfileHeader } from "./components/profile-header"
import { PersonalInfoSection } from "./components/personal-info-section"
import { UserConfigSection } from "./components/user-config-section"
import { DateValue, ProfileSection } from "./components/profile-section"
//import { DateRangeSelector, type DateValue } from "./components/date-range-selector"

import {
  actualizarUsuario,
  cambiarPasswordUsuario,
} from "@/services/usuarioService"

import {
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  Empleado,
  obtenerHabilidadesPorEmpleado
} from "@/services/empleadosService"

import type {
  // Empleado,
  //AboutMeData,
  AboutMeData,
  SkillsData,
  WorkInfoData,
  PasswordChangeData,
} from "./types/profile"

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast"
import React from "react"

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

  // Consumimos contexto de Auth para obtener el user y empleado
  const { user, isLoading: authLoading, updateUser } = useAuth();
  
  const [empleado, setEmpleado] = useState<Empleado | null>(null)
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<SkillsData>({ skills: [] })
  const [workInfo, setWorkInfo] = useState<WorkInfoData>({ departamento: "", rol: "" })
  const [aboutMe, setAboutMe] = useState<AboutMeData>({ description: "" })


  // Estos useState son para los valores de fecha 
  const [startDate, setStartDate] = React.useState<DateValue>({
    month: "",
    year: "",
  })



  // Convertimos el id a número de forma segura para usar en los servicios
  //const userIdNumber = user?.id ? Number(user.id) : null;
  const idEmpleado = user?.id_empleado;


  // CARGANDO VALORES INICIALES 
  useEffect(() => {
  const loadData = async () => {
    if (!idEmpleado) return;
    try {
      setLoading(true);
      
      // Lanzamos ambas peticiones en paralelo para mayor velocidad
      const [empleadoRes, habilidadesRes] = await Promise.all([
        obtenerEmpleadoPorId(idEmpleado),
        obtenerHabilidadesPorEmpleado(idEmpleado)
      ]);

      console.log("Esto contiene un empleado",empleadoRes)
      setEmpleado(empleadoRes);
      setAboutMe({ description: empleadoRes.infopersonal ?? "" });

      // Mapeamos las habilidades al formato {id, name} que usa tu ProfileSection
      const formattedSkills = habilidadesRes.map(h => ({
        id: h.id_habilidad.toString(),
        name: h.nombre_habilidad
      }));

      setSkills({ skills: formattedSkills });
      
      // Cargamos info laboral si existe en el objeto empleado
      setWorkInfo({
        departamento: empleadoRes.departamento || "",
        rol: empleadoRes.cargo || ""
      });


      //  Cargamos las fechas si vienen del backend
      console.log("La fecha de ingreso es ",empleadoRes.fecha_ingreso)
      if (empleadoRes.fecha_ingreso) {
        const [year, month] = empleadoRes.fecha_ingreso.split("-") // asume formato "YYYY-MM"
        setStartDate({ month, year })
      }


    } catch (error) {
      console.error("❌ Error cargando datos del perfil:", error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [idEmpleado]);



  /* FUNCIONES PARA MODIFICAR LAS VARIABLES Y MANDARLAS A LOS COMPONENTES
*/

  // Modificar email 
  const handleSaveEmail = useCallback(async (correo: string) => {
    if (!empleado) return
    try {
      console.log(empleado.id)
      const updated = await actualizarEmpleado({
        id:Number( empleado.id),
        correo,
      })
      setEmpleado(updated)
    } catch (error) {
      console.error("❌ Error actualizando correo:", error)
    }
  }, [empleado])


// Modificar alias
const handleSaveAlias = useCallback(async (alias: string) => {
  if (!user) return
  
  try {
    console.log("Enviando actualización de alias...")
    // le puse la palabra any porque el backend devuelve un objeto con { success, message, data: { alias, ... } }
    // y no coincide con el tipo Usuario que espera el contexto, así que hacemos un cast temporal para evitar errores de tipos
    const response = await actualizarUsuario(user.id, { alias })as any;
    
    // Basado en tu respuesta de consola:
    // response tiene { success, message, data: { alias, ... } }
    
    if (response && response.success && response.data) {
      console.log("Actualización exitosa en BD:", response.data.alias)
      
      if (updateUser) {
        updateUser({ 
          ...user, 
          // Accedemos correctamente a la estructura del backend
          alias: response.data.alias, 
          // Usamos el alias como nombre si es lo que requiere tu UI
          name: response.data.alias 
        });

        // Aprovechamos para usar el Toast que ya configuramos
        toast({
          title: "¡Éxito!",
          description: "Alias actualizado correctamente.",
          variant: "default", // o el estilo que tengas
        });
      }
    } else {
      throw new Error(response.message || "Error inesperado del servidor");
    }
  } catch (error) {
    console.error("❌ Error actualizando alias:", error)
    toast({
      title: "Error",
      description: "No se pudo actualizar el alias.",
      variant: "destructive",
    });
  }
}, [user, updateUser, toast]) // No olvides agregar toast a las dependencias si lo usas

  // Modificar contrasenia
  const handleChangePassword = useCallback(async (data: PasswordChangeData) => {
    console.log("almenos entro a lafuncion cambiar contrasenia")
    if (!user ) return
    
    try {
      await cambiarPasswordUsuario(user.id, data)
      console.log("si la cambio")
    } catch (error) {
      console.error("❌ Error cambiando contraseña:", error)
    }
  }, [user])

  // Modificar info sobre el usuario
//  const handleSaveAboutMe = useCallback((data: AboutMeData) => setAboutMe(data), [])

const handleSaveAboutMe = useCallback(async (data: AboutMeData) => {

  if (!empleado) return
  try {
    const updated = await actualizarEmpleado({
      
      id: Number(empleado.id ), // 👈 asegúrate de tener este valor
      //cargo: data.cargo,
      //departamento: data.departamento,
      infopersonal: data.description    });

    // 🔽 actualizas el estado con lo que viene del backend
    setAboutMe(prev => ({
      ...prev,
      ...updated
    }));

  } catch (error) {
    console.error("Error al actualizar empleado:", error);
  }
}, [empleado]);


  // Modificar info sobre las habilidades

  const handleSaveSkills = useCallback(async (data: SkillsData) => {
      if (!empleado) return;

      try {
        // 1. Limpiamos el arreglo (quitamos nombres vacíos)
        const habilidadesValidas = data.skills
          .map(s => s.name)
          .filter(name => name.trim() !== "");

        // 2. Enviamos el arreglo al servidor
        // Agregamos 'habilidades' al objeto que se envía
        await actualizarEmpleado({
          id: Number(empleado.id),
          infopersonal: aboutMe.description, // Mantenemos lo que ya existe
          // @ts-ignore (Si tu interfaz ActualizarEmpleadoData aún no tiene el campo)
          habilidades: habilidadesValidas 
        });

        // 3. Si la API responde bien, actualizamos el estado local
        setSkills(data);
        
        toast({
          title: "¡Éxito!",
          description: "Habilidades actualizadas correctamente.",
        });
      } catch (error) {
        console.error("Error al guardar habilidades:", error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los cambios.",
          variant: "destructive",
        });
      }
}, [empleado, aboutMe.description]); // Añadimos dependencias necesarias


  // handle para manejar la UI de las habilidades
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


  // ???
  // Modificar información laboral 
  //const handleSaveWorkInfo = useCallback(async(data: WorkInfoData) => setWorkInfo(data), [])
  //const handleSaveWorkInfo = useCallback((data: WorkInfoData) => setWorkInfo(data), [])
const handleSaveWorkInfo = useCallback(async (data: WorkInfoData) => {
    if (!empleado) return;

    try {
        // 1. Llamada al servicio
        const updated = await actualizarEmpleado({
          id: Number(empleado.id),
          // Mapeamos los nombres de la UI a los nombres de la base de datos
          cargo: data.rol, 
          departamento: data.departamento,
          infopersonal: aboutMe.description // Mantenemos lo que ya existe
        });

        // 2. Actualizamos el estado local con la respuesta
        setWorkInfo({
          departamento: updated.departamento || "",
          rol: updated.cargo || ""
        });

        toast({
          title: "¡Éxito!",
          description: "Información laboral actualizada.",
        });
        } catch (error) {
          console.error("❌ Error actualizando info laboral:", error);
          toast({
            title: "Error",
            description: "No se pudo guardar la información laboral.",
            variant: "destructive",
          });
          throw error; // Re-lanzamos para que el hijo capture el error si es necesario
        }
}, [empleado, aboutMe.description]);
    
 

// Modificar la fecha de inicio del empleado
const handleSaveExperience = useCallback(async () => {
  if (!empleado) return;
  try {
    // Validamos que tengamos datos antes de enviar
    const fechaFormateada = startDate.year && startDate.month 
      ? `${startDate.year}-${startDate.month.padStart(2, '0')}-01` 
      : undefined;

    await actualizarEmpleado({
      id: Number(empleado.id),
      fecha_ingreso: fechaFormateada,
    });

    toast({
      title: "¡Éxito!",
      description: "Fecha de experiencia actualizada.",
    });
  } catch (error) {
    console.error("❌ Error actualizando fecha:", error);
    toast({
      title: "Error",
      description: "No se pudo guardar la fecha.",
      variant: "destructive",
    });
    throw error; // Importante para que el 'catch' del hijo se entere
  }
}, [empleado, startDate]);
 



  // Modificar Departamento
  const handleDepartmentChange = useCallback((value: string) => {
    setWorkInfo((prev) => ({ ...prev, departamento: value }))
  }, [])
  // Modificar Rol de trabajo
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



 
// const handleSave = () => {
//   const data = {
//     startDate,
//     endDate: isCurrentPosition ? { month: "present", year: "present" } : endDate,
//     isCurrentPosition,
//   }
//   console.log("Datos guardados:", data)
//   alert(JSON.stringify(data, null, 2))
// }















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
        startDate={startDate}
        onStartDateChange={setStartDate}
        onSaveExperience={handleSaveExperience}
      />

    </div>
  </main>
)}