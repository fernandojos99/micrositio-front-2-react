import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle2, Circle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui-shadcn/checkbox';
import {
  obtenerAvance,
  type AvanceProyecto,
  type DatosEtapa,
  type ProyectoEtapa,
  type PropuestaServicio,
} from '@/services/proyectoEtapaService';

interface Props {
  idProyecto: number;
  bloqueado: boolean;
  etapa: ProyectoEtapa | null;
  puedeEditar: boolean;
  onGuardar: (parcial: DatosEtapa) => Promise<void> | void;
}

/** Lo marcado a mano en este tablero, guardado en el JSON de la etapa. */
interface Cumplidos {
  [claveEtapa: string]: { entregables?: number[]; criterios?: number[] };
}

const porcentaje = (parte: number, total: number) => (total === 0 ? 0 : Math.round((parte / total) * 100));

const Tarjeta: React.FC<{ titulo: string; valor: string; pie?: string; alerta?: boolean }> = ({
  titulo, valor, pie, alerta,
}) => (
  <div className="rounded-lg border border-theme-border bg-theme-bg-primary p-4">
    <p className="text-xs uppercase tracking-wide text-theme-text-secondary">{titulo}</p>
    <p className={`mt-1 text-2xl font-semibold ${alerta ? 'text-theme-warning' : 'text-theme-text-primary'}`}>{valor}</p>
    {pie && <p className="mt-1 text-xs text-theme-text-secondary">{pie}</p>}
  </div>
);

const Barra: React.FC<{ etiqueta: string; parte: number; total: number }> = ({ etiqueta, parte, total }) => {
  const pct = porcentaje(parte, total);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm text-theme-text-primary">{etiqueta}</span>
        <span className="text-xs text-theme-text-secondary">{parte}/{total} · {pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-theme-bg-tertiary">
        <div className={`h-full rounded-full ${pct === 100 ? 'bg-theme-success' : 'bg-theme-info'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/**
 * Etapa 5 — Resultados.
 *
 * Resumen de todo el proyecto: lo prometido en la propuesta contra lo hecho,
 * cumplimiento de métricas, entregables y criterios de éxito, y el equipo con
 * sus fechas. Se habilita solo cuando el ADMIN aprueba.
 */
const ResultadosTab: React.FC<Props> = ({ idProyecto, bloqueado, etapa, puedeEditar, onGuardar }) => {
  const [avance, setAvance] = useState<AvanceProyecto | null>(null);
  const propuesta = etapa?.datos?.propuesta as PropuestaServicio | undefined;
  const cumplidos = (etapa?.datos?.cumplidos ?? {}) as Cumplidos;

  useEffect(() => {
    if (bloqueado) return;
    let cancelado = false;
    obtenerAvance(idProyecto)
      .then((datos) => { if (!cancelado) setAvance(datos); })
      .catch((error) => console.error('Error al cargar los resultados:', error));
    return () => { cancelado = true; };
  }, [idProyecto, bloqueado]);

  if (bloqueado) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-theme-border bg-theme-bg-primary p-8 text-center">
        <Lock size={24} className="text-theme-text-secondary" />
        <h2 className="text-lg font-semibold text-theme-text-primary">Resultados bloqueados</h2>
        <p className="max-w-md text-sm text-theme-text-secondary">
          Esta etapa se habilita cuando un administrador aprueba la propuesta en el plan de trabajo.
        </p>
      </div>
    );
  }

  if (!avance) {
    return <div className="rounded-lg border border-theme-border bg-theme-bg-primary p-6 text-sm text-theme-text-secondary">Cargando resultados…</div>;
  }

  const t = avance.totales;
  const m = avance.metricas.resumen;

  // Lo que prometía la propuesta, para comparar contra lo que existe
  const planeadas = propuesta?.etapas?.reduce((suma, e) => suma + (e.cards_planeadas?.length ?? 0), 0)
    ?? (propuesta?.cards_planeadas?.length ?? 0);

  const marcar = (claveEtapa: string, tipo: 'entregables' | 'criterios', indice: number, marcado: boolean) => {
    const actual = cumplidos[claveEtapa]?.[tipo] ?? [];
    const nuevos = marcado ? [...new Set([...actual, indice])] : actual.filter((i) => i !== indice);
    onGuardar({ cumplidos: { ...cumplidos, [claveEtapa]: { ...cumplidos[claveEtapa], [tipo]: nuevos } } });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta
          titulo="Secuencias"
          valor={`${t.secuencias_terminadas}/${t.secuencias}`}
          pie={t.secuencias_vencidas > 0 ? `${t.secuencias_vencidas} vencidas` : 'sin retrasos'}
          alerta={t.secuencias_vencidas > 0}
        />
        <Tarjeta
          titulo="Testing cards"
          valor={`${t.testing_cards_terminadas}/${t.testing_cards}`}
          pie={planeadas > 0 ? `${planeadas} planeadas en la propuesta` : undefined}
          alerta={planeadas > 0 && t.testing_cards < planeadas}
        />
        <Tarjeta titulo="Learning cards" valor={String(t.learning_cards)}
          pie={Object.entries(t.learning_cards_por_estado).map(([e, n]) => `${n} ${e.toLowerCase()}`).join(' · ')} />
        <Tarjeta titulo="Accionables" valor={`${t.accionables_realizados}/${t.accionables}`} pie="realizados" />
      </section>

      {/* Planeado contra hecho */}
      <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-theme-text-primary" />
          <h2 className="text-lg font-semibold text-theme-text-primary">Planeado contra hecho</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Barra etiqueta="Secuencias terminadas" parte={t.secuencias_terminadas} total={t.secuencias} />
          <Barra etiqueta="Testing cards terminadas" parte={t.testing_cards_terminadas} total={t.testing_cards} />
          {planeadas > 0 && <Barra etiqueta="Cards creadas de las planeadas" parte={t.testing_cards} total={planeadas} />}
          <Barra etiqueta="Accionables realizados" parte={t.accionables_realizados} total={t.accionables} />
        </div>
      </section>

      {/* Métricas */}
      <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
        <h2 className="mb-1 text-lg font-semibold text-theme-text-primary">Cumplimiento de métricas</h2>
        <p className="mb-4 text-sm text-theme-text-secondary">
          {m.cumplidas} cumplidas, {m.no_cumplidas} no cumplidas y {m.no_evaluables} sin medir, de {m.total}.
          Una métrica queda sin medir cuando no tiene resultado o cuando su criterio no es comparable.
        </p>

        {m.total === 0 ? (
          <p className="text-sm text-theme-text-secondary">Este proyecto no tiene métricas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme-border text-left text-xs uppercase tracking-wide text-theme-text-secondary">
                  <th className="py-2 pr-4">Métrica</th>
                  <th className="py-2 pr-4">Testing card</th>
                  <th className="py-2 pr-4">Criterio</th>
                  <th className="py-2 pr-4">Resultado</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {avance.metricas.detalle.map((metrica) => (
                  <tr key={metrica.id_metrica} className="border-b border-theme-border">
                    <td className="py-2 pr-4 text-theme-text-primary">{metrica.nombre}</td>
                    <td className="py-2 pr-4 text-theme-text-secondary">{metrica.testing_card}</td>
                    <td className="py-2 pr-4 text-theme-text-secondary">{metrica.operador} {metrica.criterio}</td>
                    <td className="py-2 pr-4 text-theme-text-primary">{metrica.resultado ?? '—'}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        metrica.cumplimiento === 'cumplida' ? 'bg-theme-success-soft text-theme-success'
                          : metrica.cumplimiento === 'no_cumplida' ? 'bg-theme-danger-soft text-theme-danger'
                            : 'bg-theme-bg-tertiary text-theme-text-secondary'}`}>
                        {metrica.cumplimiento === 'cumplida' ? 'cumplida'
                          : metrica.cumplimiento === 'no_cumplida' ? 'no cumplida' : 'sin medir'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Entregables y criterios de éxito de la propuesta */}
      {propuesta?.etapas?.length ? (
        <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
          <h2 className="mb-4 text-lg font-semibold text-theme-text-primary">Entregables y criterios de éxito</h2>
          <div className="flex flex-col gap-5">
            {propuesta.etapas.map((e, i) => {
              const clave = String(i);
              return (
                <div key={i}>
                  <h3 className="mb-2 font-medium text-theme-text-primary">{e.nombre || `Etapa ${i + 1}`}</h3>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {(['entregables', 'criterios'] as const).map((tipo) => {
                      const items = tipo === 'entregables' ? e.entregables : e.criterios_exito;
                      const marcados = cumplidos[clave]?.[tipo] ?? [];
                      return (
                        <div key={tipo}>
                          <p className="mb-1 text-xs uppercase tracking-wide text-theme-text-secondary">
                            {tipo === 'entregables' ? 'Entregables' : 'Criterios de éxito'} ({marcados.length}/{items.length})
                          </p>
                          <ul className="flex flex-col gap-1">
                            {items.map((texto, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm">
                                <Checkbox
                                  className="mt-0.5"
                                  checked={marcados.includes(j)}
                                  disabled={!puedeEditar}
                                  onCheckedChange={(v) => marcar(clave, tipo, j, v === true)}
                                />
                                <span className={marcados.includes(j) ? 'text-theme-text-secondary line-through' : 'text-theme-text-primary'}>
                                  {texto}
                                </span>
                              </li>
                            ))}
                            {items.length === 0 && <li className="text-xs text-theme-text-secondary">Sin elementos.</li>}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Equipo y fechas */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
          <h2 className="mb-3 text-lg font-semibold text-theme-text-primary">Equipo</h2>
          {avance.equipo.length === 0 ? (
            <p className="text-sm text-theme-text-secondary">Sin colaboradores asignados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {avance.equipo.map((p) => (
                <li key={p.id_empleado} className="flex items-center gap-2 text-sm">
                  <span className="text-theme-text-primary">{p.nombre_pila} {p.apellido_paterno ?? ''}</span>
                  {p.es_lider && <span className="rounded-full bg-theme-bg-tertiary px-2 py-0.5 text-xs text-theme-text-secondary">líder</span>}
                  <span className="ml-auto text-xs text-theme-text-secondary">{p.cargo ?? ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
          <h2 className="mb-3 text-lg font-semibold text-theme-text-primary">Fechas</h2>
          <ul className="flex flex-col gap-2">
            {avance.secuencias.map((s) => (
              <li key={s.id_secuencia} className="flex items-center gap-2 text-sm">
                {s.terminada ? <CheckCircle2 size={16} className="text-theme-success" /> : <Circle size={16} className="text-theme-text-secondary" />}
                <span className="text-theme-text-primary">{s.nombre}</span>
                {s.vencida && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-theme-warning-soft px-2 py-0.5 text-xs text-theme-warning">
                    <AlertTriangle size={12} /> vencida
                  </span>
                )}
                <span className="ml-auto text-xs text-theme-text-secondary">
                  {s.dia_inicio ?? '—'} → {s.dia_fin ?? '—'}
                </span>
              </li>
            ))}
            {avance.secuencias.length === 0 && <li className="text-sm text-theme-text-secondary">Sin secuencias.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ResultadosTab;
