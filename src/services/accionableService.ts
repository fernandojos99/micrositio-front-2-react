import apiClient from "@/apiClient";
import { Accionable } from "@/pages/Interfaces/accionablesPoints";


export async function syncAccionables(
  id: number,
  accionables: Accionable[]
): Promise<void> {

  await apiClient.put(`/accionables/sync/${id}`, accionables);

}


export async function obtenerAccionablesPorLearningCard(
  idLearningCard: number
): Promise<Accionable[]> {

  const response = await apiClient.get(
    `accionables/learning-card/${idLearningCard}/accionables`
  );

  return response.data.data;

}


// Obtener accionables por secuencia, para mostrar en la seccion de accionables del proyecto
export async function obtenerAccionablesPorSecuencia(
  idSecuencia: number
): Promise<Accionable[]> {

  const response = await apiClient.get(
    `accionables/secuencia/${idSecuencia}/accionables`
  );

  return response.data.data;

}



export async function actualizarAccionable(
  idAccionable: number,
  realizado: boolean
): Promise<void> {

  await apiClient.put(`/accionables/${idAccionable}`, {
    realizado
  });

}


/**
 * Cambia el contenido, el impacto o el esfuerzo de un accionable.
 * Es el mismo PUT que `actualizarAccionable`, que solo sabe mandar `realizado`.
 */
export async function editarAccionable(
  idAccionable: number,
  cambios: Partial<Pick<Accionable, 'contenido' | 'impacto' | 'esfuerzo' | 'realizado'>>
): Promise<Accionable> {

  const response = await apiClient.put(`/accionables/${idAccionable}`, cambios);

  return response.data.data;

}


