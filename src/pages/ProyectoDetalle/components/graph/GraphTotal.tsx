//"use client"

import { useCallback, useState } from "react"
import { QuadrantScatterChart, ScatterPoint } from "./graph/QuadrantScatterChart"

const teamA: ScatterPoint[] = [
  { x: 20, y: 30, label: "Proyecto Alpha" },
  { x: 35, y: 70, label: "Proyecto Beta" },
  { x: 60, y: 85, label: "Proyecto Gamma" },
  { x: 80, y: 90, label: "Proyecto Delta" },
  { x: 15, y: 55, label: "Proyecto Epsilon" },
  { x: 72, y: 40, label: "Proyecto Zeta" },
]

const teamB: ScatterPoint[] = [
  { x: 45, y: 25, label: "Iniciativa 1" },
  { x: 55, y: 60, label: "Iniciativa 2" },
  { x: 90, y: 75, label: "Iniciativa 3" },
  { x: 25, y: 15, label: "Iniciativa 4" },
  { x: 70, y: 55, label: "Iniciativa 5" },
  { x: 40, y: 80, label: "Iniciativa 6" },
]

const teamC: ScatterPoint[] = [
  { x: 10, y: 90, label: "Tarea X" },
  { x: 85, y: 20, label: "Tarea Y" },
  { x: 50, y: 50, label: "Tarea Z" },
  { x: 65, y: 70, label: "Tarea W" },
  { x: 30, y: 40, label: "Tarea V" },
]


// posibles lineas a seguir
const series = [
  { name: "Equipo A", data: teamA, color: "#2563eb" },
  //{ name: "Equipo B", data: teamB, color: "#f43f5e" },
  //{ name: "Equipo C", data: teamC, color: "#10b981" },
]

//import React from 'react'


/*
export const App = () => {
  return (
    <div>App</div>
  )
}
*/

export const GraphTotal=()=> {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handlePointAction = useCallback(
    (
      action: string,
      point: { seriesName: string; data: ScatterPoint }
    ) => {
      const name = point.data.label || `(${point.data.x}, ${point.data.y})`
      const message = `Accion: "${action}" en ${point.seriesName} - ${name} (x: ${point.data.x}, y: ${point.data.y})`
      setLastAction(message)
    },
    []
  )

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
            Scatter Chart con Cuadrantes
          </h1>
          <p className="text-muted-foreground text-sm">
            Haz clic en cualquier punto para interactuar. Los cuadrantes
            representan diferentes estados.
          </p>
        </div>

        <QuadrantScatterChart
          title="Rendimiento vs Satisfaccion"
          description="Distribucion de proyectos por equipo en 4 cuadrantes"
          series={series}
          xLabel="Rendimiento"
          yLabel="Satisfaccion"
          quadrants={{
            topLeft: { color: "#fef3c7", label: "Bajo Rend. / Alta Satisf." },
            topRight: { color: "#dcfce7", label: "Alto Rend. / Alta Satisf." },
            bottomLeft: { color: "#fee2e2", label: "Bajo Rend. / Baja Satisf." },
            bottomRight: { color: "#dbeafe", label: "Alto Rend. / Baja Satisf." },
          }}
          onPointAction={handlePointAction}
        />

        {lastAction && (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
            <p className="font-medium text-xs text-muted-foreground mb-1">
              Ultima accion:
            </p>
            <p className="font-mono text-sm">{lastAction}</p>
          </div>
        )}
      </div>
    </main>
  )
}
