import { useState } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui-shadcn/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui-shadcn/dropdown-menu"
import { Button } from "../ui-shadcn2/button"

export interface ItemData {
  id: number
  title: string
  text: string
  number1: number
  number2: number
  checked: boolean
}

type Props = {
  items: ItemData[]
  onItemsChange: (items: ItemData[]) => void
}



// ====================================================
//==========    dropdown de nuemero ===================
// ====================================================

function NumberDropdown({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (val: number) => void
  label: string
}) {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-16 justify-between"
          >
            {value}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-16 min-w-0 z-[9999]">
          {numbers.map((num) => (
            <DropdownMenuItem
              key={num}
              onSelect={() => onChange(num)}
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



// ====================================================
//==========   Expandible Input   = ===================
// ====================================================



function ExpandableInput({
  value,
  onChange,
  placeholder,
}: {
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
              e.stopPropagation()
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



// ====================================================
//==========    Construye la fila   ===================
// ====================================================



function ItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: ItemData
  onUpdate: (id: number, updates: Partial<ItemData>) => void
  onDelete: (id: number) => void
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-border bg-card p-3 ${
        item.checked ? "opacity-60" : ""
      }`}
    >
      <input
        type="text"
        value={item.title}
        onChange={(e) => onUpdate(item.id, { title: e.target.value })}
        placeholder="Titulo..."
        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
      />

      <div className="flex items-end gap-3">
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

        <Button
          variant="ghost"
          type="button"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-10 w-10 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}




// ====================================================
//==========    Genera la lista de accionables ========
// ====================================================




export default function ListItems({ items, onItemsChange }: Props) {


  // Agregar item
  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1

    const newItems = [
      ...items,
      { id: newId, title: "", text: "", number1: 1, number2: 1, checked: false }
    ]

    onItemsChange(newItems)
  }

  // Actualizar item
  const updateItem = (id: number, updates: Partial<ItemData>) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )

    onItemsChange(updatedItems)
  }

  // delete item
  const deleteItem = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id)

    onItemsChange(updatedItems)
  }

  return (
    <main className="w-full space-y-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="font-semibold text-foreground">Accionables</h1>

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

        <Button
          onClick={addItem}
          type="button"
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Accionable
        </Button>
      </div>
    </main>
  )
}