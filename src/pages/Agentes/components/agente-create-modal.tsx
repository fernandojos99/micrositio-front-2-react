"use client"

import { useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { crearAgente, type Agente } from "@/services/agenteService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui-shadcn2/dialog"
import { Button } from "@/components/ui-shadcn2/button"
import { Input } from "@/components/ui-shadcn2/input"
import { Textarea } from "@/components/ui-shadcn2/textarea"
import { Label } from "@/components/ui-shadcn2/label"

interface AgenteCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (agente: Agente) => void
}

export function AgenteCreateModal({ open, onOpenChange, onCreated }: AgenteCreateModalProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [prompt, setPrompt] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string; descripcion?: string; prompt?: string }>({})

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setPrompt("")
    setErrors({})
    setSaving(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio."
    if (!descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria."
    if (!prompt.trim()) newErrors.prompt = "El prompt es obligatorio."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const nuevo = await crearAgente({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        prompt: prompt.trim(),
      })
      onCreated(nuevo)
      toast.success("Agente creado correctamente.")
      handleOpenChange(false)
    } catch (error) {
      toast.error((error as Error).message || "No se pudo crear el agente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border-theme-border bg-theme-bg-primary p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="border-b border-theme-border bg-gradient-to-r from-theme-accent to-theme-accent-2 p-6">
          <DialogTitle className="text-theme-accent-foreground">Crear nuevo agente</DialogTitle>
          <DialogDescription className="text-theme-accent-foreground/80">
            Completa todos los campos para registrar un nuevo agente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-nombre" className="text-xs font-semibold uppercase tracking-wide text-theme-accent">
              Nombre
            </Label>
            <Input
              id="create-nombre"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: undefined })) }}
              placeholder="Nombre del agente"
              className="border-theme-border bg-theme-bg-secondary text-theme-text-primary"
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-descripcion" className="text-xs font-semibold uppercase tracking-wide text-theme-accent">
              Descripción
            </Label>
            <Input
              id="create-descripcion"
              value={descripcion}
              onChange={(e) => { setDescripcion(e.target.value); setErrors((p) => ({ ...p, descripcion: undefined })) }}
              placeholder="Breve descripción del agente"
              className="border-theme-border bg-theme-bg-secondary text-theme-text-primary"
            />
            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-prompt" className="text-xs font-semibold uppercase tracking-wide text-theme-accent">
              Prompt
            </Label>
            <Textarea
              id="create-prompt"
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setErrors((p) => ({ ...p, prompt: undefined })) }}
              rows={8}
              placeholder="Prompt completo del agente"
              className="resize-y border-theme-border bg-theme-bg-secondary font-mono text-sm text-theme-text-primary"
            />
            {errors.prompt && <p className="text-sm text-red-500">{errors.prompt}</p>}
          </div>
        </div>

        <div className="border-t border-theme-border p-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 bg-gradient-to-r from-theme-accent to-theme-accent-2 text-theme-accent-foreground hover:opacity-90"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
