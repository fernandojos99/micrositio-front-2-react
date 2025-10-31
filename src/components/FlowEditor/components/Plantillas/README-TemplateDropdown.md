# TemplateDropdown Component

## Descripción
El componente `TemplateDropdown` es un dropdown elegante y reutilizable que proporciona opciones para manejar plantillas en las Testing Cards. Incluye las opciones "Aplicar plantilla" y "Guardar como plantilla".

## Características
- ✨ Diseño moderno y elegante que coincide con el estilo del proyecto
- 🎯 Click fuera para cerrar automáticamente
- ♿ Accesible con soporte para lectores de pantalla
- 📱 Responsive design
- 🎨 Animaciones suaves y transiciones
- 🔧 Estados de hover y activo bien definidos
- 📦 Tamaño compacto disponible

## Uso

### Importación
```tsx
import TemplateDropdown from './components/TemplateDropdown';
```

### Ejemplo básico
```tsx
<TemplateDropdown
  onApplyTemplate={() => console.log('Aplicar plantilla')}
  onSaveTemplate={() => console.log('Guardar como plantilla')}
/>
```

### Ejemplo con clase compacta
```tsx
<TemplateDropdown
  onApplyTemplate={handleApplyTemplate}
  onSaveTemplate={handleSaveTemplate}
  className="compact"
/>
```

### Ejemplo deshabilitado
```tsx
<TemplateDropdown
  onApplyTemplate={handleApplyTemplate}
  onSaveTemplate={handleSaveTemplate}
  disabled={true}
/>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `onApplyTemplate` | `() => void` | ✅ | Función que se ejecuta al hacer click en "Aplicar plantilla" |
| `onSaveTemplate` | `() => void` | ✅ | Función que se ejecuta al hacer click en "Guardar como plantilla" |
| `disabled` | `boolean` | ❌ | Si está deshabilitado el dropdown (default: false) |
| `className` | `string` | ❌ | Clases CSS adicionales (disponible: "compact") |

## Estilos

El componente utiliza las variables CSS del tema del proyecto:
- `--theme-bg-primary`
- `--theme-bg-secondary` 
- `--theme-bg-tertiary`
- `--theme-text-primary`
- `--color-primary-purple`
- `--color-border-light`
- Y más...

### Variante compacta
Agrega la clase `compact` para un tamaño más pequeño, ideal para espacios reducidos como headers de cards.

## Integración en TestingCardNode

El componente está integrado en la cabecera de `TestingCardNode`:

```tsx
<div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div className="experiment-type">
      <ClipboardList size={14} />
      <span>TESTING CARD</span>
    </div>
  </div>
  
  <TemplateDropdown
    onApplyTemplate={handleApplyTemplate}
    onSaveTemplate={handleSaveTemplate}
    className="compact"
  />
</div>
```

## TODO - Implementaciones futuras

- [ ] Implementar la lógica real para aplicar plantillas
- [ ] Implementar la lógica real para guardar como plantilla
- [ ] Agregar estados de loading
- [ ] Integrar con servicios de backend
- [ ] Agregar más opciones al dropdown si es necesario
- [ ] Implementar gestión de plantillas (crear, editar, eliminar)

## Archivos relacionados

- `TemplateDropdown.tsx` - Componente principal
- `TemplateDropdown.css` - Estilos del componente
- `TestingCardNode.tsx` - Integración del componente
- `index.ts` - Exportación del componente
