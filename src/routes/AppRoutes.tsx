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

//import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';

// Pages
import HomePage from '../pages/HomePage';
import Proyectos from '../pages/Proyectos/Proyectos';
import ProyectoDetalle from '../pages/ProyectoDetalle/ProyectoDetalle';
import Agentes from '../pages/Agentes/Agentes';
import AgenteDetalle from '../pages/Agentes/AgenteDetalle';
import Formatos from '../pages/Formatos/Formatos';
import Equipo from '../pages/Equipo/Equipo';
import Perfil from '../pages/Perfil/Perfil';
import Assistant from '../pages/Assistant';
import LibroDigital from '../pages/LibroDigital/LibroDigital';
import Administracion from '../pages/Administracion/Administracion';
import Busqueda from '../pages/Busqueda/Busqueda';
import { GraphTotal } from '../pages/ProyectoDetalle/components/graph/GraphTotal';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="proyectos" element={<Proyectos />} />
          <Route path="proyectos/:proyectoId" element={<ProyectoDetalle />} />

          <Route path="perfil" element={<Perfil />} />
          <Route path="equipo" element={<Equipo />} />

          <Route path="agentes" element={<Agentes />} />
          <Route path="agentes/:agenteId" element={<AgenteDetalle />} />

          <Route path="formatos" element={<Formatos />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="libro-digital" element={<LibroDigital />} />
          <Route path="administracion" element={<Administracion />} />
          <Route path="buscar" element={<Busqueda />} />
          <Route path="grafica" element={<GraphTotal />} />


          {/* Rutas alternativas que ya tenías */}
          <Route path="/proyecto/:proyectoId" element={<ProyectoDetalle />} />
          <Route
            path="/proyecto/:proyectoId/secuencia/:secuenciaId"
            element={<ProyectoDetalle />}
          />
          <Route
            path="/proyecto/:proyectoId/secuencia/:secuenciaId/testing-card/:testingCardId"
            element={<ProyectoDetalle />}
          />
          <Route
            path="/proyecto/:proyectoId/secuencia/:secuenciaId/learning-card/:learningCardId"
            element={<ProyectoDetalle />}
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;