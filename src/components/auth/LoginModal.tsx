import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui-propios/Button/Button';
import styles from './LoginModal.module.css';

/**
 * Props para el componente LoginModal
 * @interface LoginModalProps
 */
interface LoginModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
}

/**
 * Modal de inicio de sesión con validación completa
 * 
 * @component LoginModal
 * @description Modal de autenticación que permite a los usuarios iniciar sesión
 * con alias y contraseña. Incluye validación en tiempo real, manejo de errores
 * y estados de carga.
 * 
 * Características principales:
 * - Validación de alias en tiempo real
 * - Validación de contraseña (mínimo 8 caracteres)
 * - Toggle de visibilidad de contraseña
 * - Estados de carga durante autenticación
 * - Manejo de errores de login
 * - Cierre con tecla ESC
 * - Prevención de scroll del body
 * - Enfoque automático en campos
 * 
 * Credenciales de prueba:
 * - Alias: admin
 * - Contraseña: admin123
 * 
 * @example
 * ```tsx
 * <LoginModal
 *   isOpen={showLoginModal}
 *   onClose={() => setShowLoginModal(false)}
 * />
 * ```
 * 
 * @param {LoginModalProps} props - Props del componente
 * @returns {JSX.Element} Modal de login
 */
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  // @context: Contexto de autenticación
  const { login, isLoading } = useAuth();
  
  // @state: Datos del formulario
  const [formData, setFormData] = useState({
    alias: '',
    password: ''
  });
  
  // @state: Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // @state: Control de visibilidad de contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // @state: Error de autenticación
  const [authError, setAuthError] = useState('');

  /**
   * Efecto para manejar el cierre con ESC y prevenir scroll
   * @function useEffect
   */
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

  /**
   * Efecto para limpiar formulario al abrir/cerrar modal
   * @function useEffect
   */
  useEffect(() => {
    if (isOpen) {
      // @reset: Limpiar formulario al abrir
      setFormData({ alias: '', password: '' });
      setErrors({});
      setAuthError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  /**
   * Valida el alias en tiempo real
   * @function validateAlias
   * @param {string} alias - Alias a validar
   * @returns {string} Mensaje de error o cadena vacía si es válido
   */
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
    
    // Validar solo alfanuméricos, guiones y guiones bajos
    const aliasRegex = /^[a-zA-Z0-9_@.-]+$/;
    if (!aliasRegex.test(alias)) {
      return 'El alias solo puede contener letras, números, guiones y guiones bajos';
    }
    
    return '';
  };

  /**
   * Valida la contraseña en tiempo real
   * @function validatePassword
   * @param {string} password - Contraseña a validar
   * @returns {string} Mensaje de error o cadena vacía si es válida
   */
  const validatePassword = (password: string): string => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    
    return '';
  };

  /**
   * Maneja el cambio en los campos del formulario
   * @function handleInputChange
   * @param {string} field - Campo que cambió
   * @param {string} value - Nuevo valor
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // @validation: Limpiar errores al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // @validation: Limpiar error de autenticación
    if (authError) {
      setAuthError('');
    }
  };

  /**
   * Valida todo el formulario
   * @function validateForm
   * @returns {boolean} true si el formulario es válido
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const aliasError = validateAlias(formData.alias);
    if (aliasError) newErrors.alias = aliasError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
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
    
    if (!validateForm()) return;
    
    try {
      const success = await login(formData.alias, formData.password);
      
      if (success) {
        onClose();
      } else {
        setAuthError('Alias o contraseña incorrectos. Verifica tus credenciales.');
      }
    } catch (error) {
      setAuthError('Error de conexión. Intenta nuevamente.');
    }
  };

  /**
   * Verifica si el formulario es válido para habilitar el botón
   * @function isFormValid
   * @returns {boolean} true si el formulario es válido
   */
  const isFormValid = (): boolean => {
    return formData.alias.trim() !== '' && 
           formData.password.length >= 8 && 
           validateAlias(formData.alias) === '' && 
           validatePassword(formData.password) === '';
  };

  // @render: No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className={styles['modal-backdrop']}>
      <div className={styles['modal-container']}>
        {/* @section: Header del modal */}
        <div className={styles['modal-header']}>
          <div className={styles['modal-icon']}>
            <LogIn size={24} />
          </div>
          <h2 className={styles['modal-title']}>Iniciar Sesión</h2>
          <button
            onClick={onClose}
            className={styles['modal-close-button']}
            disabled={isLoading}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* @section: Cuerpo del modal con formulario */}
        <div className={styles['modal-body']}>
          <p className={styles['modal-description']}>
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          {/* @component: Error de autenticación */}
          {authError && (
            <div className={styles['auth-error']}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['login-form']}>
            {/* @section: Campo de alias */}
            <div className={styles['form-group']}>
              <label htmlFor="alias" className={styles['form-label']}>
                <Mail size={16} className={styles['form-label-icon']} />
                Alias
              </label>
              <div className={styles['input-container']}>
                <input
                  type="text"
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  className={`${styles['form-input']} ${errors.alias ? styles['input-error'] : ''}`}
                  placeholder="tu_alias"
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

            {/* @section: Campo de contraseña */}
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
                  autoComplete="current-password"
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

            {/* @section: Información de credenciales de prueba 
            <div className={styles['demo-credentials']}>
              <h4>Credenciales de prueba:</h4>
              <p><strong>Alias:</strong> admin</p>
              <p><strong>Contraseña:</strong> Admin123</p>
            </div> */}

            {/* @section: Botón de envío */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={!isFormValid() || isLoading}
              icon={<LogIn size={16} />}
              className={styles['submit-button']}
            >
              {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;