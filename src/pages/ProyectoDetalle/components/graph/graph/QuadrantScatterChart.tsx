//"use client"

import { useState, useCallback } from "react"


import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
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
} from "../ui/card"
import { ChartContainer } from "../ui/chart"


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



interface ActivePoint {
  point: ScatterPoint
  seriesName: string
  seriesColor: string
  cx: number
  cy: number
}


//=================================================
// --- Quadrant Labels via CustomizedLabel ---
// Control the position of Quadrant Labels
//==================================================
function QuadrantLabels({
  xMid,
  yMid,
  xDomain,
  yDomain,
  quadrants,
}: {
  xMid: number
  yMid: number
  xDomain: [number, number]
  yDomain: [number, number]
  quadrants: QuadrantConfig
}) {


  const labels = [
    {
      label: quadrants.topLeft.label,
      x: (xDomain[0] + xMid) / 2,
      y: (yMid + yDomain[1]) / 2,
    },
    {
      label: quadrants.topRight.label,
      x: (xMid + xDomain[1]) / 2,
      y: (yMid + yDomain[1]) / 2,
    },
    {
      label: quadrants.bottomLeft.label,
      x: (xDomain[0] + xMid) / 2,
      y: (yDomain[0] + yMid) / 2,
    },
    {
      label: quadrants.bottomRight.label,
      x: (xMid + xDomain[1]) / 2,
      y: (yDomain[0] + yMid) / 2,
    },
  ]

  return (
    <>
      {labels.map((item) => (
        <ReferenceArea
          key={item.label}
          x1={item.x - 0.01}
          x2={item.x + 0.01}
          y1={item.y - 0.01}
          y2={item.y + 0.01}
          fill="transparent"
          stroke="none"
          label={{
            value: item.label,
            fill: "rgba(0,0,0,0.3)",
            fontSize: 13,
            fontWeight: 600,
          }}
        />
      ))}
    </>
  )
}



// --- Custom Dot Shape ---
// Se modifica el punto para que no sea solo un punto sencillo
function DotShape(props: {
  cx?: number
  cy?: number
  payload?: ScatterPoint
  seriesName: string
  seriesColor: string
  activePoint: ActivePoint | null
  onPointClick: (pt: ActivePoint) => void
}) {
  const {
    cx,
    cy,
    payload,
    seriesName,
    seriesColor,
    activePoint,
    onPointClick,
  } = props
  if (cx == null || cy == null || !payload) return null

  const isActive =
    activePoint?.cx === cx &&
    activePoint?.cy === cy &&
    activePoint?.seriesName === seriesName

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation()
        onPointClick({
          point: payload,
          seriesName,
          seriesColor,
          cx,
          cy,
        })
      }}
    >
      {/* Hit area */}
      {/* Area para dar click , si le pongo seriesColor pinta el area para apretar. /
      <circle r={5} fill={seriesColor}/>
      {/* <circle cx={cx} cy={cy} r={20} fill="transparent" /> */}

      {/* Pulse ring on active */}
      {isActive && (
        <circle
          cx={cx}
          cy={cy}
          r={18}
          fill={seriesColor}
          fillOpacity={0.12}
          stroke={seriesColor}
          strokeOpacity={0.25}
          strokeWidth={1.5}
        >
          <animate
          // efecto pulsante cuando se aprieta el boton
            attributeName="r"
            values="14;18;14"
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




      {/* White border */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 11 : 9}
        fill="white"
        stroke={seriesColor}
        strokeWidth={3}
        style={{
          transition: "r 0.15s ease",
          filter: isActive
            ? `drop-shadow(0 0 8px ${seriesColor})`
            : "drop-shadow(0 1px 4px rgba(0,0,0,0.18))",
        }}
      />
      {/* Inner dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 6 : 5}
        fill={seriesColor}
        style={{ transition: "r 0.15s ease" }}
      />
    </g>
  )
}

// --- Custom Tooltip ---
// Es el contenido cuando pasa el mouse arriba del punto. (Lo desactive)
function ScatterTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScatterPoint }> }) {
  if (!active || !payload?.length) return null
  const pt = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-card-foreground">
      {pt.label && (
        <p className="text-sm font-semibold mb-0.5">{pt.label}</p>
      )}
      <p className="text-xs text-muted-foreground">
        X: <span className="font-medium text-foreground">{pt.x}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Y: <span className="font-medium text-foreground">{pt.y}</span>
      </p>
    </div>
  )
}

// --- Point Popover ---
// Es la tarjeta que sale cuando dame click sobre un boton  (el modal)

function PointPopover({
  point,
  onClose,
  onAction,
}: {
  point: ActivePoint
  onClose: () => void
  onAction: (action: string, point: ActivePoint) => void
}) {
  return (
    <div
      className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150"
      style={{
        left: point.cx,
        top: point.cy - 12,
        transform: "translate(-50%, -100%)",
        pointerEvents: "auto",
      }}
    >
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-xl min-w-[210px]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: point.seriesColor }}
            />
            <span className="text-sm font-semibold">{point.seriesName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>
        <div className="px-4 py-3 space-y-1">
          {point.point.label && (
            <p className="text-xs text-muted-foreground font-medium">
              {point.point.label}
            </p>
          )}
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                X
              </p>
              <p className="text-xl font-bold tracking-tight">
                {point.point.x}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Y
              </p>
              <p className="text-xl font-bold tracking-tight">
                {point.point.y}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-border divide-x divide-border">
          <button
            onClick={() => onAction("details", point)}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-bl-xl"
          >
            Ver detalles
          </button>
          <button
            onClick={() => onAction("compare", point)}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-br-xl"
          >
            Comparar
          </button>
        </div>
      </div>
    </div>
  )
}


// --- Main Component;  Props que recibe ---
// Interface de las props que recibe el componente principal, con sus respectivos tipos
export interface QuadrantScatterChartProps {
  title?: string
  description?: string
  series: ScatterSeriesConfig[]
  quadrants?: QuadrantConfig
  xDomain?: [number, number]
  yDomain?: [number, number]
  xLabel?: string
  yLabel?: string
  height?: number
  onPointAction?: (
    action: string,
    point: {
      seriesName: string
      data: ScatterPoint
    }
  ) => void
}

//fef3c7

const DEFAULT_QUADRANTS: QuadrantConfig = {
  topLeft: { color: "#fef3c7", label: "Bajo Esfuerzo" },
  topRight: { color: "#dcfce7", label: "Alto Impacto" },
  bottomLeft: { color: "#fee2e2", label: "Critico" },
  bottomRight: { color: "#dbeafe", label: "En Crecimiento" },
}


// ==============================================================================================================
//                                      Funcion principal
// ==============================================================================================================

export const QuadrantScatterChart=({
  title = "Analisis por Cuadrantes",
  description = "Haz clic en cualquier punto para interactuar",
  series,
  quadrants = DEFAULT_QUADRANTS,
  // Rango de los ejes, se puede modificar segun los datos que se quieran mostrar
  xDomain = [0, 100],
  yDomain = [0, 100],
  xLabel = "Eje X",
  yLabel = "Eje Y",
  height = 480,
  onPointAction,
}: QuadrantScatterChartProps) => {

  // conocer el punto activo 
  const [activePoint, setActivePoint] = useState<ActivePoint | null>(null)

  const xMid = (xDomain[0] + xDomain[1]) / 2
  const yMid = (yDomain[0] + yDomain[1]) / 2

  const handlePointClick = useCallback((pt: ActivePoint) => {
    setActivePoint((prev) =>
      prev?.cx === pt.cx &&
      prev?.cy === pt.cy &&
      prev?.seriesName === pt.seriesName
        ? null
        : pt
    )
  }, [])

  const handleAction = useCallback(
    (action: string, pt: ActivePoint) => {
      onPointAction?.(action, {
        seriesName: pt.seriesName,
        data: pt.point,
      })
      setActivePoint(null)
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-balance">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 28, left: 8, bottom: 20 }}
                onClick={() => setActivePoint(null)}
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

                {/* Quadrant labels */}
                <QuadrantLabels
                  xMid={xMid}
                  yMid={yMid}
                  xDomain={xDomain}
                  yDomain={yDomain}
                  quadrants={quadrants}
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
                  tickMargin={10}
                  className="text-xs"
                  label={{
                    value: xLabel,
                    position: "insideBottom",
                    offset: -10,
                    style: {
                      fontSize: 12,
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
                  tickMargin={8}
                  width={48}
                  className="text-xs"
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    offset: 4,
                    style: {
                      fontSize: 12,
                      fill: "rgba(0,0,0,0.45)",
                      fontWeight: 500,
                    },
                  }}
                />
                {/* Para desactivar la vista previa al pasar por arriba del boton */}
             {/*    <Tooltip
                  content={<ScatterTooltipContent />}
                  cursor={false}
                /> */}

                {series.map((s) => (
                  <Scatter
                    key={s.name}
                    name={s.name}
                    data={s.data}
                    fill={s.color}
                    shape={(shapeProps: { cx?: number; cy?: number; payload?: ScatterPoint }) => (
                      <DotShape
                        cx={shapeProps.cx}
                        cy={shapeProps.cy}
                        payload={shapeProps.payload}
                        seriesName={s.name}
                        seriesColor={s.color}
                        activePoint={activePoint}
                        onPointClick={handlePointClick}
                      />
                    )}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Popover */}
          {activePoint && (
            <PointPopover
              point={activePoint}
              onClose={() => setActivePoint(null)}
              onAction={handleAction}
            />
          )}








          {/* Legend where are the teams names (lower ) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {series.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {s.name}
                </span>
              </div>
            ))}
          </div>





        </div>
      </CardContent>
    </Card>
  )
}
