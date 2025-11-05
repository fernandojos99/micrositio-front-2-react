import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import Button from '../ui/Button/Button';
import { crearUsuarioVisitante } from '../../services/usuarioService';
import styles from './LoginModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    alias: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ alias: '', password: '', confirmPassword: '' });
      setErrors({});
      setAuthError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const validateAlias = (alias: string): string => {
    if (!alias.trim()) {
      return 'El alias es requerido';
    }
    
    if (alias.length < 3) {
      return 'El alias debe tener al menos 3 caracteres';
    }
    
    if (alias.length > 50) {
      return 'El alias debe tener máximo 50 caracteres';
    }
    
    // Validar solo alfanuméricos, guiones, guiones bajos y @
    const aliasRegex = /^[a-zA-Z0-9@._-]+$/;
    if (!aliasRegex.test(alias)) {
      return 'El alias solo puede contener letras, números, @ (arroba), guiones y guiones bajos';
    }
    
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Verificar al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    
    // Verificar al menos un número
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    
    // Verificar al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...)';
    }
    
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) {
      return 'La confirmación de contraseña es requerida';
    }
    
    if (confirmPassword !== password) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (authError) {
      setAuthError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const aliasError = validateAlias(formData.alias);
    if (aliasError) newErrors.alias = aliasError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAuthError('');

    try {
      // Crear el usuario usando el servicio
      const nuevoUsuario = await crearUsuarioVisitante({
        alias: formData.alias,
        password: formData.password,
        tipo: 'VISITANTE', // Por defecto los registros desde el frontend son visitantes
        activo: true
      });
      
      console.log('Usuario creado exitosamente:', nuevoUsuario);
      alert(`¡Registro exitoso! Usuario "${formData.alias}" creado correctamente.`);
      onClose();
      
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al crear la cuenta. Por favor intenta de nuevo.';
      
      if (error instanceof Error) {
        // Si el error contiene información sobre alias duplicado u otros errores específicos
        if (error.message.includes('alias') || error.message.includes('duplicate')) {
          errorMessage = 'Este alias ya está en uso. Por favor elige otro.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const isFormValid = (): boolean => {
    return formData.alias.trim() !== '' && 
           formData.password.length >= 8 && 
           formData.confirmPassword.length >= 8 &&
           validateAlias(formData.alias) === '' && 
           validatePassword(formData.password) === '' &&
           validateConfirmPassword(formData.confirmPassword, formData.password) === '';
  };

  /**
   * Obtiene las razones por las que el formulario no es válido
   * @returns {string[]} Array de mensajes de advertencia
   */
  const getValidationWarnings = (): string[] => {
    const warnings: string[] = [];
    
    // Verificar alias
    if (!formData.alias.trim()) {
      warnings.push('El alias es requerido');
    } else {
      const aliasError = validateAlias(formData.alias);
      if (aliasError) {
        warnings.push(aliasError);
      }
    }
    
    // Verificar contraseña
    if (!formData.password) {
      warnings.push('La contraseña es requerida');
    } else {
      if (formData.password.length < 8) {
        warnings.push('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(formData.password)) {
        warnings.push('La contraseña debe contener al menos una letra mayúscula');
      }
      if (!/[0-9]/.test(formData.password)) {
        warnings.push('La contraseña debe contener al menos un número');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        warnings.push('La contraseña debe contener al menos un carácter especial');
      }
    }
    
    // Verificar confirmación de contraseña
    if (!formData.confirmPassword) {
      warnings.push('La confirmación de contraseña es requerida');
    } else if (formData.confirmPassword.length < 8) {
      warnings.push('La confirmación debe tener al menos 8 caracteres');
    } else if (formData.password && formData.confirmPassword !== formData.password) {
      warnings.push('Las contraseñas no coinciden');
    }
    
    return warnings;
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleBackdropClick}>
      <div className={styles['modal-container']}>
        <div className={styles['modal-header']}>
          <div className={styles['modal-icon']}>
            <UserPlus size={24} />
          </div>
          <h2 className={styles['modal-title']}>Crear Cuenta</h2>
          <button
            onClick={onClose}
            className={styles['modal-close-button']}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles['modal-body']}>
          {/*<p className={styles['modal-description']}>
            Crea tu cuenta para acceder a todas las funcionalidades
          </p>*/}

          {authError && (
            <div className={styles['auth-error']}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['login-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="alias" className={styles['form-label']}>
                <Mail size={16} className={styles['form-label-icon']} />
                Correo del Usuaio
              </label>
              <div className={styles['input-container']}>
                <input
                  type="text"
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  className={`${styles['form-input']} ${errors.alias ? styles['input-error'] : ''}`}
                  placeholder="Tu correo electrónico"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.alias && (
                <span className={styles['error-text']}>
                  <AlertCircle size={14} />
                  {errors.alias}
                </span>
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="password" className={styles['form-label']}>
                <Lock size={16} className={styles['form-label-icon']} />
                Contraseña
              </label>
              <div className={styles['input-container']}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`${styles['form-input']} ${styles['password-input']} ${errors.password ? styles['input-error'] : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles['password-toggle']}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles['error-text']}>
                  <AlertCircle size={14} />
                  {errors.password}
                </span>
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirmPassword" className={styles['form-label']}>
                <Lock size={16} className={styles['form-label-icon']} />
                Confirmar Contraseña
              </label>
              <div className={styles['input-container']}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`${styles['form-input']} ${styles['password-input']} ${errors.confirmPassword ? styles['input-error'] : ''}`}
                  placeholder="Confirma tu contraseña"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles['password-toggle']}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles['error-text']}>
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className={styles['demo-credentials']}>
              <h4>Requisitos:</h4>
              <p><strong>Alias:</strong> 3-50 caracteres, solo letras, números, guiones y @</p>
              <p><strong>Contraseña:</strong> Mínimo 8 caracteres, una mayúscula, un número y un carácter especial</p>
            </div>

            {/* @section: Advertencias de validación */}
            {!isFormValid() && (
              <div className={styles['validation-warnings']} style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '8px'
              }}>
                {/*<div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgb(146, 64, 14)'
                }}>
                  <AlertCircle size={16} />
                  <span>Para habilitar el botón "Crear Cuenta":</span>
                </div>
                <ul style={{
                  margin: '0',
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: 'rgb(146, 64, 14)',
                  lineHeight: '1.4'
                }}>
                  {getValidationWarnings().map((warning, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      {warning}
                    </li>
                  ))}
                </ul>*/}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={!isFormValid() || isLoading}
              icon={<UserPlus size={16} />}
              className={styles['submit-button']}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
