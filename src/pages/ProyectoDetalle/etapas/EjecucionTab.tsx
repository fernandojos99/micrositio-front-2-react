import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { obtenerAvance, type AvanceProyecto, type SecuenciaAvance } from '@/services/proyectoEtapaService';
import { obtenerTestingCardsPorSecuencia, actualizarTestingCard } from '@/services/testingCardService';
import { actualizarSecuencia } from '@/services/secuenciaService';

interface Props {
  idProyecto: number;
  puedeEditar: boolean;
  children: React.ReactNode;
}

interface TestingCardResumen {
  id_testing_card: number;
  titulo: string;
  status: string;
}

const porcentaje = (parte: number, total: number) => (total === 0 ? 0 : Math.round((parte / total) * 100));

/** Barra de avance. No hay componente de progreso en el proyecto, así que va a mano. */
const Barra: React.FC<{ etiqueta: string; parte: number; total: number; detalle?: string }> = ({
  etiqueta, parte, total, detalle,
}) => {
  const pct = porcentaje(parte, total);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-theme-text-primary">{etiqueta}</span>
        <span className="text-xs text-theme-text-secondary">
          {parte} de {total} · {pct}%{detalle ? ` · ${detalle}` : ''}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-theme-bg-tertiary">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-theme-success' : 'bg-theme-info'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/** Lista desplegable de testing cards de una secuencia, con su casilla. */
const CardsDeSecuencia: React.FC<{
  secuencia: SecuenciaAvance;
  puedeEditar: boolean;
  onCambio: () => void;
}> = ({ secuencia, puedeEditar, onCambio }) => {
  const [abierto, setAbierto] = useState(false);
  const [cards, setCards] = useState<TestingCardResumen[]>([]);
  const [guardando, setGuardando] = useState<number | null>(null);

  useEffect(() => {
    if (!abierto) return;
    obtenerTestingCardsPorSecuencia(secuencia.id_secuencia)
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .catch(() => setCards([]));
  }, [abierto, secuencia.id_secuencia]);

  const alternar = async (card: TestingCardResumen) => {
    const nuevo = card.status === 'TERMINADO' ? 'EN PLANEACION' : 'TERMINADO';
    setGuardando(card.id_testing_card);
    try {
      await actualizarTestingCard(card.id_testing_card, { status: nuevo });
      setCards((lista) => lista.map((c) => (c.id_testing_card === card.id_testing_card ? { ...c, status: nuevo } : c)));
      onCambio();
    } catch (error) {
      console.error('Error al cambiar el estado de la testing card:', error);
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        className="text-xs text-theme-text-secondary hover:text-theme-text-primary"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? 'Ocultar' : 'Ver'} sus {secuencia.testing_cards} testing cards
      </button>

      {abierto && (
        <ul className="mt-2 flex flex-col gap-1">
          {cards.length === 0 && <li className="text-xs text-theme-text-secondary">Sin testing cards.</li>}
          {cards.map((card) => (
            <li key={card.id_testing_card} className="flex items-center gap-2 text-sm">
              <button
                type="button"
                aria-label={card.status === 'TERMINADO' ? 'Marcar como pendiente' : 'Marcar como terminada'}
                disabled={!puedeEditar || guardando === card.id_testing_card}
                onClick={() => alternar(card)}
                className="text-theme-text-secondary hover:text-theme-text-primary disabled:opacity-50"
              >
                {card.status === 'TERMINADO'
                  ? <CheckCircle2 size={16} className="text-theme-success" />
                  : <Circle size={16} />}
              </button>
              <span className={card.status === 'TERMINADO' ? 'text-theme-text-secondary line-through' : 'text-theme-text-primary'}>
                {card.titulo}
              </span>
              <span className="ml-auto text-xs text-theme-text-secondary">{card.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Etapa 3 — Ejecución.
 *
 * Arriba, el avance del proyecto; abajo, la caja de secuencias y el editor de
 * flujo de siempre, que llegan como hijos para no tocar esos componentes.
 */
const EjecucionTab: React.FC<Props> = ({ idProyecto, puedeEditar, children }) => {
  const [avance, setAvance] = useState<AvanceProyecto | null>(null);
  const [version, setVersion] = useState(0);
  const [guardando, setGuardando] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerAvance(idProyecto)
      .then((datos) => { if (!cancelado) setAvance(datos); })
      .catch((error) => console.error('Error al cargar el avance:', error));
    return () => { cancelado = true; };
  }, [idProyecto, version]);

  const alternarSecuencia = async (secuencia: SecuenciaAvance) => {
    const nuevo = secuencia.terminada ? 'EN EJECUCION' : 'TERMINADO';
    setGuardando(secuencia.id_secuencia);
    try {
      await actualizarSecuencia(secuencia.id_secuencia, { estado: nuevo });
      setVersion((v) => v + 1);
    } catch (error) {
      console.error('Error al cambiar el estado de la secuencia:', error);
    } finally {
      setGuardando(null);
    }
  };

  const t = avance?.totales;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
        <h2 className="mb-4 text-lg font-semibold text-theme-text-primary">Avance del proyecto</h2>

        {!t ? (
          <p className="text-sm text-theme-text-secondary">Cargando avance…</p>
        ) : (
          <>
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <Barra etiqueta="Secuencias" parte={t.secuencias_terminadas} total={t.secuencias} />
              <Barra
                etiqueta="Testing cards"
                parte={t.testing_cards_terminadas}
                total={t.testing_cards}
                detalle={t.testing_cards_canceladas > 0 ? `${t.testing_cards_canceladas} canceladas` : undefined}
              />
            </div>

            <div className="flex flex-col gap-3">
              {avance!.secuencias.map((s) => (
                <div key={s.id_secuencia} className="rounded-lg border border-theme-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      aria-label={s.terminada ? 'Marcar secuencia como en ejecución' : 'Marcar secuencia como terminada'}
                      disabled={!puedeEditar || guardando === s.id_secuencia}
                      onClick={() => alternarSecuencia(s)}
                      className="text-theme-text-secondary hover:text-theme-text-primary disabled:opacity-50"
                    >
                      {s.terminada
                        ? <CheckCircle2 size={18} className="text-theme-success" />
                        : <Circle size={18} />}
                    </button>
                    <span className="font-medium text-theme-text-primary">{s.nombre}</span>
                    <span className="rounded-full bg-theme-bg-tertiary px-2 py-0.5 text-xs text-theme-text-secondary">{s.estado}</span>
                    {s.vencida && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-theme-warning-soft px-2 py-0.5 text-xs text-theme-warning">
                        <AlertTriangle size={12} /> vencida el {s.dia_fin}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-theme-text-secondary">
                      {s.testing_cards_terminadas}/{s.testing_cards} testing · {s.learning_cards} learning
                    </span>
                  </div>
                  {s.testing_cards > 0 && (
                    <CardsDeSecuencia secuencia={s} puedeEditar={puedeEditar} onCambio={() => setVersion((v) => v + 1)} />
                  )}
                </div>
              ))}
              {avance!.secuencias.length === 0 && (
                <p className="text-sm text-theme-text-secondary">Este proyecto todavía no tiene secuencias.</p>
              )}
            </div>
          </>
        )}
      </section>

      {children}
    </div>
  );
};

export default EjecucionTab;
