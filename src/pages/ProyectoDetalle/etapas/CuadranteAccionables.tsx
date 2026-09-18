import React, { useCallback, useEffect, useState } from 'react';
import QuadrantScatterChart, {
  type ScatterSeriesConfig,
} from '../components/graphImproved/quadrant-scatter-chart';
import { Button } from '@/components/ui-shadcn/button';
import Modal from '@/components/ui-propios/Modal/Modal';
import { obtenerSecuenciasPorProyecto } from '@/services/secuenciaService';
import { editarAccionable, obtenerAccionablesPorSecuencia } from '@/services/accionableService';
import type { Accionable } from '@/pages/Interfaces/accionablesPoints';

/**
 * Cuadrante de accionables del proyecto, incrustable.
 *
 * Antes era una página entera en /proyecto/grafica/:idProyecto: leía el id de
 * la URL y ocupaba el alto de la ventana. Ahora recibe el proyecto por prop y
 * vive dentro de la pestaña de Ideación.
 *
 * Ojo con los ejes: la versión anterior mandaba impacto al eje X y esfuerzo al
 * Y, justo al revés de lo que decían sus rótulos. Aquí va como se lee:
 * esfuerzo en X, impacto en Y, así que arriba a la izquierda queda lo que más
 * conviene hacer (mucho impacto, poco esfuerzo).
 *
 * Al hacer clic en una fila de cualquier cuadrante se abre el editor del
 * accionable (contenido, impacto y esfuerzo).
 */

const COLORES = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

/**
 * El gráfico usa este color dos veces: como relleno del cuadrante (con un
 * fillOpacity de 0.5 encima) y como filo izquierdo de su tabla. Por eso van
 * con alfa: sólidos, sobre la página oscura quedaban zonas chillonas, y si se
 * bajara más el filo de la tabla dejaría de verse.
 */
const CUADRANTES = {
  topLeft: { color: 'rgba(34, 197, 94, 0.35)', label: 'Ganancias rápidas' },
  topRight: { color: 'rgba(59, 130, 246, 0.35)', label: 'Apuestas grandes' },
  bottomLeft: { color: 'rgba(148, 163, 184, 0.35)', label: 'Relleno' },
  bottomRight: { color: 'rgba(239, 68, 68, 0.35)', label: 'Poco rentables' },
};

const ESCALA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Props {
  idProyecto: number;
  puedeEditar: boolean;
  /** Se llama cuando cambia algo, para refrescar el resto de la pestaña. */
  onCambio?: () => void;
}

const CuadranteAccionables: React.FC<Props> = ({ idProyecto, puedeEditar, onCambio }) => {
  const [series, setSeries] = useState<ScatterSeriesConfig[]>([]);
  const [accionables, setAccionables] = useState<Accionable[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enEdicion, setEnEdicion] = useState<Accionable | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const secuencias = await obtenerSecuenciasPorProyecto(idProyecto);
      const lista = Array.isArray(secuencias) ? secuencias : [];

      const porSecuencia = await Promise.all(
        lista.map(async (s: { id: string | number; nombre: string }) => ({
          nombre: s.nombre,
          accionables: await obtenerAccionablesPorSecuencia(Number(s.id)).catch(() => [] as Accionable[]),
        }))
      );

      setSeries(
        porSecuencia
          .filter((item) => item.accionables.length > 0)
          .map((item, i) => ({
            name: item.nombre,
            color: COLORES[i % COLORES.length],
            data: item.accionables.map((a) => ({
              x: a.esfuerzo,
              y: a.impacto,
              label: a.contenido,
              id: a.id_accionable ?? 0,
            })),
          }))
      );
      setAccionables(porSecuencia.flatMap((item) => item.accionables));
    } catch (error) {
      console.error('Error al cargar los accionables del proyecto:', error);
    } finally {
      setCargando(false);
    }
  }, [idProyecto]);

  useEffect(() => { cargar(); }, [cargar]);

  /** El cuadrante avisa de la fila pulsada; aquí se abre el editor. */
  const alPulsarFila = (accion: string, _puntos: unknown, accionable?: Accionable) => {
    if (accion !== 'row-click' || !accionable?.id_accionable) return;
    setEnEdicion({ ...accionable });
  };

  const guardar = async () => {
    if (!enEdicion?.id_accionable || !enEdicion.contenido.trim()) return;
    setGuardando(true);
    try {
      await editarAccionable(enEdicion.id_accionable, {
        contenido: enEdicion.contenido.trim(),
        impacto: enEdicion.impacto,
        esfuerzo: enEdicion.esfuerzo,
      });
      setEnEdicion(null);
      await cargar();
      onCambio?.();
    } catch (error) {
      console.error('Error al guardar el accionable:', error);
      alert('No se pudo guardar el accionable.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="rounded-lg border border-theme-border bg-theme-bg-primary p-6 text-sm text-theme-text-secondary">
        Cargando accionables…
      </div>
    );
  }

  if (accionables.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-theme-border bg-theme-bg-primary p-6 text-center text-sm text-theme-text-secondary">
        Este proyecto todavía no tiene accionables. Créalos desde las learning cards del editor de
        flujo y aparecerán aquí priorizados por impacto y esfuerzo.
      </div>
    );
  }

  return (
    <>
      <QuadrantScatterChart
        title="Impacto vs esfuerzo"
        description="Cada punto es un accionable. Las tablas van de mayor a menor promedio; haz clic en una fila para editarla."
        series={series}
        accionables={accionables}
        xLabel="Esfuerzo"
        yLabel="Impacto"
        clusterRadius={6}
        quadrants={CUADRANTES}
        onPointAction={alPulsarFila}
      />

      <Modal
        isOpen={!!enEdicion}
        onClose={() => setEnEdicion(null)}
        title="Editar accionable"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEnEdicion(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!puedeEditar || guardando || !enEdicion?.contenido.trim()}
              onClick={guardar}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {enEdicion && (
          <>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Contenido
            </label>
            <textarea
              className="mb-4 min-h-[90px] w-full rounded-md border border-theme-border bg-theme-bg-primary p-2 text-sm text-theme-text-primary"
              value={enEdicion.contenido}
              disabled={!puedeEditar}
              maxLength={255}
              onChange={(e) => setEnEdicion({ ...enEdicion, contenido: e.target.value })}
            />

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                Impacto
                <select
                  className="rounded-md border border-theme-border bg-theme-bg-primary px-2 py-1 text-sm text-theme-text-primary"
                  value={enEdicion.impacto}
                  disabled={!puedeEditar}
                  onChange={(e) => setEnEdicion({ ...enEdicion, impacto: Number(e.target.value) })}
                >
                  {ESCALA.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm text-theme-text-secondary">
                Esfuerzo
                <select
                  className="rounded-md border border-theme-border bg-theme-bg-primary px-2 py-1 text-sm text-theme-text-primary"
                  value={enEdicion.esfuerzo}
                  disabled={!puedeEditar}
                  onChange={(e) => setEnEdicion({ ...enEdicion, esfuerzo: Number(e.target.value) })}
                >
                  {ESCALA.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <span className="rounded-full bg-theme-bg-tertiary px-3 py-1 text-xs text-theme-text-secondary">
                promedio {((enEdicion.impacto + enEdicion.esfuerzo) / 2).toFixed(1)}
              </span>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default CuadranteAccionables;
