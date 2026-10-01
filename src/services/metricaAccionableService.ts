import apiClient from '../apiClient';

/** Veredicto que calcula el backend comparando resultado contra criterio. */
export type Cumplimiento = 'cumplida' | 'no_cumplida' | 'no_evaluable';

export interface MetricaAccionable {
  id_metrica_accionable: number;
  id_accionable: number;
  nombre: string;
  operador: string | null;
  criterio: string | null;
  resultado: string | null;
  cumplimiento: Cumplimiento;
  creado: string | null;
  actualizado: string | null;
}

export interface NuevaMetricaAccionable {
  id_accionable: number;
  nombre: string;
  operador?: string | null;
  criterio?: string | null;
  resultado?: string | null;
}

/** Los operadores que admite el backend, ya normalizados. */
export const OPERADORES = ['>=', '>', '=', '<=', '<', '!='] as const;

export const obtenerMetricasPorAccionable = async (idAccionable: number): Promise<MetricaAccionable[]> => {
  const { data } = await apiClient.get(`/metrica_accionable/accionable/${idAccionable}`);
  return data;
};

export const crearMetricaAccionable = async (metrica: NuevaMetricaAccionable): Promise<MetricaAccionable> => {
  const { data } = await apiClient.post('/metrica_accionable', metrica);
  return data;
};

export const actualizarMetricaAccionable = async (
  id: number,
  cambios: Partial<Omit<NuevaMetricaAccionable, 'id_accionable'>>
): Promise<MetricaAccionable> => {
  const { data } = await apiClient.patch(`/metrica_accionable/${id}`, cambios);
  return data;
};

export const eliminarMetricaAccionable = async (id: number): Promise<void> => {
  await apiClient.delete(`/metrica_accionable/${id}`);
};
