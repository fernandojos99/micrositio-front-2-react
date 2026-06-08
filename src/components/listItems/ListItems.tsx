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
import { Accionable } from "@/pages/Interfaces/accionablesPoints"
import { randomInt } from "crypto"




// Interface de las props que vamos a recibir en el componente ListItems
interface Props {
  items: Accionable[]
  onItemsChange: (items: Accionable[]) => void
}



// ====================================================
//==========    dropdown de numero ===================
// ====================================================


function NumberDropdown({
  value, 
  onChange, // para actualizar el valor seleccionado
  label,
}: {
  value: number
  onChange: (val: number) => void
  label: string
}) {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-1">
      <span className="contenido-xs" style={{ color: 'var(--theme-text-secondary)' }}>{label}</span>

      <DropdownMenu>

        {/* Botton que acciona el Dropdown */}
        <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className="w-16 justify-between"
              style={{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)'
              }}
            >
              {value}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>

        {/* Es el contenido que se despliega */}
        <DropdownMenuContent 
          className="w-16 min-w-0 z-[9999]"
          style={{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)'
          }}
        >
          {/*  Genera un mapa con objetos sencillos(solo numeros por defecto) */}
          {numbers.map((num) => (
            <DropdownMenuItem
              key={num} // cada item debe tener una key unica, en este caso el numero es unico
              onSelect={() => onChange(num)} // cuando se selecciona un numero, se llama a onChange (que viene de las props) 
              className="justify-center"
              style={{
                color: 'var(--theme-text-primary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
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
  // Tambien recibe una función onChange para actualizar el valor del input
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
      <span className="contenido-xs" style={{ color: 'var(--theme-text-secondary)' }}>Texto</span>

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
            style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '::placeholder': {
                color: 'var(--theme-text-tertiary)'
              }
            } as React.CSSProperties}
          />
        ) : (
          <div className="absolute left-0 top-0 z-50 min-w-[280px] w-full">
            <textarea
              autoFocus
              placeholder={placeholder}
              value={value}
              // Cada que cambia el valor del textarea, se llama a onChange (que viene de las props) 
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                e.stopPropagation()
                setIsExpanded(false)
              }}
              rows={calculateRows()}
              className="w-full resize-none rounded-md border-2 shadow-xl px-3 py-2 contenido-sm focus:outline-none"
              style={{
                borderColor: 'var(--theme-border-hover)',
                backgroundColor: 'var(--theme-bg-primary)',
                color: 'var(--theme-text-primary)',
                borderWidth: '2px',
                borderStyle: 'solid'
              }}
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
  item: Accionable
  //solo especifica que vendra una parte de Accionable, no todo el objeto
  onUpdate: (id:string, updates: Partial<Accionable>) => void 
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3`}
      style={{
        borderColor: 'var(--theme-border)',
        backgroundColor: 'var(--theme-bg-secondary)'
      }}
    >

      {/* descomentar si quiero poner un titulo */}
      {/* <input
        type="contenido"
        value={item.title}
        onChange={(e) => onUpdate(item.id_accionable, { title: e.target.value })}
        placeholder="Titulo..."
        className="w-full rounded-md border border-input bg-background px-3 py-1 contenido-sm"
      /> */}

      <div className="flex items-end gap-3">
        <ExpandableInput
          //Para identificar el input 
          value={item.contenido}
          onChange={(val) => onUpdate(item.idF!, { contenido: val })}
          placeholder="Escribe aqui..."
        />

        <NumberDropdown
          value={item.impacto}
          onChange={(val) => onUpdate(item.idF!, { impacto: val })}
          label="Esfuerzo"
        />

        <NumberDropdown
          value={item.esfuerzo}
          onChange={(val) => onUpdate(item.idF!, { esfuerzo: val })}
          label="Impacto"
        />

        <Button
          variant="ghost"
          type="button"
          size="icon"
          onClick={() => onDelete(item.idF!)}
          className="h-10 w-10"
          style={{
            color: 'var(--theme-text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-destructive)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--theme-text-secondary)'
          }}
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

  // ------------------------------------------------------------------
  // === Funciones que se encargaran de modificar el arreglo de items ===
  // ------------------------------------------------------------------


  // Agregar item , todos los nuevos los vamos a crear con 0
// Agregar item con id incremental
// Agregar item
const addItem = () => {

  const newItems = [
    ...items,
    {
      idF: crypto.randomUUID(),
      id_accionable: undefined, // Genera un ID único para el nuevo item
      id_learning_card: 0,
      contenido: "",
      impacto: 1,
      esfuerzo: 1,
      realizado: false
    }
  ]

  onItemsChange(newItems)
}


  const updateItem = (id: string, updates: Partial<Accionable>) => {
    const updatedItems = items.map(item =>
      item.idF === id ? { ...item, ...updates } : item
    )

    onItemsChange(updatedItems)
  }

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.idF !== id)
  
    onItemsChange(updatedItems)
  }

  return (
    <main className="w-full space-y-4 mb-5">
      <div className="w-full max-w-2xl space-y-4">
        <h1 
          className="font-semibold"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          Accionables
        </h1>

        <div className="space-y-3">
          {/* si vemos inicialmente no tiene ningun item */}
          {items.map((item) => (
            // Le pasamos a cada ItemRow las funciones para que puedan 
            // modificar el useState del componente padre (ListItems) 
              <ItemRow
              key={item.idF}
              item={item}
              onUpdate={updateItem}
              onDelete={deleteItem}
            />
          ))}
        </div>



        {/* Agregar accionable boton */}
        <Button
          onClick={addItem}
          type="button"
          variant="outline"
          className="w-full , mb-4"
          style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-bg-tertiary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Accionable
        </Button>
      </div >
    </main>
  )

}