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





/**
 * En el body va a ir algo asi 
 * [
  {
    "id_learning_card": 3,
    "contenido": "Automatizar pruebas",
    "impacto": 5,
    "esfuerzo": 3,
    "realizado": false
  },
  {
    "id_accionable": 7,
    "id_learning_card": 3,
    "contenido": "Actualizar API",
    "impacto": 4,
    "esfuerzo": 2,
    "realizado": true
  }
]
 * 
 * 
 */