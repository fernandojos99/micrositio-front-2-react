import React from 'react';
import CuadranteAccionables from './CuadranteAccionables';

interface Props {
  idProyecto: number;
  puedeEditar: boolean;
}

/**
 * Etapa 4 — Ideación.
 *
 * Solo el cuadrante de impacto contra esfuerzo. Las propuestas automáticas a
 * partir de learning cards y las métricas de validación se quitaron de aquí;
 * los accionables se editan haciendo clic en las filas del propio cuadrante.
 */
const IdeacionTab: React.FC<Props> = ({ idProyecto, puedeEditar }) => (
  <CuadranteAccionables idProyecto={idProyecto} puedeEditar={puedeEditar} />
);

export default IdeacionTab;
