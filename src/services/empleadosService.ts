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
