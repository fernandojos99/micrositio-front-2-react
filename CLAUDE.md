# CLAUDE.md — Micrositio Iris Front

SPA en React 18 + Vite + TypeScript + Tailwind v3 + shadcn/ui. Consume el backend de `../Micrositio-Iris-Backend`. Todo lo de aquí está verificado contra el código.

Para el modelo de negocio (secuencias, testing/learning cards, métricas, plantillas, `FlowEditor`) y las discrepancias de estados entre front y BD: **`../DOMINIO.md`**.

## Comandos

```bash
npm run dev       # Vite dev server en :5173
npm run build     # vite build
npm run typecheck # tsc --noEmit -p tsconfig.app.json
npm run lint      # ESLint (flat config en eslint.config.js)
npm run preview   # sirve el build
```

**No hay tests.** `npm run build` sigue siendo `vite build` a secas: **un error de TypeScript no rompe el build**. Para verlos hay que ejecutar `npm run typecheck` — y hay que usar ese script, no `tsc --noEmit` a secas, porque el `tsconfig.json` raíz tiene `"files": []` y devuelve 0 errores sin compilar nada.

`.github/workflows/ci.yml` ejecuta typecheck, lint y build en cada push. Los dos primeros funcionan como **trinquete**: fallan solo si el número de errores sube por encima del límite fijado en el propio workflow (hoy 19 de TypeScript y 173 de ESLint). Al arreglar errores, baja también el límite.

## Punto de entrada y providers

`src/main.tsx` importa **dos hojas de estilo** (`./index.css` y `./tailwind.css`) y monta `<App />`.

`src/App.tsx` anida los providers en este orden — respétalo al añadir uno nuevo:

```
ThemeProvider (src/hooks/useTheme)
└── UIProvider (src/contexts/UIContext)
    └── AuthProvider (src/contexts/AuthContext)
        └── AppProvider (src/contexts/AppContext)
            ├── <Toaster />           (ui-shadcn/toaster)
            └── <Router> → <AppRoutes />
```

`App.tsx` también hace un `pingBackend()` al montar (`services/chatService`) y loguea en consola si el backend responde. Si ves *"Backend no disponible"*, el backend no está levantado o el puerto no coincide.

## La capa de datos: nunca llames a axios directamente

```
Componente → src/services/<recurso>Service.ts → src/apiClient.ts → backend
```

`src/apiClient.ts` es la única instancia de axios del proyecto (ningún archivo fuera de él importa axios — mantenlo así). Contiene:

- `API_BASE_URL` **hardcodeada**, sin variable de entorno: cambiar de entorno = editar este archivo. En el commit apunta a Render; en el árbol de trabajo suele estar cambiada a `http://localhost:3001` con la de Render comentada. Mira `git diff src/apiClient.ts` antes de sacar conclusiones.
- Interceptor de request: mete `Authorization: Bearer <token>` leyendo `localStorage.jwt_token`.
- Interceptor de response: ante un **401** borra `jwt_token` y `auth_user` de `localStorage` y dispara `window.dispatchEvent(new CustomEvent('auth:logout'))`, que `AuthContext` escucha para cerrar sesión.
- `fetchStream(path, options)` — helper aparte basado en `fetch` (no axios) para consumir **SSE**; aplica el mismo token y el mismo manejo de 401.

Hay ~30 servicios en `src/services/`, uno por recurso del backend, con funciones sueltas exportadas (`obtenerX`, `crearX`, `actualizarX`, `eliminarX`). Al añadir una llamada al backend, **crea o extiende el servicio del recurso**, no llames al `apiClient` desde el componente.

### Tres sitios que se saltan el `apiClient` — tenlos presentes

1. **`services/chatService.ts`** usa `fetch` crudo, no la instancia axios. Importa `API_BASE_URL` de `apiClient` (así que la URL base sí es la misma), pero **queda fuera de los interceptores**: ni inyección automática del token ni manejo global del 401. Es el servicio de sesiones de chat y del stream SSE.
2. **`pages/Transcripts/page.tsx`** no habla con el backend del repo: llama con `fetch` a **dos AWS Lambda Function URLs hardcodeadas** en el propio archivo (`.../process-text` y otra de transcripts). Si algo de transcripts falla, no lo busques en `Micrositio-Iris-Backend`.
3. **`pages/Perfil/components/nuevoHeader/image-uploader.tsx`** exporta `uploadImageFormData` / `uploadImageBase64`, helpers genéricos con `fetch(endpoint, ...)` y sin cabecera de autenticación. Encajan con el endpoint `POST /upload` del backend, que **está comentado** en `src/app.js`.

Los cinco recursos principales (proyectos, secuencias, testing cards, learning cards y empleados) ya usan **rutas REST con el ID en el path**. El backend mantiene además las rutas antiguas, que llevaban el ID en el body — incluido un `GET` con body —, para no romper a clientes sin migrar; no las uses en código nuevo. El resto de recursos sigue sin normalizar: **antes de escribir un servicio nuevo, mira el archivo de rutas del backend**.

## Estado global

| Contexto | Qué guarda |
|---|---|
| `contexts/AuthContext.tsx` | Usuario, `login`/`logout`/`updateUser`. Transforma el usuario del backend al del front (`transformBackendUser`). Rol en `tipo: 'EDITOR' \| 'VISITANTE'`; los proyectos accesibles en `proyectosIds` |
| `contexts/AppContext.tsx` | Estado de aplicación compartido |
| `contexts/UIContext.tsx` | Estado de interfaz (modales, paneles) |

Hooks propios en `src/hooks/`: `useTheme` (además exporta el `ThemeProvider`), `use-toast`, `useEmpleados`, `useNodePositions`, `useProyectoNavigation`.

`swr` está instalado pero se usa en **un solo archivo** (`pages/Agentes/components/agentes-grid.tsx`). El patrón dominante sigue siendo `useEffect` + servicio.

## Componentes: dos carpetas, dos cosas distintas

| Carpeta | Qué es | Regla |
|---|---|---|
| `src/components/ui-shadcn/` | **shadcn/ui** (17 componentes). Destino del alias `@/components/ui` de `components.json`, o sea donde escribe `npx shadcn add` | ✅ Aquí van los componentes shadcn |
| `src/components/ui-propios/` | Componentes **propios** del proyecto, no shadcn (`Modal`, `ConfirmationModal`, `Dropdown`, `ActionDropdown`, `Button`, `Busqueda`) | Aquí van los componentes genéricos escritos a mano |

Antes había **tres**: una `ui/` que no era shadcn pese al nombre (hoy `ui-propios/`), y dos carpetas shadcn duplicadas, `ui-shadcn/` y `ui-shadcn2/`. Ya están fusionadas en `ui-shadcn/`.

⚠️ **Cuidado al ejecutar `npx shadcn add`.** El CLI actual genera para Tailwind **v4** y este proyecto es **v3**. Así nació la duplicación, y dejó un defecto real: los componentes de la generación nueva traían `shadow-xs`, una clase que **no existe en la escala de v3** (`sm, DEFAULT, md, lg, xl, 2xl, inner, none`) y que por tanto no pintaba nada. Tras añadir un componente, compáralo con sus hermanos ya instalados y revisa que no traiga clases de v4.

La carpeta es mayoritariamente de la generación con `forwardRef` + `displayName`, que es la compatible con v3. La excepción es `dropdown-menu.tsx`, que es de la generación nueva (`data-slot`): se conservó tal cual al fusionar porque funciona y no trae ninguna clase rota, y reescribirlo era riesgo sin beneficio.

Pendiente de decidir: `ui-propios/` tiene además un `Dropdown` y un `ActionDropdown` escritos a mano que se solapan con el `dropdown-menu` de shadcn.

El resto de `src/components/` son módulos de dominio: `FlowEditor`, `ExperimentCard`, `ExperimentModal`, `SaveDocumentationModal`, `UsersProjects`, `Filters`, `PieChart`, `cards`, `listItems`, `auth`, `layout`, `ErrorBoundary`.

## Estilos

Tailwind **v3 por PostCSS**, no v4:

```
postcss.config.js → tailwind.config.js → src/tailwind.css (variables CSS de shadcn)
```

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
- El backend en producción es el de Render y **es lo que hay commiteado** en `apiClient.ts`, así que un despliegue desde HEAD sale bien. Lo que rompe un deploy es publicar con el cambio local a `localhost:3001` sin revertir: compruébalo antes.

## Ruido en el repositorio — no lo tomes como ejemplo

- Imágenes sueltas en la raíz de `src/` (`logoIRIS.png`, `COPILOT.jpg`, `iconCopilot.png`, `icons8-chatgpt-50.png`…) en vez de en `public/` o `src/assets/`.

## Declaraciones sin usar que apuntan a funcionalidad desconectada

`npm run typecheck` reporta 19 errores, todos `TS6133` (declarado y nunca usado). Varios no son basura, son síntomas: `handleAddSkill`, `handleRemoveSkill` y `handleUpdateSkill` en `pages/Perfil/Perfil.tsx`, y `addVariable`, `removeVariable` y `updateVariable` en `pages/Transcripts/page.tsx`, existen pero **no los llama nadie**. Antes de borrarlos, comprueba si la UI correspondiente debería estar conectada.

## Estado del repositorio

Repo git propio (independiente del backend), rama `dev3`. `src/apiClient.ts` apunta a Render en el commit; el cambio a `localhost:3001` es local y no está commiteado.
