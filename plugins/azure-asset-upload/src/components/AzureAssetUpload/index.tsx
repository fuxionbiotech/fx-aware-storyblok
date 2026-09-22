import './style.css'
import { ChangeEvent, FunctionComponent, useState } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'
import { requestUploadUrl, uploadToBlob } from './api'
import { AzureAsset, isAzureAsset } from './types'
import AssetPreview from './AssetPreview'

type Status = 'idle' | 'uploading' | 'error'

// Matches simple accept patterns: "image/*", "video/*,audio/*", "image/png,image/jpeg"
const matchesAccept = (fileType: string, accept: string): boolean =>
  accept.split(',').some((pattern) => {
    const trimmed = pattern.trim()
    if (trimmed.endsWith('/*')) {
      return fileType.startsWith(trimmed.slice(0, -1))
    }
    return fileType === trimmed
  })

const AzureAssetUpload: FunctionComponent = () => {
  const plugin = useFieldPlugin({
    validateContent: (content: unknown) => ({
      content: isAzureAsset(content) ? content : null,
    }),
  })

  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  if (plugin.type !== 'loaded') {
    return null
  }

  const { data, actions } = plugin
  const asset = data.content as AzureAsset | null
  const accept =
    typeof data.options?.accept === 'string' ? data.options.accept : undefined

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (accept && file.type && !matchesAccept(file.type, accept)) {
      setStatus('error')
      setErrorMessage(
        `Este campo solo acepta archivos de tipo "${accept}". El archivo seleccionado es "${file.type}".`,
      )
      return
    }

    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    try {
      const { uploadUrl, blobUrl } = await requestUploadUrl({
        spaceId: data.spaceId,
        storyId: data.storyId,
        filename: file.name,
        contentType: file.type,
      })

      await uploadToBlob(uploadUrl, file, setProgress)

      actions.setContent({
        url: blobUrl,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      })

      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Error inesperado subiendo el archivo.',
      )
    }
  }

  const handleRemove = () => {
    actions.setContent(null)
  }

  return (
    <div className="azure-asset-upload">
      {asset && (
        <div className="azure-asset-upload__current">
          <AssetPreview asset={asset} />
          <p className="azure-asset-upload__filename">{asset.filename}</p>
          <a
            className="azure-asset-upload__link"
            href={asset.url}
            target="_blank"
            rel="noreferrer"
          >
            {asset.url}
          </a>
          <button
            type="button"
            className="azure-asset-upload__remove"
            onClick={handleRemove}
            disabled={status === 'uploading'}
          >
            Quitar archivo
          </button>
        </div>
      )}

      {!asset && status !== 'uploading' && (
        <p className="azure-asset-upload__empty">Sin archivo asignado.</p>
      )}

      <label className="azure-asset-upload__input-label">
        <input
          type="file"
          className="azure-asset-upload__input"
          accept={accept}
          onChange={handleFileChange}
          disabled={status === 'uploading'}
        />
        {status === 'uploading' ? 'Subiendo…' : asset ? 'Reemplazar archivo' : 'Subir archivo'}
      </label>

      {status === 'uploading' && (
        <div className="azure-asset-upload__progress-track">
          <div
            className="azure-asset-upload__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status === 'error' && (
        <p className="azure-asset-upload__error">{errorMessage}</p>
      )}
    </div>
  )
}

export default AzureAssetUpload
