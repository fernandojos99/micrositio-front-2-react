import apiClient from "@/apiClient";
import { Accionable } from "@/pages/Interfaces/accionablesPoints";


export async function syncAccionables(
  accionables: Accionable[]
): Promise<void> {

  await apiClient.put("/accionables/sync", accionables);

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