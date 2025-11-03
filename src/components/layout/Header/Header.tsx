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
  Users, 
  Briefcase, 
  BookOpen,
  ChevronDown 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BubbleBackground from '../BubbleBackground/BubbleBackground';
import LoginModal from '../../auth/LoginModal';
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
  
  // @state: Control del modal de login y navegación
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  /**
   * Maneja el clic en el botón de login
   * @function handleLoginClick
   */
  const handleLoginClick = () => {
    setShowLoginModal(true);
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

        {/* @section: Navegación principal (solo para usuarios autenticados) */}
        {user && (
          <nav className={styles['main-nav']}>
            <Link to="/proyectos" className={styles['nav-link']}>
              <Briefcase size={16} />
              Proyectos
            </Link>
            <Link to="/equipo" className={styles['nav-link']}>
              <Users size={16} />
              Equipo
            </Link>
            <Link to="/libro-digital" className={styles['nav-link']}>
              <BookOpen size={16} />
              Libro Digital
            </Link>
            {user.tipo === 'EDITOR' && (
              <Link to="/administracion" className={styles['nav-link-admin']}>
                <Settings size={16} />
                Administración
              </Link>
            )}
          </nav>
        )}

        {/* @section: Acciones del header */}
        <div className={styles['header-actions']}>
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
            <button 
              onClick={handleLoginClick}
              className={styles['login-button']}
            >
              <LogIn className={styles['login-icon']} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* @component: Modal de login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
};

export default Header;