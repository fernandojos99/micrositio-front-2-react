"use client"

import { useCallback, useState } from "react"
import QuadrantScatterChart, {
  type ScatterPoint,
} from "./quadrant-scatter-chart"
//import { GraphTotal } from "../graph/GraphTotal"

const teamA: ScatterPoint[] = [
  { x: 20, y: 30, label: "Proyecto Alpha" },
  { x: 35, y: 70, label: "Proyecto Beta" },
  { x: 60, y: 85, label: "Proyecto Gamma" },
  { x: 80, y: 90, label: "Proyecto Delta" },
  { x: 15, y: 55, label: "Proyecto Epsilon" },
  { x: 72, y: 40, label: "Proyecto Zeta" },
  // Puntos cercanos para probar clustering
  { x: 21, y: 31, label: "Proyecto Alpha 2" },
  { x: 22, y: 29, label: "Proyecto Alpha 3" },
]

const teamB: ScatterPoint[] = [
  { x: 45, y: 25, label: "Iniciativa 1" },
  { x: 55, y: 60, label: "Iniciativa 2" },
  { x: 90, y: 75, label: "Iniciativa 3" },
  { x: 25, y: 15, label: "Iniciativa 4" },
  { x: 70, y: 55, label: "Iniciativa 5" },
  { x: 40, y: 80, label: "Iniciativa 6" },
  // Punto cercano a Iniciativa 2
  { x: 56, y: 61, label: "Iniciativa 2B" },
]

const teamC: ScatterPoint[] = [
  { x: 10, y: 90, label: "Tarea X" },
  { x: 85, y: 20, label: "Tarea Y" },
  { x: 50, y: 50, label: "Tarea Z" },
  { x: 65, y: 70, label: "Tarea W" },
  { x: 30, y: 40, label: "Tarea V" },
  // Punto cercano a Tarea Z
  { x: 51, y: 51, label: "Tarea Z2" },
]

const series = [
  { name: "Equipo A", data: teamA, color: "#2563eb" },
  { name: "Equipo B", data: teamB, color: "#f43f5e" },
  { name: "Equipo C", data: teamC, color: "#10b981" },
]

export default function DemoPage() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handlePointAction = useCallback(
    (
      action: string,
      points: Array<{ seriesName: string; data: ScatterPoint }>
    ) => {
      if (points.length === 1) {
        const point = points[0]
        const name = point.data.label || `(${point.data.x}, ${point.data.y})`
        const message = `Accion: "${action}" en ${point.seriesName} - ${name}`
        setLastAction(message)
      } else {
        const names = points
          .map((p) => p.data.label || `(${p.data.x}, ${p.data.y})`)
          .join(", ")
        const message = `Accion: "${action}" en ${points.length} puntos: ${names}`
        setLastAction(message)
      }
    },
    []
  )

  return (
    <main className="min-h-screen bg-background flex flex-col items-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-5xl space-y-4 sm:space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">
            Accionables
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Puntos cercanos se agrupan con badge. Haz clic para interactuar.
          </p>
        </div>

        <QuadrantScatterChart
          title="Esfuerzo vs Impacto"
          description="Distribucion de proyectos por equipo. Puntos cercanos se agrupan automaticamente."
          series={series}
          xLabel="Esfuerzo"
          yLabel="Impacto"
          clusterRadius={6}
          quadrants={{
            topLeft: { color: "#fef3c7", label: "Quick win" },
            topRight: { color: "#dcfce7", label: "Trayectoria" },
            bottomLeft: { color: "#fee2e2", label: "Cambios sencillos" },
            bottomRight: { color: "#dbeafe", label: "<Insertar-tema>." },
          }}
          onPointAction={handlePointAction}
        />

        {lastAction && (
          <div className="rounded-lg border border-border bg-card p-3 sm:p-4 text-sm text-card-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
            <p className="font-medium text-xs text-muted-foreground mb-1">
              Ultima accion:
            </p>
            <p className="font-mono text-xs sm:text-sm break-all">{lastAction}</p>
          </div>
        )}
      </div>


    </main>
  )
}
