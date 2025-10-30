# Sistema de Plantillas para Testing Cards

## 📋 Descripción General

El sistema de plantillas permite a los usuarios crear, gestionar y aplicar plantillas reutilizables de Testing Cards en el FlowEditor. Proporciona una solución completa para estandarizar experimentos y acelerar la creación de flujos de trabajo.

## 🏗️ Arquitectura de Componentes

### Estructura de Archivos
```
src/components/FlowEditor/components/Plantillas/
├── types.ts                     # Tipos TypeScript del sistema
├── index.ts                     # Exportaciones centralizadas
├── TemplateViewerModal.tsx      # Modal principal de visualización
├── TemplateViewerModal.css      # Estilos completos del sistema
├── TemplateFlowViewer.tsx       # FlowEditor especializado para plantillas
├── TemplateTestingCardNode.tsx  # Nodo simplificado para vista previa
└── README-Plantillas.md         # Esta documentación
```

## 🎯 Componentes Principales

### 1. TemplateViewerModal
**Propósito:** Modal principal que contiene todo el sistema de visualización de plantillas.

**Características:**
- Vista previa completa de la plantilla
- Panel de información lateral con detalles
- Controles para usar o duplicar plantillas
- Estados de carga y manejo de errores
- Diseño responsive

**Props principales:**
```tsx
interface TemplateViewerModalProps {
  isOpen: boolean;                          // Control de visibilidad
  onClose: () => void;                      // Función de cierre
  plantillaId: number;                      // ID de la plantilla
  plantillaNombre: string;                  // Nombre para el título
  onUseTemplate?: (id: number) => void;     // Callback para usar plantilla
  onDuplicateTemplate?: (id: number) => void; // Callback para duplicar
}
```

**Ejemplo de uso:**
```tsx
<TemplateViewerModal
  isOpen={showTemplateModal}
  onClose={() => setShowTemplateModal(false)}
  plantillaId={selectedTemplateId}
  plantillaNombre="Plantilla de Marketing"
  onUseTemplate={handleUseTemplate}
  onDuplicateTemplate={handleDuplicateTemplate}
/>
```

### 2. TemplateFlowViewer
**Propósito:** FlowEditor simplificado para mostrar plantillas en modo de solo lectura.

**Características:**
- Carga automática de Testing Cards de la plantilla
- ReactFlow configurado para solo lectura
- Posicionamiento automático de nodos
- Conexiones visuales entre nodos padre-hijo
- Estados de carga y error

**Props principales:**
```tsx
interface TemplateFlowViewerProps {
  plantillaId: number;                      // ID de la plantilla
  height?: string | number;                 // Altura del contenedor
  width?: string | number;                  // Anchura del contenedor
  showControls?: boolean;                   // Mostrar controles de zoom
  onDataLoaded?: (data: TemplateTestingCardData[]) => void;
  onError?: (error: Error) => void;
}
```

**Configuración especial:**
- `nodesDraggable={false}` - No permite arrastrar nodos
- `nodesConnectable={false}` - No permite conectar nodos
- `elementsSelectable={false}` - No permite seleccionar elementos

### 3. TemplateTestingCardNode
**Propósito:** Versión simplificada de TestingCardNode para vista previa de plantillas.

**Características:**
- Sin botones de acción (editar, eliminar, agregar)
- Información condensada y clara
- Indicadores visuales de plantilla
- Tres modos de visualización: preview, compact, detailed
- Soporte para diferentes estados y categorías

**Props principales:**
```tsx
interface TemplateTestingCardNodeProps {
  data: TemplateTestingCardData;            // Datos de la Testing Card
  selected?: boolean;                       // Estado de selección visual
  viewMode?: 'preview' | 'compact' | 'detailed'; // Modo de visualización
  onClick?: (nodeId: string) => void;       // Callback de clic opcional
}
```

## 📊 Tipos de Datos

### TemplateTestingCardData
Extiende `TestingCardData` pero elimina los callbacks de acción:

```tsx
interface TemplateTestingCardData extends Omit<TestingCardData, 'onEdit' | 'onDelete' | 'onAddTesting' | 'onAddLearning' | 'onStatusChange'> {
  id_plantilla?: number;
  nombre_plantilla?: string;
  descripcion_plantilla?: string;
  categoria?: string;
  es_publica?: boolean;
  creado_por?: number;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  usos_count?: number;
}
```

### TemplateServiceResponse
Estructura de respuesta del servicio de plantillas:

```tsx
interface TemplateServiceResponse {
  plantilla: {
    id_plantilla: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    es_publica: boolean;
    creado_por: number;
    fecha_creacion: string;
    fecha_modificacion: string;
    usos_count: number;
  };
  testing_cards: TemplateTestingCardData[];
  metadata?: {
    total_cards: number;
    has_learning_cards: boolean;
    complexity_level: 'simple' | 'medium' | 'complex';
  };
}
```

## 🎨 Sistema de Estilos

### Variables CSS Personalizadas
```css
:root {
  --template-primary: #8B5CF6;
  --template-primary-light: #A78BFA;
  --template-primary-dark: #7C3AED;
  --template-secondary: #F3F4F6;
  --template-accent: #10B981;
  /* ... más variables */
}
```

### Clases CSS Principales
- `.template-modal-backdrop` - Fondo del modal
- `.template-modal-container` - Contenedor principal
- `.template-testing-card` - Nodo de Testing Card
- `.template-testing-card--preview` - Modo vista previa
- `.template-testing-card--compact` - Modo compacto
- `.template-testing-card--detailed` - Modo detallado

### Responsive Design
- **Desktop:** Diseño completo con panel lateral
- **Tablet:** Panel lateral más estrecho
- **Móvil:** Panel lateral colapsado, diseño vertical
- **Móvil pequeño:** Modal de pantalla completa

## 🔧 Integración con FlowEditor

### Paso 1: Importar componentes
```tsx
import { TemplateViewerModal } from './components/Plantillas';
```

### Paso 2: Agregar estados
```tsx
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
```

### Paso 3: Integrar en el render
```tsx
{showTemplateModal && selectedTemplateId && (
  <TemplateViewerModal
    isOpen={showTemplateModal}
    onClose={() => setShowTemplateModal(false)}
    plantillaId={selectedTemplateId}
    plantillaNombre="Nombre de la plantilla"
    onUseTemplate={handleUseTemplate}
  />
)}
```

### Paso 4: Conectar con TemplateDropdown
En el `TemplateDropdown`, las funciones de callback pueden abrir el modal:

```tsx
const handleApplyTemplate = () => {
  // Mostrar selector de plantillas o abrir directamente
  setSelectedTemplateId(1); // ID de plantilla
  setShowTemplateModal(true);
};
```

## 🚀 Funcionalidades

### ✅ Implementadas
- Modal de visualización de plantillas
- FlowEditor de solo lectura para plantillas
- Nodos simplificados para vista previa
- Sistema completo de estilos CSS
- Manejo de estados de carga y error
- Diseño responsive
- Tipos TypeScript completos

### 🔄 En desarrollo
- Servicios de backend para plantillas
- Lógica real de aplicar plantillas
- Lógica real de guardar como plantilla
- Gestión de categorías de plantillas
- Sistema de búsqueda y filtros

### 📋 Por implementar
- Selector de plantillas disponibles
- Editor de plantillas
- Gestión de permisos (público/privado)
- Versionado de plantillas
- Estadísticas de uso
- Importar/exportar plantillas

## 🎯 Casos de Uso

### Caso 1: Ver vista previa de plantilla
```tsx
// Usuario hace clic en "Aplicar plantilla" en TemplateDropdown
<TemplateViewerModal
  isOpen={true}
  plantillaId={123}
  plantillaNombre="Plantilla de Marketing Digital"
  onUseTemplate={(id) => aplicarPlantilla(id)}
/>
```

### Caso 2: Comparar plantillas
```tsx
// Mostrar múltiples plantillas para comparación
{plantillasSeleccionadas.map(plantilla => (
  <TemplateFlowViewer
    key={plantilla.id}
    plantillaId={plantilla.id}
    height="300px"
    showControls={false}
  />
))}
```

### Caso 3: Vista previa embebida
```tsx
// Mostrar vista previa pequeña en una lista
<TemplateFlowViewer
  plantillaId={plantilla.id}
  height="200px"
  width="300px"
  showControls={false}
/>
```

## 🛠️ Personalización

### Modificar estilos
Los estilos están centralizados en `TemplateViewerModal.css`. Para personalizar:

1. Modificar variables CSS en `:root`
2. Sobrescribir clases específicas
3. Agregar nuevos modos de visualización

### Agregar nuevos modos de vista
```tsx
// En types.ts
export const TEMPLATE_CONSTANTS = {
  VIEW_MODES: {
    PREVIEW: 'preview',
    COMPACT: 'compact',
    DETAILED: 'detailed',
    CUSTOM: 'custom' // Nuevo modo
  }
} as const;
```

### Extender funcionalidades
```tsx
// Agregar nuevas props a TemplateViewerModal
interface ExtendedTemplateViewerModalProps extends TemplateViewerModalProps {
  allowEditing?: boolean;
  showComments?: boolean;
  customActions?: TemplateAction[];
}
```

## 🔍 Debugging

### Habilitar logs de desarrollo
```tsx
// En TemplateFlowViewer.tsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Cargando plantilla:', plantillaId);
  console.log('Datos cargados:', templateData);
}
```

### Verificar estados
```tsx
// En TemplateViewerModal.tsx
useEffect(() => {
  console.log('Estado del modal:', { isOpen, plantillaId, loadingState });
}, [isOpen, plantillaId, loadingState]);
```

## 📝 Notas de Desarrollo

### Limitaciones actuales
- Los datos de plantillas son mock (no hay backend real)
- No hay validación de permisos
- No hay persistencia de preferencias de usuario

### Mejores prácticas
- Siempre manejar estados de carga y error
- Usar tipos TypeScript estrictos
- Mantener componentes pequeños y enfocados
- Seguir patrones de diseño establecidos

### Performance
- Los componentes están optimizados para re-renders mínimos
- ReactFlow está configurado para modo de solo lectura
- Las animaciones usan CSS transforms para mejor performance

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Definir tipos en `types.ts`
2. Implementar componente con documentación JSDoc
3. Agregar estilos en `TemplateViewerModal.css`
4. Actualizar exportaciones en `index.ts`
5. Actualizar esta documentación

## 📞 Soporte

Para preguntas o problemas:
- Revisar esta documentación
- Verificar tipos TypeScript
- Consultar ejemplos de uso
- Revisar console logs en modo desarrollo

---

**Versión:** 1.0.0  
**Última actualización:** 28 de octubre, 2025  
**Autor:** Micrositio Iris Team
