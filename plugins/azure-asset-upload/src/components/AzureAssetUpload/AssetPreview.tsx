import { FunctionComponent } from 'react'
import { AzureAsset } from './types'

const AssetPreview: FunctionComponent<{ asset: AzureAsset }> = ({ asset }) => {
  const type = asset.contentType || ''

  if (type.startsWith('image/')) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={asset.url}
        alt={asset.filename}
        className="azure-asset-upload__preview-image"
      />
    )
  }

  if (type.startsWith('video/')) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={asset.url}
        controls
        className="azure-asset-upload__preview-video"
      />
    )
  }

  if (type.startsWith('audio/')) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio src={asset.url} controls className="azure-asset-upload__preview-audio" />
    )
  }

  return null
}

export default AssetPreview
