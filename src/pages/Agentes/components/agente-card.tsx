"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, Tag } from "lucide-react"
import type { Agente } from "@/services/agenteService"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui-shadcn2/card"
import { Button } from "@/components/ui-shadcn2/button"
import { AgenteModal } from "./agente-modal"

interface AgenteCardProps {
  agente: Agente
  onUpdated: (agente: Agente) => void
}

export function AgenteCard({ agente, onUpdated }: AgenteCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card className="flex h-full flex-col border-theme-border bg-theme-bg-secondary transition-colors hover:border-theme-border-hover">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-theme-accent to-theme-accent-2 text-theme-accent-foreground">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="mt-3 text-balance text-theme-text-primary">
            {agente.nombre}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-pretty text-theme-text-tertiary">
            {agente.descripcion || "Sin descripción disponible."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <span className="inline-flex items-center gap-1 rounded-full border border-theme-border bg-theme-bg-tertiary px-2.5 py-0.5 text-xs text-theme-text-secondary">
            <Tag className="size-3" />
            {agente.categoria || "default"}
          </span>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setOpen(true)}
            className="w-full justify-center gap-2 bg-gradient-to-r from-theme-accent to-theme-accent-2 text-theme-accent-foreground hover:opacity-90"
            aria-label={`Explorar prompt de ${agente.nombre}`}
          >
            Explorar prompt
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      <AgenteModal
        agente={agente}
        open={open}
        onOpenChange={setOpen}
        onUpdated={onUpdated}
      />
    </>
  )
}
