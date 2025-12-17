import React, { useState, useEffect } from 'react';
import styles from './Formatos.module.css';
import DocumentationModal from '../../components/FlowEditor/components/DocumentationModal';
import SaveDocumentationModal from '../../components/SaveDocumentationModal/SaveDocumentationModal';
import { 
  uploadFormatoDocument, 
  getFormatoDocuments,
  FormatoDocument
} from '../../services/formatoDocumentService';
import { 
  obtenerTodas, 
  crear, 
  UrlFormato 
} from '../../services/urlFormatoService';

const Formatos: React.FC = () => {
  // Estados para gestionar documentos y modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ type: 'file' | 'url', data: File | string, name: string } | null>(null);
  const [documentos, setDocumentos] = useState<FormatoDocument[]>([]);
  const [urlFormatos, setUrlFormatos] = useState<UrlFormato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar documentos y URLs al montar el componente
  useEffect(() => {
    loadDocumentos();
    loadUrlFormatos();
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
      console.log('[Formatos] Datos recibidos:', docs);
      console.log('[Formatos] Tipo de datos:', typeof docs, Array.isArray(docs));
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
   * Carga todas las URLs de formato
   */
  const loadUrlFormatos = async () => {
    try {
      console.log('[Formatos] Cargando URLs...');
      
      const urls = await obtenerTodas();
      console.log('[Formatos] URLs recibidas:', urls);
      setUrlFormatos(urls);
      
      console.log('[Formatos] ✅ URLs cargadas:', urls.length);
    } catch (err: any) {
      console.error('[Formatos] ❌ Error al cargar URLs:', err);
    }
  };

  /**
   * Maneja la selección de archivos desde el modal de documentación
   * Abre el modal de guardado para cada archivo
   */
  const handleAddFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Por ahora, tomamos el primer archivo (puedes ajustar para múltiples archivos)
    const file = files[0];
    setPendingItem({ type: 'file', data: file, name: file.name });
    setIsModalOpen(false);
    setIsSaveModalOpen(true);
  };

  /**
   * Maneja la adición de URL desde el modal de documentación
   * Abre el modal de guardado
   */
  const handleAddUrl = (url: string) => {
    setPendingItem({ type: 'url', data: url, name: url });
    setIsModalOpen(false);
    setIsSaveModalOpen(true);
  };

  /**
   * Guarda el archivo o URL con la categoría y descripción proporcionadas
   */
  const handleSaveDocumentation = async (categoria: string, descripcion?: string) => {
    if (!pendingItem) return;

    try {
      if (pendingItem.type === 'file') {
        console.log('[Formatos] Subiendo archivo:', pendingItem.name);
        // Nota: Aquí necesitarías modificar uploadFormatoDocument para aceptar categoría
        // Por ahora, subiremos el archivo como está
        await uploadFormatoDocument(pendingItem.data as File);
        console.log('[Formatos] ✅ Archivo subido');
        await loadDocumentos();
      } else {
        console.log('[Formatos] Guardando URL:', pendingItem.data);
        await crear({ 
          url: pendingItem.data as string, 
          categoria: categoria,
          descripcion: descripcion 
        });
        console.log('[Formatos] ✅ URL guardada');
        await loadUrlFormatos();
      }
      
      setPendingItem(null);
    } catch (err: any) {
      console.error('[Formatos] ❌ Error al guardar:', err);
      setError(`Error al guardar: ${err.message}`);
      throw err;
    }
  };

  return (
    <div className={styles['formatos-container']}>
      <div className={styles['formatos-content']}>
        <h1 className={styles['formatos-title']}>Formatos</h1>
        <p className={styles['formatos-description']}>
          Gestión de formatos de documentos y archivos. Aquí podrás administrar los diferentes tipos de formato soportados en el sistema.
        </p>
        
        <div className={styles['formatos-actions']} style={{ marginBottom: '20px' }}>
          <button 
            className={styles['add-formato-btn']}
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
            style={{
              backgroundColor: 'var(--color-primary-purple)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'color-mix(in srgb, var(--color-primary-purple) 90%, black)'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-purple)'}
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

        {/* Grid de documentos y URLs */}
        <div className={styles['formatos-grid']}>
          {loading ? (
            <div className={styles['loading-message']}>
              <i className="fas fa-spinner fa-spin"></i>
              Cargando formatos...
            </div>
          ) : documentos.length === 0 && urlFormatos.length === 0 ? (
            <div className={styles['empty-message']}>
              <i className="fas fa-file"></i>
              <h3>No hay formatos disponibles</h3>
              <p>Haz clic en "Agregar Formato" para subir tu primer documento o URL.</p>
            </div>
          ) : (
            <>
              {/* Renderizar documentos */}
              {documentos.map((documento) => (
                <div 
                  key={`doc-${documento.id}`} 
                  className={styles['formato-card']}
                  onClick={() => window.open(documento.document_url, '_blank')}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className={styles['formato-info']}>
                    <h4 className={styles['formato-name']} title={documento.document_name}>
                      <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
                      {documento.document_name}
                    </h4>
                  </div>
                </div>
              ))}

              {/* Renderizar URLs */}
              {urlFormatos.map((urlFormato) => (
                <div 
                  key={`url-${urlFormato.id_url_formato}`} 
                  className={styles['formato-card']}
                  onClick={() => window.open(urlFormato.url, '_blank')}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className={styles['formato-info']}>
                    <h4 className={styles['formato-name']} title={urlFormato.url}>
                      <i className="fas fa-link" style={{ marginRight: '8px' }}></i>
                      {urlFormato.url}
                    </h4>
                  </div>
                </div>
              ))}
            </>
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

      {/* Modal para guardar con categoría y descripción */}
      <SaveDocumentationModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setPendingItem(null);
        }}
        onSave={handleSaveDocumentation}
        itemType={pendingItem?.type || 'file'}
        itemName={pendingItem?.name || ''}
      />
    </div>
  );
};

export default Formatos;