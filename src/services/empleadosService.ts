import apiClient from '../apiClient';

export interface Empleado {
  id: number;
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
  id: number;
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
  // 🔹 1. Obtener empleados y proyectos en paralelo
  const [empleadosRes, proyectosRes] = await Promise.all([
    apiClient.get('/empleados/todos'),
    apiClient.get('/proyectos')
  ]);

  const empleados = empleadosRes.data;
  const proyectos = proyectosRes.data || [];

  // 🔹 2. Agrupar proyectos por id_lider
  const proyectosPorLider: Record<number, any[]> = {};

  proyectos.forEach((p: any) => {
    if (!proyectosPorLider[p.id_lider]) {
      proyectosPorLider[p.id_lider] = [];
    }
    proyectosPorLider[p.id_lider].push(p);
  });

  // 🔹 3. Mapear empleados
  // const empleadosConInfo = await Promise.all(
  //   empleados.map(async (empleado: any) => {
  //     try {
  //       // 🔹 Habilidades (esto sí sigue siendo por empleado)
  //       const habilidadesResponse = await apiClient.get(
  //         `/habilidad/empleado/${empleado.id_empleado}`
  //       );

  //       const listaHabilidades = habilidadesResponse.data.data || [];
  //       const skillsArray = listaHabilidades.map(
  //         (h: any) => h.nombre_habilidad
  //       );

  //       // 🔹 Obtener proyectos ya agrupados
  //       const proyectosDelEmpleado =
  //         proyectosPorLider[empleado.id_empleado] || [];

  //       // 🔹 Contadores optimizados (una sola pasada)
  //       let projectsCompleted = 0;
  //       let projectsActive = 0;

  //       for (const p of proyectosDelEmpleado) {
  //         if (p.estado === 'COMPLETADO') projectsCompleted++;
  //         else if (p.estado === 'ACTIVO') projectsActive++;
  //       }

  //       return {
  //         ...mapEmpleadoResumen(empleado),
  //         skills: skillsArray,
  //         projectsCompleted,
  //         projectsActive
  //       };

  //     } catch (error) {
  //       console.error(
  //         `Error obteniendo info para empleado ${empleado.id_empleado}:`,
  //         error
  //       );

  //       return {
  //         ...mapEmpleadoResumen(empleado),
  //         skills: [],
  //         projectsCompleted: 0,
  //         projectsActive: 0
  //       };
  //     }
  //   })
  // );


  const empleadosConInfo = await Promise.all(
    empleados.map(async (empleado: any) => {
      try {
        // 🔹 Habilidades y usuario en paralelo
        const [habilidadesResponse, usuarioResponse] = await Promise.all([
          apiClient.get(`/habilidad/empleado/${empleado.id_empleado}`),
          apiClient.get(`/usuarios/empleado/${empleado.id_empleado}`).catch(() => ({ data: [] }))
          // El catch es por si el empleado no tiene usuario asignado
        ]);
  
        const listaHabilidades = habilidadesResponse.data.data || [];
        const skillsArray = listaHabilidades.map((h: any) => h.nombre_habilidad);
  
        // 🔹 Extraer imagen del usuario (puede ser array o un solo objeto)
        // const usuarios = Array.isArray(usuarioResponse.data)
        //   ? usuarioResponse.data
        //   : [usuarioResponse.data];
        const usuarios = usuarioResponse.data?.data || [];

          console.log(`Empleado ${empleado.id_empleado} - usuarioResponse.data:`, usuarioResponse.data)
          console.log(`Empleado ${empleado.id_empleado} - imageUrl:`, usuarios[0]?.image)

        const imageUrl = usuarios[0]?.image || null;
  
        // 🔹 Proyectos ya agrupados
        const proyectosDelEmpleado = proyectosPorLider[empleado.id_empleado] || [];
  
        let projectsCompleted = 0;
        let projectsActive = 0;
  
        for (const p of proyectosDelEmpleado) {
          if (p.estado === 'COMPLETADO') projectsCompleted++;
          else if (p.estado === 'ACTIVO') projectsActive++;
        }
  
        return {
          ...mapEmpleadoResumen(empleado),
          skills: skillsArray,
          projectsCompleted,
          projectsActive,
          image: imageUrl  // 👈 nuevo campo
        };
  
      } catch (error) {
        console.error(`Error obteniendo info para empleado ${empleado.id_empleado}:`, error);
  
        return {
          ...mapEmpleadoResumen(empleado),
          skills: [],
          projectsCompleted: 0,
          projectsActive: 0,
          image: null  // 👈 fallback
        };
      }
    })
  );

  return empleadosConInfo;
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
  const response = await apiClient.request({
    method: 'POST',
    url: '/empleados',
    data: { id },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
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
  const response = await apiClient.patch('/empleados/', empleadoData);
  return response.data;
};

/**
 * Desactiva un empleado (eliminación lógica)
 * @param {number} id - ID del empleado a desactivar
 * @returns {Promise<Empleado>} El empleado desactivado
 */
export const desactivarEmpleado = async (id: number): Promise<Empleado> => {
  const response = await apiClient.delete('/empleados/', {
    data: { id }
  });
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