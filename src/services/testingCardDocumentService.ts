import apiClient from '../apiClient';

/**
 * Interfaz que representa un documento de testing card.
 */
export interface TestingCardDocument {
  id: string;
  testing_card_id: number;
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
  data: TestingCardDocument;
}

/**
 * Respuesta de la API al obtener documentos.
 */
export interface DocumentListResponse {
  success: boolean;
  data: TestingCardDocument[];
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
 * Sube un documento asociado a una Testing Card.
 * @param {number} testingCardId - ID de la Testing Card.
 * @param {File} file - Archivo a subir.
 * @returns {Promise<TestingCardDocument>} Documento creado.
 */
export const uploadDocument = async (
  testingCardId: number, 
  file: File
): Promise<TestingCardDocument> => {
  // Validar archivo antes de enviarlo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('document', file);

  const response = await apiClient.post<DocumentUploadResponse>(
    `/testing-cards/${testingCardId}/documentos`,
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
 * Obtiene todos los documentos asociados a una Testing Card.
 * @param {number} testingCardId - ID de la Testing Card.
 * @returns {Promise<TestingCardDocument[]>} Lista de documentos.
 */
export const getDocumentsByTestingCard = async (
  testingCardId: number
): Promise<TestingCardDocument[]> => {
  const endpoint = `/testing-cards/${testingCardId}/documentos`;
  console.log('[testingCardDocumentService] Llamando endpoint:', endpoint);
  console.log('[testingCardDocumentService] URL completa:', `http://localhost:3000${endpoint}`);
  
  const response = await apiClient.get<DocumentListResponse>(endpoint);

  if (!response.data.success) {
    throw new Error('Error al obtener documentos');
  }

  return response.data.data;
};

/**
 * Elimina un documento por su ID.
 * @param {string} documentId - UUID del documento a eliminar.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  const response = await apiClient.delete<DocumentDeleteResponse>(
    `/testing-cards/documentos/${documentId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al eliminar documento');
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
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Verifica si un archivo es un video.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {boolean} True si es un video.
 */
export const isVideo = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

/**
 * Verifica si un archivo es un audio.
 * @param {string} mimeType - Tipo MIME del archivo.
 * @returns {boolean} True si es un audio.
 */
export const isAudio = (mimeType: string): boolean => {
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
