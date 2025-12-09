import React, { useRef } from 'react';
import { Play, GitBranch, Save, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Secuencia } from '../../../types/secuencia';
import FlowEditor, { FlowEditorRef } from '../../../components/FlowEditor/FlowEditor';
import Button from '../../../components/ui/Button/Button';
import styles from './FlowEditorSection.module.css';

interface FlowEditorSectionProps {
  secuenciaSeleccionada: Secuencia | null;
  onGuardarCambios?: () => void;
  onTestingCardsChange?: () => void;
  onTestingCardSelect?: (cardId: string) => void;
  onLearningCardSelect?: (cardId: string) => void;
  onCardDeselect?: () => void;
  selectedTestingCardId?: string;
  selectedLearningCardId?: string;
}

const FlowEditorSection: React.FC<FlowEditorSectionProps> = ({
  secuenciaSeleccionada,
  onGuardarCambios,
  onTestingCardsChange,
  onTestingCardSelect,
  onLearningCardSelect,
  onCardDeselect,
  selectedTestingCardId,
  selectedLearningCardId,
}) => {
  const flowEditorRef = useRef<FlowEditorRef>(null);

  const handleGuardarCambios = async () => {
    try {
      if (flowEditorRef.current) {
        // Guardar las posiciones de los nodos
        await flowEditorRef.current.saveCurrentPositions();
        console.log('Posiciones de nodos guardadas exitosamente');
      }
      
      // Llamar al callback original si existe
      if (onGuardarCambios) {
        onGuardarCambios();
      }
    } catch (error) {
      console.error('Error guardando las posiciones de los nodos:', error);
      // Aquí podrías mostrar un toast o notificación de error
      
      // Aún así, llamar al callback original para no romper el flujo
      if (onGuardarCambios) {
        onGuardarCambios();
      }
    }
  };

  const handleFitView = () => {
    if (flowEditorRef.current) {
      flowEditorRef.current.fitViewNow();
    }
  };

  if (!secuenciaSeleccionada) {
    return (
      <div className={styles['flow-editor-section']}>
        <div className={styles['flow-editor-header']}>
          <div className={styles['flow-editor-title-container']}>
            <h2 className={styles['flow-editor-title']}>Editor de Flujo</h2>
            <p className={styles['flow-editor-subtitle']}>
              Selecciona una secuencia para comenzar a editar
            </p>
          </div>
        </div>

        <div className={styles['flow-editor-container']}>
          <div className={styles['flow-editor-placeholder']}>
            <GitBranch size={48} className={styles['placeholder-icon']} />
            <h3 className={styles['placeholder-title']}>
              Ninguna secuencia seleccionada
            </h3>
            <p className={styles['placeholder-description']}>
              Selecciona una secuencia de la lista anterior para visualizar y editar su flujo de trabajo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['flow-editor-section']}>
      <div className={styles['flow-editor-header']}>
        <div className={styles['flow-editor-title-container']}>
          <h2 className={styles['flow-editor-title']}>Editor de Flujo</h2>
          <p className={styles['flow-editor-subtitle']}>
            Editando flujo de trabajo de la secuencia seleccionada
          </p>
        </div>

        <div className={styles['flow-editor-actions']}>
          <div className={styles['secuencia-badge']}>
            <Play size={14} />
            {secuenciaSeleccionada.nombre}
          </div>

          <div className={styles['action-buttons']}>
            {/* @component: Botón de Revisión de Experimentos */}
            <Link to="/assistant" className={styles['assistant-button']}>
              <Bot size={14} />
              <span>Revisión de Experimentos</span>
            </Link>

            {/* @component: Botón de Guardar */}
            {onGuardarCambios && (
              <Button
                variant="primary"
                size="small"
                icon={<Save size={14} />}
                onClick={handleGuardarCambios}
              >
                Guardar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={styles['flow-editor-container']}>
        <FlowEditor
          ref={flowEditorRef}
          key={`flow-${secuenciaSeleccionada.id}`}
          idSecuencia={secuenciaSeleccionada.id}
          onTestingCardsChange={onTestingCardsChange}
          onTestingCardSelect={onTestingCardSelect}
          onLearningCardSelect={onLearningCardSelect}
          onCardDeselect={onCardDeselect}
          selectedTestingCardId={selectedTestingCardId}
          selectedLearningCardId={selectedLearningCardId}
        />
      </div>
    </div>
  );
};

export default FlowEditorSection;
