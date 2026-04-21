// Tipos para la información del empleado
// export interface Empleado {
//   id_empleado: number
//   nombre_pila: string
//   apellido_paterno: string
//   apellido_materno?: string
//   correo: string
//   celular?: string
  
// }

// Tipos para el usuario autenticado
export interface User {
  id: number
  id_empleado?: number
  alias?: string
  name?: string
  email?: string
  avatar?: string
  role?: string
}

// Tipos para los datos del perfil
export interface PersonalInfoData {
  nombreCompleto: string
  correo: string
  celular?: string
}

export interface UserConfigData {
  alias: string
}

export interface PasswordChangeData {
  password_actual: string
  password_nueva: string
}

// Tipos para las secciones del perfil
export interface AboutMeData {
  description: string
}

export interface Skill {
  id: string
  name: string
}

export interface SkillsData {
  skills: Skill[]
}

export interface WorkInfoData {
  departamento: string
  rol: string
}

export interface DepartmentOption {
  value: string
  label: string
}

export interface RoleOption {
  value: string
  label: string
}
