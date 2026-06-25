"use client"

import { useEffect, useState } from "react"
import { Pencil, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { actualizarAgente, type Agente } from "@/services/agenteService"
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

type EditableField = "nombre" | "descripcion" | "prompt"

interface AgenteModalProps {
  agente: Agente
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (agente: Agente) => void
}

interface FieldDraft {
  nombre: string
  descripcion: string
  prompt: string
}

function buildDraft(agente: Agente): FieldDraft {
  return {
    nombre: agente.nombre ?? "",
    descripcion: agente.descripcion ?? "",
    prompt: agente.prompt ?? "",
  }
}

export function AgenteModal({ agente, open, onOpenChange, onUpdated }: AgenteModalProps) {
  const [draft, setDraft] = useState<FieldDraft>(() => buildDraft(agente))
  const [editing, setEditing] = useState<EditableField | null>(null)
  const [backup, setBackup] = useState<string>("")
  const [saving, setSaving] = useState<EditableField | null>(null)

  // Reinicia el borrador cuando se abre el modal o cambia el agente.
  useEffect(() => {
    if (open) {
      setDraft(buildDraft(agente))
      setEditing(null)
    }
  }, [open, agente])

  const startEdit = (field: EditableField) => {
    setBackup(draft[field])
    setEditing(field)
  }

  const cancelEdit = (field: EditableField) => {
    setDraft((d) => ({ ...d, [field]: backup }))
    setEditing(null)
  }

  const saveEdit = async (field: EditableField) => {
    setSaving(field)
    try {
      const updated = await actualizarAgente({
        id_agente: agente.id_agente,
        [field]: draft[field],
      })
      onUpdated({ ...agente, ...updated, [field]: draft[field] })
      toast.success("Cambios guardados correctamente.")
      setEditing(null)
    } catch (error) {
      toast.error((error as Error).message || "No se pudo guardar el cambio.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border-theme-border bg-theme-bg-primary p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="border-b border-theme-border bg-gradient-to-r from-theme-accent to-theme-accent-2 p-6">
          <DialogTitle className="text-theme-accent-foreground">Detalle del agente</DialogTitle>
          <DialogDescription className="text-theme-accent-foreground/80">
            Explora y edita la información de este agente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <FieldBlock
            label="Nombre"
            field="nombre"
            editing={editing === "nombre"}
            saving={saving === "nombre"}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveEdit}
          >
            {editing === "nombre" ? (
              <Input
                value={draft.nombre}
                onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
                className="border-theme-border bg-theme-bg-secondary text-theme-text-primary"
              />
            ) : (
              <p className="text-pretty font-medium text-theme-text-primary">{draft.nombre}</p>
            )}
          </FieldBlock>

          <FieldBlock
            label="Descripción"
            field="descripcion"
            editing={editing === "descripcion"}
            saving={saving === "descripcion"}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveEdit}
          >
            {editing === "descripcion" ? (
              <Textarea
                value={draft.descripcion}
                onChange={(e) => setDraft((d) => ({ ...d, descripcion: e.target.value }))}
                rows={3}
                className="resize-none border-theme-border bg-theme-bg-secondary text-theme-text-primary"
              />
            ) : (
              <p className="text-pretty leading-relaxed text-theme-text-tertiary">
                {draft.descripcion || "Sin descripción."}
              </p>
            )}
          </FieldBlock>

          <FieldBlock
            label="Prompt completo"
            field="prompt"
            editing={editing === "prompt"}
            saving={saving === "prompt"}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveEdit}
          >
            {editing === "prompt" ? (
              <Textarea
                value={draft.prompt}
                onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))}
                rows={8}
                className="resize-y border-theme-border bg-theme-bg-secondary font-mono text-sm text-theme-text-primary"
              />
            ) : (
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-theme-border bg-theme-bg-secondary p-4 font-mono text-sm leading-relaxed text-theme-text-tertiary">
                {draft.prompt || "Sin prompt."}
              </pre>
            )}
          </FieldBlock>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FieldBlockProps {
  label: string
  field: EditableField
  editing: boolean
  saving: boolean
  onEdit: (field: EditableField) => void
  onCancel: (field: EditableField) => void
  onSave: (field: EditableField) => void
  children: React.ReactNode
}

function FieldBlock({
  label,
  field,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  children,
}: FieldBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-theme-accent">
          {label}
        </Label>
        {!editing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(field)}
            className="h-8 gap-1.5 text-theme-text-secondary hover:bg-theme-accent-soft hover:text-theme-accent"
          >
            <Pencil className="size-3.5" />
            Modificar
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => onSave(field)}
              disabled={saving}
              className="h-8 gap-1.5 bg-gradient-to-r from-theme-accent to-theme-accent-2 text-theme-accent-foreground hover:opacity-90"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel(field)}
              disabled={saving}
              className="h-8 gap-1.5 border-theme-border text-theme-text-secondary hover:bg-theme-bg-tertiary"
            >
              <X className="size-3.5" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
