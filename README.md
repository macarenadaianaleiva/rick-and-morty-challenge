# Rick & Morty — Episode Explorer

Challenge técnico: **Ssr. Frontend Developer (NextJS)**.

Elegí un personaje en **Character #1** y otro en **Character #2** (listados paginados +
búsqueda por nombre, [Rick and Morty API](https://rickandmortyapi.com/)) y compará sus
episodios en tres columnas: exclusivos de #1, compartidos, exclusivos de #2. La selección
queda en la URL (`?c1=&c2=`) — el resultado es compartible por link.

## Requisitos cubiertos

| Requisito                       | Cómo se cubre                                                  |
| ------------------------------- | -------------------------------------------------------------- |
| TypeScript (2+ años)            | Todo el proyecto en TS estricto, cero `any`                    |
| React + Next.js                 | App Router, Server + Client Components combinados a propósito  |
| Patrones de diseño              | Repository, Custom Hooks, Container/Presentational (ver abajo) |
| Testing (Jest/RTL)              | Unitarios + componente + integración                           |
| Prettier / Lint                 | ESLint 9 + Prettier configurados                               |
| Animaciones                     | Framer Motion                                                  |
| PWA / Figma / demos con cliente | No aplica a este entregable                                    |

**Extras no pedidos:** dark mode, filtro por status, búsqueda por nombre con debounce,
comparación compartible por URL, `next/image`, manejo de errores 4xx/5xx diferenciado.

## Quick start

Requiere **Node.js 20+**.

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Stack

|               |                                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) + React 19                                 |
| Lenguaje      | TypeScript, modo estricto (`strict` + `noUncheckedIndexedAccess`, cero `any`) |
| Estilos       | Tailwind CSS v4 (config CSS-first, sin `tailwind.config.js`)                  |
| Data fetching | TanStack Query v5, con prefetch + hidratación server-side                     |
| Animaciones   | Framer Motion                                                                 |
| Testing       | Jest + React Testing Library                                                  |
| Tooling       | ESLint 9 (flat config), Prettier, pnpm                                        |

## Testing

```bash
pnpm test            # toda la suite
pnpm test:watch
pnpm test:coverage
```

Unitarios (`utils/episodes.ts`, sin mocks) + componente (`CharacterCard`, `EpisodeList`, aislados) +
integración (`HomeClient`: verifica que las 3 columnas están ocultas hasta elegir ambos personajes,
y que `fetchEpisodesByIds` no se llama de más — no solo que la UI lo oculta).

## Otros scripts

```bash
pnpm build          # build de producción
pnpm start           # sirve el build
pnpm lint            # ESLint
pnpm format          # Prettier (aplica)
pnpm format:check    # Prettier (solo verifica)
pnpm typecheck       # tsc --noEmit
```

## Arquitectura

```
UI (componentes)  ──►  hooks (estado + orquestación)  ──►  lib/api.ts (acceso a datos)
       ▲                        │
       └──────── utils/ (reglas de negocio puras, sin React ni fetch) ──┘
```

```
src/
  app/           Server Component (prefetch + hidratación), layout, providers, globals.css
  components/    Home/ (Client Component con la lógica interactiva) + un folder por componente
  hooks/         useCharacters, useEpisodesComparison, useDebouncedValue, useTheme...
  lib/           api.ts (HTTP), query-client.ts, query-keys.ts, constants.ts
  types/         Tipos de dominio (Character, Episode, ...)
  utils/         episodes.ts — lógica pura: partición de episodios
__tests__/       Unitarios + integración
```

**Patrones aplicados** (código de referencia entre paréntesis):

- **Repository** — todo acceso HTTP pasa por `lib/api.ts`, ningún componente hace `fetch` directo.
- **Custom hooks como capa de aplicación** — envuelven TanStack Query y exponen un shape simple (`useCharacters`, `useEpisodesComparison`), no el `useQuery` crudo.
- **Funciones puras para la regla de negocio** (`utils/episodes.ts`) — sin React ni HTTP, 100% testeable de forma aislada.
- **Container/Presentational** — `CharacterPanel` pide datos y decide; `CharacterCard`/`EpisodeList` solo reciben props y renderizan.

## Decisiones clave

- **Cache: server vs. cliente, no una sola herramienta para todo.** La página 1 de personajes se prefetchea en el Server Component (`app/page.tsx`) e hidrata al cliente — sin loading inicial. Todo lo que depende de interacción (paginar, elegir, comparar) va por TanStack Query en el cliente. No se usó Server Actions por click: el estado de selección es puramente de cliente, forzar un round-trip al servidor por cada interacción sería la herramienta equivocada.
- **La regla del challenge ("no mostrar episodios hasta elegir ambos") vive en la query, no en un `if`** — `enabled: Boolean(character1 && character2)` en `useEpisodesComparison`: la petición ni se dispara si falta un personaje.
- **Errores manejados en capas, no solo "algo salió mal"** — un 404 en la lista de personajes (búsqueda sin resultados) es un estado vacío, no un error; un link compartido con un id inexistente muestra error + reintentar (no falla en silencio); un 4xx no se reintenta solo (no va a cambiar), un 5xx/network sí, una vez.
- **Comparación compartible por URL** — se guardan _ids_, no objetos `Character`; `page.tsx` prefetchea esos dos personajes puntuales del lado del servidor, así que abrir un link compartido no muestra loading.
- **`next/image`** para los avatares (optimización real, no solo el componente — `images.remotePatterns` en `next.config.ts`).
