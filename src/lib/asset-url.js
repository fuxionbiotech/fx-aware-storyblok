/**
 * Resuelve la URL de un campo de imagen sin importar como se cargo.
 *
 * En este espacio conviven dos convenciones:
 *
 * - Plugin `azure-asset-upload`: guarda `{ url, filename, contentType, size }`,
 *   donde `filename` es el nombre del archivo y la URL real esta en `url`.
 * - Asset nativo de Storyblok: guarda `{ filename: 'https://a.storyblok.com/...' }`
 *   y ahi `filename` SI es la URL.
 *
 * Por eso `url` se evalua primero: los valores del plugin tienen los dos campos
 * y quedarse con `filename` daria un nombre de archivo suelto. Es el mismo
 * orden que aplica el backend en `learn.service.ts`.
 *
 * No se aplica el image service de Storyblok: esto es un preview y conviene ver
 * la imagen tal como se cargo, sin recortes.
 */
export function assetUrl(field) {
	if (!field) return null;
	if (typeof field === 'string') return field.trim() || null;
	if (field.url) return field.url;
	if (field.filename) return field.filename;
	return null;
}
