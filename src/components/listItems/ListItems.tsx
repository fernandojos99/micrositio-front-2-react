import { useState } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui-shadcn/button"
import { Input } from "@/components/ui-shadcn/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-shadcn/dropdown-menu"
import { Checkbox } from "@/components/ui-shadcn/checkbox"

interface ItemData {
  id: number
  text: string
  number1: number
  number2: number
  checked: boolean
}

function NumberDropdown({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"
          type="button"
          className="w-16 justify-between">
            {value}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-16 min-w-0">
          {numbers.map((num) => (
            <DropdownMenuItem
              key={num}
              onClick={(e) => {
                e.stopPropagation() // Evita que el click suba al contenedor padre
                onChange(num)
              }}
              className="justify-center"
            >
              {num}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function ExpandableInput({ value, onChange, placeholder }: {
  value: string
  onChange: (val: string) => void
  placeholder: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const calculateRows = () => {
    if (!value) return 3
    const lines = value.split("\n").length
    const charLines = Math.ceil(value.length / 35)
    return Math.min(Math.max(lines, charLines, 3), 8)
  }

  return (
    <div className="relative flex-1">
      <span className="text-xs text-muted-foreground">Texto</span>
      <div className="relative h-10">
        {!isExpanded ? (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => {
              e.stopPropagation() // Detener propagación si el padre tiene click
              setIsExpanded(true)
            }}
            className="w-full truncate"
          />
        ) : (
          <div className="absolute left-0 top-0 z-50 min-w-[280px] w-full">
            <textarea
              autoFocus
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                e.stopPropagation()
                setIsExpanded(false)
              }}
              rows={calculateRows()}
              className="w-full resize-none rounded-md border-2 border-primary bg-background px-3 py-2 text-sm shadow-xl placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ItemRow({ item, onUpdate, onDelete }: { 
  item: ItemData
  onUpdate: (id: number, updates: Partial<ItemData>) => void
  onDelete: (id: number) => void 
}) {
  return (
    <div
      className={`flex items-end gap-3 rounded-lg border border-border bg-card p-3 ${item.checked ? "opacity-60" : ""}`}
      // Si el row fuera clickeable, podemos agregar un onClick aquí y los botones no interferirán
      onClick={() => console.log("Row clicked", item.id)}
    >
      <div className="flex items-center pb-2">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked, e) => {
            e?.stopPropagation() // Evitar que el click suba
            onUpdate(item.id, { checked: !!checked })
          }}
          className="h-5 w-5"
        />
      </div>
      <ExpandableInput
        value={item.text}
        onChange={(val) => onUpdate(item.id, { text: val })}
        placeholder="Escribe aqui..."
      />
      
      <NumberDropdown
        value={item.number1}
        onChange={(val) => onUpdate(item.id, { number1: val })}
        label="Esfuerzo"
      />
      
      <NumberDropdown
        value={item.number2}
        onChange={(val) => onUpdate(item.id, { number2: val })}
        label="Impacto"
      />
      
      {/* Boton para eliminar */}
      
      <Button
        variant="ghost"
        type="button"
        size="icon"
        onClick={(e) => {
          e.stopPropagation() // Evita que el click suba al row
          onDelete(item.id)
        }}
        className="h-10 w-10 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function ListItems() {
  const [items, setItems] = useState<ItemData[]>([
    { id: 1, text: "", number1: 1, number2: 1, checked: false }
  ])

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1
    setItems([...items, { id: newId, text: "", number1: 1, number2: 1, checked: false }])
  }

  const updateItem = (id: number, updates: Partial<ItemData>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const deleteItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  return (
    <main className="w-full space-y-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className=" font-semibold text-foreground">Accionables</h1>
        
        <div className="space-y-3">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          ))}
        </div>
        
        <Button onClick={addItem}
        type="button"
        style={{ marginBottom: "16px" }}
        variant="outline"
         className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Accionable
        </Button>
      </div>
    </main>
  )
}