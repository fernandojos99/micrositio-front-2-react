import { useState, useEffect, useMemo } from "react"
import { Info, Briefcase, Building, X, Plus, Save, Loader2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui-shadcn2/button"
import { Textarea } from "@/components/ui-shadcn2/textarea"
import { Input } from "@/components/ui-shadcn/input"
import { Label } from "@/components/ui-shadcn2/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui-shadcn2/select"
import type {
  AboutMeData,
  SkillsData,
  WorkInfoData,
  DepartmentOption,
  RoleOption,
} from "./../types/profile"
import { toast } from "@/hooks/use-toast"

// --- Interfaces ---
export interface DateValue {
  month: string
  year: string
}

interface ProfileSectionProps {
  aboutMe: AboutMeData
  skills: SkillsData
  workInfo: WorkInfoData
  departmentOptions: DepartmentOption[]
  roleOptions: RoleOption[]
  onSaveAboutMe: (data: AboutMeData) => Promise<void>
  onSaveSkills: (data: SkillsData) => Promise<void>
  onSaveWorkInfo: (data: WorkInfoData) => Promise<void>
  onSaveExperience: (date: DateValue) => Promise<void>
  startDate: DateValue
}

export function ProfileSection({
  aboutMe,
  skills,
  workInfo,
  departmentOptions,
  roleOptions,
  onSaveAboutMe,
  onSaveSkills,
  onSaveWorkInfo,
  onSaveExperience,
  startDate,
}: ProfileSectionProps) {

  // --- ESTADOS LOCALES ---
  const [localDescription, setLocalDescription] = useState(aboutMe.description)
  const [localSkills, setLocalSkills] = useState(skills)
  const [localWorkInfo, setLocalWorkInfo] = useState(localWorkInfoData())
  const [localStartDate, setLocalStartDate] = useState(startDate)

  function localWorkInfoData() { return workInfo }

  // --- SNAPSHOT INICIAL (Para comparar si hay cambios) ---
  const [initialState, setInitialState] = useState({
    description: aboutMe.description,
    skills: JSON.stringify(skills),
    workInfo: JSON.stringify(workInfo),
    startDate: JSON.stringify(startDate),
  })

  const [isSaving, setIsSaving] = useState(false)

  // --- LÓGICA "DIRTY" (Detecta si hubo cambios) ---
  const isDirty = useMemo(() => {
    return (
      localDescription !== initialState.description ||
      JSON.stringify(localSkills) !== initialState.skills ||
      JSON.stringify(localWorkInfo) !== initialState.workInfo ||
      JSON.stringify(localStartDate) !== initialState.startDate
    )
  }, [localDescription, localSkills, localWorkInfo, localStartDate, initialState])

  // --- PREVENIR CIERRE DE PESTAÑA DEL NAVEGADOR ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  // --- HANDLERS ---
  const handleDiscardChanges = () => {
    setLocalDescription(initialState.description)
    setLocalSkills(JSON.parse(initialState.skills))
    setLocalWorkInfo(JSON.parse(initialState.workInfo))
    setLocalStartDate(JSON.parse(initialState.startDate))
    
    toast({
      title: "Cambios descartados",
      description: "Se han restaurado los valores originales.",
    })
  }

  const handleUpdateSkillLocal = (id: string, name: string) => {
    setLocalSkills((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, name } : s)),
    }))
  }

  const handleRemoveSkillLocal = (id: string) => {
    setLocalSkills((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }))
  }

  const handleAddSkillLocal = () => {
    setLocalSkills((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: crypto.randomUUID(), name: "" }],
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      await Promise.all([
        onSaveAboutMe({ description: localDescription }),
        onSaveSkills(localSkills),
        onSaveWorkInfo(localWorkInfo),
        onSaveExperience(localStartDate)
      ])

      // Actualizar el snapshot para que isDirty vuelva a ser false
      setInitialState({
        description: localDescription,
        skills: JSON.stringify(localSkills),
        workInfo: JSON.stringify(localWorkInfo),
        startDate: JSON.stringify(localStartDate),
      })

      toast({
        title: "¡Éxito!",
        description: "Información actualizada correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-0">
      <div className="flex flex-col">
        
        {/* Acerca de mi */}
        <div className="bg-card rounded-t-xl border border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-[#844484]" />
              <h3 className="font-semibold text-card-foreground">Acerca de mi</h3>
            </div>
            {/* Botón de cerrar simulado para mostrar el Toast de advertencia */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8"
              onClick={() => {
                if(isDirty) {
                  toast({ title: "Cambios pendientes", description: "Guarda o descarta los cambios antes de cerrar.", variant: "destructive" })
                }
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
          <Textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Escribe algo sobre ti..."
            className="min-h-[100px] resize-y mb-4"
            disabled={isSaving}
          />
        </div>

        {/* Habilidades */}
        <div className="bg-card border-x border-b border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="size-4 text-[#844484]" />
            <h3 className="font-semibold text-card-foreground">Habilidades</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Agrega tus habilidades profesionales</p>

          <div className="space-y-3 mb-4">
            {localSkills.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <Input
                  value={skill.name}
                  onChange={(e) => handleUpdateSkillLocal(skill.id, e.target.value)}
                  placeholder="Nombre de la habilidad"
                  className="flex-1"
                  disabled={isSaving}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSkillLocal(skill.id)}
                  disabled={isSaving}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddSkillLocal}
            disabled={isSaving}
            className="flex items-center gap-2 text-sm text-[#844484] hover:text-[#8C37F7] transition-colors mb-4 disabled:opacity-50"
          >
            <span className="flex items-center justify-center size-6 rounded-full border-2 border-dashed border-current">
              <Plus className="size-3" />
            </span>
            Agregar otra habilidad
          </button>
        </div>

        {/* Información Laboral */}
        <div className="bg-card rounded-b-xl border-x border-b border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building className="size-4 text-[#844484]" />
            <h3 className="font-semibold text-card-foreground">Información Laboral</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Configura tu puesto actual</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Departamento</Label>
              <Select
                onValueChange={(v) => setLocalWorkInfo(p => ({ ...p, departamento: v }))}
                value={localWorkInfo.departamento}
                disabled={isSaving}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Rol</Label>
              <Select 
                value={localWorkInfo.rol}
                onValueChange={(v) => setLocalWorkInfo(p => ({ ...p, rol: v }))}
                disabled={isSaving}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <DateRangeSelector 
              startDate={localStartDate}
              onStartDateChange={setLocalStartDate}
              disabled={isSaving}
            />
          </div>

          {/* BOTONES DE ACCIÓN PRINCIPALES */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || !isDirty}
              className="bg-[#844484] hover:bg-[#8C37F7] text-white transition-colors min-w-[140px]"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="size-4 mr-1" /> Guardar cambios</>
              )}
            </Button>

            {/* Solo aparece si hay algo que cancelar */}
            {isDirty && !isSaving && (
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Undo2 className="size-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENTE INTERNO: DateRangeSelector (Igual al tuyo pero saneado) ---
const MONTHS = [
  { value: "01", label: "Enero" }, { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" }, { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" }, { value: "06", label: "Junio" },
  { value: "07", label: "Julio" }, { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
]

function DateRangeSelector({
  startDate,
  onStartDateChange,
  minYear = 2019,
  maxYear = 2035,
  disabled = false,
}: any) {
  const years = useMemo(() => {
    const list: string[] = []
    for (let i = minYear; i <= maxYear; i++) list.push(i.toString())
    return list
  }, [minYear, maxYear])

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Fecha de inicio en la empresa</label>
      <div className="flex gap-3">
        <Select 
          value={startDate?.month} 
          onValueChange={(m) => onStartDateChange?.({ ...startDate, month: m })} 
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Mes" /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select 
          value={startDate?.year} 
          onValueChange={(y) => onStartDateChange?.({ ...startDate, year: y })} 
          disabled={disabled}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Año" /></SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}