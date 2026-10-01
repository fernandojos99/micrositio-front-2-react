import apiClient from '../apiClient';

export interface Empleado {
  // La API devuelve id_empleado, nunca id: la PK de la tabla empleado se
  // llama asi. Este tipo declaraba 'id', que no existe en la respuesta, y por
  // eso seis archivos redeclaraban Empleado por su cuenta con el nombre bueno.
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  celular?: string;
  correo: string;
  numero_empleado: string;
  activo: boolean;
  fecha_ingreso?: string;
  updated_at?: string;
  infopersonal?:string;
  departamento?:string;
  cargo ?:string;
}

export interface CrearEmpleadoData {
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  celular?: string;
  correo: string;
  numero_empleado: string;
  activo?: boolean;
}

export interface ActualizarEmpleadoData {
  id_empleado: number;
  nombre_pila?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  celular?: string;
  correo?: string;
  numero_empleado?: string;
  activo?: boolean;
  fecha_ingreso?:string;

  // 🔽 nuevos campos
  cargo?: string;
  departamento?: string;
  infopersonal?: string;
  habilidades?: string[]; // Si quieres actualizar habilidades junto con el empleado
}


export interface EmpleadoResumen {
  id_empleado: number; // 🔥 agregado
  skills: string[];
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo: string;
  fecha_ingreso?: string;
  cargo: string;
  departamento: string;
  infopersonal:string;
  projectsActive?: number;
  projectsCompleted?: number;
  image?: string | null; // URL de la imagen del usuario, puede ser null si no tiene
}


const mapEmpleadoResumen = (emp: any): EmpleadoResumen => ({
  id_empleado: emp.id_empleado, // 🔥 agregado
  nombre_pila: emp.nombre_pila,
  apellido_paterno: emp.apellido_paterno,
  apellido_materno: emp.apellido_materno,
  correo: emp.correo,
  fecha_ingreso: emp.fecha_ingreso,
  infopersonal:emp.infopersonal,

  // 🔥 aquí está la lógica importante
  cargo: emp.cargo ?? "",
  departamento: emp.departamento ?? "",
  skills: emp.skills  ?? [], // Convertir array a string si es necesario
});


// Nota: Todo esto lo pude haber agregado a la interface Empleado, pero lo hice aparte para no mezclar responsabilidades.
//  Empleado es para el CRUD básico, y EmpleadoResumen es para la vista de resumen que incluye
export interface Habilidad {
  id_habilidad: number;
  nombre_habilidad: string;
  // Añade aquí otros campos que devuelva tu tabla 'habilidad' si existen
}

export interface HabilidadResponse {
  success: boolean;
  message: string;
  data: Habilidad[];
}


/**
 * Obtiene toda la informacion del empleado 
 * @returns  regresa solo los campos especificados de la interface
 * 
 */
export const obtenerEmpleadosResumen = async (): Promise<EmpleadoResumen[]> => {
  // Una sola petición: el backend junta habilidades, foto y conteo de
  // proyectos (antes eran /todos + /proyectos + 2 peticiones por empleado).
  const { data } = await apiClient.get<EmpleadoResumen[]>('/empleados/resumen');

  return (data || []).map((emp) => ({
    ...mapEmpleadoResumen(emp),
    projectsCompleted: emp.projectsCompleted ?? 0,
    projectsActive: emp.projectsActive ?? 0,
    image: emp.image ?? null,
  }));
};



/**
 * Obtiene todos los empleados
 * @returns {Promise<Empleado[]>} Lista de todos los empleados
 */
export const obtenerEmpleados = async (): Promise<Empleado[]> => {
  const response = await apiClient.get('/empleados/todos');
  return response.data;
};

/**
 * Obtiene un empleado específico por su ID
 * @param {number} id - ID del empleado a buscar
 * @returns {Promise<Empleado>} Los datos del empleado
 */
export const obtenerEmpleadoPorId = async (id: number): Promise<Empleado> => {
  const response = await apiClient.get(`/empleados/${id}`);
  return response.data;
};

/**
 * Crea un nuevo empleado
 * @param {CrearEmpleadoData} empleadoData - Datos del nuevo empleado
 * @returns {Promise<Empleado>} El empleado creado
 */
export const crearEmpleado = async (empleadoData: CrearEmpleadoData): Promise<Empleado> => {
  const response = await apiClient.post('/empleados/', empleadoData);
  return response.data;
};

/**
 * Actualiza los datos de un empleado existente
 * @param {ActualizarEmpleadoData} empleadoData - Datos a actualizar (debe incluir el id)
 * @returns {Promise<Empleado>} El empleado actualizado
 */
export const actualizarEmpleado = async (empleadoData: ActualizarEmpleadoData): Promise<Empleado> => {
  const response = await apiClient.patch(`/empleados/${empleadoData.id_empleado}`, empleadoData);
  return response.data;
};

/**
 * Desactiva un empleado (eliminación lógica)
 * @param {number} id - ID del empleado a desactivar
 * @returns {Promise<Empleado>} El empleado desactivado
 */
export const desactivarEmpleado = async (id: number): Promise<Empleado> => {
  const response = await apiClient.delete(`/empleados/${id}`);
  return response.data;
};

/**
 * Obtiene todos los empleados que no estan relacionado con un usuario
 * @returns {Promise<Empleado[]>} Lista de todos los empleados
 */
export const obtenerEmpleadosSinUsuario = async (): Promise<Empleado[]> => {
  const response = await apiClient.get('/empleados/sin-usuario');
  return response.data;
};

/**
 * Obtiene las habilidades asociadas a un empleado específico
 * @param {number} id - ID del empleado
 * @returns {Promise<Habilidad[]>} Lista de habilidades del empleado
 */
export const obtenerHabilidadesPorEmpleado = async (id: number): Promise<Habilidad[]> => {
  try {
    const response = await apiClient.get<HabilidadResponse>(`/habilidad/empleado/${id}`);
    return response.data.data || [];
  } catch (error) {
    console.error(`Error al obtener habilidades para el empleado ${id}:`, error);
    return [];
  }
};