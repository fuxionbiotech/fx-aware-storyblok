import { SasTokenResponse } from './types'

const SAS_TOKEN_ENDPOINT = import.meta.env.VITE_SAS_TOKEN_ENDPOINT
const PLUGIN_SHARED_SECRET = import.meta.env.VITE_PLUGIN_SHARED_SECRET

type RequestUploadUrlParams = {
  spaceId: number | undefined
  storyId: number | undefined
  filename: string
  contentType: string
}

export async function requestUploadUrl({
  spaceId,
  storyId,
  filename,
  contentType,
}: RequestUploadUrlParams): Promise<SasTokenResponse> {
  const response = await fetch(SAS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Plugin-Key': PLUGIN_SHARED_SECRET,
    },
    body: JSON.stringify({ spaceId, storyId, filename, contentType }),
  })

  if (!response.ok) {
    throw new Error(`No se pudo obtener la URL de subida (HTTP ${response.status})`)
  }

  return response.json()
}

export async function uploadToBlob(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob')
    xhr.setRequestHeader(
      'Content-Type',
      file.type || 'application/octet-stream',
    )

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`La subida al storage falló (HTTP ${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Error de red subiendo el archivo'))

    xhr.send(file)
  })
}
