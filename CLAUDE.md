# CLAUDE.md — Micrositio Iris Front

SPA en React 18 + Vite + TypeScript + Tailwind v3 + shadcn/ui. Consume el backend de `../Micrositio-Iris-Backend`. Todo lo de aquí está verificado contra el código.

## Comandos

```bash
npm run dev       # Vite dev server en :5173
npm run build     # vite build
npm run lint      # ESLint (flat config en eslint.config.js)
npm run preview   # sirve el build
```

**No hay typecheck ni tests.** `npm run build` es `vite build` a secas, sin `tsc` delante: **un error de TypeScript no rompe el build**, solo se ve en el IDE. `npm run lint` es la única verificación automatizable.

## Punto de entrada y providers

`src/main.tsx` importa **dos hojas de estilo** (`./index.css` y `./tailwind.css`) y monta `<App />`.

`src/App.tsx` anida los providers en este orden — respétalo al añadir uno nuevo:

```
ThemeProvider (src/hooks/useTheme)
└── UIProvider (src/contexts/UIContext)
    └── AuthProvider (src/contexts/AuthContext)
        └── AppProvider (src/contexts/AppContext)
            ├── <Toaster />           (ui-shadcn2/toaster)
            └── <Router> → <AppRoutes />
```

`App.tsx` también hace un `pingBackend()` al montar (`services/chatService`) y loguea en consola si el backend responde. Si ves *"Backend no disponible"*, el backend no está levantado o el puerto no coincide.

## La capa de datos: nunca llames a axios directamente

```
Componente → src/services/<recurso>Service.ts → src/apiClient.ts → backend
```

`src/apiClient.ts` es la única instancia de axios del proyecto (ningún archivo fuera de él importa axios — mantenlo así). Contiene:

- `API_BASE_URL` **hardcodeada** en `http://localhost:3001` (línea 5), con la URL de producción de Render comentada encima. **No hay variable de entorno**: cambiar de entorno = editar este archivo.
- Interceptor de request: mete `Authorization: Bearer <token>` leyendo `localStorage.jwt_token`.
- Interceptor de response: ante un **401** borra `jwt_token` y `auth_user` de `localStorage` y dispara `window.dispatchEvent(new CustomEvent('auth:logout'))`, que `AuthContext` escucha para cerrar sesión.
- `fetchStream(path, options)` — helper aparte basado en `fetch` (no axios) para consumir **SSE**; aplica el mismo token y el mismo manejo de 401.

Hay ~30 servicios en `src/services/`, uno por recurso del backend, con funciones sueltas exportadas (`obtenerX`, `crearX`, `actualizarX`, `eliminarX`). Al añadir una llamada al backend, **crea o extiende el servicio del recurso**, no llames al `apiClient` desde el componente.

`services/index-testingCardDocuments.ts` no es un servicio: es un barrel que reexporta el servicio de documentos, el hook `useDocuments` y el `DocumentManager`.

### Tres sitios que se saltan el `apiClient` — tenlos presentes

1. **`services/chatService.ts`** usa `fetch` crudo, no la instancia axios. Importa `API_BASE_URL` de `apiClient` (así que la URL base sí es la misma), pero **queda fuera de los interceptores**: ni inyección automática del token ni manejo global del 401. Es el servicio de sesiones de chat y del stream SSE.
2. **`pages/Transcripts/page.tsx`** no habla con el backend del repo: llama con `fetch` a **dos AWS Lambda Function URLs hardcodeadas** en el propio archivo (`.../process-text` y otra de transcripts). Si algo de transcripts falla, no lo busques en `Micrositio-Iris-Backend`.
3. **`pages/Perfil/components/nuevoHeader/image-uploader.tsx`** exporta `uploadImageFormData` / `uploadImageBase64`, helpers genéricos con `fetch(endpoint, ...)` y sin cabecera de autenticación. Encajan con el endpoint `POST /upload` del backend, que **está comentado** en `src/app.js`.

⚠️ Los servicios reflejan las inconsistencias del backend, no las arreglan. Ejemplo real en `proyectosService.ts`: `obtenerProyectoPorId` hace `POST /proyectos/p` con `{ id_proyecto }` en el body, y `actualizarProyecto` hace `PATCH /proyectos` metiendo el ID en el body. Antes de escribir un servicio nuevo, mira el archivo de rutas del backend.

## Estado global

| Contexto | Qué guarda |
|---|---|
| `contexts/AuthContext.tsx` | Usuario, `login`/`logout`/`updateUser`. Transforma el usuario del backend al del front (`transformBackendUser`). Rol en `tipo: 'EDITOR' \| 'VISITANTE'`; los proyectos accesibles en `proyectosIds` |
| `contexts/AppContext.tsx` | Estado de aplicación compartido |
| `contexts/UIContext.tsx` | Estado de interfaz (modales, paneles) |

Hooks propios en `src/hooks/`: `useTheme` (además exporta el `ThemeProvider`), `use-toast`, `useDocuments`, `useEmpleados`, `useNodePositions`, `useProyectoNavigation`.

`swr` está instalado pero se usa en **un solo archivo** (`pages/Agentes/components/agentes-grid.tsx`). El patrón dominante sigue siendo `useEffect` + servicio.

## Componentes: tres carpetas, tres cosas distintas

| Carpeta | Qué es | Regla |
|---|---|---|
| `src/components/ui-shadcn2/` | **shadcn/ui actual** (16 componentes). Es el destino del alias `@/components/ui` según `components.json` | ✅ Aquí van los componentes shadcn nuevos |
| `src/components/ui-shadcn/` | shadcn viejo (6 componentes), aún importado por 4 archivos | ⚠️ Legado, no añadir nada |
| `src/components/ui/` | Componentes **propios** del proyecto, no shadcn (`Modal`, `ConfirmationModal`, `Dropdown`, `ActionDropdown`, `Button`, `Busqueda`) | Aquí van los componentes genéricos escritos a mano |

Ojo con el desfase: `components.json` mapea el alias `ui` a `@/components/ui-shadcn2`, pero en el código **existe** un `@/components/ui` real que es otra cosa. Al ejecutar `npx shadcn add`, el componente cae en `ui-shadcn2`; al escribir un import a mano, verifica cuál de las tres quieres.

El resto de `src/components/` son módulos de dominio: `FlowEditor`, `DocumentManager`, `ExperimentCard`, `ExperimentModal`, `SaveDocumentationModal`, `UsersProjects`, `Filters`, `PieChart`, `cards`, `listItems`, `auth`, `layout`, `ErrorBoundary`.

## Estilos

Tailwind **v3 por PostCSS**, no v4:

```
postcss.config.js → tailwind.config.js → src/tailwind.css (variables CSS de shadcn)
```

`@tailwindcss/vite` (el plugin de Tailwind v4) está en `package.json` pero **`vite.config.ts` solo carga `@vitejs/plugin-react`** — no se usa. No migres a v4 por accidente al ver esa dependencia.

Estilo shadcn: `new-york`, base color `neutral`, CSS variables activadas, iconos `lucide-react`. Utilidad `cn()` en `src/lib/utils.ts` (`clsx` + `tailwind-merge`). Variantes con `class-variance-authority`.

## Rutas

`src/routes/AppRoutes.tsx`. Todo cuelga de `<MainLayout />` (`src/layouts/MainLayout/`):

```
/                             HomePage
/proyectos                    Proyectos
/proyectos/:proyectoId        ProyectoDetalle
/perfil  /equipo  /buscar  /formatos  /assistant  /libro-digital  /administracion
/agentes                      Agentes          (pages/Agentes/)
/agentes/:agenteId            AgenteDetalle    (pages/Agentes-old/)
/proyecto/grafica/:idProyecto GraphImprovedTotal
/transcripts                  TranscriptProcessor
/chatAgente                   Chat
/*                            → redirige a /
```

Deep links a `ProyectoDetalle`, que sincroniza su estado con la URL:

```
/proyecto/:proyectoId
/proyecto/:proyectoId/secuencia/:secuenciaId
/proyecto/:proyectoId/secuencia/:secuenciaId/testing-card/:testingCardId
/proyecto/:proyectoId/secuencia/:secuenciaId/learning-card/:learningCardId
```

⚠️ `/proyectos/:proyectoId` y `/proyecto/:proyectoId` (singular y plural) **coexisten** apuntando al mismo componente — el archivo las llama *"rutas alternativas que ya tenías"*. Al enlazar, usa la plural, que es la del menú.

**Las rutas no están protegidas en el router**: no hay wrapper de autenticación por ruta, y `MainLayout` tampoco comprueba la sesión. La autorización se resuelve **dentro de cada página** leyendo `user.tipo` de `AuthContext` — p. ej. `pages/Administracion/Administracion.tsx` corta con `if (!user || user.tipo !== 'EDITOR')` — y en el backend con el middleware `soloEditores`. El login se presenta como modal (`components/auth/LoginModal.tsx`, `RegisterModal.tsx`), no como ruta.

## Convenciones de páginas

`src/pages/<Nombre>/<Nombre>.tsx`, con sus `components/` propios anidados dentro de la carpeta de la página. Excepciones vivas:

- `pages/HomePage.tsx` y `pages/Assistant.tsx` están sueltos, sin carpeta (y `HomePage` usa CSS Modules, `HomePage.module.css` — es el único).
- `pages/Agentes-old/` **sigue en uso**: `AgenteDetalle` se importa de ahí aunque `Agentes` venga de `pages/Agentes/`. No borres la carpeta sin migrar el detalle.
- `pages/ChatAgente/chat.tsx` y `pages/Transcripts/page.tsx` usan nombres de archivo en minúscula.

## Alias

`@/` → `./src/*`, declarado en **dos sitios que hay que mantener sincronizados**: `vite.config.ts` (`resolve.alias`) y `tsconfig.json` (`paths`). Si solo tocas uno, Vite compila y el IDE marca error, o al revés.

En el código conviven imports con alias (`@/pages/...`) y relativos (`../pages/...`), a veces en el mismo archivo.

## Despliegue

- **Vercel**, con `vercel.json` reescribiendo todas las rutas a `/index.html` (necesario para el router del lado cliente).
- `index.html` carga Google Analytics (`G-FGHRMXS7TY`) y Microsoft Clarity (`w1ex3ex3i3`).
- El backend en producción es el de Render, cuya URL está **comentada** en `apiClient.ts`: un despliegue hoy saldría apuntando a `localhost:3001`. Revísalo antes de publicar.

## Ruido en el repositorio — no lo tomes como ejemplo

- `Untitled-1.jsonc` y `debug-guardar-boton.js` en la raíz: restos de depuración.
- Imágenes sueltas en la raíz de `src/` (`logoIRIS.png`, `COPILOT.jpg`, `iconCopilot.png`, `icons8-chatgpt-50.png`…) en vez de en `public/` o `src/assets/`.
- `openapi.agentes.json` en la raíz, desincronizado del backend.
- `firebase` está en `package.json` pero **no tiene ni un import en `src/`**. No asumas que hay Firebase.

## Estado del repositorio

Repo git propio (independiente del backend), rama `dev3`, con `src/apiClient.ts` modificado sin commitear (es el cambio de URL a `localhost:3001`).
