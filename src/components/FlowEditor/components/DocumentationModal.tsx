import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  AlertCircle,
  Check,
  Trash2
} from 'lucide-react';
import './DocumentationModal.css';

/**
 * Props para el componente DocumentationModal
 * @interface DocumentationModalProps
 */
interface DocumentationModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función callback para añadir URLs */
  onAddUrl: (url: string) => void;
  /** Función callback para añadir archivos */
  onAddFiles: (files: File[]) => Promise<void>;
}

/**
 * Modal para gestionar documentación (URLs y archivos) de Testing Cards
 * 
 * @component DocumentationModal
 * @description Componente modal especializado en la gestión de documentación.
 * Permite añadir URLs de referencia y cargar archivos con drag & drop.
 * 
 * Características principales:
 * - Validación de URLs en tiempo real
 * - Drag & Drop para archivos
 * - Límite de 50MB por archivo
 * - Preview de archivos seleccionados
 * - Validación de tipos de archivo
 * - Interfaz intuitiva con pestañas
 * 
 * @param {DocumentationModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de documentación
 */
const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onAddUrl,
  onAddFiles
}) => {
  // @state: Pestaña activa (urls o files)
  const [activeTab, setActiveTab] = useState<'urls' | 'files'>('urls');
  
  // @state: URL actual en el input
  const [currentUrl, setCurrentUrl] = useState('');
  
  // @state: Lista de URLs pendientes
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  
  // @state: Archivos seleccionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // @state: Estado de drag over
  const [isDragOver, setIsDragOver] = useState(false);
  
  // @state: Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // @state: Estado de carga para subida de archivos
  const [isUploading, setIsUploading] = useState(false);
  
  // @ref: Referencia al input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Valida si una URL es válida
   * @function isValidUrl
   * @param {string} url - URL a validar
   * @returns {boolean} true si la URL es válida
   */
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Añade una URL a la lista pendiente
   * @function addUrl
   */
  const addUrl = () => {
    if (!currentUrl.trim()) {
      setErrors({ url: 'La URL es requerida' });
      return;
    }

    if (!isValidUrl(currentUrl)) {
      setErrors({ url: 'La URL no es válida' });
      return;
    }

    if (pendingUrls.includes(currentUrl)) {
      setErrors({ url: 'Esta URL ya está en la lista' });
      return;
    }

    setPendingUrls([...pendingUrls, currentUrl]);
    setCurrentUrl('');
    setErrors({});
  };

  /**
   * Elimina una URL de la lista pendiente
   * @function removeUrl
   * @param {number} index - Índice de la URL a eliminar
   */
  const removeUrl = (index: number) => {
    setPendingUrls(pendingUrls.filter((_, i) => i !== index));
  };

  /**
   * Valida un archivo antes de añadirlo
   * @function validateFile
   * @param {File} file - Archivo a validar
   * @returns {string | null} Mensaje de error o null si es válido
   */
  const validateFile = (file: File): string | null => {
    // @validation: Tamaño máximo 50MB
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return `${file.name}: El archivo excede el límite de 50MB`;
    }

    // @validation: Tipos de archivo permitidos
    const allowedTypes = [
      // Documentos
      'application/pdf',
      'text/plain',
      'text/csv',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
      'application/vnd.oasis.opendocument.presentation',
      // Imágenes
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Tipo de archivo no permitido`;
    }

    return null;
  };

  /**
   * Maneja la selección de archivos
   * @function handleFileSelection
   * @param {FileList} files - Lista de archivos seleccionados
   */
  const handleFileSelection = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const fileErrors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        fileErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (fileErrors.length > 0) {
      setErrors({ files: fileErrors.join(', ') });
    } else {
      setErrors({});
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  /**
   * Maneja el drag over
   * @function handleDragOver
   * @param {React.DragEvent} e - Evento de drag
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  /**
   * Maneja el drag leave
   * @function handleDragLeave
   * @param {React.DragEvent} e - Evento de drag
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  /**
   * Maneja el drop de archivos
   * @function handleDrop
   * @param {React.DragEvent} e - Evento de drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [selectedFiles]);

  /**
   * Elimina un archivo seleccionado
   * @function removeFile
   * @param {number} index - Índice del archivo a eliminar
   */
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  /**
   * Guarda todos los cambios y cierra el modal
   * @function handleSave
   */
  const handleSave = async () => {
    try {
      setIsUploading(true);
      
      // @action: Añadir URLs pendientes
      pendingUrls.forEach(url => onAddUrl(url));
      
      // @action: Añadir archivos seleccionados
      if (selectedFiles.length > 0) {
        await onAddFiles(selectedFiles);
      }

      // @action: Resetear estado y cerrar
      setPendingUrls([]);
      setSelectedFiles([]);
      setCurrentUrl('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('[DocumentationModal] ❌ Error al guardar:', error);
      // No cerrar el modal si hay error, para que el usuario pueda intentar de nuevo
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Formatea el tamaño de archivo
   * @function formatFileSize
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} Tamaño formateado
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="documentation-modal-backdrop">
      <div className="documentation-modal-container">
        {/* @section: Header del modal */}
        <div className="documentation-modal-header">
          <h3 className="documentation-modal-title">
            <FileText size={20} />
            Gestionar Documentación
          </h3>
          <button onClick={onClose} className="documentation-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* @section: Pestañas de navegación */}
        <div className="documentation-tabs">
          <button
            className={`tab-button ${activeTab === 'urls' ? 'active' : ''}`}
            onClick={() => setActiveTab('urls')}
          >
            <LinkIcon size={16} />
            URLs de Referencia
          </button>
          <button
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <Upload size={16} />
            Archivos
          </button>
        </div>

        {/* @section: Contenido de pestañas */}
        <div className="documentation-content">
          {activeTab === 'urls' && (
            <div className="urls-tab">
              <div className="url-input-section">
                <div className="url-input-group">
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => {
                      setCurrentUrl(e.target.value);
                      setErrors({});
                    }}
                    placeholder="https://ejemplo.com/documento"
                    className={`url-input ${errors.url ? 'error' : ''}`}
                    onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                  />
                  <button onClick={addUrl} className="add-url-btn">
                    <Plus size={16} />
                  </button>
                </div>
                {errors.url && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    {errors.url}
                  </div>
                )}
              </div>

              {pendingUrls.length > 0 && (
                <div className="urls-list">
                  <h4>URLs a añadir:</h4>
                  {pendingUrls.map((url, index) => (
                    <div key={index} className="url-item">
                      <LinkIcon size={14} />
                      <span className="url-text">{url}</span>
                      <button onClick={() => removeUrl(index)} className="remove-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="files-tab">
              {/* @section: Zona de drag & drop */}
              <div
                className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-zone-icon">
                  <Upload size={32} />
                </div>
                <p className="drop-zone-text">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="drop-zone-hint">
                  Máximo 50MB por archivo • PDF, Word, Excel, PowerPoint, Imágenes, Videos, Audio
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
                className="hidden-file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pptm,.odp,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mpeg,.mov,.avi,.webm,.mp3,.wav,.ogg"
              />

              {errors.files && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.files}
                </div>
              )}

              {/* @section: Lista de archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="files-list">
                  <h4>Archivos seleccionados:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <FileText size={16} />
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="remove-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* @section: Botones de acción */}
        <div className="documentation-actions">
          <button 
            onClick={onClose} 
            className="btn-secondary"
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={isUploading || (pendingUrls.length === 0 && selectedFiles.length === 0)}
          >
            {isUploading ? (
              <>
                <Upload size={16} />
                Subiendo...
              </>
            ) : (
              <>
                <Check size={16} />
                Guardar Documentación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;