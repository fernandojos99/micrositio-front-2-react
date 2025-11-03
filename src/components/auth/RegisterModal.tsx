import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import Button from '../ui/Button/Button';
import styles from './LoginModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
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
      setFormData({ email: '', password: '', confirmPassword: '' });
      setErrors({});
      setAuthError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'El correo electrónico es requerido';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El formato del correo electrónico no es válido';
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
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email === 'test@error.com') {
        throw new Error('Este correo electrónico ya está registrado');
      }
      
      console.log('Registro exitoso:', { email: formData.email });
      alert(`¡Registro exitoso! Se ha enviado un correo de confirmación a ${formData.email}`);
      onClose();
      
    } catch (error) {
      console.error('Error en registro:', error);
      setAuthError(error instanceof Error ? error.message : 'Error al crear la cuenta. Por favor intenta de nuevo.');
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
    return formData.email.trim() !== '' && 
           formData.password.length >= 8 && 
           formData.confirmPassword.length >= 8 &&
           validateEmail(formData.email) === '' && 
           validatePassword(formData.password) === '' &&
           validateConfirmPassword(formData.confirmPassword, formData.password) === '';
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
          <p className={styles['modal-description']}>
            Crea tu cuenta para acceder a todas las funcionalidades
          </p>

          {authError && (
            <div className={styles['auth-error']}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['login-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="email" className={styles['form-label']}>
                <Mail size={16} className={styles['form-label-icon']} />
                Correo Electrónico
              </label>
              <div className={styles['input-container']}>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${styles['form-input']} ${errors.email ? styles['input-error'] : ''}`}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className={styles['error-text']}>
                  <AlertCircle size={14} />
                  {errors.email}
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
              <p><strong>Email:</strong> Formato válido (ej: usuario@dominio.com)</p>
              <p><strong>Contraseña:</strong> Mínimo 8 caracteres</p>
            </div>

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
