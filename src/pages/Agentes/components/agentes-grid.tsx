"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Plus, Search } from "lucide-react"
import { obtenerAgentes, CATEGORIAS_AGENTE, type Agente } from "@/services/agenteService.ts"
import { AgenteCard } from "./agente-card"
import { AgenteCreateModal } from "./agente-create-modal"
import { Skeleton } from "@/components/ui-shadcn/skeleton"
import { Input } from "@/components/ui-shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui-shadcn/select"

function getCategoriaLabel(categoria: string | undefined): string {
  return categoria || "default"
}

export function AgentesGrid() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("todas")
  const { data, error, isLoading, mutate } = useSWR<Agente[]>(
    "agentes", 
    obtenerAgentes, 
    {
      revalidateOnFocus: false,
    }
  )

  const categoriasDisponibles = useMemo(() => {
    if (!data) return []
    const cats = new Set(data.map((a) => getCategoriaLabel(a.categoria)))
    return Array.from(cats).sort()
  }, [data])

  const agentesFiltrados = useMemo(() => {
    if (!data) return []
    let result = data
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.nombre.toLowerCase().includes(q) ||
          (a.descripcion ?? "").toLowerCase().includes(q)
      )
    }
    if (filterCategoria !== "todas") {
      result = result.filter((a) => getCategoriaLabel(a.categoria) === filterCategoria)
    }
    return result
  }, [data, search, filterCategoria])

  const handleUpdated = (updated: Agente) => {
    mutate(
      (current: Agente[] | undefined) =>
        current?.map((a) => (a.id_agente === updated.id_agente ? updated : a)) ?? current,
      { revalidate: false }
    )
  }

  const handleCreated = (nuevo: Agente) => {
    mutate(
      (current: Agente[] | undefined) => [...(current ?? []), nuevo],
      { revalidate: false }
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
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-theme-text-muted" />
          <Input
            placeholder="busqueda agente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-theme-border bg-theme-bg-secondary text-theme-text-primary placeholder:text-theme-text-muted"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-full sm:w-48 border-theme-border bg-theme-bg-secondary text-theme-text-primary">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent className="border-theme-border bg-theme-bg-secondary text-theme-text-primary">
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {CATEGORIAS_AGENTE.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
            {categoriasDisponibles.filter((c) => c === "default" || !(CATEGORIAS_AGENTE as readonly string[]).includes(c)).map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <p className="mb-6 text-center text-theme-text-muted">
          No hay agentes todavía. Crea el primero con el botón de abajo.
        </p>
      )}

      {!isLoading && data && agentesFiltrados.length === 0 && data.length > 0 && (
        <p className="mb-6 text-center text-theme-text-muted">
          No se encontraron agentes con los filtros actuales.
        </p>
      )}

      {!isLoading && data && agentesFiltrados.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-theme-border bg-theme-bg-secondary text-theme-text-muted transition-colors hover:border-theme-accent hover:text-theme-accent"
          >
            <Plus className="size-8" />
            <span className="text-sm font-medium">Nuevo agente</span>
          </button>
          {agentesFiltrados.map((agente) => (
            <AgenteCard key={agente.id_agente} agente={agente} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      <AgenteCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}