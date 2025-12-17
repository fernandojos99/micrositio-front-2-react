import React, { useState } from 'react';
import styles from './SaveDocumentationModal.module.css';

interface SaveDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoria: string, descripcion?: string) => void;
  itemType: 'file' | 'url';
  itemName: string;
}

const SaveDocumentationModal: React.FC<SaveDocumentationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemType,
  itemName
}) => {
  const [categoria, setCategoria] = useState<string>('FORMATO');
  const [descripcion, setDescripcion] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoria) {
      alert('Por favor selecciona una categoría');
      return;
    }

    onSave(categoria, descripcion || undefined);
    handleClose();
  };

  const handleClose = () => {
    setCategoria('FORMATO');
    setDescripcion('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={handleClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Guardar Documentación</h2>
          <button className={styles['close-btn']} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label>
                <i className={itemType === 'file' ? 'fas fa-file-alt' : 'fas fa-link'}></i>
                {itemType === 'file' ? 'Archivo' : 'URL'}
              </label>
              <input 
                type="text" 
                value={itemName} 
                disabled 
                className={styles['disabled-input']}
              />
            </div>

            <div className={styles['form-group']}>
              <label>
                <i className="fas fa-tag"></i>
                Categoría <span className={styles['required']}>*</span>
              </label>
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)}
                className={styles['select-input']}
                required
              >
                <option value="HERRAMIENTA">HERRAMIENTA</option>
                <option value="CURSO">CURSO</option>
                <option value="LIBROS">LIBROS</option>
                <option value="FORMATO">FORMATO</option>
              </select>
            </div>

            {itemType === 'url' && (
              <div className={styles['form-group']}>
                <label>
                  <i className="fas fa-comment-alt"></i>
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className={styles['textarea-input']}
                  rows={3}
                  placeholder="Agrega una descripción opcional..."
                />
              </div>
            )}
          </div>

          <div className={styles['modal-footer']}>
            <button 
              type="button" 
              className={styles['cancel-btn']} 
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles['save-btn']}
            >
              <i className="fas fa-save"></i>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveDocumentationModal;
