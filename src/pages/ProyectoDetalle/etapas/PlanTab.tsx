import React, { useRef, useState } from 'react';
import { Plus, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui-shadcn/button';

interface Props {
  idProyecto: number;
  esAdmin: boolean;
  puedeEditar: boolean;
  guardando: boolean;
  aprobando: boolean;
  onAprobar: () => Promise<void> | void;
}

/** Una línea del plan: quién hace qué, cuándo, y si ya está. */
interface FilaPlan {
  id: string;
  persona: string;
  cargo: string;
  actividad: string;
  dia_inicio: string;
  dia_fin: string;
  comentarios: string;
  realizado: boolean;
}

/**
 * Etapa 2 — Plan de trabajo.
 *
 * Maqueta: el plan NO se guarda en la base. Vive en memoria del navegador
 * (el mapa de abajo), así que sobrevive a cambiar de pestaña pero se pierde al
 * recargar la página. Cuando esto se implemente de verdad irá a
 * `proyecto_etapa.datos`, que ya acepta JSON libre.
 *
 * El botón de IA rellena la tabla con una propuesta de ejemplo: personas
 * reales del equipo con su cargo, actividades y fechas inventadas.
 */
const enMemoria = new Map<number, { filas: FilaPlan[]; generado: boolean }>();

const LEYENDA_IA =
  'Información cargada en base a actitudes, proyectos y disponibilidad de tiempo y áreas de expertise de cada colaborador.';

/** Fecha de hoy más N días, en formato del input date. */
const fecha = (dias: number): string => {
  const dia = new Date();
  dia.setDate(dia.getDate() + dias);
  return dia.toISOString().slice(0, 10);
};

const nuevaFila = (): FilaPlan => ({
  id: crypto.randomUUID(),
  persona: '',
  cargo: '',
  actividad: '',
  dia_inicio: '',
  dia_fin: '',
  comentarios: '',
  realizado: false,
});

/**
 * Lo que "propone la IA". Los nombres y cargos son los del equipo real
 * (tabla `empleado`); las actividades y fechas son inventadas.
 */
const PROPUESTA: Array<Omit<FilaPlan, 'id' | 'dia_inicio' | 'dia_fin'> & { desde: number; dura: number }> = [
  {
    persona: 'Eduardo Lopez', cargo: 'Consultor',
    actividad: 'Levantamiento del brief y alineación con el cliente',
    comentarios: 'Cierra la sesión con el comité antes de arrancar',
    realizado: true, desde: -14, dura: 5,
  },
  {
    persona: 'Jose Fernando Cervantes', cargo: 'Consultor',
    actividad: 'Diseño de los experimentos de validación',
    comentarios: 'Dos hipótesis por secuencia',
    realizado: true, desde: -9, dura: 7,
  },
  {
    persona: 'Jorge Gomez', cargo: 'Analista',
    actividad: 'Modelo financiero y definición de métricas',
    comentarios: 'Requiere los datos de ventas del último trimestre',
    realizado: false, desde: -2, dura: 8,
  },
  {
    persona: 'Andres Amaya', cargo: 'Desarrollador',
    actividad: 'Prototipo funcional del flujo principal',
    comentarios: 'Depende del diseño de Javier',
    realizado: false, desde: 3, dura: 12,
  },
  {
    persona: 'Javier Flores', cargo: 'Diseñador',
    actividad: 'Interfaz del prototipo y guion de pruebas de usabilidad',
    comentarios: '',
    realizado: false, desde: 3, dura: 8,
  },
  {
    persona: 'Patricio Escamilla', cargo: 'Consultor',
    actividad: 'Entrevistas con usuarios y síntesis de aprendizajes',
    comentarios: '8 entrevistas, 2 por segmento',
    realizado: false, desde: 10, dura: 10,
  },
  {
    persona: 'Diana Berumen', cargo: 'Analista',
    actividad: 'Análisis de los datos del piloto',
    comentarios: '',
    realizado: false, desde: 18, dura: 6,
  },
  {
    persona: 'Azeneth Guadalupe Garcia', cargo: 'Analista',
    actividad: 'Tablero de seguimiento de métricas',
    comentarios: 'Se actualiza semanalmente',
    realizado: false, desde: 18, dura: 9,
  },
  {
    persona: 'Jonathan Alexis Chavero', cargo: 'Consultor',
    actividad: 'Taller de priorización de accionables',
    comentarios: 'Con el cuadrante de impacto y esfuerzo',
    realizado: false, desde: 25, dura: 3,
  },
  {
    persona: 'Felipe De Jesus Sauceda', cargo: 'Consultor',
    actividad: 'Presentación de resultados al comité',
    comentarios: '',
    realizado: false, desde: 30, dura: 2,
  },
];

/**
 * Celda de texto que crece al enfocarla.
 *
 * Con siete columnas, una actividad o un comentario largos no caben de un
 * vistazo. Al entrar en la celda se despliega hasta cuatro líneas ajustándose
 * al contenido, y al salir vuelve a una sola para que la tabla se siga leyendo
 * como tabla.
 */
const CeldaTexto: React.FC<{
  valor: string;
  etiqueta: string;
  placeholder?: string;
  editable: boolean;
  onChange: (valor: string) => void;
}> = ({ valor, etiqueta, placeholder, editable, onChange }) => {
  const campo = useRef<HTMLTextAreaElement>(null);

  const ajustar = () => {
    const el = campo.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  const encoger = () => {
    if (campo.current) campo.current.style.height = '';
  };

  return (
    <textarea
      ref={campo}
      rows={1}
      aria-label={etiqueta}
      placeholder={placeholder}
      value={valor}
      disabled={!editable}
      onFocus={ajustar}
      onBlur={encoger}
      onChange={(e) => { onChange(e.target.value); ajustar(); }}
      className="w-full resize-none overflow-hidden rounded-md border border-theme-border bg-theme-bg-primary px-2 py-1 text-sm text-theme-text-primary transition-[height] focus-visible:border-theme-border-hover disabled:opacity-60"
    />
  );
};

const PlanTab: React.FC<Props> = ({ idProyecto, esAdmin, puedeEditar, guardando, aprobando, onAprobar }) => {
  const recordado = enMemoria.get(idProyecto);
  const [filas, setFilas] = useState<FilaPlan[]>(recordado?.filas ?? [nuevaFila()]);
  const [generado, setGenerado] = useState(recordado?.generado ?? false);

  /** Todo cambio pasa por aquí, para que quede también en memoria. */
  const aplicar = (siguientes: FilaPlan[], conIA = generado) => {
    setFilas(siguientes);
    setGenerado(conIA);
    enMemoria.set(idProyecto, { filas: siguientes, generado: conIA });
  };

  const cambiar = (id: string, campo: keyof FilaPlan, valor: string | boolean) =>
    aplicar(filas.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));

  const agregar = () => aplicar([...filas, nuevaFila()]);

  const quitar = (id: string) => {
    const restantes = filas.filter((f) => f.id !== id);
    aplicar(restantes.length > 0 ? restantes : [nuevaFila()]);
  };

  const llenarConIA = () =>
    aplicar(
      PROPUESTA.map((p) => ({
        id: crypto.randomUUID(),
        persona: p.persona,
        cargo: p.cargo,
        actividad: p.actividad,
        comentarios: p.comentarios,
        realizado: p.realizado,
        dia_inicio: fecha(p.desde),
        dia_fin: fecha(p.desde + p.dura),
      })),
      true
    );

  const hechas = filas.filter((f) => f.realizado && f.actividad.trim()).length;
  const conActividad = filas.filter((f) => f.actividad.trim()).length;

  const celda = 'w-full rounded-md border border-theme-border bg-theme-bg-primary px-2 py-1 text-sm text-theme-text-primary disabled:opacity-60';

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-theme-text-primary">Plan de trabajo</h2>
            <p className="text-sm text-theme-text-secondary">
              Quién hace qué, cuándo, y si ya está.
              {conActividad > 0 && ` ${hechas} de ${conActividad} actividades realizadas.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!puedeEditar} onClick={agregar}>
              <Plus size={16} className="mr-2" /> Añadir fila
            </Button>
            <Button type="button" disabled={!puedeEditar} onClick={llenarConIA}>
              <Sparkles size={16} className="mr-2" /> Llenar con IA
            </Button>
          </div>
        </div>

        {generado && (
          <p className="mb-4 rounded-md border border-dashed border-theme-border bg-theme-bg-tertiary p-3 text-xs text-theme-text-secondary">
            <Sparkles size={13} className="mr-1 inline" />
            {LEYENDA_IA}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-theme-border text-left text-xs uppercase tracking-wide text-theme-text-secondary">
                <th className="px-2 py-2 font-medium">Persona</th>
                <th className="px-2 py-2 font-medium">Cargo</th>
                <th className="px-2 py-2 font-medium">Actividad</th>
                <th className="px-2 py-2 font-medium">Fecha inicio</th>
                <th className="px-2 py-2 font-medium">Fecha fin</th>
                <th className="px-2 py-2 font-medium">Comentarios</th>
                <th className="px-2 py-2 text-center font-medium">Realizado</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr
                  key={fila.id}
                  className="border-b border-theme-border last:border-b-0 focus-within:bg-theme-bg-tertiary"
                >
                  <td className="px-2 py-2 align-top">
                    <input
                      className={celda} aria-label="Persona" placeholder="Nombre"
                      value={fila.persona} disabled={!puedeEditar}
                      onChange={(e) => cambiar(fila.id, 'persona', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      className={celda} aria-label="Cargo" placeholder="Cargo"
                      value={fila.cargo} disabled={!puedeEditar}
                      onChange={(e) => cambiar(fila.id, 'cargo', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CeldaTexto
                      etiqueta="Actividad" placeholder="Qué va a hacer"
                      valor={fila.actividad} editable={puedeEditar}
                      onChange={(v) => cambiar(fila.id, 'actividad', v)}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="date" className={celda} aria-label="Fecha de inicio"
                      value={fila.dia_inicio} disabled={!puedeEditar}
                      onChange={(e) => cambiar(fila.id, 'dia_inicio', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="date" className={celda} aria-label="Fecha de fin"
                      value={fila.dia_fin} disabled={!puedeEditar}
                      onChange={(e) => cambiar(fila.id, 'dia_fin', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <CeldaTexto
                      etiqueta="Comentarios" placeholder="Notas"
                      valor={fila.comentarios} editable={puedeEditar}
                      onChange={(v) => cambiar(fila.id, 'comentarios', v)}
                    />
                  </td>
                  <td className="px-2 py-2 text-center align-middle">
                    <input
                      type="checkbox" className="h-4 w-4 accent-[color:var(--theme-success)]"
                      aria-label="Realizado"
                      checked={fila.realizado} disabled={!puedeEditar}
                      onChange={(e) => cambiar(fila.id, 'realizado', e.target.checked)}
                    />
                  </td>
                  <td className="px-2 py-2 text-right align-middle">
                    <button
                      type="button" aria-label="Quitar fila" disabled={!puedeEditar}
                      className="text-theme-text-secondary hover:text-theme-text-primary disabled:opacity-50"
                      onClick={() => quitar(fila.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-theme-text-secondary">
          Maqueta: el plan se conserva mientras no recargues la página.
        </p>
      </section>

      {esAdmin && (
        <section className="rounded-lg border border-theme-border bg-theme-bg-primary p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-theme-text-primary">Aprobación del proyecto</h2>
              <p className="text-sm text-theme-text-secondary">
                Al aprobar, las cards en borrador se publican y se desbloquea Resultados.
              </p>
            </div>
            <Button type="button" disabled={aprobando || guardando} onClick={onAprobar}>
              <ShieldCheck size={16} className="mr-2" />
              {aprobando ? 'Aprobando…' : 'Aprobar proyecto'}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default PlanTab;
