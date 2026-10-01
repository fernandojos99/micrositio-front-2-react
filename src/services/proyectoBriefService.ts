import apiClient from '../apiClient';

/**
 * Brief de un proyecto: lo que devuelve el procesador de transcripts al pulsar
 * Ejecutar, más los archivos que lo acompañan.
 *
 * El procesador habla con las Lambdas de AWS con `fetch` a pelo; estas
 * llamadas sí van por `apiClient`, para heredar el token y el manejo del 401.
 */

/** Archivo guardado: solo la referencia, el binario vive en disco. */
export interface ArchivoBrief {
  nombre: string;
  url: string;
  tipo?: string | null;
  tamano?: number | null;
}

export interface ProyectoBrief {
  id_proyecto: number;
  nombre_proyecto: string | null;
  transcript_id: string | null;
  url: string | null;
  resumen: string | null;
  resumen_estructurado: unknown;
  origen: 'texto' | 'docx' | null;
  ejecutado: boolean;
  archivo: ArchivoBrief | null;
  pptx: ArchivoBrief | null;
  ejecutado_en: string | null;
  creado: string | null;
  actualizado: string | null;
}

/** Lo que se guarda tras un Ejecutar correcto. */
export interface BriefGuardable {
  nombre_proyecto?: string | null;
  transcript_id?: string | null;
  url?: string | null;
  resumen?: string | null;
  resumen_estructurado?: unknown;
  origen?: 'texto' | 'docx' | null;
}

export async function obtenerBrief(idProyecto: number): Promise<ProyectoBrief> {
  const response = await apiClient.get(`/proyecto_brief/${idProyecto}`);
  return response.data;
}

export async function guardarBrief(
  idProyecto: number,
  datos: BriefGuardable
): Promise<ProyectoBrief> {
  const response = await apiClient.put(`/proyecto_brief/${idProyecto}`, datos);
  return response.data;
}

/** Sube el .docx del que salió el brief. El campo tiene que llamarse `document`. */
export async function subirArchivoBrief(
  idProyecto: number,
  archivo: File
): Promise<ProyectoBrief> {
  const formData = new FormData();
  formData.append('document', archivo);

  const response = await apiClient.post(`/proyecto_brief/${idProyecto}/archivo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Deja el brief a cero: borra el resultado de la Lambda y, de disco, el .docx
 * y el .pptx. No tiene vuelta atrás.
 */
export async function borrarBrief(idProyecto: number): Promise<ProyectoBrief> {
  const response = await apiClient.delete(`/proyecto_brief/${idProyecto}`);
  return response.data;
}

/** Sube la presentación. No hace falta haber ejecutado nada antes. */
export async function subirPptxBrief(
  idProyecto: number,
  archivo: File
): Promise<ProyectoBrief> {
  const formData = new FormData();
  formData.append('document', archivo);

  const response = await apiClient.post(`/proyecto_brief/${idProyecto}/pptx`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
