import apiClient from '../apiClient';

/**
 * Interfaz que representa un documento de formato.
 */
export interface FormatoDocument {
  id: string;
  document_name: string;
  document_url: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  categoria: string;
}

/**
 * Respuesta de la API al subir un documento de formato.
 */
export interface FormatoUploadResponse {
  success: boolean;
  message: string;
  data: FormatoDocument;
}

/**
 * Respuesta de la API al obtener documentos de formato.
 */
export interface FormatoListResponse {
  success: boolean;
  message: string;
  data: {
    documents: FormatoDocument[];
    count: number;
  };
}

/**
 * Respuesta de la API al eliminar un documento de formato.
 */
export interface FormatoDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Respuesta de la API al actualizar un documento de formato.
 */
export interface FormatoUpdateResponse {
  success: boolean;
  message: string;
  data: FormatoDocument;
}

/**
 * Resultado de validación de archivo.
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Tipos de archivo permitidos con sus tipos MIME.
 */
const ALLOWED_MIME_TYPES = [
  // Imágenes
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documentos
  'application/pdf', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  // Videos
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'
];

/**
 * Tamaño máximo de archivo en bytes (50MB).
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Valida un archivo antes de subirlo.
 * @param {File} file - Archivo a validar.
 * @returns {FileValidationResult} Resultado de la validación.
 */
export const validateFile = (file: File): FileValidationResult => {
  // Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'El archivo excede el tamaño máximo permitido de 50MB' 
    };
  }

  // Verificar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes, documentos, videos y audios.` 
    };
  }

  // Verificar nombre
  if (!file.name || file.name.length > 255) {
    return { 
      valid: false, 
      error: 'Nombre de archivo inválido' 
    };
  }

  return { valid: true };
};

/**
 * Sube un documento de formato.
 * @param {File} file - Archivo a subir.
 * @returns {Promise<FormatoDocument>} Documento creado.
 */
export const uploadFormatoDocument = async (file: File): Promise<FormatoDocument> => {
  // Validar archivo antes de enviarlo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('document', file);

  const endpoint = '/formato/upload';

  const response = await apiClient.post<FormatoUploadResponse>(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al subir documento de formato');
  }

  return response.data.data;
};

/**
 * Obtiene todos los documentos de formato.
 * @returns {Promise<FormatoDocument[]>} Lista de documentos.
 */
export const getFormatoDocuments = async (): Promise<FormatoDocument[]> => {
  try {
    const endpoint = '/formato/';
    
    const response = await apiClient.get<FormatoListResponse>(endpoint);

    // Validación defensiva de la respuesta
    if (!response.data) {
      console.warn('[formatoDocumentService] Respuesta sin data, devolviendo array vacío');
      return [];
    }

    if (!response.data.success) {
      console.warn('[formatoDocumentService] API respondió con success=false:', response.data);
      return [];
    }

    // Asegurar que data contenga la estructura esperada
    const responseData = response.data.data;
    if (!responseData) {
      console.warn('[formatoDocumentService] API no devolvió data, devolviendo array vacío');
      return [];
    }

    // La API puede devolver directamente un array o un objeto con propiedad documents
    let documents: FormatoDocument[];
    
    if (Array.isArray(responseData)) {
      // Caso 1: La API devuelve directamente un array
      documents = responseData;
    } else if (typeof responseData === 'object' && responseData.hasOwnProperty('documents')) {
      // Caso 2: La API devuelve un objeto con propiedad documents
      documents = responseData.documents;
    } else {
      console.warn('[formatoDocumentService] API no devolvió la estructura esperada:', responseData);
      return [];
    }

    
    if (!Array.isArray(documents)) {
      console.warn('[formatoDocumentService] documents no es un array, devolviendo array vacío');
      console.warn('[formatoDocumentService] Valor recibido:', documents);
      return [];
    }

    return documents;
  } catch (error: any) {
    console.error('[formatoDocumentService] Error al obtener documentos:', error);
    
    // Si el error es 404 (no found), devolver array vacío en lugar de error
    if (error.response?.status === 404) {
      return [];
    }
    
    // Para otros errores, devolver array vacío para evitar crashes
    console.warn('[formatoDocumentService] Error inesperado, devolviendo array vacío');
    return [];
  }
};

/**
 * Obtiene un documento de formato específico por su ID.
 * @param {string} documentId - ID del documento.
 * @returns {Promise<FormatoDocument>} Documento encontrado.
 */
export const getFormatoDocumentById = async (documentId: string): Promise<FormatoDocument> => {
  const endpoint = `/formato/${documentId}`;
  
  const response = await apiClient.get<{ success: boolean; data: FormatoDocument }>(endpoint);

  if (!response.data.success) {
    throw new Error('Error al obtener documento de formato');
  }

  return response.data.data;
};

/**
 * Actualiza un documento de formato por su ID.
 * @param {string} documentId - ID del documento a actualizar.
 * @param {Partial<FormatoDocument>} updateData - Datos a actualizar (puede incluir categoria).
 * @returns {Promise<FormatoDocument>} Documento actualizado.
 */
export const updateFormatoDocument = async (
  documentId: string, 
  updateData: Partial<Pick<FormatoDocument, 'document_name' | 'document_type' | 'categoria'>>
): Promise<FormatoDocument> => {
  try {
    // Validar que el documentId sea válido
    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      throw new Error('ID de documento inválido o vacío');
    }

    const endpoint = `/formato/${documentId}`;
    
    const response = await apiClient.patch<FormatoUpdateResponse>(endpoint, updateData);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al actualizar documento de formato');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('[formatoDocumentService] ❌ Error al actualizar documento:', error);
    
    // Log detallado del error
    if (error.response) {
      console.error('[formatoDocumentService] Status:', error.response.status);
      console.error('[formatoDocumentService] Data:', error.response.data);
      console.error('[formatoDocumentService] Headers:', error.response.headers);
      
      // Lanzar error con mensaje del backend si está disponible
      const backendMessage = error.response.data?.message || error.response.data?.detail || 'Error interno del servidor';
      throw new Error(`Error ${error.response.status}: ${backendMessage}`);
    } else if (error.request) {
      console.error('[formatoDocumentService] No response:', error.request);
      throw new Error('No se pudo conectar con el servidor');
    } else {
      console.error('[formatoDocumentService] Error config:', error.message);
      throw error;
    }
  }
};

/**
 * Elimina un documento de formato por su ID.
 * @param {string} documentId - UUID del documento a eliminar.
 * @returns {Promise<void>}
 */
export const deleteFormatoDocument = async (documentId: string): Promise<void> => {
  try {
    // Validar que el documentId sea válido
    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      throw new Error('ID de documento inválido o vacío');
    }

    const endpoint = `/formato/${documentId}`;
    
    const response = await apiClient.delete<FormatoDeleteResponse>(endpoint);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar documento de formato');
    }
    
  } catch (error: any) {
    console.error('[formatoDocumentService] ❌ Error al eliminar documento:', error);
    
    // Log detallado del error
    if (error.response) {
      console.error('[formatoDocumentService] Status:', error.response.status);
      console.error('[formatoDocumentService] Data:', error.response.data);
      console.error('[formatoDocumentService] Headers:', error.response.headers);
      
      // Lanzar error con mensaje del backend si está disponible
      const backendMessage = error.response.data?.message || error.response.data?.detail || 'Error interno del servidor';
      throw new Error(`Error ${error.response.status}: ${backendMessage}`);
    } else if (error.request) {
      console.error('[formatoDocumentService] No response:', error.request);
      throw new Error('No se pudo conectar con el servidor');
    } else {
      console.error('[formatoDocumentService] Error config:', error.message);
      throw error;
    }
  }
};

/**
 * Obtiene la URL de descarga de un documento de formato.
 * @param {string} documentUrl - URL del documento.
 * @returns {string} URL de descarga.
 */
export const getDownloadUrl = (documentUrl: string): string => {
  return documentUrl;
};

/**
 * Determina el tipo de documento basado en el tipo MIME.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {string} Tipo de documento categorizado.
 */
export const getDocumentType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'other';
};

/**
 * Formatea el tamaño de archivo en formato legible.
 * @param {number} bytes - Tamaño en bytes.
 * @returns {string} Tamaño formateado.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtiene la extensión de archivo a partir del nombre.
 * @param {string} fileName - Nombre del archivo.
 * @returns {string} Extensión del archivo.
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
};

/**
 * Verifica si un archivo es una imagen.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {boolean} True si es una imagen.
 */
export const isImage = (mimeType: string | undefined | null): boolean => {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }
  return mimeType.startsWith('image/');
};

/**
 * Verifica si un archivo es un video.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {boolean} True si es un video.
 */
export const isVideo = (mimeType: string | undefined | null): boolean => {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }
  return mimeType.startsWith('video/');
};

/**
 * Verifica si un archivo es un audio.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {boolean} True si es un audio.
 */
export const isAudio = (mimeType: string | undefined | null): boolean => {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }
  return mimeType.startsWith('audio/');
};

/**
 * Obtiene el icono CSS class basado en el tipo de documento.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {string} Clase CSS para el icono.
 */
export const getDocumentIcon = (mimeType: string): string => {
  if (isImage(mimeType)) return 'fas fa-image';
  if (mimeType === 'application/pdf') return 'fas fa-file-pdf';
  if (mimeType.includes('word')) return 'fas fa-file-word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'fas fa-file-powerpoint';
  if (isVideo(mimeType)) return 'fas fa-file-video';
  if (isAudio(mimeType)) return 'fas fa-file-audio';
  if (mimeType === 'text/plain') return 'fas fa-file-alt';
  return 'fas fa-file';
};

// Exportar constantes útiles
export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };