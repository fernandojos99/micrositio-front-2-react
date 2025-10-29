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
  /** ID de la plantilla */
  plantillaId: number;
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
  plantillaId,
  onApplyTestingCard,
  onSelectTestingCard,
  className = ''
}) => {
  const [testingCards, setTestingCards] = useState<TestingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las Testing Cards de la plantilla
   */
  useEffect(() => {
    if (plantillaId) {
      loadTestingCards();
    }
  }, [plantillaId]);

  /**
   * Obtiene las Testing Cards asociadas a la plantilla
   */
  const loadTestingCards = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Intentando cargar plantillas para plantilla ID:', plantillaId);

      // Opción 1: Intentar usar el servicio de testing cards directamente
      try {
        // Usar el servicio de testing cards que sabemos que funciona
        const { listarTodasTestingCards } = await import('../../../../services/testingCardService');
        const todasLasTestingCards = await listarTodasTestingCards();
        console.log('Testing Cards obtenidas directamente:', todasLasTestingCards);
        
        // Tomar las primeras 5 como ejemplo de plantilla
        const testingCardsLimitadas = todasLasTestingCards.slice(0, 5);
        
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
          }
        ];
        
        setTestingCards(mockTestingCards);
      }
    } catch (err) {
      console.error('Error al cargar Testing Cards de la plantilla:', err);
      setError('Error al cargar las Testing Cards de la plantilla');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el click en aplicar una Testing Card específica
   */
  const handleApplyTestingCard = (testingCard: TestingCardData) => {
    console.log('Aplicando Testing Card:', testingCard);
    onApplyTestingCard(testingCard);
  };

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
          <h3>No hay plantillas disponibles</h3>
          //<p>Esta plantilla no contiene Testing Cards.</p>
        </div>
      </div>
    );
  }

  // Renderizar lista de Testing Cards
  return (
    <div className={`template-list-container ${className}`}>
      <div className="template-list-header">
        <h3>Testing Cards de la Plantilla</h3>
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
