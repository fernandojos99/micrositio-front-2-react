import { obtenerProyectoPorId } from '@/services/proyectosService';
import { obtenerSecuenciasPorProyecto, crearSecuencia } from '@/services/secuenciaService';
import { crearTestingCard } from '@/services/testingCardService';
import { crear as crearLearningCard } from '@/services/learningCardService';
import type { PropuestaServicio } from '@/services/proyectoEtapaService';

/**
 * Lleva a la base las cards que promete la propuesta.
 *
 * Cada etapa se materializa como una secuencia del proyecto, y sus cards
 * cuelgan de ella marcadas como borrador: existen, pero no se ven en el editor
 * de flujo ni en la búsqueda hasta que el ADMIN aprueba el proyecto.
 *
 * Es idempotente: anota en la propia propuesta el id de lo que crea
 * (`id_secuencia`, `id_testing_card`, `id_learning_card`), así que volver a
 * guardar no duplica nada.
 *
 * El tipo de experimento por defecto es el 2 ("Experimento de validacion"),
 * y el responsable es el líder del proyecto; ambos se cambian después en el
 * editor de flujo.
 */

const TIPO_EXPERIMENTO_POR_DEFECTO = 2;

export interface ResultadoSincronizacion {
  secuencias_creadas: number;
  testing_cards_creadas: number;
  learning_cards_creadas: number;
  avisos: string[];
}

export async function sincronizarCardsPlaneadas(
  idProyecto: number,
  propuesta: PropuestaServicio
): Promise<{ propuesta: PropuestaServicio; resultado: ResultadoSincronizacion }> {
  const resultado: ResultadoSincronizacion = {
    secuencias_creadas: 0, testing_cards_creadas: 0, learning_cards_creadas: 0, avisos: [],
  };

  const pendientes = (propuesta.etapas ?? []).some((e) => (e.cards_planeadas ?? []).length > 0);
  if (!pendientes) return { propuesta, resultado };

  const proyecto = await obtenerProyectoPorId(idProyecto);
  const idLider: number | undefined = proyecto?.id_lider ?? undefined;

  const existentes = await obtenerSecuenciasPorProyecto(idProyecto).catch(() => []);
  const porNombre = new Map(
    (Array.isArray(existentes) ? existentes : []).map((s: { id: string | number; nombre: string }) =>
      [s.nombre, Number(s.id)])
  );

  const etapas = await Promise.all((propuesta.etapas ?? []).map(async (etapa) => {
    const cards = etapa.cards_planeadas ?? [];
    if (cards.length === 0) return etapa;

    // 1. La secuencia de la etapa: la ya anotada, una con el mismo nombre, o nueva
    let idSecuencia = etapa.id_secuencia ?? porNombre.get(etapa.nombre);

    if (!idSecuencia) {
      try {
        const creada = await crearSecuencia({
          id_proyecto: idProyecto,
          nombre: etapa.nombre || 'Etapa sin nombre',
          descripcion: etapa.etiqueta || undefined,
          estado: 'EN PLANEACION',
          ...(etapa.dia_inicio ? { dia_inicio: etapa.dia_inicio } : {}),
          ...(etapa.dia_fin ? { dia_fin: etapa.dia_fin } : {}),
        });
        idSecuencia = Number(creada?.id_secuencia ?? creada?.id);
        resultado.secuencias_creadas++;
      } catch (error) {
        resultado.avisos.push(`No se pudo crear la secuencia de "${etapa.nombre}": ${(error as Error).message}`);
        return etapa;
      }
    }

    // 2. Las cards que aún no existen
    let ultimaTestingCard: number | undefined = cards.find((c) => c.tipo === 'testing' && c.id_testing_card)?.id_testing_card;

    const sincronizadas = [];
    for (const card of cards) {
      if (card.id_testing_card || card.id_learning_card) {
        if (card.id_testing_card) ultimaTestingCard = card.id_testing_card;
        sincronizadas.push(card);
        continue;
      }

      if (!card.titulo.trim()) { sincronizadas.push(card); continue; }

      try {
        if (card.tipo === 'testing') {
          const creada = await crearTestingCard({
            id_secuencia: idSecuencia,
            titulo: card.titulo,
            status: 'EN PLANEACION',
            id_experimento_tipo: TIPO_EXPERIMENTO_POR_DEFECTO,
            es_borrador: true,
            ...(idLider ? { id_responsable: idLider } : {}),
            ...(etapa.dia_inicio ? { dia_inicio: etapa.dia_inicio } : {}),
            ...(etapa.dia_fin ? { dia_fin: etapa.dia_fin } : {}),
          });
          const id = Number(creada?.id_testing_card ?? creada?.id);
          ultimaTestingCard = id;
          resultado.testing_cards_creadas++;
          sincronizadas.push({ ...card, id_testing_card: id });
        } else {
          if (!ultimaTestingCard) {
            resultado.avisos.push(`"${card.titulo}" necesita una testing card antes que ella en la misma etapa.`);
            sincronizadas.push(card);
            continue;
          }
          const creada = await crearLearningCard({
            id_testing_card: ultimaTestingCard,
            hallazgo: card.titulo,
            estado: 'ACEPTADA',
            es_borrador: true,
            ...(idLider ? { id_responsable: idLider } : {}),
          } as Parameters<typeof crearLearningCard>[0]);
          resultado.learning_cards_creadas++;
          sincronizadas.push({ ...card, id_learning_card: Number(creada?.id_learning_card) });
        }
      } catch (error) {
        resultado.avisos.push(`No se pudo crear "${card.titulo}": ${(error as Error).message}`);
        sincronizadas.push(card);
      }
    }

    return { ...etapa, id_secuencia: idSecuencia, cards_planeadas: sincronizadas };
  }));

  return { propuesta: { ...propuesta, etapas }, resultado };
}
