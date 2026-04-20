"use client"

import { useState } from "react"
import { Info, Briefcase, Building, X, Plus, Save } from "lucide-react"
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

interface ProfileSectionProps {
  aboutMe: AboutMeData
  skills: SkillsData
  workInfo: WorkInfoData
  departmentOptions: DepartmentOption[]
  roleOptions: RoleOption[]
  onSaveAboutMe: (data: AboutMeData) => void
  onCancelAboutMe: () => void
  onSaveSkills: (data: SkillsData) => void
  onCancelSkills: () => void
  onAddSkill: () => void
  onRemoveSkill: (id: string) => void
  onUpdateSkill: (id: string, name: string) => void
  onSaveWorkInfo: (data: WorkInfoData) => void
  onCancelWorkInfo: () => void
  onDepartmentChange: (value: string) => void
  onRoleChange: (value: string) => void
}

export function ProfileSection({
  aboutMe,
  skills,
  workInfo,
  departmentOptions,
  roleOptions,
  onSaveAboutMe,
  onCancelAboutMe,
  onSaveSkills,
  onCancelSkills,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkill,
  onSaveWorkInfo,
  onCancelWorkInfo,
  onDepartmentChange,
  onRoleChange,
}: ProfileSectionProps) {
  const [localDescription, setLocalDescription] = useState(aboutMe.description)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Container para las 3 tarjetas pegadas */}
      <div className="flex flex-col">
        {/* Acerca de mi - Primera tarjeta */}
        <div className="bg-card rounded-t-xl border border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Info className="size-4 text-[#844484]" />
            <h3 className="font-semibold text-card-foreground">Acerca de mi</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Cuéntanos sobre ti
          </p>

          <Textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            placeholder="Escribe algo sobre ti..."
            className="min-h-[100px] resize-y mb-4"
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSaveAboutMe({ description: localDescription })}
              className="bg-[#844484] hover:bg-[#8C37F7] text-white transition-colors"
            >
              <Save className="size-4 mr-1" />
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setLocalDescription(aboutMe.description)
                onCancelAboutMe()
              }}
              className="text-muted-foreground hover:text-card-foreground"
            >
              <X className="size-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>

        {/* Habilidades - Segunda tarjeta (sin bordes redondeados) */}
        <div className="bg-card border-x border-b border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="size-4 text-[#844484]" />
            <h3 className="font-semibold text-card-foreground">Habilidades</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Agrega tus habilidades profesionales
          </p>

          <div className="space-y-3 mb-4">
            {skills.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <Input
                  value={skill.name}
                  onChange={(e) => onUpdateSkill(skill.id, e.target.value)}
                  placeholder="Nombre de la habilidad"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveSkill(skill.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  aria-label="Eliminar habilidad"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <button
            onClick={onAddSkill}
            className="flex items-center gap-2 text-sm text-[#844484] hover:text-[#8C37F7] transition-colors mb-4"
          >
            <span className="flex items-center justify-center size-6 rounded-full border-2 border-dashed border-current">
              <Plus className="size-3" />
            </span>
            Agregar otra habilidad
          </button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSaveSkills(skills)}
              className="bg-[#844484] hover:bg-[#8C37F7] text-white transition-colors"
            >
              <Save className="size-4 mr-1" />
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={onCancelSkills}
              className="text-muted-foreground hover:text-card-foreground"
            >
              <X className="size-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>

        {/* Información Laboral - Tercera tarjeta */}
        <div className="bg-card rounded-b-xl border-x border-b border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building className="size-4 text-[#844484]" />
            <h3 className="font-semibold text-card-foreground">
              Información Laboral
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona tu departamento y rol
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label
                htmlFor="departamento"
                className="text-sm font-medium text-card-foreground"
              >
                Departamento
              </Label>
              <Select
                value={workInfo.departamento}
                onValueChange={onDepartmentChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="rol"
                className="text-sm font-medium text-card-foreground"
              >
                Rol
              </Label>
              <Select value={workInfo.rol} onValueChange={onRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSaveWorkInfo(workInfo)}
              className="bg-[#844484] hover:bg-[#8C37F7] text-white transition-colors"
            >
              <Save className="size-4 mr-1" />
              Guardar
            </Button>
            <Button
              variant="ghost"
              onClick={onCancelWorkInfo}
              className="text-muted-foreground hover:text-card-foreground"
            >
              <X className="size-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
