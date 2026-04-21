

/**
 * Componente principal de la aplicación
 * 
 * @component App
 * @description Componente raíz que configura el enrutamiento, proveedores de contexto
 * y la estructura general de la aplicación. Incluye el sistema de autenticación
 * y gestión de temas.
 * 
 * Características principales:
 * - Configuración de React Router para navegación
 * - Proveedores de contexto para tema y autenticación
 * - Rutas protegidas y públicas
 * - Layout principal compartido
 * - Redirección automática para rutas no encontradas
 * 
 * Estructura de rutas:
 * - / : Página de inicio
 * - /proyectos : Lista de proyectos
 * - /proyectos/:id : Detalle de proyecto específico
 * - /perfil : Página de perfil de usuario
 * - /equipo : Página del equipo
 * - /agentes : Página de agentes
 * - /formatos : Página de formatos
 * - /assistant : Asistente interactivo
 * - /libro-digital : Página del libro digital
 * - /administracion : Panel de administración (solo EDITORES)
 * 
 * @returns {JSX.Element} Aplicación completa
 */

//import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './routes/AppRoutes';
import { UIProvider } from './contexts/UIContext';
import { Toaster } from './components/ui-shadcn2/toaster';

function App() {
  return (
    <ThemeProvider>
      <UIProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Router>
              <AppRoutes />
            </Router>
          </AppProvider>
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;