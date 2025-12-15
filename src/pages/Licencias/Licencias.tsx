import React, { useState, useEffect } from 'react';
import styles from './Licencias.module.css';
import DocumentationModal from '../../components/FlowEditor/components/DocumentationModal';
import { 
  uploadFormatoDocument, 
  getFormatoDocuments, 
  deleteFormatoDocument,
  FormatoDocument,
  getDocumentIcon,
  getFileExtension,
  isImage
} from '../../services/formatoDocumentService';

const Formatos: React.FC = () => {
  // Estados para gestionar documentos y modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentos, setDocumentos] = useState<FormatoDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocumentos();
  }, []);

  /**
   * Carga todos los documentos de formato
   */
  const loadDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Formatos] Cargando documentos...');
      
      const docs = await getFormatoDocuments();
      setDocumentos(docs);
      
      console.log('[Formatos] ✅ Documentos cargados:', docs.length);
    } catch (err: any) {
      console.error('[Formatos] ❌ Error al cargar documentos:', err);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la subida de archivos desde el modal
   */
  const handleAddFiles = async (files: File[]) => {
    try {
      console.log('[Formatos] Subiendo archivos:', files.length);
      
      // Subir cada archivo individualmente
      for (const file of files) {
        console.log('[Formatos] Subiendo archivo:', file.name);
        await uploadFormatoDocument(file);
      }
      
      console.log('[Formatos] ✅ Todos los archivos subidos');
      
      // Recargar la lista de documentos
      await loadDocumentos();
      
    } catch (err: any) {
      console.error('[Formatos] ❌ Error al subir archivos:', err);
      throw new Error(`Error al subir archivos: ${err.message}`);
    }
  };

  /**
   * Maneja la adición de URLs (no implementado para formatos)
   */
  const handleAddUrl = (url: string) => {
    console.log('[Formatos] URLs no soportadas en formatos:', url);
  };

  /**
   * Elimina un documento de formato
   */
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      console.log('[Formatos] Eliminando documento:', documentId);
      await deleteFormatoDocument(documentId);
      console.log('[Formatos] ✅ Documento eliminado');
      
      // Recargar la lista
      await loadDocumentos();
    } catch (err: any) {
      console.error('[Formatos] ❌ Error al eliminar documento:', err);
      setError(`Error al eliminar documento: ${err.message}`);
    }
  };

  /**
   * Obtiene la vista previa de un documento
   */
  const renderDocumentPreview = (documento: FormatoDocument) => {
    const mimeType = documento.document_type;
    
    if (isImage(mimeType)) {
      return (
        <div className={styles['documento-preview']}>
          <img 
            src={documento.document_url} 
            alt={documento.document_name}
            className={styles['preview-image']}
          />
        </div>
      );
    }
    
    return (
      <div className={styles['documento-icon']}>
        <i className={getDocumentIcon(mimeType)}></i>
      </div>
    );
  };

  return (
    <div className={styles['formatos-container']}>
      <div className={styles['formatos-content']}>
        <h1 className={styles['formatos-title']}>Formatos</h1>
        <p className={styles['formatos-description']}>
          Gestión de formatos de documentos y archivos. Aquí podrás administrar los diferentes tipos de formato soportados en el sistema.
        </p>
        
        <div className={styles['formatos-actions']}>
          <button 
            className={styles['add-formato-btn']}
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
          >
            <i className="fas fa-plus"></i>
            {loading ? 'Cargando...' : 'Agregar Formato'}
          </button>
        </div>

        {/* Mostrar errores */}
        {error && (
          <div className={styles['error-message']}>
            <i className="fas fa-exclamation-triangle"></i>
            {error}
            <button onClick={() => setError(null)} className={styles['error-close']}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Grid de documentos */}
        <div className={styles['formatos-grid']}>
          {loading ? (
            <div className={styles['loading-message']}>
              <i className="fas fa-spinner fa-spin"></i>
              Cargando documentos...
            </div>
          ) : documentos.length === 0 ? (
            <div className={styles['empty-message']}>
              <i className="fas fa-file"></i>
              <h3>No hay formatos disponibles</h3>
              <p>Haz clic en "Agregar Formato" para subir tu primer documento.</p>
            </div>
          ) : (
            documentos.map((documento) => (
              <div key={documento.id} className={styles['formato-card']}>
                {renderDocumentPreview(documento)}
                
                <div className={styles['formato-info']}>
                  <h4 className={styles['formato-name']} title={documento.document_name}>
                    {documento.document_name}
                  </h4>
                  <p className={styles['formato-type']}>
                    {getFileExtension(documento.document_name).toUpperCase()}
                  </p>
                  <p className={styles['formato-date']}>
                    {new Date(documento.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className={styles['formato-actions']}>
                  <a
                    href={documento.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles['action-btn']}
                    title="Descargar"
                  >
                    <i className="fas fa-download"></i>
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(documento.id)}
                    className={styles['action-btn'] + ' ' + styles['delete-btn']}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para subir documentos */}
      <DocumentationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUrl={handleAddUrl}
        onAddFiles={handleAddFiles}
      />
    </div>
  );
};

export default Formatos;