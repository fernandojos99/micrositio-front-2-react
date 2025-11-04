import React, { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  User, 
  Settings,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BubbleBackground from '../BubbleBackground/BubbleBackground';
import LoginModal from '../../auth/LoginModal';
import RegisterModal from '../../auth/RegisterModal';
import styles from './Header.module.css';

/**
 * Componente Header con sistema de autenticación integrado
 * 
 * @component Header
 * @description Header principal de la aplicación que incluye logo, toggle de tema
 * y sistema de autenticación. Muestra diferentes estados según si el usuario
 * está autenticado o no.
 * 
 * Características principales:
 * - Logo con gradiente animado
 * - Toggle de tema claro/oscuro
 * - Botón de login para usuarios no autenticados
 * - Menú de usuario para usuarios autenticados (perfil + logout)
 * - Modal de login integrado
 * - Fondo animado con burbujas
 * - Responsive design
 * 
 * Estados de autenticación:
 * - No autenticado: Muestra botón "Login"
 * - Autenticado: Muestra icono de usuario + botón logout
 * 
 * @returns {JSX.Element} Header de la aplicación
 */
const Header: React.FC = () => {
  // @context: Tema y autenticación
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  // @state: Control de los modales
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  /**
   * Maneja el clic en el botón de login
   * @function handleLoginClick
   */
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  /**
   * Maneja el clic en el botón de registro
   * @function handleRegisterClick
   */
  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  /**
   * Maneja el logout del usuario
   * @function handleLogout
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <BubbleBackground />
      
      <div className={styles['header-content']}>
        {/* @section: Logo y título */}
        <Link to="/" className={styles['logo-area']}>
          <div className={styles['logo-icon']}>
            <span className={styles['logo-text']}>IR</span>
          </div>
          <h1 className={styles['logo-title']}>
            <span className={styles['logo-innovative']}>Iris </span>
            <span className={styles['logo-repository']}>Start up Lab</span>
          </h1>
        </Link>

        {/* @section: Acciones del header */}
        <div className={styles['header-actions']}>
          {/* @section: Autenticación condicional */}
          {user ? (
            /* @section: Usuario autenticado */
            <div className={styles['user-menu']}>
              {/* @component: Enlace al perfil */}
              <Link to="/perfil" className={styles['user-profile']}>
                <div className={styles['user-avatar']}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className={styles['avatar-image']}
                    />
                  ) : (
                    <User className={styles['avatar-icon']} />
                  )}
                </div>
                <span className={styles['user-name']}>{user.name}</span>
              </Link>

              {/* @component: Botón de logout */}
              <button 
                onClick={handleLogout}
                className={styles['logout-button']}
                aria-label="Cerrar sesión"
              >
                <LogOut className={styles['logout-icon']} />
                <span className={styles['logout-text']}>Logout</span>
              </button>
            </div>
          ) : (
            /* @section: Usuario no autenticado */
            <div className={styles['auth-buttons']}>
              <button 
                onClick={handleRegisterClick}
                className={styles['register-button']}
              >
                <UserPlus className={styles['register-icon']} />
                <span>Registro</span>
              </button>
              <button 
                onClick={handleLoginClick}
                className={styles['login-button']}
              >
                <LogIn className={styles['login-icon']} />
                <span>Login</span>
              </button>
            </div>
          )}

          {/* @component: Botón de configuración (solo para usuarios autenticados) */}
          {user && (
            <button 
              className={styles['settings-button']}
              aria-label="Configuración"
            >
              <Settings className={styles['settings-icon']} />
            </button>
          )}

          {/* @component: Toggle de tema */}
          <button 
            onClick={toggleTheme}
            className={styles['theme-toggle']}
            aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? 
              <Sun className={styles['theme-icon-sun']} /> : 
              <Moon className={styles['theme-icon-moon']} />
            }
          </button>
        </div>
      </div>

      {/* @component: Modal de login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* @component: Modal de registro */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </header>
  );
};

export default Header;