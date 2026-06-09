"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import QuadrantScatterChart, {
  type ScatterPoint,
} from "./quadrant-scatter-chart"
import { useParams } from "react-router-dom"
import { obtenerProyectoPorId } from "@/services/proyectosService"
import { obtenerSecuenciasPorProyecto } from "@/services/secuenciaService"
import { Accionable } from "@/pages/Interfaces/accionablesPoints"
import { Secuencia } from "@/types/secuencia"
import { obtenerAccionablesPorSecuencia } from "@/services/accionableService"
//import { GraphTotal } from "../graph/GraphTotal"


function accionablesToScatterPoints(data: Accionable[]): ScatterPoint[] {
  return data.map((a) => ({
    x: a.impacto,
    y: a.esfuerzo,
    label: a.contenido,
    id: a.id_accionable
  }))
}





// const teamA: ScatterPoint[] = [
//   { x: 20, y: 30, label: "Proyecto Alpha" },
//   { x: 35, y: 70, label: "Proyecto Beta" },
//   { x: 60, y: 85, label: "Proyecto Gamma" },
//   { x: 80, y: 90, label: "Proyecto Delta" },
//   { x: 15, y: 55, label: "Proyecto Epsilon" },
//   { x: 72, y: 40, label: "Proyecto Zeta" },
//   // Puntos cercanos para probar clustering
//   { x: 21, y: 31, label: "Proyecto Alpha 2" },
//   { x: 22, y: 29, label: "Proyecto Alpha 3" },
// ]

// const teamB: ScatterPoint[] = [
//   { x: 45, y: 25, label: "Iniciativa 1" },
//   { x: 55, y: 60, label: "Iniciativa 2" },
//   { x: 90, y: 75, label: "Iniciativa 3" },
//   { x: 25, y: 15, label: "Iniciativa 4" },
//   { x: 70, y: 55, label: "Iniciativa 5" },
//   { x: 40, y: 80, label: "Iniciativa 6" },
//   // Punto cercano a Iniciativa 2
//   { x: 56, y: 61, label: "Iniciativa 2B" },
// ]

// const teamC: ScatterPoint[] = [
//   { x: 10, y: 90, label: "Tarea X" },
//   { x: 85, y: 20, label: "Tarea Y" },
//   { x: 50, y: 50, label: "Tarea Z" },
//   { x: 65, y: 70, label: "Tarea W" },
//   { x: 30, y: 40, label: "Tarea V" },
//   // Punto cercano a Tarea Z
//   { x: 51, y: 51, label: "Tarea Z2" },
// ]


// //Pendiente :Generar unos 10 colores para poder diferenciar mas equipos si es necesario. 
// //Se pueden generar con https://www.materialpalette.com/colors o con https://www.color-hex.com/color-palettes/ para mantener una paleta armoniosa. 
// const series = [
//   { name: "Equipo A", data: teamA, color: "#2563eb" },
//   { name: "Equipo B", data: teamB, color: "#f43f5e" },
//   { name: "Equipo C", data: teamC, color: "#10b981" },
// ]




interface SecuenciaConAccionables {
  secuencia: Secuencia;
  accionables: Accionable[];
}

//========================================================
//          main function
// =======================================================

export default function DemoPage() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const { idProyecto } = useParams();
  console.log("ID del proyecto desde URL:", idProyecto);

  const [accionables, setAccionables] = useState<Accionable[]>([]); //Guarda todos los accionables de todas las secuencias 
  const [proyecto, setProyecto] = useState<any>(null);

  //Para obtener el proyecto y mostrar su titulo en el header del grafico.
  useEffect(() => {
    const cargarProyecto = async () => {
      const data = await obtenerProyectoPorId(parseInt(idProyecto!));
      setProyecto(data);
    };

    cargarProyecto();

  }, [idProyecto]);



//   Obtener secuencias del proyecto
  const [secuencias, setSecuencias] = useState<Secuencia[]>([]);

  useEffect(() => {
    const cargarSecuencias = async () => {
      const data = await obtenerSecuenciasPorProyecto(parseInt(idProyecto!));
      setSecuencias(data);
      console.log("Secuencias cargadas:", data);
    };

    cargarSecuencias();

  }, [idProyecto]);



  const [secuenciasConAccionables, setSecuenciasConAccionables] = useState<SecuenciaConAccionables[]>([]);


  // Obtener accionables de cada secuencia y guardarlos en un nuevo estado que combine
  // ambos datos para facilitar el acceso a la hora de generar los puntos del grafico.
  useEffect(() => {

    if (secuencias.length === 0) return;
  
    const cargarAccionables = async () => {
      const resultado = await Promise.all(
        secuencias.map(async (s) => {
  
          const accionables = await obtenerAccionablesPorSecuencia(Number(s.id));
  
          return {
            secuencia: s,
            accionables
          };
  
        })
      );
      setSecuenciasConAccionables(resultado);
  
    };
  
    cargarAccionables();
  
  }, [secuencias]);



  //Aqui recorre secuenciasConAccionables para generar
  // los puntos del grafico a partir de los accionables.


  const series = useMemo(() => {

    const colores = [
      "#2563eb",
      "#f43f5e",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#14b8a6",
      "#ec4899",
      "#22c55e"
    ]
  
    return secuenciasConAccionables.map((item, index) => ({
      name: item.secuencia.nombre,
      data: accionablesToScatterPoints(item.accionables),
      color: colores[index % colores.length]
    }));
  
  }, [secuenciasConAccionables]);



  //Para obtener todos los accionables 
  useEffect(() => {
    if (secuenciasConAccionables.length === 0) return;
    const todos = secuenciasConAccionables.flatMap(s => s.accionables);
    setAccionables(todos);
     // console.log("Accionables combinados:", todos);
  }, [secuenciasConAccionables]);



  const handlePointAction = useCallback(
    (
      action: string,
      points: Array<{ seriesName: string; data: ScatterPoint  }>,
      accionable?:Accionable
    ) => {
      // 2 casos dependiendo de la cantidad de accionables
      if (points.length === 1) { // Solo 1 accionable
        const point = points[0]
        const punto =  `(${point.data.x}, ${point.data.y})`
        const message = `Accionable en el punto  ${punto} , Secuencia = ${point.seriesName}  \n,  Contenido=  ${accionable?.contenido} \n, Impacto= ${accionable?.impacto} \n, Esfuerzo=  ${accionable?.esfuerzo} \n, Realizado = ${accionable?.realizado ? "Sí" : "No" }`

        setLastAction(message)
      } else {
        const names = points
          .map((p) => p.data.label || `(${p.data.x}, ${p.data.y})`)
          .join(", ")
        const message = `Accionables: "${action}" en ${points.length} puntos: ${names}`
        setLastAction(message)
      }
    },
    []
  )

  return (
    <main 
      className="min-h-screen flex flex-col items-center p-3 sm:p-4 md:p-6"
      style={{ backgroundColor: 'var(--theme-bg-primary)' }}
    >
      <div className="w-full max-w-5xl space-y-4 sm:space-y-6">
        <div className="space-y-1 text-center">
          <h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-balance"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            Accionables de {proyecto?.titulo || "cargando..."}
          </h1>
          <p 
            className="text-xs sm:text-sm"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Puntos cercanos se agrupan con badge. Haz clic para interactuar.
          </p>
        </div>


         {/*
        ==============================
                  Graph 
        ==============================
        */}


        <QuadrantScatterChart
          title="Esfuerzo vs Impacto"
          description="Distribucion de proyectos por equipo. Puntos cercanos se agrupan automaticamente."
          series={series}
          accionables={accionables}
          xLabel="Esfuerzo"
          yLabel="Impacto"
          clusterRadius={6}
          quadrants={{
            topLeft: { color: "#fef3c7", label: "Quick Wins" },
            topRight: { color: "#dcfce7", label: "Proyectos Principales" },
            bottomLeft: { color: "#fee2e2", label: "Tareas Menores" },
            bottomRight: { color: "#dbeafe", label: "Tareas Complejas" },
          }}

         // Quick Wins, Proyectos Principales, Tareas Menores, Tareas Complejas
          onPointAction={handlePointAction}
        />


        {/* Lo que aparece hasta abajo cuando apretamos el modal */}

        {lastAction && (
          <div 
            className="rounded-lg border p-3 sm:p-4 text-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-secondary)',
              color: 'var(--theme-text-primary)'
            }}
          >
            <p 
              className="font-medium text-xs mb-1"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Detalles:
            </p>
            <p 
              className="font-mono text-xs sm:text-sm break-all"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              {lastAction}
            </p>
          </div>
        )}
      </div>


    </main>
  )
}