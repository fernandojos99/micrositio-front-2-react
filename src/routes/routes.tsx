// Configuración de rutas para la aplicación
// Agrega las siguientes rutas para soportar URLs dinámicas del proyecto:

/* 
Rutas a agregar en tu router:

<Route path="/proyecto/:proyectoId" element={<ProyectoDetalle />} />
<Route path="/proyecto/:proyectoId/secuencia/:secuenciaId" element={<ProyectoDetalle />} />
<Route path="/proyecto/:proyectoId/secuencia/:secuenciaId/testing-card/:testingCardId" element={<ProyectoDetalle />} />
<Route path="/proyecto/:proyectoId/secuencia/:secuenciaId/learning-card/:learningCardId" element={<ProyectoDetalle />} />

Estas rutas permitirán:
- Navegar directamente a un proyecto específico
- Navegar a una secuencia específica dentro de un proyecto
- Navegar a una testing card específica
- Navegar a una learning card específica

El componente ProyectoDetalle maneja automáticamente la sincronización con la URL.
*/