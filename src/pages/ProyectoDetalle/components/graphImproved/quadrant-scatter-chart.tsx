"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui-shadcn2/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui-shadcn2/collapsible"
import { ChartContainer } from "@/components/ui-shadcn2/chart"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { Accionable, createAccionable } from "@/pages/Interfaces/accionablesPoints"
import { actualizarAccionable } from "@/services/accionableService"

// --- Types ---
// Scatter = dispersión

// Point
export interface ScatterPoint {
  x: number
  y: number
  label?: string
  [key: string]: string | number | undefined
}


 // sets of points
export interface ScatterSeriesConfig {
  name: string
  data: ScatterPoint[]
  color: string
}

// Configuration of cuadrants , color and label
export interface QuadrantConfig {
  topLeft: { color: string; label: string }
  topRight: { color: string; label: string }
  bottomLeft: { color: string; label: string }
  bottomRight: { color: string; label: string }
}


interface ClusteredPoint {
  x: number
  y: number
  points: Array<{ point: ScatterPoint; seriesName: string; seriesColor: string }>
  count: number
  primaryColor: string
  primarySeriesName: string
}

interface ActiveCluster {
  cluster: ClusteredPoint
  cx: number
  cy: number
}

// --- Utility: Cluster nearby points ---
function clusterPoints(
  series: ScatterSeriesConfig[],
  xDomain: [number, number],
  yDomain: [number, number],
  clusterRadius: number
): ClusteredPoint[] {
  const allPoints: Array<{ point: ScatterPoint; seriesName: string; seriesColor: string }> = []
  
  series.forEach((s) => {
    s.data.forEach((point) => {
      allPoints.push({ point, seriesName: s.name, seriesColor: s.color })
    })
  })

  const xRange = xDomain[1] - xDomain[0]
  const yRange = yDomain[1] - yDomain[0]
  const xThreshold = (clusterRadius / 100) * xRange
  const yThreshold = (clusterRadius / 100) * yRange

  const clusters: ClusteredPoint[] = []
  const used = new Set<number>()

  for (let i = 0; i < allPoints.length; i++) {
    if (used.has(i)) continue

    const cluster: ClusteredPoint = {
      x: allPoints[i].point.x,
      y: allPoints[i].point.y,
      points: [allPoints[i]],
      count: 1,
      primaryColor: allPoints[i].seriesColor,
      primarySeriesName: allPoints[i].seriesName,
    }
    used.add(i)

    for (let j = i + 1; j < allPoints.length; j++) {
      if (used.has(j)) continue

      const dx = Math.abs(allPoints[j].point.x - cluster.x)
      const dy = Math.abs(allPoints[j].point.y - cluster.y)

      if (dx <= xThreshold && dy <= yThreshold) {
        cluster.points.push(allPoints[j])
        cluster.count++
        used.add(j)
      }
    }

    if (cluster.count > 1) {
      let sumX = 0, sumY = 0
      cluster.points.forEach((p) => {
        sumX += p.point.x
        sumY += p.point.y
      })
      cluster.x = sumX / cluster.count
      cluster.y = sumY / cluster.count
    }

    clusters.push(cluster)
  }

  return clusters
}



// --- Get quadrant for a point ---
function getQuadrant(
  x: number,
  y: number,
  xMid: number,
  yMid: number
): "topLeft" | "topRight" | "bottomLeft" | "bottomRight" {
  if (x < xMid && y >= yMid) return "topLeft"
  if (x >= xMid && y >= yMid) return "topRight"
  if (x < xMid && y < yMid) return "bottomLeft"
  return "bottomRight"
}

// --- Custom Dot Shape with Badge ---
// Se modifica el punto para que no sea solo un punto sencillo
function ClusterDotShape(props: {
  cx?: number
  cy?: number
  payload?: ClusteredPoint
  activeCluster: ActiveCluster | null
  onClusterClick: (cluster: ActiveCluster) => void
}) {
  const { cx, cy, payload, activeCluster, onClusterClick } = props
  if (cx == null || cy == null || !payload) return null

  const isActive =
    activeCluster?.cx === cx &&
    activeCluster?.cy === cy

  const hasMultiple = payload.count > 1

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation()
        onClusterClick({ cluster: payload, cx, cy })
      }}
    >
      {/* Hit area */}
      <circle cx={cx} cy={cy} r={24} fill="transparent" />
      
      {/* Pulse ring on active */}
      {isActive && (
        <circle
          cx={cx}
          cy={cy}
          r={20}
          fill={payload.primaryColor}
          fillOpacity={0.12}
          stroke={payload.primaryColor}
          strokeOpacity={0.25}
          strokeWidth={1.5}
        >
          <animate
            attributeName="r"
            values="16;20;16"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fillOpacity"
            values="0.12;0.04;0.12"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* White border circle */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 13 : 11}
        fill="white"
        stroke={payload.primaryColor}
        strokeWidth={3}
        style={{
          transition: "r 0.15s ease",
          filter: isActive
            ? `drop-shadow(0 0 8px ${payload.primaryColor})`
            : "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}
      />
      
      {/* Inner dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 7 : 6}
        fill={payload.primaryColor}
        style={{ transition: "r 0.15s ease" }}
      />

      {/* Badge for multiple points */}
      {hasMultiple && (
        <g>
          <circle
            cx={cx + 10}
            cy={cy - 10}
            r={10}
            fill="#ef4444"
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={cx + 10}
            y={cy - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={10}
            fontWeight={700}
          >
            {payload.count > 99 ? "99+" : payload.count}
          </text>
        </g>
      )}
    </g>
  )
}


// --- Custom Tooltip ---
// Es el contenido cuando pasa el mouse arriba del punto. (Lo desactive)
function ScatterTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ClusteredPoint }>
}) {
  if (!active || !payload?.length) return null
  const cluster = payload[0].payload
  
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-card-foreground max-w-[200px]">
      {cluster.count === 1 ? (
        <>
          {cluster.points[0].point.label && (
            <p className="text-sm font-semibold mb-0.5 truncate">
              {cluster.points[0].point.label}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Esfuerzo: <span className="font-medium text-foreground">{cluster.points[0].point.x}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Impacto: <span className="font-medium text-foreground">{cluster.points[0].point.y}</span>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold mb-1">
            {cluster.count} puntos agrupados
          </p>
          <p className="text-xs text-muted-foreground">
            Centro: ({cluster.x.toFixed(1)}, {cluster.y.toFixed(1)})
          </p>
        </>
      )}
    </div>
  )
}

// --- Cluster Popover ---
// Es la tarjeta que sale cuando da un click sobre un boton  (el modal)
// Se agrego la funcionalidad de que fuera clickeable y se pueda mover por la pantalla, 
function ClusterPopover({
  cluster,
  onClose,
  onAction,
}: {
  cluster: ActiveCluster
  onClose: () => void
  onAction: (action: string, points: Array<{ seriesName: string; data: ScatterPoint }>) => void
}) {
 // const isSingle = cluster.cluster.count === 1
 // const firstPoint = cluster.cluster.points[0]


  const [pos, setPos] = useState({
    x: cluster.cx,
    y: cluster.cy - 16
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;

    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;

    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const isSingle = cluster.cluster.count === 1
  const firstPoint = cluster.cluster.points[0]






  
  return (
    <div
      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        //left: cluster.cx,
        //top: cluster.cy - 16,
        left:pos.x,
        top:pos.y,
        transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
      }}
    >
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-xl min-w-[240px] max-w-[320px] max-h-[320px] overflow-hidden flex flex-col">
        
        
        {/* <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5"> */}
        {/* HEADER DRAGGABLE */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 cursor-move"
        > 

          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: cluster.cluster.primaryColor }}
            />
            <span className="text-sm font-semibold truncate">
              {isSingle ? firstPoint.seriesName : `${cluster.cluster.count} puntos`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none shrink-0"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        
        <div className="px-4 py-3 space-y-2 overflow-y-auto flex-1">
          {isSingle ? (
            <>
              {firstPoint.point.label && (
                <p className="text-xs text-muted-foreground font-medium">
                  {firstPoint.point.label}
                </p>
              )}
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px]  tracking-wide text-muted-foreground">Esfuerzo</p>
                  <p className="text-xl font-bold tracking-tight">{firstPoint.point.x}</p>
                </div>
                <div>
                  <p className="text-[10px]  tracking-wide text-muted-foreground">Impacto</p>
                  <p className="text-xl font-bold tracking-tight">{firstPoint.point.y}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              {cluster.cluster.points.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50"
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.seriesColor }}
                  />
                  <span className="truncate flex-1 font-medium">
                    {p.point.label || `Punto ${i + 1}`}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    ({p.point.x}, {p.point.y})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex border-t border-border divide-x divide-border">
          {/* <button
            onClick={() =>
              onAction(
                "details",
                cluster.cluster.points.map((p) => ({
                  seriesName: p.seriesName,
                  data: p.point,
                }))
              )
            }
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-bl-xl"
          >
            Ver detalles
          </button> */}
          {/* <button
            onClick={() =>
              onAction(
                "compare",
                cluster.cluster.points.map((p) => ({
                  seriesName: p.seriesName,
                  data: p.point,
                }))
              )
            }
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-br-xl"
          >
            Comparar
          </button> */}
        </div>
      </div>
    </div>
  )
}





// --- Quadrant Table ---
// La tabla que contiene los dropdown de cada cuadrante
function QuadrantTable({
  title,
  color,
  points,
  onRowClick,
  accionables,
}: {
  title: string
  color: string
  accionables: Accionable[]
  points: Array<{ point: ScatterPoint; seriesName: string; seriesColor: string }>
  onRowClick?: (point: ScatterPoint, seriesName: string,accionable:Accionable) => void
}) {
  const [isOpen, setIsOpen] = useState(false)


  //Este estado es para mantener un registro de qué filas están seleccionadas (marcadas) en la tabla de cada cuadrante. 
  const [checkedRows, setCheckedRows] = useState(new Set<string>())


  

  useEffect(() => {
    const initialChecked = new Set<string>()
  
    points.forEach((p) => {
      const accionable = accionables.find(a => a.contenido === p.point.label)
  
      if (accionable?.realizado) {
        initialChecked.add(p.point.label||"")
      }
    })
  
    setCheckedRows(initialChecked)
  
  }, [points, accionables])

  // Aqui tengo que agregar despues la llamada a la API para actulizar el
  // la columna de realizado (tanto para true como false)
  const toggleCheck = async (label: string) => {

    const accionable = accionables.find(a => a.contenido === label)
  
    if (!accionable) return
  
    const nuevoValor = !accionable.realizado
  
    try {
  
      await actualizarAccionable(accionable.id_accionable||0, nuevoValor)
  
      setCheckedRows(prev => {
        const newSet = new Set(prev)
  
        if (newSet.has(label)) {
          newSet.delete(label)
        } else {
          newSet.add(label)
        }
  
        return newSet
      })
  
    } catch (error) {
      console.error("Error actualizando accionable", error)
    }
  
  }
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          style={{ borderLeftWidth: 4, borderLeftColor: color }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm truncate">{title}</span>
            <span className="shrink-0 inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {points.length}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {points.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">
            No hay puntos en este cuadrante
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
             
            <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="w-[5%] px-3 py-2"></th>

                      <th className="w-[60%] px-3 py-2 text-left font-medium text-muted-foreground text-xs">
                        Accionable
                      </th>

                      <th className="w-[15%] px-3 py-2 text-left font-medium text-muted-foreground text-xs">
                        Secuencia
                      </th>

                      <th className="w-[10%] px-3 py-2 text-right font-medium text-muted-foreground text-xs">
                        Esfuerzo
                      </th>

                      <th className="w-[10%] px-3 py-2 text-right font-medium text-muted-foreground text-xs">
                        Impacto
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {points.map((p) => {
                      const isChecked = checkedRows.has(p.point.label||"") // Verifica si la fila actual está marcada

                      return (
                        <tr
                        key={p.point.label}
                          className="border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors"
                        >
                          {/* CHECK BUTTON */}
                          <td className="px-3 py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCheck(p.point.label||"")
                              }}
                              className={`flex items-center justify-center w-5 h-5 rounded border transition-colors
                                ${isChecked 
                                  ? "bg-green-500 border-green-500 text-white" 
                                  : "border-muted-foreground/40"}
                              `}
                            >
                              {isChecked && <Check size={14} />}
                            </button>
                          </td>

                          <td
                            className="px-3 py-2 font-medium truncate cursor-pointer"
                            onClick={() => onRowClick?.(p.point, p.seriesName,accionables.find(a => a.contenido === p.point.label) ||createAccionable(0))}
                          >
                            {p.point.label || "-"}
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-block h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: p.seriesColor }}
                              />
                              <span className="truncate text-xs">{p.seriesName}</span>
                            </div>
                          </td>

                          <td className="px-3 py-2 text-right tabular-nums">
                            {p.point.x}
                          </td>

                          <td className="px-3 py-2 text-right tabular-nums">
                            {p.point.y}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            </div>
          </div>
        )}
      </CollapsibleContent>


    </Collapsible>
  )
}




// --- Main Component ---
// Interface de las props que recibe el componente principal, con sus respectivos tipos
export interface QuadrantScatterChartProps {
  title?: string
  description?: string
  series: ScatterSeriesConfig[]
  accionables:Accionable[]
  quadrants?: QuadrantConfig
  xDomain?: [number, number]
  yDomain?: [number, number]
  xLabel?: string
  yLabel?: string
  clusterRadius?: number
  onPointAction?: (
    action: string,
    points: Array<{ seriesName: string; data: ScatterPoint }>,
    accionable?: Accionable
  ) => void
}

const DEFAULT_QUADRANTS: QuadrantConfig = {
  topLeft: { color: "#fef3c7", label: "Bajo Rendimiento" },
  topRight: { color: "#dcfce7", label: "Alto Rendimiento" },
  bottomLeft: { color: "#fee2e2", label: "Critico" },
  bottomRight: { color: "#dbeafe", label: "En Crecimiento" },
}


// ==================================================
//                  Creo  que este es el bueno MAIN
// ==================================================

export default function QuadrantScatterChart({
  title = "Analisis por Cuadrantes",
  description = "Haz clic en cualquier punto para interactuar",
  series,
  accionables,
  quadrants = DEFAULT_QUADRANTS,
  xDomain = [0, 10],
  yDomain = [0, 10],
  xLabel = "Eje X",
  yLabel = "Eje Y",
  clusterRadius = 5,
  onPointAction,
}: QuadrantScatterChartProps) {
  const [activeCluster, setActiveCluster] = useState<ActiveCluster | null>(null)

  const xMid = (xDomain[0] + xDomain[1]) / 2
  const yMid = (yDomain[0] + yDomain[1]) / 2

  const clusteredData = useMemo(
    () => clusterPoints(series, xDomain, yDomain, clusterRadius),
    [series, xDomain, yDomain, clusterRadius]
  )

  const pointsByQuadrant = useMemo(() => {
    const result: Record<
      "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
      Array<{ point: ScatterPoint; seriesName: string; seriesColor: string }>
    > = {
      topLeft: [],
      topRight: [],
      bottomLeft: [],
      bottomRight: [],
    }

    series.forEach((s) => {
      s.data.forEach((point) => {
        const quadrant = getQuadrant(point.x, point.y, xMid, yMid)
        result[quadrant].push({ point, seriesName: s.name, seriesColor: s.color })
      })
    })

    return result
  }, [series, xMid, yMid])

  const handleClusterClick = useCallback((cluster: ActiveCluster) => {
    setActiveCluster((prev) =>
      prev?.cx === cluster.cx && prev?.cy === cluster.cy ? null : cluster
    )
  }, [])

  const handleAction = useCallback(
    (action: string, points: Array<{ seriesName: string; data: ScatterPoint }>) => {
      onPointAction?.(action, points)
      setActiveCluster(null)
    },
    [onPointAction]
  )

  const handleRowClick = useCallback(
    (point: ScatterPoint, seriesName: string,accionable:Accionable) => {
      onPointAction?.("row-click", [{ seriesName, data: point }],accionable)
    },
    [onPointAction]
  )

  const chartConfig = series.reduce(
    (acc, s) => {
      acc[s.name] = { label: s.name, color: s.color }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  )

  return (
    <Card className="w-full overflow-visible">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-balance text-lg sm:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px] md:h-[480px] w-full overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
              // Para tener mas espacio entre el borde del grafico y los puntos, para que se vea mejor
                margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
                onClick={() => setActiveCluster(null)}
              >
                {/* Quadrant background areas */}
                <ReferenceArea
                  x1={xDomain[0]}
                  x2={xMid}
                  y1={yMid}
                  y2={yDomain[1]}
                  fill={quadrants.topLeft.color}
                  fillOpacity={0.5}
                  stroke="none"
                />
                <ReferenceArea
                  x1={xMid}
                  x2={xDomain[1]}
                  y1={yMid}
                  y2={yDomain[1]}
                  fill={quadrants.topRight.color}
                  fillOpacity={0.5}
                  stroke="none"
                />
                <ReferenceArea
                  x1={xDomain[0]}
                  x2={xMid}
                  y1={yDomain[0]}
                  y2={yMid}
                  fill={quadrants.bottomLeft.color}
                  fillOpacity={0.5}
                  stroke="none"
                />
                <ReferenceArea
                  x1={xMid}
                  x2={xDomain[1]}
                  y1={yDomain[0]}
                  y2={yMid}
                  fill={quadrants.bottomRight.color}
                  fillOpacity={0.5}
                  stroke="none"
                />

                {/* Quadrant divider lines */}
                <ReferenceLine
                  x={xMid}
                  stroke="rgba(0,0,0,0.15)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />
                <ReferenceLine
                  y={yMid}
                  stroke="rgba(0,0,0,0.15)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />

                <CartesianGrid
                  strokeDasharray="3 3"
                  strokeOpacity={0.15}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={xDomain}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: xLabel,
                    position: "insideBottom",
                    offset: -10,
                    style: {
                      fontSize: 10,
                      fill: "rgba(0,0,0,0.45)",
                      fontWeight: 500,
                    },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  width={36}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    offset: 8,
                    style: {
                      fontSize: 10,
                      fill: "rgba(0,0,0,0.45)",
                      fontWeight: 500,
                    },
                  }}
                />
                 {/* Para desactivar la vista previa al pasar por arriba del boton */}
                <Tooltip content={<ScatterTooltipContent />} cursor={false} />

                <Scatter
                  name="clusters"
                  data={clusteredData}
                  fill="#2563eb"
                  shape={(shapeProps: { cx?: number; cy?: number; payload?: ClusteredPoint }) => (
                    <ClusterDotShape
                      cx={shapeProps.cx}
                      cy={shapeProps.cy}
                      payload={shapeProps.payload}
                      activeCluster={activeCluster}
                      onClusterClick={handleClusterClick}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Popover */}
          {activeCluster && (
            <ClusterPopover
              cluster={activeCluster}
              onClose={() => setActiveCluster(null)}
              onAction={handleAction}
            />
          )}

          {/* Legend  : Es el nombre de los conjuntos de puntos  (secuencias)*/}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            {series.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant Tables */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Puntos por Cuadrante
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <QuadrantTable
              title={quadrants.topLeft.label}
              color={quadrants.topLeft.color}
              points={pointsByQuadrant.topLeft}
              accionables={accionables}
              onRowClick={handleRowClick}
            />
            <QuadrantTable
              title={quadrants.topRight.label}
              color={quadrants.topRight.color}
              points={pointsByQuadrant.topRight}
              accionables={accionables}
              onRowClick={handleRowClick}
            />
            <QuadrantTable
              title={quadrants.bottomLeft.label}
              color={quadrants.bottomLeft.color}
              points={pointsByQuadrant.bottomLeft}
              accionables={accionables}
              onRowClick={handleRowClick}
            />
            <QuadrantTable
              title={quadrants.bottomRight.label}
              color={quadrants.bottomRight.color}
              points={pointsByQuadrant.bottomRight}
              accionables={accionables}
              onRowClick={handleRowClick}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
