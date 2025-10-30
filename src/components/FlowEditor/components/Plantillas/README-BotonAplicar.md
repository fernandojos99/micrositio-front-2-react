# Botón "Aplicar" en Testing Cards de Plantillas

## 📋 Descripción

Se ha agregado un botón "Aplicar" a cada Testing Card individual en el sistema de plantillas, permitiendo a los usuarios aplicar Testing Cards específicas en lugar de toda la plantilla completa.

## 🆕 Nuevas Funcionalidades

### Botón "Aplicar" en Testing Cards
- ✅ Cada Testing Card en la vista previa tiene su propio botón "Aplicar"
- 📱 Diseño responsive con ajustes para móvil
- 🎨 Estilos consistentes con el sistema de diseño
- ⚡ Callbacks individuales para cada Testing Card

### Props Nuevas Agregadas

#### TemplateTestingCardNodeProps
```tsx
interface TemplateTestingCardNodeProps {
  // ... props existentes
  
  /** Función callback para aplicar esta Testing Card específica */
  onApplyTemplate?: (testingCardData: TemplateTestingCardData) => void;
  
  /** Indica si debe mostrar el botón "Aplicar" */
  showApplyButton?: boolean;
}
```

#### TemplateFlowViewerProps
```tsx
interface TemplateFlowViewerProps {
  // ... props existentes
  
  /** Función callback para aplicar una Testing Card específica */
  onApplyTestingCard?: (testingCardData: TemplateTestingCardData) => void;
  
  /** Indica si debe mostrar botones "Aplicar" en los nodos */
  showApplyButtons?: boolean;
}
```

## 🎯 Uso

### Ejemplo básico
```tsx
<TemplateViewerModal
  isOpen={showTemplateModal}
  onClose={() => setShowTemplateModal(false)}
  plantillaId={selectedTemplateId}
  plantillaNombre="Mi Plantilla"
  onUseTemplate={handleUseTemplate}
/>
```

### Ejemplo con callback personalizado para Testing Cards individuales
```tsx
const handleApplyIndividualCard = (cardData: TemplateTestingCardData) => {
  console.log('Aplicando Testing Card individual:', cardData);
  // Crear nueva Testing Card basada en la plantilla
  createTestingCardFromTemplate(cardData);
};

<TemplateFlowViewer
  plantillaId={123}
  onApplyTestingCard={handleApplyIndividualCard}
  showApplyButtons={true}
/>
```

### Deshabilitar botones "Aplicar"
```tsx
<TemplateFlowViewer
  plantillaId={123}
  showApplyButtons={false} // Oculta los botones "Aplicar"
/>
```

## 🎨 Estilos del Botón

### Estilos CSS agregados
```css
.template-apply-btn {
  display: flex;
  align-items: center;
  gap: var(--template-spacing-xs);
  padding: var(--template-spacing-xs) var(--template-spacing-sm);
  background: var(--template-primary);
  color: white;
  border: none;
  border-radius: var(--template-border-radius);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--template-transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  justify-content: center;
}
```

### Estados interactivos
- **Hover:** Color más oscuro y elevación sutil
- **Active:** Sin elevación para feedback táctil
- **Focus:** Outline sutil para accesibilidad

## 📱 Responsive Design

### Desktop
- Footer horizontal con botón a la derecha
- Botón con texto completo "Aplicar"

### Móvil
- Footer vertical para mejor espacio
- Botón más compacto
- Elementos centrados para mejor usabilidad

## 🔧 Implementación Técnica

### Flujo de datos
1. Usuario hace clic en botón "Aplicar" en una Testing Card
2. Se ejecuta `handleApplyClick` que previene propagación del evento
3. Se llama `onApplyTemplate` con los datos de la Testing Card específica
4. El callback se propaga hasta `TemplateViewerModal`
5. Se ejecuta la lógica de aplicación (actualmente usa el callback general)

### Prevención de conflictos
```tsx
const handleApplyClick = (e: React.MouseEvent) => {
  // Prevenir que el evento se propague al nodo padre
  e.stopPropagation();
  
  if (onApplyTemplate) {
    onApplyTemplate(data);
  }
};
```

## 🚀 Próximos Pasos

### TODO - Implementaciones pendientes
- [ ] Lógica específica para crear Testing Card individual
- [ ] Validación de datos antes de aplicar
- [ ] Confirmación de aplicación exitosa
- [ ] Manejo de errores específicos
- [ ] Integración con el FlowEditor principal

### Ejemplo de implementación futura
```tsx
const handleApplyTestingCard = async (testingCardData: TemplateTestingCardData) => {
  try {
    // Crear nueva Testing Card basada en la plantilla
    const newTestingCard = await TestingCardService.createFromTemplate({
      templateData: testingCardData,
      secuenciaId: currentSecuenciaId,
      position: getNextAvailablePosition()
    });
    
    // Actualizar el FlowEditor
    addTestingCardToFlow(newTestingCard);
    
    // Mostrar notificación de éxito
    showSuccessNotification(`Testing Card "${testingCardData.titulo}" aplicada exitosamente`);
    
  } catch (error) {
    console.error('Error aplicando Testing Card:', error);
    showErrorNotification('Error al aplicar la Testing Card');
  }
};
```

## 🎯 Beneficios

### Para el usuario
- ✅ **Granularidad:** Aplicar solo las Testing Cards necesarias
- ⚡ **Rapidez:** No necesidad de aplicar toda la plantilla
- 🎯 **Precisión:** Selección específica de elementos
- 📱 **Accesibilidad:** Funciona bien en todos los dispositivos

### Para el desarrollo
- 🧩 **Modularidad:** Componentes reutilizables y desacoplados
- 🔧 **Flexibilidad:** Callbacks configurables según necesidades
- 📊 **Escalabilidad:** Preparado para funcionalidades futuras
- 🎨 **Consistencia:** Estilos coherentes con el sistema de diseño

---

**Fecha de implementación:** 28 de octubre, 2025  
**Versión:** 1.1.0  
**Autor:** Micrositio Iris Team
