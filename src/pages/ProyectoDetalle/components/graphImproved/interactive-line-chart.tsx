"use client"

import { useState, useCallback } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui-shadcn/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui-shadcn/chart"

// --- Types ---
export interface DataPoint {
  [key: string]: string | number
}

export interface LineConfig {
  dataKey: string
  label: string
  color: string
}

interface ClickedPoint {
  dataKey: string
  label: string
  value: number
  payload: DataPoint
  color: string
  cx: number
  cy: number
}

// --- Custom Dot ---
function ClickableDot(props: {
  cx?: number
  cy?: number
  payload?: DataPoint
  dataKey: string
  color: string
  label: string
  activePoint: ClickedPoint | null
  onPointClick: (point: ClickedPoint) => void
}) {
  const { cx, cy, payload, dataKey, color, label, activePoint, onPointClick } =
    props
  if (cx == null || cy == null || !payload) return null

  const value = payload[dataKey]
  if (typeof value !== "number") return null

  const isActive =
    activePoint?.cx === cx &&
    activePoint?.cy === cy &&
    activePoint?.dataKey === dataKey

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation()
        onPointClick({ dataKey, label, value, payload, color, cx, cy })
      }}
    >
      {/* Invisible larger hit area */}
      <circle cx={cx} cy={cy} r={18} fill="transparent" />
      {/* Outer glow ring on active */}
      {isActive && (
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill={color}
          fillOpacity={0.15}
          stroke={color}
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      )}
      {/* White border ring */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 9 : 7}
        fill="white"
        stroke={color}
        strokeWidth={2.5}
        style={{
          transition: "r 0.15s ease",
          filter: isActive
            ? `drop-shadow(0 0 6px ${color})`
            : `drop-shadow(0 1px 3px rgba(0,0,0,0.15))`,
        }}
      />
      {/* Inner filled dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 5 : 4}
        fill={color}
        style={{ transition: "r 0.15s ease" }}
      />
    </g>
  )
}

// --- Popover ---
function PointPopover({
  point,
  onClose,
  onAction,
  xKey,
}: {
  point: ClickedPoint
  onClose: () => void
  onAction: (action: string, point: ClickedPoint) => void
  xKey: string
}) {
  const xValue = point.payload[xKey]
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
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-xl min-w-[200px]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: point.color }}
            />
            <span className="text-sm font-semibold">{point.label}</span>
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
          <p className="text-xs text-muted-foreground">{String(xKey)}: <span className="font-medium text-foreground">{String(xValue)}</span></p>
          <p className="text-2xl font-bold tracking-tight">{point.value.toLocaleString()}</p>
        </div>
        <div className="flex border-t border-border divide-x divide-border">
          <button
            onClick={() => onAction("details", point)}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-bl-xl"
          >
            Ver detalles
          </button>
          <button
            onClick={() => onAction("export", point)}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors rounded-br-xl"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export interface InteractiveLineChartProps {
  /** Chart title */
  title?: string
  /** Chart description */
  description?: string
  /** Data array */
  data: DataPoint[]
  /** Key used for the X axis */
  xKey: string
  /** Line configurations */
  lines: LineConfig[]
  /** Callback when clicking a point action button */
  onPointAction?: (action: string, point: { dataKey: string; label: string; value: number; payload: DataPoint }) => void
  /** Chart height in px */
  height?: number
}

export default function InteractiveLineChart({
  title = "Datos Interactivos",
  description = "Haz clic en cualquier punto para ver sus opciones",
  data,
  xKey,
  lines,
  onPointAction,
  height = 420,
}: InteractiveLineChartProps) {
  const [activePoint, setActivePoint] = useState<ClickedPoint | null>(null)

  const handlePointClick = useCallback((point: ClickedPoint) => {
    setActivePoint((prev) =>
      prev?.cx === point.cx &&
      prev?.cy === point.cy &&
      prev?.dataKey === point.dataKey
        ? null
        : point
    )
  }, [])

  const handleAction = useCallback(
    (action: string, point: ClickedPoint) => {
      onPointAction?.(action, {
        dataKey: point.dataKey,
        label: point.label,
        value: point.value,
        payload: point.payload,
      })
      setActivePoint(null)
    },
    [onPointAction]
  )

  const chartConfig = lines.reduce(
    (acc, line) => {
      acc[line.dataKey] = { label: line.label, color: line.color }
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
              <LineChart
                data={data}
                margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
                onClick={() => setActivePoint(null)}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey={xKey}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickMargin={8}
                  width={48}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
                />
                {lines.map((line) => (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.label}
                    stroke={line.color}
                    strokeWidth={2.5}
                    activeDot={false}
                    dot={(dotProps) => (
                      <ClickableDot
                        key={`${dotProps.cx}-${dotProps.cy}`}
                        cx={dotProps.cx}
                        cy={dotProps.cy}
                        payload={dotProps.payload}
                        dataKey={line.dataKey}
                        color={line.color}
                        label={line.label}
                        activePoint={activePoint}
                        onPointClick={handlePointClick}
                      />
                    )}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Click popover */}
          {activePoint && (
            <PointPopover
              point={activePoint}
              xKey={xKey}
              onClose={() => setActivePoint(null)}
              onAction={handleAction}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
