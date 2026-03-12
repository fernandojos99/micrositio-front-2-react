// services/accionableService.ts


import apiClient from "@/apiClient";
import { Points } from "@/pages/Interfaces/accionablesPoints";


export async function getAccionables(): Promise<Points> {
  const response = await apiClient.get<Points>("/accionables/");
  return response.data;
}