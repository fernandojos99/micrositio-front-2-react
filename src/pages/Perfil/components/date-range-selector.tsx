import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui-shadcn2/select"
import { cn } from "@/lib/utils"

// Tipos para los meses
const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export interface DateValue {
  month: string
  year: string
}

export interface DateRangeSelectorProps {
  /** Valor de la fecha de inicio */
  startDate?: DateValue
  /** Valor de la fecha de fin */

  /** Callback cuando cambia la fecha de inicio */
  onStartDateChange?: (date: DateValue) => void
  /** Callback cuando cambia la fecha de fin */

  /** Año mínimo permitido (default: 2019) */
  minYear?: number
  /** Año máximo permitido (default: 2035) */
  maxYear?: number
  /** Label para fecha de inicio */
  startLabel?: string

  /** Placeholder para el mes */
  monthPlaceholder?: string
  /** Placeholder para el año */
  yearPlaceholder?: string
  /** Deshabilitar el componente */
  disabled?: boolean
  /** Clase CSS adicional para el contenedor */
  className?: string
  /** Si la fecha de fin es "Presente" */
  isCurrentPosition?: boolean
  /** Callback cuando cambia isCurrentPosition */
  onCurrentPositionChange?: (isCurrent: boolean) => void
  /** Mostrar checkbox de "Actualidad" */
  showCurrentPositionOption?: boolean
}

export function DateRangeSelector({
  startDate,
  onStartDateChange,

  minYear = 2019,
  maxYear = 2035,
  startLabel = "Fecha de inicio",

  monthPlaceholder = "Mes",
  yearPlaceholder = "Año",
  disabled = false,
  className,

}: DateRangeSelectorProps) {
  // Generar lista de años
  const years = React.useMemo(() => {
    const yearList: string[] = []
    for (let year = minYear; year <= maxYear; year++) {
      yearList.push(year.toString())
    }
    return yearList
  }, [minYear, maxYear])

  const handleStartMonthChange = (month: string) => {
    onStartDateChange?.({
      month,
      year: startDate?.year || "",
    })
  }

  const handleStartYearChange = (year: string) => {
    onStartDateChange?.({
      month: startDate?.month || "",
      year,
    })
  }



  return (
    <div className={cn("flex flex-col gap-4", className)}>



      {/* Fecha de inicio */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          {startLabel}
        </label>
        <div className="flex gap-3">
          <Select
            value={startDate?.month}
            onValueChange={handleStartMonthChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full min-w-[140px] bg-white border-gray-300 hover:border-gray-400 focus:border-[#8B5A8B] focus:ring-[#8B5A8B]/20">
              <SelectValue placeholder={monthPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {MONTHS.map((month) => (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  className="hover:bg-[#8B5A8B]/10 focus:bg-[#8B5A8B]/10"
                >
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={startDate?.year}
            onValueChange={handleStartYearChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full min-w-[100px] bg-white border-gray-300 hover:border-gray-400 focus:border-[#8B5A8B] focus:ring-[#8B5A8B]/20">
              <SelectValue placeholder={yearPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year}
                  className="hover:bg-[#8B5A8B]/10 focus:bg-[#8B5A8B]/10"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


    </div>
  )
}

export default DateRangeSelector
