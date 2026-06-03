import apiClient from '../apiClient';

/**
 * Interfaz que representa una relación célula-proyecto.
 */
export interface CelulaProyecto {
  id: number;
  id_empleado: number;
  id_proyecto: number;
  activo: boolean;
}

/**
 * Obtiene todas las relaciones célula-proyecto.
 * @returns {Promise<CelulaProyecto[]>} Lista de relaciones célula-proyecto.
 */
export const obtenerTodos = async (): Promise<CelulaProyecto[]> => {
  const response = await apiClient.get('/celulas-proyecto');
  return response.data.data;
};

/**
 * Obtiene las relaciones célula-proyecto por ID de empleado.
 * @param {number} id_empleado - ID del empleado.
 * @returns {Promise<CelulaProyecto[]>} Lista de relaciones célula-proyecto asociadas al empleado.
 */
export const obtenerPorEmpleado = async (id_empleado: number): Promise<CelulaProyecto[]> => {
  const response = await apiClient.get(`/celulas-proyecto?empleadoId=${id_empleado}`);
  return response.data.data;
};

/**
 * Obtiene las relaciones célula-proyecto por ID de proyecto.
 * @param {number} id_proyecto - ID del proyecto.
 * @returns {Promise<CelulaProyecto[]>} Lista de relaciones célula-proyecto asociadas al proyecto.
 */
export const obtenerPorProyecto = async (id_proyecto: number): Promise<CelulaProyecto[]> => {
  const response = await apiClient.get(`/celulas-proyecto?proyectoId=${id_proyecto}`);
  return response.data.data;
};

/**
 * Crea nuevas relaciones célula-proyecto para varios empleados.
 * @param {number[]} id_empleados - Array de IDs de empleados.
 * @param {number} id_proyecto - ID del proyecto.
 * @param {boolean} activo - Estado activo.
 * @returns {Promise<CelulaProyecto[]>} Las relaciones creadas.
 */
export const crear = async (
  id_empleados: number[],
  id_proyecto: number,
  activo: boolean = true
): Promise<CelulaProyecto[]> => {
  const response = await apiClient.post('/celulas-proyecto', {
    id_empleados,
    id_proyecto,
    activo,
  });
  return response.data.data;
};

/**
 * Elimina una relación célula-proyecto por su ID.
 * @param {number} id - ID de la relación a eliminar.
 * @returns {Promise<void>}
 */
export const eliminar = async (id: number): Promise<void> => {
  await apiClient.delete(`/celulas-proyecto/${id}`);
};

/**
 * Actualiza el estado activo de una relación célula-proyecto.
 * @param {number} id - ID de la relación a actualizar.
 * @param {boolean} activo - Nuevo estado activo.
 * @returns {Promise<CelulaProyecto>} La relación actualizada.
 */
export const actualizarActivo = async (id: number, activo: boolean): Promise<CelulaProyecto> => {
  const response = await apiClient.patch(`/celulas-proyecto/${id}`, { activo });
  return response.data.data;
};