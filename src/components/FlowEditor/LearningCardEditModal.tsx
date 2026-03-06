import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  BookOpen, 
  Link as LinkIcon, 
  Upload, 
  Plus, 
  Trash2,
  Eye,
  Download,
  Image,
  File,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  Presentation,
  BarChart3,
  Users
} from 'lucide-react';
import { Node } from 'reactflow';
import { LearningCardData } from './types';
import DocumentationModal from './components/DocumentationModal';
import ConfirmationModal from '../ui/ConfirmationModal/ConfirmationModal';
import { obtenerPorId as obtenerLearningCardPorId, actualizar as actualizarLearningCard } from '../../services/learningCardService';
import { UrlLearningCard, obtenerPorLearningCard, crear as crearUrl, eliminar as eliminarUrl } from '../../services/urlLearningCardService';
import './styles/TestingCardEditModal.css';
import './styles/LearningCardEditModal.css';
import { 
  LearningCardDocument, 
  getDocumentsByLearningCard, 
  uploadDocument, 
  deleteDocument, 
  isImage 
} from '../../services/learningCardDocumentService';
import { MetricaTestingCard, obtenerPorTestingCard, actualizarResultado } from '../../services/metricaTestingCardService';
import { obtenerEmpleados } from '../../services/empleadosService';
import { notificacionSiguienteResponsable } from '../../services/notificacionesService';
import { useAuth } from '../../contexts/AuthContext';
import EmpleadoSelector from '../../pages/Proyectos/components/EmpleadoSelector';
import './styles/TestingCardEditModal.css';
import ListItems from '../listItems/ListItems';

// Interface para Empleado
interface Empleado {
  id_empleado: number;
  nombre_pila: string;
  apellido_paterno: string;
  apellido_materno?: string;
  celular?: string;
  correo: string;
  numero_empleado: string;
  activo: boolean;
}

/**
 * Props para el componente LearningCardEditModal
 * @interface LearningCardEditModalProps
 */
interface LearningCardEditModalProps {
  /** Nodo de Learning Card a editar */
  node: Node<LearningCardData>;
  /** Función callback para guardar los cambios */
  onSave: (data: LearningCardData) => void;
  /** Función callback para cerrar el modal */
  onClose: () => void;
  /** ID de la Learning Card a editar */
  editingIdLC: number;
}

/**
 * Modal para editar Learning Cards con sistema completo de documentación
 * 
 * @component LearningCardEditModal
 * @description Componente modal que permite editar todos los aspectos de una Learning Card,
 * incluyendo resultados, hallazgos y documentación (URLs y archivos).
 * Replica la funcionalidad completa del TestingCardEditModal adaptada para Learning Cards.
 * 
 * Características principales:
 * - Formulario completo con validación
 * - Sistema de documentación con URLs y archivos (reutiliza componentes)
 * - Drag & Drop para archivos
 * - Límite de 10MB por archivo
 * - Preview de archivos adjuntos
 * - Responsive design
 * 
 * @param {LearningCardEditModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de edición de Learning Card
 */
const LearningCardEditModal: React.FC<LearningCardEditModalProps> = ({ node, onSave, onClose, editingIdLC }) => {
  // Hook de autenticación para obtener el usuario logueado
  const { user } = useAuth();
  
  // @state: Datos del formulario
  const [formData, setFormData] = useState<LearningCardData>({
    ...node.data,
    resultado: node.data.resultado || '',
    hallazgo: node.data.hallazgo || '',
    estado: node.data.estado || 'ACEPTADA',
    id_responsable: node.data.id_responsable || 0,
  });

  // @state: Loading y feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados locales para links, documentación y archivos adjuntos
  const [documentationUrls, setDocumentationUrls] = useState<UrlLearningCard[]>([]);
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<UrlLearningCard | null>(null);

  // Estados para documentos
  const [documentos, setDocumentos] = useState<LearningCardDocument[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = useState<LearningCardDocument | null>(null);
  const [showDeleteDocumentConfirmation, setShowDeleteDocumentConfirmation] = useState(false);

  // Estados para empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [empleadosError, setEmpleadosError] = useState<string | null>(null);

  // Estados para notificación
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  // Estados para métricas del Testing Card asociado - NUEVO ENFOQUE
  const [metricas, setMetricas] = useState<MetricaTestingCard[]>([]);
  const [loadingMetricas, setLoadingMetricas] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [savingMetrica, setSavingMetrica] = useState<number | null>(null);
  
  // Nuevo estado: mapa de resultados editables por ID único
  const [resultadosEditables, setResultadosEditables] = useState<{[uniqueKey: string]: string}>({});

  // Opciones de estado para la Learning Card
  const statusOptions = [
    { value: 'ACEPTADA', label: 'Aceptada' },
    { value: 'RECHAZADA', label: 'Rechazada' },
    { value: 'REITERAR', label: 'Reiterar' },
    { value: 'MAL PLANTEADA', label: 'Mal planteada' },
  ];

  /**
   * Efecto para cargar datos reales de la BD al abrir el modal
   * @function useEffect
   */
  useEffect(() => {
    const cargarDatos = async () => {
      if (editingIdLC) {
        setLoading(true);
        try {
          // Cargar datos de la Learning Card
          const data = await obtenerLearningCardPorId(editingIdLC);
          setFormData(prevFormData => ({ ...prevFormData, ...data }));
          
        } catch (error) {
          console.error('[LearningCardEditModal] Error al cargar datos:', error);
          setErrorMsg('Error al cargar datos de la Learning Card');
        } finally {
          setLoading(false);
        }
      }
    };
    
    const cargarUrls = async () => {
      if (editingIdLC) {
        setLoadingUrls(true);
        try {
          // Cargar URLs asociadas
          const urlsData = await obtenerPorLearningCard(editingIdLC);
          setDocumentationUrls(urlsData || []);
          
          // Expandir automáticamente la sección de documentación si hay URLs
          if (urlsData && urlsData.length > 0) {
            setShowDocumentation(true);
          }
        } catch (error) {
          console.error('[LearningCardEditModal] Error al cargar URLs:', error);
          setErrorMsg('Error al cargar URLs de la Learning Card');
        } finally {
          setLoadingUrls(false);
        }
      }
    };

    const cargarDocumentos = async () => {
      if (editingIdLC) {
        setLoadingDocumentos(true);
        try {
          const documentosData = await getDocumentsByLearningCard(editingIdLC);
          
          // Validación defensiva: asegurar que documentosData sea un array
          const documentosArray = Array.isArray(documentosData) ? documentosData : [];
          setDocumentos(documentosArray);
          
          // Expandir automáticamente la sección de documentación si hay documentos
          if (documentosArray.length > 0) {
            setShowDocumentation(true);
          }
        } catch (error) {
          console.error('[LearningCardEditModal] Error al cargar documentos:', error);
          setErrorMsg('Error al cargar documentos de la Learning Card');
          // En caso de error, asegurar que documentos sea un array vacío
          setDocumentos([]);
        } finally {
          setLoadingDocumentos(false);
        }
      }
    };
    
    cargarDatos();
    cargarUrls();
    cargarDocumentos();
  }, [editingIdLC]);

  /**
   * Efecto para cargar métricas cuando se abre la sección de métricas
   */
  useEffect(() => {
    if (showMetrics && formData.id_testing_card) {
      cargarMetricas();
    }
  }, [showMetrics, formData.id_testing_card]);

  /**
   * Efecto para cargar empleados al montar el componente
   */
  useEffect(() => {
    cargarEmpleados();
  }, []);

  /**
   * Carga las métricas del Testing Card asociado - NUEVO ENFOQUE
   */
  const cargarMetricas = async () => {
    if (!formData.id_testing_card) {
      console.warn('[cargarMetricas] No hay id_testing_card disponible');
      return;
    }
    
    try {
      setLoadingMetricas(true);
      
      const metricasData = await obtenerPorTestingCard(formData.id_testing_card);
      
      // Validación defensiva
      const metricasArray = Array.isArray(metricasData) ? metricasData : [];
      
      if (metricasArray.length === 0) {
        setMetricas([]);
        setResultadosEditables({});
        return;
      }
      
      // Procesar métricas y crear claves únicas
      const resultadosIniciales: {[uniqueKey: string]: string} = {};
      metricasArray.forEach((metrica, index) => {
        // Crear clave única usando múltiples campos para garantizar unicidad
        const uniqueKey = `${metrica.id_metrica || index}_${metrica.nombre || 'sin_nombre'}_${metrica.id_testing_card}`;
        resultadosIniciales[uniqueKey] = metrica.resultado ? String(metrica.resultado) : '';
      });
      
      setMetricas(metricasArray);
      setResultadosEditables(resultadosIniciales);
      
    } catch (error) {
      setMetricas([]);
      setResultadosEditables({});
    } finally {
      setLoadingMetricas(false);
    }
  };

  /**
   * Genera una clave única para identificar una métrica
   */
  const generarClaveUnicaMetrica = (metrica: MetricaTestingCard, index: number): string => {
    return `${metrica.id_metrica || index}_${metrica.nombre || 'sin_nombre'}_${metrica.id_testing_card}`;
  };

  /**
   * Maneja el cambio en el resultado de una métrica - NUEVO ENFOQUE
   */
  const handleCambioResultadoMetrica = (metrica: MetricaTestingCard, index: number, nuevoValor: string) => {
    const claveUnica = generarClaveUnicaMetrica(metrica, index);
    
    setResultadosEditables(prev => ({
      ...prev,
      [claveUnica]: nuevoValor
    }));
  };

  /**
   * Guarda el resultado de una métrica específica - NUEVO ENFOQUE ROBUSTO
   */
  const guardarResultadoMetricaNuevo = async (metrica: MetricaTestingCard, index: number) => {
    const claveUnica = generarClaveUnicaMetrica(metrica, index);
    const nuevoResultado = resultadosEditables[claveUnica];
    
    // Validaciones iniciales
    if (!metrica) {
      console.error('[guardarResultadoMetricaNuevo] ❌ Métrica no válida');
      setErrorMsg('Error: métrica no válida');
      return;
    }
    
    if (metrica.id_metrica === undefined || metrica.id_metrica === null) {
      console.error('[guardarResultadoMetricaNuevo] ❌ ID de métrica no válido:', metrica.id_metrica);
      setErrorMsg('Error: ID de métrica no válido');
      return;
    }
    
    // Validar que el resultado sea una cadena y no esté vacío
    if (nuevoResultado === undefined || nuevoResultado === null || nuevoResultado.trim() === '') {
      console.error('[guardarResultadoMetricaNuevo] ❌ Resultado no válido o vacío:', nuevoResultado);
      setErrorMsg('Error: el resultado no puede estar vacío');
      return;
    }
    
    // Validar longitud máxima (varchar(30) en la BD)
    if (nuevoResultado.length > 30) {
      console.error('[guardarResultadoMetricaNuevo] ❌ Resultado excede longitud máxima:', nuevoResultado.length);
      setErrorMsg('Error: el resultado no puede exceder 30 caracteres');
      return;
    }
    
    try {
      setSavingMetrica(metrica.id_metrica);
      
      // Llamada a la API - El resultado ahora es varchar(30) en la BD
      await actualizarResultado(metrica.id_metrica, String(nuevoResultado));
      
      // Actualizar el estado local con la métrica actualizada (como string)
      setMetricas(prevMetricas => 
        prevMetricas.map(m => 
          m.id_metrica === metrica.id_metrica 
            ? { ...m, resultado: String(nuevoResultado) }
            : m
        )
      );
      
      setSuccessMsg(`Resultado de métrica "${metrica.nombre}" actualizado exitosamente`);
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (error: any) {
      
      let mensajeError = 'Error al actualizar el resultado de la métrica';
      if (error?.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error?.message) {
        mensajeError = error.message;
      }
      
      setErrorMsg(mensajeError);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSavingMetrica(null);
    }
  };

  /**
   * Renderiza la sección de métricas
   */
  const renderSeccionMetricas = () => {
    if (loadingMetricas) {
      return (
        <div className="metricas-loading">
          Cargando métricas...
        </div>
      );
    }

    if (metricas.length === 0) {
      return (
        <div className="metricas-empty">
          No hay métricas definidas para el Testing Card asociado
        </div>
      );
    }

    return (
      <div className="metricas-list">
        {metricas.map((metrica, index) => {
          const claveUnica = generarClaveUnicaMetrica(metrica, index);
          const valorActual = resultadosEditables[claveUnica] || '';
          const estaGuardando = savingMetrica === metrica.id_metrica;
          
          return (
          <div key={claveUnica} className="metrica-item">
            <div className="metrica-header">
              <BarChart3 size={16} />
              <span className="metrica-nombre">
                {metrica.nombre}
              </span>
              <span className="metrica-criterio">
                {metrica.operador} {metrica.criterio}
              </span>
            </div>
            
            <div className="metrica-resultado">
              <label>
                Resultado obtenido:
              </label>
              <div className="metrica-resultado-input-container">
                <input
                  type="text"
                  value={valorActual}
                  onChange={(e) => handleCambioResultadoMetrica(metrica, index, e.target.value)}
                  placeholder="Ingresa el resultado obtenido..."
                  disabled={estaGuardando}
                />
                <button
                  type="button"
                  onClick={() => guardarResultadoMetricaNuevo(metrica, index)}
                  disabled={estaGuardando}
                  className="metrica-guardar-btn"
                >
                  {estaGuardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
            
            {metrica.resultado && (
              <div className="metrica-resultado-actual">
                <strong>Resultado actual:</strong> {metrica.resultado}
              </div>
            )}
          </div>
          );
        })}
      </div>
    );
  };

  // Funciones para manejar URLs
  const addDocumentationUrl = async (url: string) => {
    try {
      const nuevaUrl = await crearUrl({
        id_learning_card: editingIdLC,
        url: url
      });
      setDocumentationUrls(prev => [...prev, nuevaUrl]);
      setSuccessMsg('URL agregada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('[LearningCardEditModal] Error al agregar URL:', error);
      setErrorMsg('Error al agregar la URL');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleDeleteUrl = (urlObj: UrlLearningCard) => {
    setUrlToDelete(urlObj);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteUrl = async () => {
    if (urlToDelete) {
      try {
        await eliminarUrl(urlToDelete.id_url_lc);
        setDocumentationUrls(prev => prev.filter(url => url.id_url_lc !== urlToDelete.id_url_lc));
        setSuccessMsg('URL eliminada exitosamente');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error) {
        console.error('[LearningCardEditModal] Error al eliminar URL:', error);
        setErrorMsg('Error al eliminar la URL');
        setTimeout(() => setErrorMsg(''), 3000);
      }
    }
    setShowDeleteConfirmation(false);
    setUrlToDelete(null);
  };

  const removeDocumentationUrl = (index: number) => {
    const urlObj = documentationUrls[index];
    handleDeleteUrl(urlObj);
  };

  /**
   * Obtiene el icono de Lucide para un tipo de documento
   */
  const getDocumentIconComponent = (mimeType: string | undefined | null) => {
    // Validación defensiva: si mimeType es undefined, null o vacío, usar icono por defecto
    if (!mimeType || typeof mimeType !== 'string') {
      console.warn('[LearningCardEditModal] mimeType inválido o undefined:', mimeType);
      return File;
    }

    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType.includes('word')) return File;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return FileSpreadsheet;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return Presentation;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.startsWith('audio/')) return FileAudio;
    return File;
  };

  /**
   * Trunca nombres de documento para mejor legibilidad
   */
  const truncateDocumentName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name;
    
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const maxNameLength = maxLength - extension!.length - 4; // 4 para "..." y "."
    
    return `${nameWithoutExt.substring(0, maxNameLength)}...${extension}`;
  };

  /**
   * Maneja la visualización de un documento
   */
  const handleViewDocument = (documento: LearningCardDocument) => {
    // Validación defensiva del document_type
    const documentType = documento.document_type || '';
    
    if (isImage(documentType) || documentType === 'application/pdf') {
      // Abrir en nueva pestaña para PDFs e imágenes
      window.open(documento.document_url, '_blank');
    } else {
      // Descargar directamente para otros tipos
      handleDownloadDocument(documento);
    }
  };

  /**
   * Maneja la descarga de un documento
   */
  const handleDownloadDocument = (documento: LearningCardDocument) => {
    const link = document.createElement('a');
    link.href = documento.document_url;
    link.download = documento.document_name;
    link.click();
  };

  /**
   * Maneja la eliminación de un documento
   */
  const handleDeleteDocument = (documento: LearningCardDocument) => {
    setDocumentoAEliminar(documento);
    setShowDeleteDocumentConfirmation(true);
  };

  /**
   * Confirma la eliminación de un documento
   */
  const confirmDeleteDocument = async () => {
    if (documentoAEliminar) {
      try {
        await deleteDocument(documentoAEliminar.id);
        
        // Actualizar la lista eliminando el documento
        setDocumentos(prev => prev.filter(doc => doc.id !== documentoAEliminar.id));
        
        setSuccessMsg('Documento eliminado exitosamente');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error: any) {
        
        // Mostrar mensaje de error más específico
        let errorMessage = 'Error al eliminar documento';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        
        setErrorMsg(errorMessage);
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
    setShowDeleteDocumentConfirmation(false);
    setDocumentoAEliminar(null);
  };

  /**
   * Renderiza la lista de documentos cargados desde la base de datos
   */
  const renderDocumentos = () => {
    if (loadingDocumentos) {
      return (
        <div className="documentos-loading">
          Cargando documentos...
        </div>
      );
    }

    // Validación defensiva: asegurar que documentos sea un array
    if (!Array.isArray(documentos) || documentos.length === 0) {
      return (
        <div className="documentos-empty">
          No hay documentos registrados para esta Learning Card
        </div>
      );
    }

    return (
      <div className="documentos-list">
        {documentos.map((documento) => {
          // Validación defensiva: asegurar que el documento tenga todas las propiedades necesarias
          if (!documento || !documento.id || !documento.document_name) {
            console.warn('[LearningCardEditModal] Documento inválido encontrado:', documento);
            return null; // No renderizar documentos inválidos
          }

          const IconComponent = getDocumentIconComponent(documento.document_type);
          
          return (
            <div key={documento.id} className="documento-item">
              <div className="documento-item-info">
                <IconComponent size={16} />
                <span 
                  className="documento-item-name"
                  onClick={() => handleViewDocument(documento)}
                  title={documento.document_name}
                >
                  {truncateDocumentName(documento.document_name)}
                </span>
              </div>
              <div className="documento-item-actions">
                <button
                  type="button"
                  onClick={() => handleViewDocument(documento)}
                  className="documento-action-btn view"
                  title="Ver documento"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(documento)}
                  className="documento-action-btn download"
                  title="Descargar documento"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(documento)}
                  className="documento-action-btn delete"
                  title="Eliminar documento"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const addDocumentationFiles = async (files: File[]) => {
    try {
      setLoadingDocumentos(true);
      
      // Subir cada archivo individualmente
      const uploadPromises = files.map(async (file) => {
        try {
          const documentoSubido = await uploadDocument(editingIdLC, file);
          return documentoSubido;
        } catch (error) {
          throw error;
        }
      });

      // Esperar a que todos los archivos se suban
      const documentosSubidos = await Promise.all(uploadPromises);
      
      // Actualizar la lista de documentos con los nuevos documentos
      setDocumentos(prev => [...prev, ...documentosSubidos]);
      
      setSuccessMsg(`${documentosSubidos.length} archivo(s) subido(s) exitosamente`);
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (error) {
      setErrorMsg('Error al subir los archivos');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoadingDocumentos(false);
    }
  };
  
  // Validación y submit
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Añadir validaciones básicas si es necesario
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Carga la lista de empleados
   * @function cargarEmpleados
   */
  const cargarEmpleados = async () => {
    setLoadingEmpleados(true);
    setEmpleadosError(null);
    try {
      const data = await obtenerEmpleados();
      setEmpleados(data);
    } catch (error: any) {
      setEmpleadosError('Error al cargar empleados');
    } finally {
      setLoadingEmpleados(false);
    }
  };

  /**
   * Obtiene el nombre completo de un empleado
   * @function getNombreCompleto
   * @param {Empleado} empleado - Objeto empleado
   * @returns {string} Nombre completo del empleado
   */
  const getNombreCompleto = (empleado: Empleado) => {
    return `${empleado.nombre_pila} ${empleado.apellido_paterno}${empleado.apellido_materno ? ' ' + empleado.apellido_materno : ''}`;
  };

  /**
   * Obtiene las iniciales de un empleado
   * @function getIniciales
   * @param {Empleado} empleado - Objeto empleado
   * @returns {string} Iniciales del empleado
   */
  const getIniciales = (empleado: Empleado) => {
    const nombres = [empleado.nombre_pila, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean);
    return nombres.map(n => (n ? n[0] : '')).join('').toUpperCase();
  };

  const avatarColors = [
    '#6C63FF', '#FF6584', '#43E6FC', '#FFD166', '#06D6A0', '#FFB5E8', '#B5FFFC', '#B5FFD6', '#B5B5FF', '#FFB5B5'
  ];

  /**
   * Obtiene el color del avatar según el índice
   * @function getAvatarColor
   * @param {number} index - Índice del empleado
   * @returns {string} Color del avatar
   */
  const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

  /**
   * Maneja el envío de notificación al siguiente responsable
   * @function handleEnviarNotificacion
   */
  const handleEnviarNotificacion = async () => {
    if (!formData.id_responsable || !editingIdLC) {
      setErrorMsg('Debe seleccionar un responsable antes de enviar la notificación');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    // Obtener el ID del empleado logueado desde el contexto de autenticación
    if (!user?.id_empleado) {
      setErrorMsg('No se pudo identificar al usuario actual. Inicie sesión nuevamente.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    try {
      setSendingNotification(true);
      
      await notificacionSiguienteResponsable({
        id_empleado: formData.id_responsable,
        id_learning_card: editingIdLC,
        id_empleado_remitente: user.id_empleado
      });

      setSuccessMsg('Notificación enviada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowNotificationModal(false);
      
    } catch (error: any) {
      console.error('[LearningCardEditModal] Error al enviar notificación:', error);
      
      let errorMessage = 'Error al enviar la notificación';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setErrorMsg(errorMessage);
      setTimeout(() => setErrorMsg(''), 5000);
      setShowNotificationModal(false);
    } finally {
      setSendingNotification(false);
    }
  };

  /**
   * Maneja el envío del formulario
   * @function handleSubmit
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      // Limpiar payload: solo enviar campos válidos al backend
      const {
        id_learning_card,
        id_testing_card,
        resultado,
        hallazgo,
        estado,
        id_responsable,
      } = formData;
      
      const payload = {
        ...formData,
        id_learning_card: id_learning_card,
        id_testing_card: id_testing_card,
        resultado: resultado?.trim() || '',
        hallazgo: hallazgo?.trim() || '',
        estado: estado || 'ACEPTADA',
        id_responsable: id_responsable || 0,
      };
      
      try {
        await actualizarLearningCard(editingIdLC, payload);
        setSuccessMsg('¡Learning Card guardada exitosamente!');
        onSave(payload); // Notifica al padre
      } catch (err: any) {
        // Mostrar mensaje detallado del backend si existe
        let backendMsg = 'Error al guardar Learning Card en la base de datos';
        if (err?.response?.data?.detail) {
          backendMsg = err.response.data.detail;
        } else if (err?.message) {
          backendMsg = err.message;
        }
        setErrorMsg(backendMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Efecto para manejar el cierre del modal con tecla ESC
   * @function useEffect
   */
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="testing-modal-backdrop" onClick={(e) => e.stopPropagation()}>
      <div className="testing-modal-container">
        {/* @section: Header del modal */}
        <div className="testing-modal-header">
          <div className="learning-modal-header-content">
            <div className="testing-modal-icon">
              <BookOpen size={20} />
            </div>
            <h2 className="testing-modal-title">Editar Learning Card</h2>
          </div>
          <button onClick={onClose} className="testing-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="testing-modal-form">
          {loading && <div className="testing-form-loading">Cargando...</div>}
          {successMsg && <div className="testing-form-success">{successMsg}</div>}
          {errorMsg && <div className="testing-form-error">{errorMsg}</div>}

          {/* @section: Estado de la Learning Card */}
          <div className="testing-form-group">
            <label htmlFor="estado" className="testing-form-label">
              Estado de la Learning Card
            </label>
            <select
              id="estado"
              value={formData.estado ?? ''}
              onChange={e => setFormData({ ...formData, estado: e.target.value as any })}
              className="learning-status-select"
            >
              <option value="">Selecciona estado</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>



        {/* @section: Resultados obtenidos */}
          <div className="testing-form-group">
            <label htmlFor="result" className="testing-form-label">
              <FileText className="testing-form-icon" />
              Resultados Obtenidos (observamos...)
            </label>
            <textarea
              id="result"
              value={formData.resultado ?? ''}
              onChange={(e) => setFormData({...formData, resultado: e.target.value})}
              className={`testing-input textarea ${errors.resultado ? 'input-error' : ''}`}
              placeholder="Resultados Obtenidos (observamos...)"
              rows={3}
            />
            {errors.resultado && <span className="testing-error-text">{errors.resultado}</span>}
          </div>










          {/* @section: Hallazgo accionable */}
      {/*     <div className="testing-form-group">
            <label htmlFor="insight" className="testing-form-label">
              <FileText className="testing-form-icon" />
              Hallazgo Accionable (por ende, haremos...)
            </label>
            <textarea
              id="insight"
              value={formData.hallazgo ?? ''}
              onChange={(e) => setFormData({ ...formData, hallazgo: e.target.value })}
              className={`testing-input textarea ${errors.hallazgo ? 'input-error' : ''}`}
              placeholder="Hallazgo Accionable (por ende, haremos...)"
              rows={3}
            />
            {errors.hallazgo && <span className="testing-error-text">{errors.hallazgo}</span>}
          </div> */}

        <ListItems/>

          {/* @section: Métricas del Testing Card asociado */}
          <div className="testing-form-section">
            <button
              type="button"
              className="testing-form-section-toggle"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              <span className={`toggle-icon${showMetrics ? ' open' : ''}`}>▼</span>
              <span>Métricas del Testing Card</span>
              {metricas.length > 0 && (
                <span className="badge-counter">
                  {metricas.length} métrica{metricas.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>

            {showMetrics && (
              <div className="testing-form-section-content">
                <div className="documentation-subsection">
                  <h4 className="subsection-title">
                    <BarChart3 size={14} />
                    Resultados de Métricas
                    {metricas.length > 0 && (
                      <span className="badge-counter-small">
                        {metricas.length}
                      </span>
                    )}
                  </h4>
                  <p className="subsection-description">
                    Actualiza los resultados obtenidos para cada métrica del Testing Card asociado:
                  </p>
                  {renderSeccionMetricas()}
                </div>
              </div>
            )}
          </div>

          {/* @section: Documentación expandible */}
          <div className="testing-form-section">
            <button
              type="button"
              className="testing-form-section-toggle"
              onClick={() => setShowDocumentation(!showDocumentation)}
            >
              <span className={`toggle-icon${showDocumentation ? ' open' : ''}`}>▼</span>
              <span>Documentación</span>
              {(documentationUrls.length > 0 || documentos.length > 0) && (
                <span className="badge-counter">
                  {documentationUrls.length + documentos.length} elemento{(documentationUrls.length + documentos.length) !== 1 ? 's' : ''}
                </span>
              )}
            </button>

            {showDocumentation && (
              <div className="testing-form-section-content">
                {/* @subsection: URLs de documentación */}
                <div className="documentation-subsection">
                  <h4 className="subsection-title">
                    <LinkIcon size={14} />
                    URLs de Referencia
                    {documentationUrls.length > 0 && (
                      <span className="badge-counter-small">
                        {documentationUrls.length}
                      </span>
                    )}
                  </h4>

                  {loadingUrls && (
                    <div className="loading-urls">
                      Cargando URLs...
                    </div>
                  )}

                  {!loadingUrls && documentationUrls.length === 0 && (
                    <div className="no-urls">
                      No hay URLs registradas para esta Learning Card
                    </div>
                  )}

                  {!loadingUrls && documentationUrls.length > 0 && (
                    <div className="urls-list">
                      {documentationUrls.map((urlObj, index) => (
                        <div key={urlObj.id_url_lc} className="url-item">
                          <a href={urlObj.url} target="_blank" rel="noopener noreferrer" className="url-link">
                            {urlObj.url}
                          </a>
                          <button
                            type="button"
                            className="testing-remove-btn"
                            onClick={() => removeDocumentationUrl(index)}
                            title="Eliminar URL"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="testing-add-btn"
                    onClick={() => setIsDocumentationModalOpen(true)}
                  >
                    <Plus size={14} />
                    Añadir URL
                  </button>
                </div>

                {/* @subsection: Archivos adjuntos */}
                <div className="documentation-subsection">
                  <h4 className="subsection-title">
                    <Upload size={14} />
                    Archivos Adjuntos
                    {documentos.length > 0 && (
                      <span className="badge-counter-small">
                        {documentos.length}
                      </span>
                    )}
                  </h4>

                  {/* Mostrar documentos cargados desde la base de datos */}
                  {renderDocumentos()}

                  <button
                    type="button"
                    className="testing-add-btn"
                    onClick={() => setIsDocumentationModalOpen(true)}
                    disabled={loadingDocumentos}
                  >
                    <Upload size={14} />
                    {loadingDocumentos ? 'Subiendo...' : 'Cargar Archivos'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* @section: Responsable */}
          <div className="testing-form-group">
            <label htmlFor="id_responsable" className="testing-form-label">
              <Users className="testing-form-icon" />
              Seleccionar siguiente responsable
              {empleados.length > 0 && formData.id_responsable ? (
                (() => {
                  const emp = empleados.find(e => e.id_empleado === formData.id_responsable);
                  return emp ? (
                    <span className="responsable-selected-label">
                      (Seleccionado: {getNombreCompleto(emp)})
                    </span>
                  ) : null;
                })()
              ) : null}
            </label>
            {/* Selector de responsable (empleado) */}
            <EmpleadoSelector
              empleados={empleados}
              loading={loadingEmpleados}
              loadingEmpleados={loadingEmpleados}
              errors={{...errors, empleados: empleadosError || ''}}
              selectedId={formData.id_responsable}
              onSelect={(id: number) => setFormData({ ...formData, id_responsable: id })}
              cargarEmpleados={cargarEmpleados}
              getNombreCompleto={getNombreCompleto}
              getIniciales={getIniciales}
              getAvatarColor={getAvatarColor}
              hideLabel={true}
            />
            
            {/* Botón de notificar */}
            {formData.id_responsable && (
              <button
                type="button"
                onClick={() => setShowNotificationModal(true)}
                className="notificar-btn"
              >
                <Users size={16} />
                Notificar responsable
              </button>
            )}
          </div>

          {/* @section: Botones de acción */}
          <div className="testing-form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="learning-btn-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="learning-btn-submit"
            >
              <Save className="testing-btn-icon" />
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* @component: Modal de documentación reutilizado */}
        {isDocumentationModalOpen && (
          <DocumentationModal
            isOpen={isDocumentationModalOpen}
            onClose={() => setIsDocumentationModalOpen(false)}
            onAddUrl={addDocumentationUrl}
            onAddFiles={addDocumentationFiles}
          />
        )}

        {/* @component: Modal de confirmación para eliminar URL */}
        {showDeleteConfirmation && (
          <ConfirmationModal
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={confirmDeleteUrl}
            title="Eliminar URL"
            message={`¿Estás seguro que deseas eliminar esta URL?\n\n${urlToDelete?.url}`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
          />
        )}

        {/* @component: Modal de confirmación para eliminar documento */}
        {showDeleteDocumentConfirmation && (
          <ConfirmationModal
            isOpen={showDeleteDocumentConfirmation}
            onClose={() => setShowDeleteDocumentConfirmation(false)}
            onConfirm={confirmDeleteDocument}
            title="Eliminar Documento"
            message={`¿Estás seguro que deseas eliminar este documento?\n\n${documentoAEliminar?.document_name}\n\nEsta acción no se puede deshacer.`}
            confirmText="Eliminar"
            cancelText="Cancelar"
            type="danger"
          />
        )}

        {/* @component: Modal de confirmación para enviar notificación */}
        {showNotificationModal && (
          <ConfirmationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            onConfirm={handleEnviarNotificacion}
            title="Enviar Notificación"
            message={`¿Estás seguro que deseas enviar una notificación por correo electrónico al siguiente responsable?\n\n${empleados.find(e => e.id_empleado === formData.id_responsable)?.correo || 'Responsable seleccionado'}\n\nSe enviará un correo informando sobre la asignación de esta Learning Card.`}
            confirmText={sendingNotification ? "Enviando..." : "Enviar Notificación"}
            cancelText="Cancelar"
            type="info"
            isLoading={sendingNotification}
          />
        )}
      </div>
    </div>
  );
};

export default LearningCardEditModal;