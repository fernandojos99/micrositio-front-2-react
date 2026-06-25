"use client"

import useSWR from "swr"
import { obtenerAgentes, type Agente } from "@/services/agenteService.ts"
import { AgenteCard } from "./agente-card"
import { ThemeToggle } from "./theme-toggle"
import { Skeleton } from "@/components/ui-shadcn2/skeleton"

export function AgentesGrid() {
  // CORRECCIÓN 1: La clave debe ser un array o string, no un array con opciones
  const { data, error, isLoading, mutate } = useSWR<Agente[]>(
    "agentes", 
    obtenerAgentes, 
    {
      revalidateOnFocus: false,
    }
  )

  // CORRECCIÓN 2: Tipar explícitamente el parámetro 'current'
  const handleUpdated = (updated: Agente) => {
    mutate(
      (current: Agente[] | undefined) => // <-- Aquí se tipa 'current'
        current?.map((a) => (a.id_agente === updated.id_agente ? updated : a)) ?? current,
      { revalidate: false } // <-- Esto está bien, es la opción de mutate
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-theme-text-primary sm:text-4xl">
            Galería de Agentes
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-theme-text-tertiary">
            Explora los agentes disponibles, revisa su prompt completo y edita su información.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl bg-theme-bg-secondary" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-theme-border bg-theme-bg-secondary p-8 text-center text-theme-text-tertiary">
          Ocurrió un error al cargar los agentes. Intenta nuevamente más tarde.
        </div>
      )}

      {!isLoading && !error && data && data.length === 0 && (
        <div className="rounded-xl border border-theme-border bg-theme-bg-secondary p-8 text-center text-theme-text-tertiary">
          No hay agentes disponibles por el momento.
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((agente) => (
            <AgenteCard key={agente.id_agente} agente={agente} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  )
}