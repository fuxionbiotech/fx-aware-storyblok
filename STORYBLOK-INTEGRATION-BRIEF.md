# Integración de contenido "Aprende" (Storyblok) — Brief para implementación

## Contexto

El contenido de las pantallas "Aprende" (listado de contenidos + detalle) ya está modelado y cargado en Storyblok. Este documento es la guía para integrarlo en el proyecto web (Next.js): el **back-end** consume la API de Storyblok y expone un JSON propio ya normalizado; el **front-end** consume solo ese JSON propio, sin saber que Storyblok existe.

- Space ID: `293900562500203`
- Región: `eu`
- No se necesita ningún token de Management API en este proyecto — solo el Content Delivery API token (público, solo lectura).

---

## Modelo de contenido en Storyblok (referencia)

- **`content_item`** (story raíz — es también la página de detalle de cada contenido):
  `title`, `format` (`video` | `podcast` | `live` | `article`), `category` (Datasource `categories`), `cover` (asset), `media_url`, `duration`, `author` (relación → story `author`), `published_at`, `is_live` (boolean), `description` (richtext), `transcript` (richtext), `related_content` (relación múltiple → otros `content_item`).
- **`author`**: `name`, `avatar`.
- **`podcast_show`**: `name`, `cover`, `category`.
- **`content_carousel`** (blok anidado dentro de `page.body`): `title`, `see_all_link`, `layout` (`hero` | `large_card` | `live` | `podcast_episode` | `podcast_show`), `items` (relación múltiple → `content_item` o `podcast_show`).
- **Página de listado**: story `aprende/tab-contenidos` (tipo `page`, `body` = array de `content_carousel`).
- **Datasource `categories`**: Liderazgo, Mentalidad, Motivación, Negocio, Enfoque, Emprendimiento, Estrategia — alimenta tanto el campo `category` como el filtro (bottom-sheet).

---

## Estado del back-end — ✅ Implementado

El módulo vive en `src/modules/learn/` dentro del proyecto `fx-aware-api` (NestJS). Rama: `feature/learn-tab-content`.

### Variables de entorno requeridas

```
STORYBLOK_DELIVERY_API_TOKEN=<Content Delivery API token — solo lectura>
STORYBLOK_SPACE_ID=<Space ID del workspace>
```

### Paquetes instalados

- `@storyblok/richtext` — renderiza los campos richtext de Storyblok a HTML.
- `sanitize-html` — sanitiza el HTML resultante antes de enviarlo al front.

### Endpoints implementados

Todos requieren el JWT de usuario (`UserSessionGuard`). El prefijo de la API global es `/api`, así que las rutas completas son:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/learn/content` | Carruseles de la página tab-contenidos |
| `GET` | `/api/learn/content/search` | Búsqueda filtrada por categoría y/o formato |
| `GET` | `/api/learn/content/:slug` | Detalle de un content item |
| `GET` | `/api/learn/filters` | Listado de categorías para el bottom-sheet |

#### Query params de `/api/learn/content/search`

| Param | Tipo | Ejemplo |
|-------|------|---------|
| `category` | `string` (opcional) | `motivacion` |
| `format` | `string` (opcional) | `video` |

Ambos son opcionales e independientes — se pueden combinar.

---

## Shapes del JSON normalizado

El back-end **nunca** devuelve JSON crudo de Storyblok. Las respuestas siguen la estructura `GenericResponse<T>`:

```jsonc
{
  "statusCode": 200,
  "status": "success",
  "data": T
}
```

### `GET /api/learn/filters`

`data` es `FilterCategory[]`:

```ts
type FilterCategory = {
  label: string;  // "Motivación"
  value: string;  // "motivacion"
}
```

### `GET /api/learn/content` y `GET /api/learn/content/search`

`/content` devuelve `Carousel[]`. `/content/search` devuelve `ContentItemPreview[]` directamente.

```ts
type Carousel = {
  title: string;
  seeAllLink: string;
  layout: 'hero' | 'large_card' | 'live' | 'podcast_episode' | 'podcast_show';
  items: ContentItemPreview[];
}

type ContentItemPreview = {
  slug: string;           // "como-crear-objetivos-motivacion" (sin prefijo "content/")
  title: string;
  format: 'video' | 'podcast' | 'live' | 'article';
  category: string;       // valor del datasource, ej. "motivacion"
  coverUrl: string;       // URL de Storyblok ya redimensionada (/m/800x450/filters:quality(80))
  duration: string;       // ej. "12:46"
  author: {
    name: string;
    avatarUrl: string;
  };
  publishedAt: string;    // ej. "2024-01-15"
  isLive: boolean;
}
```

### `GET /api/learn/content/:slug`

`data` es `ContentItemDetail`, que extiende `ContentItemPreview`:

```ts
type ContentItemDetail = ContentItemPreview & {
  mediaUrl: string;         // URL del video, podcast o artículo
  descriptionHtml: string;  // HTML ya sanitizado, listo para dangerouslySetInnerHTML
  transcriptHtml: string;   // HTML ya sanitizado, listo para dangerouslySetInnerHTML
  relatedContent: ContentItemPreview[];
}
```

> **Nota:** Si el slug no existe o fue despublicado en Storyblok, el endpoint responde `404`. El front debe manejar este caso (redirigir o mostrar pantalla de error).

---

## Instrucciones para el Front-end

### Decisiones confirmadas

- ✅ **Auth**: todos los endpoints requieren el JWT de usuario (mismo header `Authorization: Bearer <token>` que el resto de la app).
- ✅ **Cache**: ISR con `revalidate: 60` en las páginas de listado y detalle. El webhook de revalidación de Storyblok se agrega en una segunda iteración.
- ⬜ **Carrusel**: definir si se usa `react-multi-carousel`, `swiper`, o scroll nativo con CSS `scroll-snap`. No mezclar ambas librerías dentro de esta feature. Si no hay un estándar claro en el proyecto, scroll nativo es la opción más liviana.

### 1. Consumir solo los endpoints del back-end

Nunca llamar a Storyblok directamente desde el front. El front queda completamente desacoplado del CMS — si mañana se migra a otro CMS, el front no cambia.

### 2. Ruteo sugerido

```
/aprende/contenidos          → página de listado (consume /api/learn/content)
/aprende/contenidos/[slug]   → página de detalle (consume /api/learn/content/:slug)
```

El slug que devuelve el back ya no tiene el prefijo `content/`, así que se puede usar directamente como segmento de URL.

### 3. Renderizar los carruseles según `layout`

El campo `layout` de cada carrusel determina qué variante de tarjeta usar. Mapeo sugerido:

| `layout` | Tarjeta a usar |
|----------|---------------|
| `hero` | Tarjeta grande con imagen de fondo, prominente |
| `large_card` | Tarjeta estándar con thumbnail |
| `live` | Tarjeta con badge LIVE y timestamp |
| `podcast_episode` | Tarjeta compacta con ícono de podcast y duración |
| `podcast_show` | Tarjeta de show con cover cuadrado |

Reusar componentes de card existentes en el design system — no crear uno nuevo por sección.

### 4. Página de listado

- Fetch de `/api/learn/content` con ISR (`revalidate: 60`).
- Fetch de `/api/learn/filters` para poblar el bottom-sheet (puede hacerse en el mismo `getStaticProps` o en cliente al abrir el drawer).
- Renderizar cada `Carousel` como una fila horizontal scrolleable con su `title` como encabezado.
- Si `carousel.items` está vacío, no renderizar la sección (no mostrar título sin contenido).

### 5. Bottom-sheet de filtros

- Usar `@radix-ui/react-dialog` (o el Drawer propio si ya existe uno en el proyecto).
- Las categorías vienen de `/api/learn/filters`. El chip "Formato" usa los valores fijos del tipo `format` (`video`, `podcast`, `live`, `article`).
- Guardar la selección en estado local (o `zustand` si el estado necesita persistir entre navegaciones).
- Al presionar "Aplicar filtros": llamar a `/api/learn/content/search?category=X&format=Y` y reemplazar la vista de listado con los resultados.
- Si la búsqueda devuelve un array vacío, mostrar estado vacío explícito (no silencio).

### 6. Página de detalle

- Fetch de `/api/learn/content/:slug` con ISR (`revalidate: 60`).
- **Tabs Descripción / Transcripción**: usar `@radix-ui/react-tabs` (ya instalado).
  - El HTML de `descriptionHtml` y `transcriptHtml` ya viene sanitizado — usar `dangerouslySetInnerHTML` dentro de cada panel.
  - ⚠️ No pasar `dangerouslySetInnerHTML` como prop de `Tabs.Content` directamente: Radix lanza `Can only set one of children or props.dangerouslySetInnerHTML`. Envolverlo en un `<div>` hijo:
    ```tsx
    <Tabs.Content value="description">
      <div dangerouslySetInnerHTML={{ __html: content.descriptionHtml }} />
    </Tabs.Content>
    ```
- **Imágenes**: `coverUrl` y `author.avatarUrl` ya apuntan a URLs del servicio de imágenes de Storyblok. Agregar `a.storyblok.com` a `images.remotePatterns` en `next.config` para poder usar `<Image>` de Next.js.
- **Sección "Otros contenidos"**: renderizar `relatedContent` con la misma tarjeta de `large_card`.

### 7. Estados a contemplar

| Situación | Comportamiento esperado |
|-----------|------------------------|
| Carrusel con `items: []` | No renderizar la sección |
| Búsqueda sin resultados | Mostrar estado vacío con mensaje |
| `404` en detalle | Redirigir a `/aprende/contenidos` o página de error |
| Error de red / 5xx | Mostrar error genérico, no crashear |

### 8. Analítica

Instrumentar con la misma librería de eventos ya usada en el resto de la app:

| Evento | Cuándo dispararlo |
|--------|-------------------|
| `learn_content_card_tapped` | Al hacer clic en cualquier tarjeta de contenido |
| `learn_filter_applied` | Al confirmar selección en el bottom-sheet |
| `learn_content_detail_viewed` | Al cargar la página de detalle |
| `learn_tab_changed` | Al cambiar entre Descripción y Transcripción |

---

## Pendiente / Segunda iteración

- **Webhook de revalidación**: configurar en Storyblok un webhook "Story published" que llame a un endpoint propio en el back (`POST /api/learn/revalidate`), el cual dispare `revalidatePath` en Next.js. Verificar la firma del webhook (`STORYBLOK_WEBHOOK_SECRET`) antes de confiar en el payload.
- **Carrusel horizontal**: confirmar librería estándar del proyecto antes de implementar.
- **`podcast_show` items**: el modelo de contenido incluye `podcast_show` como tipo de item dentro de un carrusel. Si se implementan estos carruseles, el back devolverá los campos de `podcast_show` dentro de `ContentItemPreview` usando los campos que apliquen (`title` = `name`, `coverUrl` = `cover.filename`).
