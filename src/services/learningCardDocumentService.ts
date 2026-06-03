import apiClient from '../apiClient';

/**
 * Interfaz que representa un documento de learning card.
 */
export interface LearningCardDocument {
  id: string;
  learning_card_id: number;
  document_name: string;
  document_url: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta de la API al subir un documento.
 */
export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: LearningCardDocument;
}

/**
 * Respuesta de la API al obtener documentos.
 */
export interface DocumentListResponse {
  success: boolean;
  message: string;
  data: {
    documents: LearningCardDocument[];
    count: number;
  };
}

/**
 * Respuesta de la API al eliminar un documento.
 */
export interface DocumentDeleteResponse {
  success: boolean;
  message: string;
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
 * Sube un documento asociado a una Learning Card.
 * @param {number} learningCardId - ID de la Learning Card.
 * @param {File} file - Archivo a subir.
 * @returns {Promise<LearningCardDocument>} Documento creado.
 */
export const uploadDocument = async (
  learningCardId: number, 
  file: File
): Promise<LearningCardDocument> => {
  // Validar archivo antes de enviarlo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('document', file);

  const endpoint = `/learning-cards/${learningCardId}/documentos`;
  //console.log('[learningCardDocumentService] Subiendo documento a:', endpoint);
  //console.log('[learningCardDocumentService] Archivo:', file.name);

  const response = await apiClient.post<DocumentUploadResponse>(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al subir documento');
  }

  return response.data.data;
};

/**
 * Obtiene todos los documentos asociados a una Learning Card.
 * @param {number} learningCardId - ID de la Learning Card.
 * @returns {Promise<LearningCardDocument[]>} Lista de documentos.
 */
export const getDocumentsByLearningCard = async (
  learningCardId: number
): Promise<LearningCardDocument[]> => {
  try {
    const endpoint = `/learning-cards/${learningCardId}/documentos`;
    //console.log('[learningCardDocumentService] Llamando endpoint:', endpoint);
    //console.log('[learningCardDocumentService] URL completa:', `http://localhost:3000${endpoint}`);
    
    const response = await apiClient.get<DocumentListResponse>(endpoint);

    // Validación defensiva de la respuesta
    if (!response.data) {
      //console.warn('[learningCardDocumentService] Respuesta sin data, devolviendo array vacío');
      return [];
    }

    if (!response.data.success) {
      //console.warn('[learningCardDocumentService] API respondió con success=false:', response.data);
      return [];
    }

    // Asegurar que data contenga la estructura esperada
    const responseData = response.data.data;
    if (!responseData || typeof responseData !== 'object') {
      //console.warn('[learningCardDocumentService] API no devolvió la estructura esperada:', responseData);
      return [];
    }

    // Verificar que tenga la propiedad documents
    if (!responseData.hasOwnProperty('documents')) {
      //console.warn('[learningCardDocumentService] API no devolvió la propiedad documents:', responseData);
      return [];
    }

    const documents = responseData.documents;
    //console.log('[learningCardDocumentService] Estructura de respuesta completa:', JSON.stringify(response.data, null, 2));
    //console.log('[learningCardDocumentService] Tipo de documents:', typeof documents);
    //console.log('[learningCardDocumentService] Es array?:', Array.isArray(documents));
    //console.log('[learningCardDocumentService] Contenido de documents:', documents);
    //console.log('[learningCardDocumentService] Count:', responseData.count);
    
    if (!Array.isArray(documents)) {
      //console.warn('[learningCardDocumentService] API no devolvió un array en documents, devolviendo array vacío');
      //console.warn('[learningCardDocumentService] Valor recibido:', documents);
      return [];
    }

    return documents;
  } catch (error: any) {
    //console.error('[learningCardDocumentService] Error al obtener documentos:', error);
    
    // Si el error es 404 (no found), devolver array vacío en lugar de error
    if (error.response?.status === 404) {
      //console.log('[learningCardDocumentService] Learning Card sin documentos (404), devolviendo array vacío');
      return [];
    }
    
    // Para otros errores, devolver array vacío para evitar crashes
    //console.warn('[learningCardDocumentService] Error inesperado, devolviendo array vacío');
    return [];
  }
};

/**
 * Obtiene un documento específico por su ID.
 * @param {string} documentId - ID del documento.
 * @returns {Promise<LearningCardDocument>} Documento encontrado.
 */
export const getDocumentById = async (documentId: string): Promise<LearningCardDocument> => {
  const endpoint = `/learning-cards/documentos/${documentId}`;
  //console.log('[learningCardDocumentService] Obteniendo documento:', endpoint);
  
  const response = await apiClient.get<{ success: boolean; data: LearningCardDocument }>(endpoint);

  if (!response.data.success) {
    throw new Error('Error al obtener documento');
  }

  return response.data.data;
};

/**
 * Elimina un documento por su ID.
 * @param {string} documentId - UUID del documento a eliminar.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    // Validar que el documentId sea válido
    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      throw new Error('ID de documento inválido o vacío');
    }

    const endpoint = `/learning-cards/documentos/${documentId}`;
    //console.log('[learningCardDocumentService] Eliminando documento:', endpoint);
    //console.log('[learningCardDocumentService] Document ID:', documentId);
    
    const response = await apiClient.delete<DocumentDeleteResponse>(endpoint);
    //console.log('[learningCardDocumentService] Respuesta del servidor:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar documento');
    }
    
    //console.log('[learningCardDocumentService] ✅ Documento eliminado exitosamente');
  } catch (error: any) {
    //console.error('[learningCardDocumentService] ❌ Error al eliminar documento:', error);
    
    // Log detallado del error
    if (error.response) {
      //console.error('[learningCardDocumentService] Status:', error.response.status);
      //console.error('[learningCardDocumentService] Data:', error.response.data);
      //console.error('[learningCardDocumentService] Headers:', error.response.headers);
      
      // Lanzar error con mensaje del backend si está disponible
      const backendMessage = error.response.data?.message || error.response.data?.detail || 'Error interno del servidor';
      throw new Error(`Error ${error.response.status}: ${backendMessage}`);
    } else if (error.request) {
      //console.error('[learningCardDocumentService] No response:', error.request);
      throw new Error('No se pudo conectar con el servidor');
    } else {
      //console.error('[learningCardDocumentService] Error config:', error.message);
      throw error;
    }
  }
};

/**
 * Obtiene la URL de descarga de un documento.
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
