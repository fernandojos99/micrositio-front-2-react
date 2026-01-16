import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  FileText, 
  Tag, 
  ClipboardList, 
  ChevronDown,
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
  Presentation
} from 'lucide-react';
import { Node } from 'reactflow';
import { TestingCardData } from './types';
import DocumentationModal from './components/DocumentationModal';
import EmpleadoSelector from '../../pages/Proyectos/components/EmpleadoSelector';
import { Empleado, obtenerEmpleados } from '../../services/empleadosService';
import { obtenerTestingCardPorId, actualizarTestingCard } from '../../services/testingCardService';
import { MetricaTestingCard, obtenerPorTestingCard, eliminar, crear } from '../../services/metricaTestingCardService';
import { UrlTestingCard, obtenerPorTestingCard as obtenerUrlsPorTestingCard, crear as crearUrl, eliminar as eliminarUrl } from '../../services/urlTestingCardService';
import { TestingCardDocument, getDocumentsByTestingCard, deleteDocument, isImage, uploadDocument } from '../../services/testingCardDocumentService';
import TestingCardPlaybookService from '../../services/TestingCardPlaybookService';
import { TestingCardPlaybook } from '../../types/testingCardPlaybook';
import './styles/TestingCardEditModal.css';

/**
 * Interfaz extendida para métricas con propiedad adicional del frontend
 */
interface MetricaWithFrontendProps extends MetricaTestingCard {
  needsCreation?: boolean; // Propiedad adicional para marcar si necesita ser creada en BD
}

/**
 * Props para el componente TestingCardEditModal
 * @interface TestingCardEditModalProps
 */
interface TestingCardEditModalProps {
  /** Nodo de Testing Card a editar */
  node: Node<TestingCardData>;
  /** Función callback para guardar los cambios */
  onSave: (data: TestingCardData) => void;
  /** Función callback para cerrar el modal */
  onClose: () => void;
  editingId: number; // <-- Nuevo prop
}

/**
 * Modal para editar Testing Cards con sistema de documentación completo
 * 
 * @component TestingCardEditModal
 * @description Componente modal que permite editar todos los aspectos de una Testing Card,
 * incluyendo información básica, métricas, criterios, colaboradores y documentación (URLs y archivos).
 * 
 * Características principales:
 * - Formulario completo con validación
 * - Sistema de colaboradores con búsqueda typeahead
 * - Sistema de documentación con URLs y archivos
 * - Secciones colapsables para mejor organización
 * - Drag & Drop para archivos
 * - Límite de 10MB por archivo
 * - Preview de archivos adjuntos
 * - Responsive design
 * 
 * @param {TestingCardEditModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de edición de Testing Card
 */
const TestingCardEditModal: React.FC<TestingCardEditModalProps> = ({ node, onSave, onClose, editingId }) => {
  // @state: Datos del formulario
  const [formData, setFormData] = useState<TestingCardData & { metricas?: MetricaWithFrontendProps[] }>(() => {
    console.log('[TestingCardEditModal] Inicializando formData con node.data:', node.data);
    console.log('[TestingCardEditModal] id_experimento_tipo inicial:', node.data.id_experimento_tipo);
    
    return {
      ...node.data,
      titulo: node.data.titulo || '',
      hipotesis: node.data.hipotesis || '',
      descripcion: node.data.descripcion || '',
      dia_inicio: node.data.dia_inicio || '',
      dia_fin: node.data.dia_fin || '',
      id_responsable: typeof node.data.id_responsable === 'number' ? node.data.id_responsable : 0,
      id_experimento_tipo: typeof node.data.id_experimento_tipo === 'number' ? node.data.id_experimento_tipo : 0,
      status: node.data.status || 'EN VALIDACION',
      metricas: node.data.metricas || [],
      documentationUrls: node.data.documentationUrls || [],
      attachments: node.data.attachments || [],
      collaborators: node.data.collaborators || [],
    };
  });
  // @state: Loading y feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // @state: Control de secciones expandibles
  const [showMetrics, setShowMetrics] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  
  // @state: Control del modal de documentación
  const [isDocumentationModalOpen, setIsDocumentationModalOpen] = useState(false);
  
  // @state: Lista de empleados para el selector de líder
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  // @state: Loading para empleados
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  // @state: Error al cargar empleados
  const [empleadosError, setEmpleadosError] = useState<string | null>(null);

  // @state: Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // @state: Loading para métricas
  const [loadingMetricas, setLoadingMetricas] = useState(false);

  // @state: Modal de confirmación para eliminar métrica
  const [metricaAEliminar, setMetricaAEliminar] = useState<{index: number, metrica: any} | null>(null);

  // @state: Modal de confirmación para crear métrica
  const [metricaACrear, setMetricaACrear] = useState<{index: number, metrica: any} | null>(null);

  // @state: Estados para URLs de documentación
  const [documentationUrls, setDocumentationUrls] = useState<UrlTestingCard[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [showDeleteUrlConfirmation, setShowDeleteUrlConfirmation] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<UrlTestingCard | null>(null);
  
  // Estado para los documentos
  const [documentos, setDocumentos] = useState<TestingCardDocument[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = useState<TestingCardDocument | null>(null);
  const [showDeleteDocumentConfirmation, setShowDeleteDocumentConfirmation] = useState(false);

  // @state: Estados para TestingCardPlaybook
  const [testingCardPlaybooks, setTestingCardPlaybooks] = useState<TestingCardPlaybook[]>([]);
  const [loadingPlaybooks, setLoadingPlaybooks] = useState(false);
  const [playbooksError, setPlaybooksError] = useState<string | null>(null);

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

  /**
   * Efecto para cargar empleados al montar el componente
   * @function useEffect
   */
  useEffect(() => {
    cargarEmpleados();
    cargarTestingCardPlaybooks();
  }, []);

  /**
   * Efecto para cargar datos reales de la BD al abrir el modal
   * @function useEffect
   */
  useEffect(() => {
    if (node.data.id) {
      setLoading(true);
      obtenerTestingCardPorId(node.data.id)
        .then((data) => {
          console.log('[useEffect BD] Datos cargados desde BD:', data);
          console.log('[useEffect BD] id_experimento_tipo desde BD:', data.id_experimento_tipo);
          console.log('[useEffect BD] status desde BD:', data.status);
          setFormData(prev => ({ 
            ...prev, 
            ...data,
            // Asegurar que el id_experimento_tipo se tome correctamente desde la BD
            id_experimento_tipo: data.id_experimento_tipo || prev.id_experimento_tipo || 0
          }));
        })
        .catch(() => setErrorMsg('Error al cargar datos de la BD'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [node.data.id]);

  /**
   * Efecto para verificar la preselección del tipo de experimento
   * @function useEffect
   */
  useEffect(() => {
    if (testingCardPlaybooks.length > 0 && formData.id_experimento_tipo) {
      console.log('[useEffect preselección] TestingCardPlaybooks cargados:', testingCardPlaybooks.length);
      console.log('[useEffect preselección] id_experimento_tipo actual:', formData.id_experimento_tipo);
      
      const playbookEncontrado = testingCardPlaybooks.find(p => p.pagina === formData.id_experimento_tipo);
      if (playbookEncontrado) {
        console.log('[useEffect preselección] ✅ Playbook encontrado:', playbookEncontrado.titulo);
      } else {
        console.log('[useEffect preselección] ⚠️ Playbook no encontrado para id:', formData.id_experimento_tipo);
        console.log('[useEffect preselección] IDs disponibles:', testingCardPlaybooks.map(p => p.pagina));
      }
    }
  }, [testingCardPlaybooks, formData.id_experimento_tipo]);

  /**
   * Efecto para cargar métricas cuando se abre la sección de métricas
   * @function useEffect
   */
  useEffect(() => {
    console.log('[useEffect métricas] showMetrics:', showMetrics, 'editingId:', editingId);
    if (showMetrics && editingId) {
      console.log('[useEffect métricas] Condiciones cumplidas, llamando a cargarMetricas()');
      cargarMetricas();
    } else {
      console.log('[useEffect métricas] Condiciones no cumplidas, no se cargan métricas');
    }
    // eslint-disable-next-line
  }, [showMetrics, editingId]);

  /**
   * Efecto para cargar URLs cuando se abre la sección de documentación
   * @function useEffect
   */
  useEffect(() => {
    console.log('[useEffect URLs] showDocumentation:', showDocumentation, 'editingId:', editingId);
    if (showDocumentation && editingId) {
      console.log('[useEffect URLs] Condiciones cumplidas, llamando a cargarUrls()');
      cargarUrls();
      cargarDocumentos(); // También cargar documentos cuando se abre la sección
    } else {
      console.log('[useEffect URLs] Condiciones no cumplidas, no se cargan URLs');
    }
  }, [showDocumentation, editingId]);

  /**
   * Valida todos los campos del formulario
   * @function validateForm
   * @returns {boolean} true si el formulario es válido
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.hipotesis.trim()) newErrors.hipotesis = 'La hipótesis es requerida';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.dia_inicio) newErrors.dia_inicio = 'La fecha de inicio es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      // Validación y limpieza extra del payload
      // Limpiar payload: solo enviar campos válidos al backend
      const {
        id_testing_card,
        titulo,
        hipotesis,
        descripcion,
        dia_inicio,
        dia_fin,
        id_responsable,
        id_experimento_tipo,
        status,
        id_secuencia,

        // creado, actualizado, id eliminados por tipado
      } = formData;
      const payload = {
        id: editingId, // Agregamos el ID requerido por TestingCardData
        id_testing_card: id_testing_card,
        titulo: titulo.trim(),
        hipotesis: hipotesis.trim(),
        descripcion: descripcion.trim(),
        dia_inicio: dia_inicio || '',
        dia_fin: dia_fin || '',
        id_responsable: Number(id_responsable) || -1,
        id_experimento_tipo: Number(id_experimento_tipo) || 0,
        status: status || 'EN VALIDACION',
        //metricas: Array.isArray(metricas) ? metricas : [],
        //documentationUrls: Array.isArray(documentationUrls) ? documentationUrls : [],
        //attachments: Array.isArray(attachments) ? attachments : [],
        //collaborators: Array.isArray(collaborators) ? collaborators : [],
        id_secuencia,
        //anexo_url,
      };
      // Log para depuración
      console.log('[TestingCardEditModal] Payload enviado:', payload, 'editingId:', editingId);
      try {
        await actualizarTestingCard(editingId, payload); // <-- Aquí usas editingId
        setSuccessMsg('¡Guardado exitosamente!');
        onSave(payload); // Notifica al padre
      } catch (err: any) {
        // Mostrar mensaje detallado del backend si existe
        let backendMsg = 'Error al guardar en la base de datos';
        if (err?.response?.data?.detail) {
          backendMsg = err.response.data.detail;
        } else if (err?.message) {
          backendMsg = err.message;
        }
        setErrorMsg(backendMsg);
        // Log para depuración
        console.error('[TestingCardEditModal] Error al actualizar:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Actualiza una métrica específica
  const handleMetricChange = (index: number, field: string, value: string | number) => {
    const updatedMetricas = [...(formData.metricas || [])];
    updatedMetricas[index] = { ...updatedMetricas[index], [field]: value };
    setFormData({ ...formData, metricas: updatedMetricas });
  };

  // Añade una nueva métrica vacía
  const addMetric = () => {
    const newMetric: MetricaWithFrontendProps = { 
      id_metrica: 0, 
      id_testing_card: editingId, 
      nombre: '', 
      operador: '', 
      criterio: '',
      creado: new Date().toISOString(),
      actualizado: new Date().toISOString(),
      needsCreation: true // Marca que necesita ser creada en BD
    };  
    setFormData({
      ...formData,
      metricas: [...(formData.metricas || []), newMetric]
    });
  };

  // Elimina una métrica por índice
  const removeMetric = (index: number) => {
    const metricToRemove = (formData.metricas || [])[index];
    console.log('[removeMetric] Índice:', index);
    console.log('[removeMetric] Métrica a eliminar:', metricToRemove);
    console.log('[removeMetric] ID de la métrica (id_metrica):', metricToRemove?.id_metrica);
    console.log('[removeMetric] ID de la métrica (id):', (metricToRemove as any)?.id);
    console.log('[removeMetric] Todas las métricas:', formData.metricas);
    setMetricaAEliminar({ index, metrica: metricToRemove });
  };

  // Confirma la eliminación de una métrica
  const confirmarEliminacionMetrica = async () => {
    if (!metricaAEliminar) return;
    
    const { index, metrica } = metricaAEliminar;
    
    console.log('[confirmarEliminacionMetrica] Iniciando eliminación...');
    console.log('[confirmarEliminacionMetrica] Índice:', index);
    console.log('[confirmarEliminacionMetrica] Métrica completa:', metrica);
    console.log('[confirmarEliminacionMetrica] ID de métrica (id_metrica):', metrica?.id_metrica);
    console.log('[confirmarEliminacionMetrica] ID de métrica (id):', (metrica as any)?.id);
    console.log('[confirmarEliminacionMetrica] Tipo de ID (id_metrica):', typeof metrica?.id_metrica);
    console.log('[confirmarEliminacionMetrica] Tipo de ID (id):', typeof (metrica as any)?.id);
    
    // Usar tanto id_metrica como id para mayor compatibilidad
    const metricaId = metrica?.id_metrica || (metrica as any)?.id;
    
    // Si la métrica tiene un ID válido, eliminarla de la BD
    if (metrica && metricaId && metricaId > 0) {
      console.log('[confirmarEliminacionMetrica] ID válido detectado, procediendo a eliminar de BD...');
      try {
        setLoadingMetricas(true);
        console.log('[confirmarEliminacionMetrica] Llamando a eliminar() con ID:', metricaId);
        await eliminar(metricaId);
        console.log(`[confirmarEliminacionMetrica] ✅ Métrica ${metricaId} eliminada exitosamente de la BD`);
        setSuccessMsg('Métrica eliminada exitosamente');
      } catch (error) {
        console.error('[confirmarEliminacionMetrica] ❌ Error al eliminar métrica de la BD:', error);
        setErrorMsg('Error al eliminar la métrica');
        setLoadingMetricas(false);
        setMetricaAEliminar(null);
        return; // No actualizar el estado local si falla la eliminación en BD
      } finally {
        setLoadingMetricas(false);
      }
    } else {
      console.log('[confirmarEliminacionMetrica] ⚠️ ID no válido, solo eliminando del estado local');
      console.log('[confirmarEliminacionMetrica] Razones posibles:');
      console.log('  - metrica es null/undefined:', !metrica);
      console.log('  - metricaId es null/undefined:', !metricaId);
      console.log('  - metricaId <= 0:', metricaId <= 0);
    }
    
    // Actualizar el estado local
    console.log('[confirmarEliminacionMetrica] Actualizando estado local...');
    const updatedMetricas = (formData.metricas || []).filter((_, i) => i !== index);
    console.log('[confirmarEliminacionMetrica] Métricas antes del filtro:', formData.metricas);
    console.log('[confirmarEliminacionMetrica] Métricas después del filtro:', updatedMetricas);
    setFormData({ ...formData, metricas: updatedMetricas });
    setMetricaAEliminar(null);
    console.log('[confirmarEliminacionMetrica] ✅ Estado local actualizado');
  };

  // Cancela la eliminación de una métrica
  const cancelarEliminacionMetrica = () => {
    setMetricaAEliminar(null);
  };

  // Inicia el proceso de creación de una métrica en la BD
  const iniciarCreacionMetrica = (index: number) => {
    const metricToCreate = (formData.metricas || [])[index];
    console.log('[iniciarCreacionMetrica] Métrica a crear:', metricToCreate);
    setMetricaACrear({ index, metrica: metricToCreate });
  };

  // Confirma la creación de una métrica en la base de datos
  const confirmarCreacionMetrica = async () => {
    if (!metricaACrear) return;
    
    const { index, metrica } = metricaACrear;
    
    console.log('[confirmarCreacionMetrica] Iniciando creación...');
    console.log('[confirmarCreacionMetrica] Métrica a crear:', metrica);
    
    // Validar que la métrica tenga datos requeridos
    if (!metrica.nombre || !metrica.operador || !metrica.criterio) {
      setErrorMsg('Por favor completa todos los campos de la métrica antes de guardarla');
      setMetricaACrear(null);
      return;
    }
    
    try {
      setLoadingMetricas(true);
      
      // Crear la métrica en la BD
      const dataToCreate = {
        id_testing_card: editingId,
        nombre: metrica.nombre,
        operador: metrica.operador,
        criterio: metrica.criterio
      };
      
      console.log('[confirmarCreacionMetrica] Datos a enviar:', dataToCreate);
      const metricaCreada = await crear(dataToCreate);
      console.log('[confirmarCreacionMetrica] ✅ Métrica creada exitosamente:', metricaCreada);
      
      // Actualizar el estado local con la métrica creada
      const updatedMetricas = [...(formData.metricas || [])];
      updatedMetricas[index] = {
        ...metricaCreada,
        needsCreation: false // Ya no necesita ser creada
      } as MetricaWithFrontendProps;
      
      setFormData({ ...formData, metricas: updatedMetricas });
      setSuccessMsg('Métrica creada exitosamente');
      
    } catch (error) {
      console.error('[confirmarCreacionMetrica] ❌ Error al crear métrica:', error);
      setErrorMsg('Error al crear la métrica en la base de datos');
    } finally {
      setLoadingMetricas(false);
      setMetricaACrear(null);
    }
  };

  // Cancela la creación de una métrica
  const cancelarCreacionMetrica = () => {
    setMetricaACrear(null);
  };

  /**
   * Carga las métricas desde la base de datos
   * @function cargarMetricas
   */
  const cargarMetricas = async () => {
    if (!editingId) {
      console.log('[cargarMetricas] ⚠️ No hay editingId, saliendo...');
      return;
    }
    
    console.log('[cargarMetricas] Iniciando carga de métricas para editingId:', editingId);
    
    try {
      setLoadingMetricas(true);
      const metricasData = await obtenerPorTestingCard(editingId);
      
      console.log('[cargarMetricas] ✅ Métricas recibidas de la BD:', metricasData);
      console.log('[cargarMetricas] Cantidad de métricas:', metricasData?.length || 0);
      
      // Log detallado de cada métrica
      if (metricasData && metricasData.length > 0) {
        metricasData.forEach((metrica, index) => {
          console.log(`[cargarMetricas] Métrica ${index}:`, {
            id_metrica: metrica.id_metrica,
            nombre: metrica.nombre,
            operador: metrica.operador,
            criterio: metrica.criterio,
            id_testing_card: metrica.id_testing_card
          });
        });
      }
      
      // Actualizar el formData con las métricas cargadas
      setFormData(prev => ({
        ...prev,
        metricas: metricasData as MetricaWithFrontendProps[]
      }));
      
      console.log('[cargarMetricas] ✅ FormData actualizado con las métricas');
    } catch (error) {
      console.error('[cargarMetricas] ❌ Error al cargar métricas:', error);
      // En caso de error, mantener el array vacío
      setFormData(prev => ({
        ...prev,
        metricas: []
      }));
    } finally {
      setLoadingMetricas(false);
    }
  };

  /**
   * Carga las URLs desde la base de datos
   * @function cargarUrls
   */
  const cargarUrls = async () => {
    if (!editingId) {
      console.log('[cargarUrls] ⚠️ No hay editingId, saliendo...');
      return;
    }
    
    console.log('[cargarUrls] Iniciando carga de URLs para editingId:', editingId);
    
    try {
      setLoadingUrls(true);
      const urlsData = await obtenerUrlsPorTestingCard(editingId);
      
      console.log('[cargarUrls] ✅ URLs recibidas de la BD:', urlsData);
      console.log('[cargarUrls] Cantidad de URLs:', urlsData?.length || 0);
      
      // Actualizar el estado con las URLs cargadas
      setDocumentationUrls(urlsData || []);
      
      // Expandir automáticamente la sección si hay URLs
      if (urlsData && urlsData.length > 0) {
        setShowDocumentation(true);
      }
      
      console.log('[cargarUrls] ✅ Estado actualizado con las URLs');
    } catch (error) {
      console.error('[cargarUrls] ❌ Error al cargar URLs:', error);
      // En caso de error, mantener el array vacío
      setDocumentationUrls([]);
    } finally {
      setLoadingUrls(false);
    }
  };

  /**
   * Carga los documentos desde la base de datos
   * @function cargarDocumentos
   */
  const cargarDocumentos = async () => {
    if (!editingId) {
      console.log('[cargarDocumentos] ⚠️ No hay editingId, saliendo...');
      return;
    }
    
    console.log('[cargarDocumentos] Iniciando carga de documentos para editingId:', editingId);
    
    try {
      setLoadingDocumentos(true);
      const documentosData = await getDocumentsByTestingCard(editingId);
      
      console.log('[cargarDocumentos] ✅ Documentos recibidos de la BD:', documentosData);
      console.log('[cargarDocumentos] Cantidad de documentos:', documentosData?.length || 0);
      
      // Actualizar el estado con los documentos cargados
      setDocumentos(documentosData || []);
      
      console.log('[cargarDocumentos] ✅ Estado actualizado con los documentos');
    } catch (error) {
      console.error('[cargarDocumentos] ❌ Error al cargar documentos:', error);
      // En caso de error, mantener el array vacío
      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  /**
   * Añade una nueva URL de documentación
   * @function addDocumentationUrl
   * @param {string} url - URL a añadir
   */
  const addDocumentationUrl = async (url: string) => {
    try {
      console.log('[addDocumentationUrl] Agregando URL:', url, 'para TC:', editingId);
      const nuevaUrl = await crearUrl({
        id_testing_card: editingId,
        url: url
      });
      console.log('[addDocumentationUrl] URL creada:', nuevaUrl);
      setDocumentationUrls(prev => [...prev, nuevaUrl]);
      setSuccessMsg('URL agregada exitosamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('[addDocumentationUrl] Error al agregar URL:', error);
      setErrorMsg('Error al agregar la URL');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  /**
   * Maneja la eliminación de una URL
   * @function handleDeleteUrl
   * @param {UrlTestingCard} urlObj - Objeto URL a eliminar
   */
  const handleDeleteUrl = (urlObj: UrlTestingCard) => {
    setUrlToDelete(urlObj);
    setShowDeleteUrlConfirmation(true);
  };

  /**
   * Confirma la eliminación de una URL
   * @function confirmDeleteUrl
   */
  const confirmDeleteUrl = async () => {
    if (urlToDelete) {
      try {
        console.log('[confirmDeleteUrl] Eliminando URL:', urlToDelete.id_url_tc);
        await eliminarUrl(urlToDelete.id_url_tc);
        setDocumentationUrls(prev => prev.filter(url => url.id_url_tc !== urlToDelete.id_url_tc));
        setSuccessMsg('URL eliminada exitosamente');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (error) {
        console.error('[confirmDeleteUrl] Error al eliminar URL:', error);
        setErrorMsg('Error al eliminar la URL');
        setTimeout(() => setErrorMsg(''), 3000);
      }
    }
    setShowDeleteUrlConfirmation(false);
    setUrlToDelete(null);
  };

  /**
   * Elimina una URL de documentación
   * @function removeDocumentationUrl
   * @param {number} index - Índice de la URL a eliminar
   */
  const removeDocumentationUrl = (index: number) => {
    const urlObj = documentationUrls[index];
    handleDeleteUrl(urlObj);
  };

  /**
   * Obtiene el icono de Lucide para un tipo de documento
   * @function getDocumentIconComponent
   * @param {string} mimeType - Tipo MIME del documento
   * @returns {React.ComponentType} Componente de icono
   */
  const getDocumentIconComponent = (mimeType: string) => {
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
   * @function truncateDocumentName
   * @param {string} name - Nombre del documento
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Nombre truncado
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
   * @function handleViewDocument
   * @param {TestingCardDocument} documento - Documento a visualizar
   */
  const handleViewDocument = (documento: TestingCardDocument) => {
    console.log('[handleViewDocument] Abriendo documento:', documento.document_name);
    
    if (isImage(documento.document_type) || documento.document_type === 'application/pdf') {
      // Abrir en nueva pestaña para PDFs e imágenes
      window.open(documento.document_url, '_blank');
    } else {
      // Descargar directamente para otros tipos
      handleDownloadDocument(documento);
    }
  };

  /**
   * Maneja la descarga de un documento
   * @function handleDownloadDocument
   * @param {TestingCardDocument} documento - Documento a descargar
   */
  const handleDownloadDocument = (documento: TestingCardDocument) => {
    console.log('[handleDownloadDocument] Descargando documento:', documento.document_name);
    
    const link = document.createElement('a');
    link.href = documento.document_url;
    link.download = documento.document_name;
    link.click();
  };

  /**
   * Maneja la eliminación de un documento
   * @function handleDeleteDocument
   * @param {TestingCardDocument} documento - Documento a eliminar
   */
  const handleDeleteDocument = (documento: TestingCardDocument) => {
    setDocumentoAEliminar(documento);
    setShowDeleteDocumentConfirmation(true);
  };

  /**
   * Confirma la eliminación de un documento
   * @function confirmDeleteDocument
   */
  const confirmDeleteDocument = async () => {
    if (documentoAEliminar) {
      try {
        console.log('[confirmDeleteDocument] Eliminando documento:', documentoAEliminar.id);
        await deleteDocument(documentoAEliminar.id);
        
        // Actualizar la lista eliminando el documento
        setDocumentos(prev => prev.filter(doc => doc.id !== documentoAEliminar.id));
        
        console.log('[confirmDeleteDocument] ✅ Documento eliminado exitosamente');
      } catch (error) {
        console.error('[confirmDeleteDocument] Error al eliminar documento:', error);
      }
    }
    setShowDeleteDocumentConfirmation(false);
    setDocumentoAEliminar(null);
  };

  /**
   * Renderiza la lista de documentos cargados desde la base de datos
   * @function renderDocumentos
   * @returns {JSX.Element} Lista de documentos
   */
  const renderDocumentos = () => {
    if (loadingDocumentos) {
      return (
        <div className="documentos-loading" style={{ 
          fontSize: '12px', 
          color: 'var(--theme-text-secondary)',
          fontStyle: 'italic',
          padding: '8px 0'
        }}>
          Cargando documentos...
        </div>
      );
    }

    if (documentos.length === 0) {
      return (
        <div className="documentos-empty" style={{ 
          fontSize: '12px', 
          color: 'var(--theme-text-secondary)',
          fontStyle: 'italic',
          padding: '8px 0'
        }}>
          No hay documentos registrados para esta Testing Card
        </div>
      );
    }

    return (
      <div className="documentos-list">
        {documentos.map((documento) => {
          const IconComponent = getDocumentIconComponent(documento.document_type);
          
          return (
            <div key={documento.id} className="documento-item" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'var(--theme-bg-secondary)',
              border: '1px solid var(--theme-border-primary)',
              borderRadius: '6px',
              marginBottom: '6px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                <IconComponent size={16} style={{ color: 'var(--theme-text-secondary)', flexShrink: 0 }} />
                <span 
                  style={{ 
                    color: 'var(--theme-text-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                  onClick={() => handleViewDocument(documento)}
                  title={documento.document_name}
                >
                  {truncateDocumentName(documento.document_name)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleViewDocument(documento)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--theme-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  title="Ver documento"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(documento)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--theme-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
                  title="Descargar documento"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(documento)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: 'var(--theme-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px'
                  }}
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

  /**
   * Añade archivos de documentación subiéndolos a la base de datos
   * @function addDocumentationFiles
   * @param {File[]} files - Archivos a subir
   */
  const addDocumentationFiles = async (files: File[]) => {
    if (!editingId) {
      console.error('[addDocumentationFiles] No hay editingId disponible');
      setErrorMsg('Error: No se puede identificar la Testing Card');
      return;
    }

    console.log('[addDocumentationFiles] Subiendo archivos:', files.length, 'para TC:', editingId);
    
    try {
      setLoadingDocumentos(true);
      
      // Subir cada archivo individualmente
      const uploadPromises = files.map(async (file) => {
        console.log('[addDocumentationFiles] Subiendo archivo:', file.name);
        try {
          const documentoSubido = await uploadDocument(editingId, file);
          console.log('[addDocumentationFiles] ✅ Archivo subido exitosamente:', documentoSubido);
          return documentoSubido;
        } catch (error) {
          console.error('[addDocumentationFiles] ❌ Error al subir archivo:', file.name, error);
          throw error;
        }
      });

      // Esperar a que todos los archivos se suban
      const documentosSubidos = await Promise.all(uploadPromises);
      
      // Actualizar la lista de documentos con los nuevos documentos
      setDocumentos(prev => [...prev, ...documentosSubidos]);
      
      setSuccessMsg(`${documentosSubidos.length} archivo(s) subido(s) exitosamente`);
      setTimeout(() => setSuccessMsg(''), 3000);
      
      console.log('[addDocumentationFiles] ✅ Todos los archivos subidos exitosamente');
      
    } catch (error) {
      console.error('[addDocumentationFiles] ❌ Error al subir archivos:', error);
      setErrorMsg('Error al subir los archivos');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoadingDocumentos(false);
    }
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
   * Carga la lista de TestingCardPlaybooks
   * @function cargarTestingCardPlaybooks
   */
  const cargarTestingCardPlaybooks = async () => {
    setLoadingPlaybooks(true);
    setPlaybooksError(null);
    try {
      const playbookService = new TestingCardPlaybookService();
      const data = await playbookService.listarTodos();
      setTestingCardPlaybooks(data);
    } catch (error: any) {
      console.error('Error al cargar TestingCardPlaybooks:', error);
      setPlaybooksError('Error al cargar tipos de experimento');
    } finally {
      setLoadingPlaybooks(false);
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

  useEffect(() => {
    console.log('[TestingCardEditModal] editingId recibido:', editingId);
  }, [editingId]);

  return (
    <div className="testing-modal-backdrop" onClick={(e) => e.stopPropagation()}>
      <div className="testing-modal-container">
        {/* @section: Header del modal */}
        <div className="testing-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="testing-modal-icon">
              <ClipboardList size={20} />
            </div>
            <h2 className="testing-modal-title">Editar Testing Card</h2>
          </div>
          <button onClick={onClose} className="testing-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="testing-modal-form">
          {loading && <div className="testing-form-loading">Cargando...</div>}
          {successMsg && <div className="testing-form-success">{successMsg}</div>}
          {errorMsg && <div className="testing-form-error">{errorMsg}</div>}
          {/* @section: Estado de la Testing Card */}
          <div className="testing-form-group">
            <label htmlFor="status" className="testing-form-label">
              Estado de la Testing Card
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="testing-status-badge"
              style={{
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 10px',
                minWidth: 80,
                textAlign: 'center',
                letterSpacing: 0.5,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <option value="EN PLANEACION">EN PLANEACION</option>
              <option value="EN VALIDACION">EN VALIDACION</option>
              <option value="EN ANALISIS">EN ANALISIS</option>
              <option value="CANCELADO">CANCELADO</option>
              <option value="TERMINADO">TERMINADO</option>
            </select>
          </div>
          {/* @section: Información básica */}
          <div className="testing-form-group">
            <label htmlFor="titulo" className="testing-form-label">
              <Tag className="testing-form-icon" />
              Título del Experimento
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className={`testing-input ${errors.titulo ? 'input-error' : ''}`}
              placeholder="¿Qué quieres probar?"
            />
            {errors.titulo && <span className="testing-error-text">{errors.titulo}</span>}
          </div>

          <div className="testing-form-group">
            <label htmlFor="hipotesis" className="testing-form-label">
              <FileText className="testing-form-icon" />
              Hipótesis (creemos que... )
            </label>
            <textarea
              id="hipotesis"
              value={formData.hipotesis}
              onChange={(e) => setFormData({...formData, hipotesis: e.target.value})}
              className={`testing-input textarea ${errors.hipotesis ? 'input-error' : ''}`}
              placeholder="Hipótesis (creemos que... )"
              rows={2}
            />
            {errors.hipotesis && <span className="testing-error-text">{errors.hipotesis}</span>}
          </div>

          {/* @section: Configuración del experimento */}
          <div className="testing-form-row">
            <div className="testing-form-group">
              <label htmlFor="id_experimento_tipo" className="testing-form-label">
                Tipo de Experimento
                {loadingPlaybooks && (
                  <span style={{ marginLeft: 8, fontSize: '12px', color: '#6C63FF' }}>
                    (Cargando...)
                  </span>
                )}
                {playbooksError && (
                  <span style={{ marginLeft: 8, fontSize: '12px', color: '#ff4444' }}>
                    ({playbooksError})
                  </span>
                )}
              </label>
              <select
                id="id_experimento_tipo"
                value={formData.id_experimento_tipo}
                onChange={(e) => setFormData({...formData, id_experimento_tipo: Number(e.target.value)})}
                className="testing-input"
                disabled={loadingPlaybooks}
              >
                <option value={0}>Selecciona un tipo de experimento</option>
                {testingCardPlaybooks
                  .sort((a, b) => a.titulo.localeCompare(b.titulo))
                  .map((playbook) => (
                    <option key={playbook.pagina} value={playbook.pagina}>
                      {playbook.titulo} - {playbook.campo} ({playbook.tipo})
                    </option>
                  ))}
              </select>
              {/* Mostrar información adicional del playbook seleccionado */}
              {formData.id_experimento_tipo > 0 && (() => {
                const selectedPlaybook = testingCardPlaybooks.find(p => p.pagina === formData.id_experimento_tipo);
                return selectedPlaybook ? (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    <div><strong>Campo:</strong> {selectedPlaybook.campo}</div>
                    <div><strong>Tipo:</strong> {selectedPlaybook.tipo}</div>
                    {selectedPlaybook.descripcion && (
                      <div><strong>Descripción:</strong> {selectedPlaybook.descripcion}</div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          <div className="testing-form-group">
            <label htmlFor="descripcion" className="testing-form-label">
              <FileText className="testing-form-icon" />
              Descripción (para eso haremos... )
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className={`testing-input textarea ${errors.descripcion ? 'input-error' : ''}`}
              placeholder="Descripción (para eso haremos... )"
              rows={3}
            />
            {errors.descripcion && <span className="testing-error-text">{errors.descripcion}</span>}
          </div>

          {/* @section: Métricas expandibles */}
          <div className="testing-form-section">
            <button 
              type="button" 
              className="testing-form-section-toggle"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              <ChevronDown className={`toggle-icon ${showMetrics ? 'open' : ''}`} />
              <span>Métricas (y mediremos... )</span>
            </button>
            
            {showMetrics && (
              <div className="testing-form-section-content">
                {loadingMetricas && (
                  <div className="testing-metrics-loading">
                    <span>Cargando métricas...</span>
                  </div>
                )}
                
                {!loadingMetricas && formData.metricas && formData.metricas.length === 0 && (
                  <div className="testing-metrics-empty">
                    <span>No hay métricas definidas para esta Testing Card</span>
                  </div>
                )}
                
                {!loadingMetricas && formData.metricas && formData.metricas.map((metric, index) => {
                  const metricWithFrontend = metric as MetricaWithFrontendProps;
                  return (
                  <div key={metric.id_metrica || index} className="testing-metric-row">
                    <input
                      type="text"
                      value={metric.nombre}
                      onChange={(e) => handleMetricChange(index, 'nombre', e.target.value)}
                      className="testing-input small"
                      placeholder="Nombre métrica"
                    />
                    <select
                      value={metric.operador}
                      onChange={(e) => handleMetricChange(index, 'operador', e.target.value)}
                      className="testing-input small"
                    >
                      <option value="">Seleccionar operador</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value="=">=</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                    </select>
                    <input
                      type="text"
                      value={metric.criterio}
                      onChange={(e) => handleMetricChange(index, 'criterio', e.target.value)}
                      className="testing-input small"
                      placeholder="Criterio"
                    />
                    <div className="testing-metric-actions">
                      {metricWithFrontend.needsCreation ? (
                        <button 
                          type="button" 
                          className="testing-save-btn"
                          onClick={() => iniciarCreacionMetrica(index)}
                          title="Guardar métrica en la base de datos"
                        >
                          <Save size={14} />
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          className="testing-remove-btn"
                          onClick={() => removeMetric(index)}
                          title="Eliminar métrica"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
                <button 
                  type="button" 
                  className="testing-add-btn"
                  onClick={addMetric}
                >
                  <Plus size={14} />
                  Añadir Métrica
                </button>
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
              <ChevronDown className={`toggle-icon ${showDocumentation ? 'open' : ''}`} />
              <span>Documentación</span>
              {documentationUrls.length > 0 && (
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '11px', 
                  background: 'var(--theme-primary)', 
                  color: 'white', 
                  borderRadius: '12px', 
                  padding: '2px 8px',
                  fontWeight: '600'
                }}>
                  {documentationUrls.length} URL{documentationUrls.length !== 1 ? 's' : ''}
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
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '10px', 
                        background: 'var(--theme-primary)', 
                        color: 'white', 
                        borderRadius: '10px', 
                        padding: '2px 6px' 
                      }}>
                        {documentationUrls.length}
                      </span>
                    )}
                  </h4>

                  {loadingUrls && (
                    <div className="loading-urls" style={{ 
                      fontSize: '12px', 
                      color: 'var(--theme-text-secondary)',
                      fontStyle: 'italic',
                      padding: '8px 0'
                    }}>
                      Cargando URLs...
                    </div>
                  )}

                  {!loadingUrls && documentationUrls.length === 0 && (
                    <div className="no-urls" style={{ 
                      fontSize: '12px', 
                      color: 'var(--theme-text-secondary)',
                      fontStyle: 'italic',
                      padding: '8px 0'
                    }}>
                      No hay URLs registradas para esta Testing Card
                    </div>
                  )}
                  
                  {!loadingUrls && documentationUrls.length > 0 && (
                    <div className="urls-list">
                      {documentationUrls.map((urlObj, index) => (
                        <div key={urlObj.id_url_tc} className="url-item">
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
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '10px', 
                        background: 'var(--theme-primary)', 
                        color: 'white', 
                        borderRadius: '10px', 
                        padding: '2px 6px' 
                      }}>
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
                  >
                    <Upload size={14} />
                    Cargar Archivos
                  </button>
                </div>
              </div>
            )}
          </div>

          

          {/* @section: Fechas y responsable */}
          <div className="testing-form-row">
            <div className="testing-form-group">
              <label htmlFor="dia_inicio" className="testing-form-label">
                <Calendar className="testing-form-icon" />
                Fecha Inicio
              </label>
              <input
                type="date"
                id="dia_inicio"
                value={formData.dia_inicio}
                onChange={(e) => setFormData({...formData, dia_inicio: e.target.value})}
                className={`testing-input ${errors.dia_inicio ? 'input-error' : ''}`}
              />
              {errors.dia_inicio && <span className="testing-error-text">{errors.dia_inicio}</span>}
            </div>

            <div className="testing-form-group">
              <label htmlFor="dia_fin" className="testing-form-label">
                <Calendar className="testing-form-icon" />
                Fecha Fin
              </label>
              <input
                type="date"
                id="dia_fin"
                value={formData.dia_fin}
                onChange={(e) => setFormData({...formData, dia_fin: e.target.value})}
                className="testing-input"
                min={formData.dia_inicio}
              />
            </div>
          </div>

          <div className="testing-form-group">
            <label htmlFor="id_responsable" className="testing-form-label">
              Responsable
              {empleados.length > 0 && formData.id_responsable ? (
                (() => {
                  const emp = empleados.find(e => e.id_empleado === formData.id_responsable);
                  return emp ? (
                    <span style={{ marginLeft: 8, fontWeight: 500, color: '#6C63FF' }}>
                      (Seleccionado: {getNombreCompleto(emp)})
                    </span>
                  ) : null;
                })()
              ) : null}
            </label>
            {/* Selector de líder (empleado) */}
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
            />
          </div>

          {/* @section: Botones de acción */}
          <div className="testing-form-actions">
            <button type="button" onClick={onClose} className="testing-btn testing-btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="testing-btn testing-btn-primary">
              <Save className="testing-btn-icon" />
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* @component: Modal de documentación */}
        {isDocumentationModalOpen && (
          <DocumentationModal
            isOpen={isDocumentationModalOpen}
            onClose={() => setIsDocumentationModalOpen(false)}
            onAddUrl={addDocumentationUrl}
            onAddFiles={addDocumentationFiles}
          />
        )}

        {/* @component: Modal de confirmación para eliminar métrica */}
        {metricaAEliminar && (
          <div className="testing-modal-backdrop">
            <div className="testing-confirmation-modal">
              <div className="testing-confirmation-header">
                <h3>Confirmar Eliminación</h3>
              </div>
              <div className="testing-confirmation-content">
                <p>¿Estás seguro que deseas eliminar la métrica <strong>"{metricaAEliminar.metrica?.nombre || 'Sin nombre'}"</strong>?</p>
                <p className="testing-warning-text">Esta acción no se puede deshacer.</p>
              </div>
              <div className="testing-confirmation-actions">
                <button
                  type="button"
                  onClick={cancelarEliminacionMetrica}
                  className="testing-btn testing-btn-secondary"
                  disabled={loadingMetricas}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loadingMetricas ? 'not-allowed' : 'pointer',
                    opacity: loadingMetricas ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#1e293b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarEliminacionMetrica}
                  className="testing-btn testing-btn-danger"
                  disabled={loadingMetricas}
                  style={{
                    backgroundColor: loadingMetricas ? '#ef4444aa' : '#ef4444',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loadingMetricas ? 'not-allowed' : 'pointer',
                    opacity: loadingMetricas ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }
                  }}
                >
                  {loadingMetricas ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* @component: Modal de confirmación para crear métrica */}
        {metricaACrear && (
          <div className="testing-modal-backdrop">
            <div className="testing-confirmation-modal">
              <div className="testing-confirmation-header">
                <h3>Confirmar Creación</h3>
              </div>
              <div className="testing-confirmation-content">
                <p>¿Estás seguro que deseas guardar la métrica <strong>"{metricaACrear.metrica?.nombre || 'Sin nombre'}"</strong> en la base de datos?</p>
                <div className="testing-metric-preview">
                  <p><strong>Nombre:</strong> {metricaACrear.metrica?.nombre}</p>
                  <p><strong>Operador:</strong> {metricaACrear.metrica?.operador}</p>
                  <p><strong>Criterio:</strong> {metricaACrear.metrica?.criterio}</p>
                </div>
              </div>
              <div className="testing-confirmation-actions">
                <button
                  type="button"
                  onClick={cancelarCreacionMetrica}
                  className="testing-btn testing-btn-secondary"
                  disabled={loadingMetricas}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loadingMetricas ? 'not-allowed' : 'pointer',
                    opacity: loadingMetricas ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#1e293b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarCreacionMetrica}
                  className="testing-btn testing-btn-primary"
                  disabled={loadingMetricas}
                  style={{
                    backgroundColor: loadingMetricas ? '#864080aa' : '#864080',
                    color: '#ffffff',
                    border: '1px solid #864080',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loadingMetricas ? 'not-allowed' : 'pointer',
                    opacity: loadingMetricas ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#753970';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMetricas) {
                      e.currentTarget.style.backgroundColor = '#864080';
                    }
                  }}
                >
                  {loadingMetricas ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* @component: Modal de confirmación para eliminar URL */}
        {showDeleteUrlConfirmation && (
          <div className="testing-modal-backdrop">
            <div className="testing-confirmation-modal">
              <div className="testing-confirmation-header">
                <h3>Eliminar URL</h3>
              </div>
              <div className="testing-confirmation-content">
                <p>¿Estás seguro que deseas eliminar esta URL?</p>
                <p className="testing-warning-text">{urlToDelete?.url}</p>
                <p className="testing-warning-text">Esta acción no se puede deshacer.</p>
              </div>
              <div className="testing-confirmation-actions">
                <button
                  type="button"
                  onClick={() => setShowDeleteUrlConfirmation(false)}
                  className="testing-btn testing-btn-secondary"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUrl}
                  className="testing-btn testing-btn-danger"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* @component: Modal de confirmación para eliminar documento */}
        {showDeleteDocumentConfirmation && (
          <div className="testing-modal-backdrop">
            <div className="testing-confirmation-modal">
              <div className="testing-confirmation-header">
                <h3>Eliminar Documento</h3>
              </div>
              <div className="testing-confirmation-content">
                <p>¿Estás seguro que deseas eliminar este documento?</p>
                <p className="testing-warning-text">{documentoAEliminar?.document_name}</p>
                <p className="testing-warning-text">Esta acción no se puede deshacer.</p>
              </div>
              <div className="testing-confirmation-actions">
                <button
                  type="button"
                  onClick={() => setShowDeleteDocumentConfirmation(false)}
                  className="testing-btn testing-btn-secondary"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDocument}
                  className="testing-btn testing-btn-danger"
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestingCardEditModal;