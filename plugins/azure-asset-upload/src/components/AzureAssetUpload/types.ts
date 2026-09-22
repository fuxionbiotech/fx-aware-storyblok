export type AzureAsset = {
  url: string
  filename: string
  contentType: string
  size: number
}

export type SasTokenResponse = {
  uploadUrl: string
  blobUrl: string
}

export function isAzureAsset(value: unknown): value is AzureAsset {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AzureAsset).url === 'string' &&
    typeof (value as AzureAsset).filename === 'string'
  )
}
