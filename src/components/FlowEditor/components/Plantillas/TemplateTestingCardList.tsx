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


  // Log para confirmar que se recibe el id_testing_card
  console.log('TemplateTestingCardList recibió id_testing_card:', id_testing_card);

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

      console.log('Cargando Testing Cards disponibles');

      // Cargar testing cards directamente del servicio
      try {
        // Primero intentar obtener testing cards de plantillas
        const { obtenerTodasTestingCardsDePlantillas, listarTodasTestingCards } = await import('../../../../services/testingCardService');
        
        let todasLasTestingCards = [];
        
        try {
          todasLasTestingCards = await obtenerTodasTestingCardsDePlantillas();
          console.log('Testing Cards de plantillas obtenidas:', todasLasTestingCards);
        } catch (plantillasError) {
          console.warn('Error al obtener testing cards de plantillas, usando todas las testing cards:', plantillasError);
          // Si falla, obtener todas las testing cards
          todasLasTestingCards = await listarTodasTestingCards();
          console.log('Todas las Testing Cards obtenidas:', todasLasTestingCards);
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

        console.log('Testing Cards procesadas:', testingCardsData);
        setTestingCards(testingCardsData);
        
      } catch (apiError) {
        console.error('Error al usar API de testing cards:', apiError);
        
        // Fallback: usar datos mock si la API no está disponible
        console.log('Usando datos mock como fallback');
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
        
        console.log('Datos mock establecidos:', mockTestingCards);
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
      console.log('Iniciando aplicación de plantilla...');
      console.log('Testing Card Template:', testingCardTemplate);
      console.log('Testing Card destino ID:', id_testing_card);

      // Paso 1: Obtener la plantilla de la Testing Card seleccionada
      const { obtenerPlantillasTestingCardPorTestingCard } = await import('../../../../services/plantillaTestingCardService');
      const { aplicarPlantillaATestingCard } = await import('../../../../services/testingCardService');
      
      console.log('Obteniendo plantillas para Testing Card:', testingCardTemplate.id_testing_card);
      const plantillasResponse = await obtenerPlantillasTestingCardPorTestingCard(testingCardTemplate.id_testing_card);
      
      console.log('Plantillas obtenidas:', plantillasResponse);
      
      // Verificar que se obtuvieron plantillas
      if (!plantillasResponse || plantillasResponse.length === 0) {
        throw new Error('No se encontraron plantillas para esta Testing Card');
      }

      // Tomar la primera plantilla disponible (o podrías implementar lógica para seleccionar una específica)
      const plantillaSeleccionada = plantillasResponse[0];
      const id_plantilla_testing_card = plantillaSeleccionada.id_plantilla_testing_card;

      console.log('Plantilla seleccionada:', plantillaSeleccionada);
      console.log('ID de plantilla a aplicar:', id_plantilla_testing_card);

      // Paso 2: Aplicar la plantilla a la Testing Card actual
      console.log(`Aplicando plantilla ${id_plantilla_testing_card} a Testing Card ${id_testing_card}`);
      //const plantillaId = parseInt(id_plantilla_testing_card);
      const aplicacionResponse = await aplicarPlantillaATestingCard(id_testing_card, id_plantilla_testing_card);
      
      console.log('Plantilla aplicada exitosamente:', aplicacionResponse);

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

  // Debug logs
  console.log('Estado actual - Loading:', loading, 'Error:', error, 'TestingCards count:', testingCards.length);

  // Estado de carga
  if (loading) {
    console.log('Renderizando estado de carga');
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
    console.log('Renderizando estado de error:', error);
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
    console.log('Renderizando estado de lista vacía');
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
  console.log('Renderizando lista de Testing Cards:', testingCards);
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
                handleApplyTestingCard(testingCard);
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
    </div>
  );
};

export default TemplateTestingCardList;
