import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Componente Error Boundary para capturar errores de React
 * Previene que errores en componentes hijos crashed toda la aplicación
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Renderizar el fallback UI si se proporciona, o el UI por defecto
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>⚠️ Algo salió mal</h2>
            <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            <details className={styles.errorDetails}>
              <summary>Detalles técnicos</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
