import apiClient from '../apiClient';

/**
 * Interfaz para los parámetros de notificación al siguiente responsable.
 */
export interface NotificacionSiguienteResponsableParams {
  id_empleado: number;
  id_learning_card: number;
  id_empleado_remitente: number;
}

/**
 * Envía notificación al siguiente responsable de una Learning Card.
 * @param {NotificacionSiguienteResponsableParams} data - Datos de la notificación.
 * @returns {Promise<void>}
 */
export const notificacionSiguienteResponsable = async (
  data: NotificacionSiguienteResponsableParams
): Promise<void> => {
  await apiClient.post('/notificaciones/siguienteResponsable', data);
};