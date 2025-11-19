/**
 * Página de Administración del Sistema
 * 
 * Esta página permite a los usuarios EDITORES gestionar los recursos
 * del sistema, incluyendo la administración de usuarios VISITANTES
 * y la asignación de proyectos.
 * 
 * Funcionalidades principales:
 * - Gestión de usuarios y proyectos
 * - Conversión de VISITANTES a EDITORES
 * - Control de acceso a recursos
 * - Panel de administración completo
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Settings, Shield, UserPlus } from 'lucide-react';
import UsersProjectsList from '../../components/UsersProjects/UsersProjectsList';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import styles from './Administracion.module.css';

/**
 * Componente principal de la página de administración
 * Solo accesible para usuarios con tipo EDITOR
 */
const Administracion: React.FC = () => {
  const { user } = useAuth();

  // Verificar que el usuario sea EDITOR
  if (!user || user.tipo !== 'EDITOR') {
    return (
      <div className={styles.accessDenied}>
        <Shield size={48} />
        <h1>Acceso Denegado</h1>
        <p>Solo los usuarios administradores pueden acceder a esta página.</p>
        <p>Contacta al administrador del sistema si necesitas permisos adicionales.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header de la página */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Settings size={32} />
            <div>
              <h1>Panel de Administración</h1>
              <p>Gestiona usuarios, proyectos y permisos del sistema</p>
            </div>
          </div>
          <div className={styles.adminBadge}>
            <Shield size={16} />
            <span>Administrador</span>
          </div>
        </div>
      </header>

      {/* Sección de navegación rápida */}
      <section className={styles.quickActions}>
        <h2>Acciones Rápidas</h2>
        <div className={styles.actionsGrid}>
          <div className={styles.actionCard}>
            <Users size={24} />
            <h3>Gestión de Usuarios</h3>
            <p>Administra usuarios visitantes y editores</p>
          </div>
          <div className={styles.actionCard}>
            <UserPlus size={24} />
            <h3>Promoción de Usuarios</h3>
            <p>Convierte visitantes en editores</p>
          </div>
        </div>
      </section>

      {/* Componente principal de gestión */}
      <section className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2>Gestión de Usuarios y Proyectos</h2>
          <p>Administra la asignación de proyectos y permisos de usuarios</p>
        </div>
        <ErrorBoundary>
          <UsersProjectsList />
        </ErrorBoundary>
      </section>
    </div>
  );
};

export default Administracion;
