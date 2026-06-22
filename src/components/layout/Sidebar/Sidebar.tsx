import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FolderOpen, 
  Bot, 
  FileText, 
  Users,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageCircle ,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
//import { ... } from '@/contexts/AuthContext';

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { 
    path: '/proyectos', 
    name: 'Proyectos', 
    icon: <FolderOpen size={20} /> 
  },
  { 
    path: '/agentes', 
    name: 'Agentes', 
    icon: <Bot size={20} /> 
  },
  { 
    path: '/formatos', 
    name: 'Formatos', 
    icon: <FileText size={20} /> 
  },
  { 
    path: '/equipo', 
    name: 'Equipo', 
    icon: <Users size={20} /> 
  },
  {
    path: '/libro-digital',
    name: 'Libro Digital',
    icon: <BookOpen size={20} />
  },
  {
    path: '/transcripts',
    name: 'Transcripts',
    icon: <MessageCircle size={20} />
  },

  // Descomentar cuando me aprueben el subirlo
    {
    path: '/chatAgente',
    name: 'Chat Agente',
    icon: <Bot size={20} />
   }, 
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const { user } = useAuth();
  const { openLoginModal } = useUI();


  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles['sidebar-collapsed'] : styles['sidebar-expanded']}`}>
      <div className={styles['sidebar-content']}>
        <div className={styles['sidebar-header']}>
          {!isCollapsed && (
            <h2 className={styles['sidebar-title']}>Menú</h2>
          )}
          <button
            onClick={toggleSidebar}
            className={styles['toggle-button']}
            aria-label={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className={styles.navigation}>
          <ul className={styles['nav-list']}>
            {menuItems.map((item) => (

              <li key={item.path}>
                <NavLink
                  to={item.path}
                  // Para que active el modal si no hay usuario
                  // Utiliza contexto para administrar el modal de forma global
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        openLoginModal();
                        }
                      }}
                  className={({ isActive }) => 
                    `${styles['nav-item']} ${
                      isActive ? styles['nav-item-active'] : ''
                    } ${
                      isCollapsed ? styles['nav-item-collapsed'] : styles['nav-item-expanded']
                    }`
                  }
                >
                  <span className={styles['nav-icon']}>{item.icon}</span>
                  {!isCollapsed && <span className={styles['nav-text']}>{item.name}</span>}
                </NavLink>
              </li>

            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;