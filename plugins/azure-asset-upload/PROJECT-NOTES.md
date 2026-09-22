# Azure Asset Upload — Field Plugin de Storyblok

Custom Field Plugin para subir archivos (imágenes, video, audio, PDF) directo desde el navegador a **Azure Blob Storage**, sin pasar por el storage/tráfico de Storyblok. Reemplaza el campo `asset` nativo en los componentes donde se use.

## Estado actual

| Pieza | Estado |
|---|---|
| Endpoint que emite el SAS token | ✅ Desplegado y probado — `src/app/api/sas-token/route.js` en Vercel |
| Field Plugin (frontend) | ✅ **Desplegado y verificado de punta a punta en el editor real** — `plugins/azure-asset-upload/src/` |
| Azure Function standalone (`sas-token-function/`) | ⏸️ En pausa, no desplegada (ver más abajo) |

**Prueba real confirmada** (2026-08-14): subida de `Machu_Picchu,_Peru_(2018).jpg` desde el editor de Storyblok, guardado en un campo `content_item`, publicado, y verificado que el valor quedó persistido en el content de la story:

```json
{
  "url": "https://sgfuxionaware.blob.core.windows.net/media/images/199160725476965/1786700444600-Machu_Picchu__Peru__2018_.jpg",
  "size": 1929017,
  "filename": "Machu_Picchu,_Peru_(2018).jpg",
  "contentType": "image/jpeg"
}
```

## ⚠️ Gotcha importante: el campo custom necesita `"options": []` en el schema

Si defines un campo `{"type":"custom","field_type":"azure-asset-upload"}` por Management API **sin** incluir `"options": []` explícitamente (aunque esté vacío), el plugin queda **atascado en `"loading"` para siempre** — sin ningún error visible en consola. Lo que pasa: el plugin sí manda correctamente el mensaje `postMessage` inicial (`event: "loaded"`) al editor padre, pero el editor de Storyblok falla silenciosamente al construir la respuesta y nunca contesta. Diagnosticado comparando un campo creado por la UI (que sí incluye `options: []` automáticamente) contra uno creado por API (que no lo incluía por defecto).

**Siempre que se cree/edite un campo custom por Management API, incluir `"options": []` aunque el plugin no use ninguna opción.**

## El endpoint del SAS token — activo en producción

**No es la Azure Function** de `sas-token-function/` — terminamos desplegando esta pieza como una ruta más de este mismo proyecto Next.js (`https://fx-aware-storyblok.vercel.app/api/sas-token`), porque:

1. No había permisos disponibles todavía para terminar de crear la Function App en Azure (bloqueo de RBAC).
2. Aware backend ya tenía una **account key** de Azure Storage funcionando (`sgfuxionaware`, contenedor `media`) — reusarla evitó depender de Managed Identity, que de todas formas solo tiene sentido si el compute corre dentro de Azure.
3. Vercel ya estaba configurado y probado en este proyecto — cero infraestructura nueva.

Implementación: `StorageSharedKeyCredential` (la account key) + `generateBlobSASQueryParameters`, en vez de `DefaultAzureCredential` + User Delegation Key. Misma lógica de siempre — SAS de un solo blob, permisos `cw` (create+write, sin lectura ni borrado), ~5 minutos de vigencia — solo cambia qué firma el SAS.

### Variables de entorno (configuradas en Vercel — producción y preview)

| Variable | Valor / origen |
|---|---|
| `AZURE_STORAGE_ACCOUNT_NAME` | `sgfuxionaware` (la misma cuenta que usa Aware backend) |
| `AZURE_STORAGE_ACCOUNT_KEY` | Account key de esa storage account — **secreto**, solo vive en Vercel (encrypted) y en `.env` local (gitignored) |
| `AZURE_STORAGE_CONTAINER_NAME` | `media` (los blobs se suben con prefijo `images/`) |
| `PLUGIN_SHARED_SECRET` | Generado ad-hoc — debe coincidir con `VITE_PLUGIN_SHARED_SECRET` del plugin |
| `ALLOWED_ORIGIN` | `https://plugins.storyblok.com` — **confirmado real**, es el origin desde donde Storyblok sirve el iframe del plugin (verificado inspeccionando los mensajes `postMessage` en producción) |

### Pruebas de punta a punta ya verificadas

```
POST https://fx-aware-storyblok.vercel.app/api/sas-token
  Header: X-Plugin-Key: <PLUGIN_SHARED_SECRET>
  Body: { "spaceId": ..., "storyId": ..., "filename": "...", "contentType": "..." }
  → { "uploadUrl": "...", "blobUrl": "..." }

PUT <uploadUrl>  (con el archivo)  → 201
GET <blobUrl>                      → 200 (el contenedor es de lectura pública)
DELETE <uploadUrl>                 → 403 (el SAS no tiene permiso de borrado — confirmado)
```

Más la prueba real completa desde el editor de Storyblok (ver arriba).

## Por qué existe la Azure Function (`sas-token-function/`) si no está desplegada

Cuando planeábamos usar Managed Identity (sin ningún secreto estático guardado en ningún lado), esta era la pieza correcta. Se quedó escrita y compilando en el repo para cuando el equipo tenga los permisos de Azure necesarios (rol Owner/User Access Administrator en el resource group) y quieran migrar de "account key en Vercel" a "Managed Identity en Azure Functions" — es un mejor modelo de seguridad a mediano plazo, pero no bloqueante, ya que la funcionalidad ya está probada y funcionando con el approach actual.

## El Field Plugin (`src/`)

Corre embebido en un iframe dentro del editor de Storyblok. Guarda en el campo un JSON propio (no el formato nativo de Storyblok):

```ts
type AzureAsset = {
  url: string
  filename: string
  contentType: string
  size: number
}
```

### Flujo

1. El editor selecciona un archivo.
2. El plugin pide una URL de subida a `POST /api/sas-token`, mandando `X-Plugin-Key` como header.
3. Sube el archivo directo a Blob Storage con esa URL (SAS de solo escritura, ~5 min de vigencia).
4. Guarda `{ url, filename, contentType, size }` en el campo vía `actions.setContent(...)`.
5. **Como cualquier campo de Storyblok, el valor solo se persiste cuando el editor le da "Save"/"Save & Publish" al story** — el plugin no guarda automáticamente por su cuenta.

### Desarrollo local

```
cd plugins/azure-asset-upload
cp .env.local.example .env.local   # VITE_SAS_TOKEN_ENDPOINT=https://fx-aware-storyblok.vercel.app/api/sas-token
                                    # VITE_PLUGIN_SHARED_SECRET=<el mismo valor configurado en Vercel>
                                    # STORYBLOK_PERSONAL_ACCESS_TOKEN=<PAT con "Full user permission" — ver nota abajo>
npm install
npm run dev
```

Abrir el [Sandbox de Storyblok](https://plugin-sandbox.storyblok.com/field-plugin/) para probarlo con datos reales de un espacio — el plugin no funciona abierto suelto en el navegador, necesita el contexto del editor (parent window real para el handshake postMessage).

### Deploy

```
npm run build
npx @storyblok/field-plugin-cli@latest deploy --scope my-plugins --name azure-asset-upload --skipPrompts --dotEnvPath .env.local
```

**El PAT necesita "Full user permission (no scope/space restriction)"** activado al generarlo en Storyblok (My Account → Personal Access Tokens). Los scopes granulares por space (Assets, Components, Stories, etc.) no incluyen "Plugins" — es un recurso a nivel de cuenta/organización, no de space, así que no hay forma de acotar el PAT solo para esto.

Ya deployado: plugin id `208871932565888`, vinculado al space `293900562500203`.

## Notas de seguridad

- `PLUGIN_SHARED_SECRET` viaja embebido en el bundle del navegador (variable `VITE_*`) — es un filtro contra abuso casual, no una credencial fuerte. La seguridad real está en que el SAS emitido es de **solo escritura**, acotado a un blob específico, y expira en minutos — verificado que un intento de `DELETE` con ese SAS es rechazado (403).
- La account key en sí **nunca** sale del servidor — ni al plugin, ni a ningún log. Solo vive en las env vars de Vercel (encrypted) y en `.env` local (gitignored).
- Este endpoint es intencionalmente independiente de los guards de autenticación de usuarios de Aware backend — son dominios de confianza distintos (editor de Storyblok vs. usuario final de Aware). Ver `STORYBLOK-INTEGRATION-BRIEF.md` en la raíz del repo para el contexto completo de la integración.

## Pendiente

- [ ] Migrar `cover` (en `content_item` y `podcast_show`) y `avatar` (en `author`) de `type: "asset"` nativo a este custom field type. **Requiere coordinar con quien mantiene el backend de Aware primero** — cambia la forma del dato (`content.cover.filename` nativo de Storyblok → `content.cover.url` nuestro), y el backend ya está en producción leyendo la forma actual.
