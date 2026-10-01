/**
 * @fileoverview Componente TemplateTestingCardList - Lista de Testing Cards de una plantilla
 * 
 * Este componente muestra una lista simple de las Testing Cards que pertenecen a una plantilla,
 * con un botón "Aplicar" para cada una que permite aplicar esa Testing Card específica.
 * 
 * @author Micrositio Iris Team
 * @version 1.0.0
 * @since 2025-10-28
 */

import React, { useState, useEffect } from 'react';
import { FileText, Play, AlertCircle, Loader2 } from 'lucide-react';
import ConfirmationModal from '../../../../components/ui-propios/ConfirmationModal/ConfirmationModal';

interface TestingCardData {
  id_testing_card: number;
  titulo: string;
  descripcion: string;
}

interface TemplateTestingCardListProps {
  /** ID de la testing card desde donde se está llamando */
  id_testing_card: number;
  /** ID de la  tetsing de plantilla de la testing card */
  id_testing_card_template?: number;
  /** Callback cuando se aplica una Testing Card específica */
  onApplyTestingCard: (testingCardData: TestingCardData) => void;
  /** Callback cuando se selecciona una Testing Card para ver detalles */
  onSelectTestingCard?: (testingCardData: TestingCardData) => void;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente que muestra una lista simple de Testing Cards de una plantilla
 */
const TemplateTestingCardList: React.FC<TemplateTestingCardListProps> = ({
  id_testing_card,
  onApplyTestingCard,
  onSelectTestingCard,
  className = ''
}) => {
  const [testingCards, setTestingCards] = useState<TestingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para confirmación de aplicación de plantilla
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedForApply, setSelectedForApply] = useState<TestingCardData | null>(null);
  const [isApplying, setIsApplying] = useState(false);


  // Log para confirmar que se recibe el id_testing_card

  /**
   * Carga las Testing Cards
   */
  useEffect(() => {
    loadTestingCards();
  }, []);

  /**
   * Obtiene las Testing Cards disponibles
   */
  const loadTestingCards = async () => {
    try {
      setLoading(true);
      setError(null);


      // Cargar testing cards directamente del servicio
      try {
        // Primero intentar obtener testing cards de plantillas
        const { obtenerTodasTestingCardsDePlantillas, listarTodasTestingCards } = await import('../../../../services/testingCardService');
        
        let todasLasTestingCards = [];
        
        try {
          todasLasTestingCards = await obtenerTodasTestingCardsDePlantillas();
        } catch (plantillasError) {
          console.warn('Error al obtener testing cards de plantillas, usando todas las testing cards:', plantillasError);
          // Si falla, obtener todas las testing cards
          todasLasTestingCards = await listarTodasTestingCards();
        }
        
        // Verificar que tenemos datos
        if (!Array.isArray(todasLasTestingCards)) {
          throw new Error('Los datos obtenidos no son un array válido');
        }
        
        // Tomar las primeras 10 como ejemplo
        const testingCardsLimitadas = todasLasTestingCards.slice(0, 10);
        
        const testingCardsData = testingCardsLimitadas.map((testingCard: any) => ({
          id_testing_card: testingCard.id_testing_card,
          titulo: testingCard.titulo || `Testing Card #${testingCard.id_testing_card}`,
          descripcion: testingCard.descripcion || 'Sin descripción disponible'
        }));

        setTestingCards(testingCardsData);
        
      } catch (apiError) {
        console.error('Error al usar API de testing cards:', apiError);
        
        // Fallback: usar datos mock si la API no está disponible
        const mockTestingCards: TestingCardData[] = [
          {
            id_testing_card: 1,
            titulo: "Testing Card de Validación (Mock)",
            descripcion: "Validar funcionalidad principal del sistema"
          },
          {
            id_testing_card: 2,
            titulo: "Testing Card de Performance (Mock)",
            descripcion: "Verificar tiempos de respuesta del API"
          },
          {
            id_testing_card: 3,
            titulo: "Testing Card de Seguridad (Mock)",
            descripcion: "Validar autenticación y autorización"
          },
          {
            id_testing_card: 4,
            titulo: "Testing Card de UI/UX (Mock)",
            descripcion: "Validar interfaz de usuario y experiencia"
          },
          {
            id_testing_card: 5,
            titulo: "Testing Card de Integración (Mock)",
            descripcion: "Verificar integración entre componentes"
          }
        ];
        
        setTestingCards(mockTestingCards);
      }
    } catch (err) {
      console.error('Error al cargar Testing Cards:', err);
      setError('Error al cargar las Testing Cards');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el click en aplicar una Testing Card específica como plantilla
   * 1. Obtiene la plantilla de la Testing Card seleccionada
   * 2. Aplica la plantilla a la Testing Card actual
   */
  const handleApplyTestingCard = async (testingCardTemplate: TestingCardData) => {
    try {

      // Paso 1: Obtener la plantilla de la Testing Card seleccionada
      const { obtenerPlantillasTestingCardPorTestingCard } = await import('../../../../services/plantillaTestingCardService');
      const { aplicarPlantillaATestingCard } = await import('../../../../services/testingCardService');
      
      const plantillasResponse = await obtenerPlantillasTestingCardPorTestingCard(testingCardTemplate.id_testing_card);
      
      
      // Verificar que se obtuvieron plantillas
      if (!plantillasResponse || plantillasResponse.length === 0) {
        throw new Error('No se encontraron plantillas para esta Testing Card');
      }

      // Tomar la primera plantilla disponible (o podrías implementar lógica para seleccionar una específica)
      const plantillaSeleccionada = plantillasResponse[0];
      const id_plantilla_testing_card = plantillaSeleccionada.id_plantilla_testing_card;


      // Paso 2: Aplicar la plantilla a la Testing Card actual
      //const plantillaId = parseInt(id_plantilla_testing_card);
      await aplicarPlantillaATestingCard(id_testing_card, id_plantilla_testing_card);      

      // Disparar evento global para notificar a editores que deben recargar datos
      try {
        const detail = { id_testing_card: id_testing_card, id_plantilla_testing_card };
        window.dispatchEvent(new CustomEvent('testingCardTemplateApplied', { detail }));
      } catch (e) {
        console.warn('No se pudo despachar evento testingCardTemplateApplied', e);
      }

      // Notificar al componente padre sobre la aplicación exitosa
      onApplyTestingCard(testingCardTemplate);

      // Opcional: Mostrar mensaje de éxito
      alert(`Plantilla "${testingCardTemplate.titulo}" aplicada exitosamente a la Testing Card ${id_testing_card}`);

    } catch (error) {
      console.error('Error al aplicar plantilla:', error);
      
      // Mostrar error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al aplicar la plantilla';
      alert(`Error: ${errorMessage}`);
      
      // También notificar al componente padre (solo pasamos la testing card original)
      onApplyTestingCard(testingCardTemplate);
    }
  };

  // Abre modal de confirmación
  const requestApplyTestingCard = (testingCardTemplate: TestingCardData) => {
    setSelectedForApply(testingCardTemplate);
    setShowConfirmModal(true);
  };

  // Confirma y aplica la plantilla
  const confirmApplyTestingCard = async () => {
    if (!selectedForApply) return;
    setIsApplying(true);
    try {
      await handleApplyTestingCard(selectedForApply);
    } finally {
      setIsApplying(false);
      setShowConfirmModal(false);
      setSelectedForApply(null);
    }
  };

  // Debug logs

  // Estado de carga
  if (loading) {
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-loading">
          <Loader2 className="animate-spin" size={24} />
          <span>Cargando Testing Cards...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-error">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Lista vacía
  if (testingCards.length === 0) {
    return (
      <div className={`template-list-container ${className}`}>
        <div className="template-list-empty">
          <FileText size={48} />
          <h3>No hay Testing Cards disponibles</h3>
          <p>No se encontraron Testing Cards para mostrar.</p>
        </div>
      </div>
    );
  }

  // Renderizar lista de Testing Cards
  return (
    <div className={`template-list-container ${className}`}>
      <div className="template-list-header">
        <h3>Testing Cards Disponibles</h3>
        <span className="template-list-count">{testingCards.length} elementos</span>
      </div>
      
      <div className="template-list-items">
        {testingCards.map((testingCard) => (
          <div 
            key={testingCard.id_testing_card} 
            className="template-list-item"
            onClick={() => onSelectTestingCard?.(testingCard)}
            style={{ cursor: onSelectTestingCard ? 'pointer' : 'default' }}
          >
            <div className="template-list-item-icon">
              <FileText size={20} />
            </div>
            
            <div className="template-list-item-content">
              <h4 className="template-list-item-title">{testingCard.titulo}</h4>
              <p className="template-list-item-description">{testingCard.descripcion}</p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation(); // Evitar que se dispare el click del contenedor
                requestApplyTestingCard(testingCard);
              }}
              className="template-list-item-apply-btn"
              title={`Aplicar: ${testingCard.titulo}`}
            >
              <Play size={16} />
              Aplicar
            </button>
          </div>
        ))}
      </div>
      {/* Modal de confirmación para aplicar plantilla */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { if (!isApplying) { setShowConfirmModal(false); setSelectedForApply(null); } }}
        onConfirm={confirmApplyTestingCard}
        title="Aplicar plantilla"
        message="Se va a reemplazar todo el contenido de la Testing Card destino. ¿Deseas continuar? Esta acción reemplazará los datos existentes y no se puede deshacer."
        confirmText="Aplicar"
        cancelText="Cancelar"
        type="warning"
        isLoading={isApplying}
      />
    </div>
  );
};

export default TemplateTestingCardList;
