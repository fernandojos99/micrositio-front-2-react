import { useNavigate, useParams } from 'react-router-dom';

export interface ProyectoParams extends Record<string, string | undefined> {
  proyectoId: string;
  secuenciaId?: string;
  testingCardId?: string;
  learningCardId?: string;
}

/**
 * Hook personalizado para manejar la navegación en rutas de proyecto
 * @returns Funciones de navegación y parámetros actuales
 */
export const useProyectoNavigation = () => {
  const navigate = useNavigate();
  const params = useParams<ProyectoParams>();

  const navigateToSecuencia = (proyectoId: string, secuenciaId: string) => {
    navigate(`/proyecto/${proyectoId}/secuencia/${secuenciaId}`, { replace: true });
  };

  const navigateToTestingCard = (proyectoId: string, secuenciaId: string, testingCardId: string) => {
    navigate(`/proyecto/${proyectoId}/secuencia/${secuenciaId}/testing-card/${testingCardId}`, { replace: true });
  };

  const navigateToLearningCard = (proyectoId: string, secuenciaId: string, learningCardId: string) => {
    navigate(`/proyecto/${proyectoId}/secuencia/${secuenciaId}/learning-card/${learningCardId}`, { replace: true });
  };

  const navigateToProyecto = (proyectoId: string) => {
    navigate(`/proyecto/${proyectoId}`, { replace: true });
  };

  return {
    params,
    navigateToSecuencia,
    navigateToTestingCard,
    navigateToLearningCard,
    navigateToProyecto
  };
};