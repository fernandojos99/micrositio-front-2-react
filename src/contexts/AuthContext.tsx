import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginService, verifyToken, setToken, removeToken, BackendUser } from '../services/authService';

/**
 * Interfaz para definir un usuario (adaptada para el frontend)
 */
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  projects: string[];
  joinDate: string;
  role?: string;
  // Datos adicionales del backend
  alias: string;
  tipo: 'EDITOR' | 'VISITANTE';
  id_empleado: number | null;
  activo: boolean;
  proyectosIds?: number[];
}

/**
 * Interfaz para el contexto de autenticación
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (alias: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convierte usuario del backend al formato del frontend
 */
const transformBackendUser = (backendUser: BackendUser): User => {
  // console.log('🔍 AuthContext - Datos del backend completos:', backendUser);
  
  // Manejar tanto user_id (del JWT) como id_usuario (del objeto directo)
  const userId = backendUser.id_usuario || backendUser.user_id;
  // console.log('🔍 AuthContext - ID extraído:', userId);
  // console.log('🔍 AuthContext - backendUser.id_usuario:', backendUser.id_usuario);
  // console.log('🔍 AuthContext - backendUser.user_id:', backendUser.user_id);
  // console.log('🔍 AuthContext - Claves del objeto backend:', Object.keys(backendUser));
  
  if (!userId) {
    throw new Error('No se pudo obtener el ID del usuario del backend');
  }
  
  const transformedUser = {
    id: userId, // ✅ Ahora garantizado que no es undefined
    name: backendUser.alias, // Usar alias como nombre por ahora
    email: `${backendUser.alias}@sistema.com`, // Email temporal
    alias: backendUser.alias,
    tipo: backendUser.tipo,
    id_empleado: backendUser.id_empleado,
    activo: backendUser.activo || true, // Valor por defecto si no viene
    proyectosIds: backendUser.proyectos || [],
    projects: [], // Se puede poblar después con nombres de proyectos
    joinDate: new Date().toISOString().split('T')[0], // Fecha temporal
    role: backendUser.tipo,
    avatar: undefined // Sin foto de avatar
  };
  
  // console.log('🔍 AuthContext - Usuario transformado:', transformedUser);
  // console.log('🔍 AuthContext - transformedUser.id:', transformedUser.id);
  
  return transformedUser;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Cargar usuario desde token al inicializar
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar si hay token y si es válido
        // console.log('🔍 AuthContext - Verificando token...');
        const response = await verifyToken();
        // console.log('🔍 AuthContext - Respuesta verifyToken:', response);
        
        if (response.success) {
          // console.log('🔍 AuthContext - Datos usuario de verifyToken:', response.data.usuario);
          const transformedUser = transformBackendUser(response.data.usuario);
          setUser(transformedUser);
          localStorage.setItem('auth_user', JSON.stringify(transformedUser));
        } else {
          // console.log('❌ AuthContext - verifyToken falló:', response.message);
        }
      } catch (error) {
        // console.error('❌ AuthContext - Error verificando token:', error);
        // Limpiar datos inválidos
        removeToken();
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Escuchar evento de logout desde interceptor
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Función para iniciar sesión con backend real
   */
  const login = async (alias: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await loginService({ alias, password });
      
      if (response.success) {
        // Guardar token
        setToken(response.data.token);
        
        // Transformar y guardar usuario
        const transformedUser = transformBackendUser(response.data.usuario);
        setUser(transformedUser);
        localStorage.setItem('auth_user', JSON.stringify(transformedUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      // console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem('auth_user');
  };

  /**
   * Función para actualizar datos del usuario
   */
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};