# AGENTS.md — Micrositio Iris Front

> Detalle completo y verificado en `CLAUDE.md` (mismo directorio). Contexto del monorepo en `../CLAUDE.md`.

React 18 + Vite 6 + TypeScript + Tailwind v3 + shadcn/ui. SPA que consume el backend de `../Micrositio-Iris-Backend`.

## Comandos
- `npm run dev` — Vite en :5173
- `npm run build` — `vite build` **sin `tsc`**: los errores de tipo no rompen el build
- `npm run lint` — ESLint (flat config, `eslint.config.js`). Única verificación automatizable
- `npm run preview` — sirve el build
- No hay typecheck script ni tests

## Las tres trampas principales

1. **`ui-shadcn2` es la carpeta shadcn buena.** Conviven tres carpetas distintas: `components/ui-shadcn2/` (shadcn actual, destino del alias `@/components/ui` en `components.json`), `components/ui-shadcn/` (shadcn legado, aún importado por 4 archivos) y `components/ui/` (componentes propios escritos a mano, no shadcn). Verifica cuál quieres antes de importar.
2. **Tailwind es v3 vía PostCSS**, no v4. La cadena es `postcss.config.js` → `tailwind.config.js` → `src/tailwind.css`. `@tailwindcss/vite` está en `package.json` pero `vite.config.ts` no lo carga. No migres a v4 por accidente.
3. **Todo el acceso al backend pasa por `src/services/<recurso>Service.ts`**, que usan la instancia axios única de `src/apiClient.ts` (interceptores de token y de 401). Ningún componente importa axios directamente — mantenlo así.

## Otras cosas que conviene saber
- `API_BASE_URL` está **hardcodeada** en `src/apiClient.ts` (`http://localhost:3001`), sin variable de entorno. La URL de producción está comentada encima
- Token JWT en `localStorage.jwt_token`; un 401 limpia storage y dispara el evento `auth:logout`
- **Las rutas no están protegidas en el router**: cada página comprueba `user.tipo` (`'EDITOR' | 'VISITANTE'`) de `AuthContext`
- Providers anidados en `src/App.tsx`: Theme → UI → Auth → App → Router
- Alias `@/` → `./src/*`, declarado en `vite.config.ts` **y** `tsconfig.json` (mantener sincronizados)
- `/proyecto/:id` y `/proyectos/:id` coexisten apuntando al mismo componente
- `pages/Agentes-old/` sigue en uso (`AgenteDetalle` se importa de ahí)
- `firebase` está en `package.json` pero sin ningún import en `src/`
- Despliegue en Vercel con rewrite SPA (`vercel.json`)
