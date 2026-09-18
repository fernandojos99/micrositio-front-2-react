import React from 'react';
import TranscriptProcessor from '@/pages/Transcripts/page';

interface Props {
  idProyecto: number;
  nombreProyecto?: string;
}

/**
 * Etapa 1 — Brief y Propuesta.
 *
 * Es el mismo procesador de transcripts que había suelto en el menú, metido
 * dentro de la pestaña: de ahí sale el brief y con él la propuesta. Al pasarle
 * el proyecto, lo que devuelve Ejecutar (el enlace, el resumen y el documento)
 * se guarda y reaparece al volver a entrar.
 */
const BriefTab: React.FC<Props> = ({ idProyecto, nombreProyecto }) => (
  <TranscriptProcessor idProyecto={idProyecto} nombreProyectoInicial={nombreProyecto} />
);

export default BriefTab;
