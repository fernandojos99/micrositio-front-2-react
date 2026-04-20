import apiClient from '../apiClient';

export interface Empleado {
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  celular?: string;
  correo: string;
  numero_empleado: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
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
}


export interface EmpleadoResumen {
  skills: string[];
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo: string;
  created_at?: string;
  cargo: string;
  departamento: string;
  infopersonal:string;
  projectsActive?: number;
  projectsCompleted?: number;
}


const mapEmpleadoResumen = (emp: any): EmpleadoResumen => ({
  nombre_pila: emp.nombre_pila,
  apellido_paterno: emp.apellido_paterno,
  apellido_materno: emp.apellido_materno,
  correo: emp.correo,
  created_at: emp.created_at,
  infopersonal:emp.infopersonal,

  // 🔥 aquí está la lógica importante
  cargo: emp.cargo ?? "",
  departamento: emp.departamento ?? "",
  skills: emp.skills  ?? [], // Convertir array a string si es necesario
});


/**
 * Obtiene toda la informacion del empleado 
 * @returns  regresa solo los campos especificados de la interface
 * 
 */
/* export const obtenerEmpleadosResumen = async (): Promise<EmpleadoResumen[]> => {
  const response = await apiClient.get('/empleados/todos');

  return response.data.map(mapEmpleadoResumen);
};
 */


/* export const obtenerEmpleadosResumen = async (): Promise<any[]> => { 
  const response = await apiClient.get('/empleados/todos');
  const empleados = response.data;

  const empleadosConHabilidades = await Promise.all(
    empleados.map(async (empleado: any) => {
      try {
        const habilidadesResponse = await apiClient.get(
          `/habilidad/empleado/${empleado.id_empleado}`
        );

        // 1. Accedemos al array que está en data.data (según tu imagen)
        const listaHabilidades = habilidadesResponse.data.data || [];

        // 2. Iteramos sobre el array para extraer solo el string de 'nombre_habilidad'
        const skillsArray = listaHabilidades.map((h: any) => h.nombre_habilidad);

        return {
          ...mapEmpleadoResumen(empleado),
          skills: skillsArray // Ahora contiene un array de strings: ["JavaScript", "React", ...]
        };

      } catch (error) {
        console.error(`Error obteniendo habilidades para empleado ${empleado.id_empleado}:`, error);
        return {
          ...mapEmpleadoResumen(empleado),
          skills: []
        };
      }
    })
  );

  return empleadosConHabilidades;
};
 */



export const obtenerEmpleadosResumen = async (): Promise<any[]> => { 
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
  const empleadosConInfo = await Promise.all(
    empleados.map(async (empleado: any) => {
      try {
        // 🔹 Habilidades (esto sí sigue siendo por empleado)
        const habilidadesResponse = await apiClient.get(
          `/habilidad/empleado/${empleado.id_empleado}`
        );

        const listaHabilidades = habilidadesResponse.data.data || [];
        const skillsArray = listaHabilidades.map(
          (h: any) => h.nombre_habilidad
        );

        // 🔹 Obtener proyectos ya agrupados
        const proyectosDelEmpleado =
          proyectosPorLider[empleado.id_empleado] || [];

        // 🔹 Contadores optimizados (una sola pasada)
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
          projectsActive
        };

      } catch (error) {
        console.error(
          `Error obteniendo info para empleado ${empleado.id_empleado}:`,
          error
        );

        return {
          ...mapEmpleadoResumen(empleado),
          skills: [],
          projectsCompleted: 0,
          projectsActive: 0
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
  // console.log('Obteniendo empleado por ID:', id);
  // console.log('Tipo de ID:', typeof id);
  
  // Para GET con body en axios, usar request con configuración específica
  const response = await apiClient.request({
    method: 'POST',
    url: '/empleados',
    data: { id },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // console.log('Respuesta del servidor:', response.data);
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
  // console.log('actualizarEmpleado - Datos recibidos:', JSON.stringify(empleadoData, null, 2));
  // console.log('actualizarEmpleado - Tipo de ID:', typeof empleadoData.id);
  
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


