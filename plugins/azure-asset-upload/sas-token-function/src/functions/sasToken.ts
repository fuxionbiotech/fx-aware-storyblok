import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { DefaultAzureCredential } from '@azure/identity'
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob'

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? ''
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME ?? ''
const PLUGIN_SHARED_SECRET = process.env.PLUGIN_SHARED_SECRET ?? ''
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? ''
const SAS_TTL_MINUTES = 5

// The plugin runs in the browser (embedded as an iframe inside the Storyblok
// editor), so it can never hold a real credential. This function is the only
// piece that talks to Azure: it uses this Function App's Managed Identity to
// mint a short-lived, write-only SAS scoped to a single blob, so the storage
// account key/connection string never has to exist anywhere.
let cachedBlobServiceClient: BlobServiceClient | null = null

function getBlobServiceClient(): BlobServiceClient {
  if (!cachedBlobServiceClient) {
    const credential = new DefaultAzureCredential()
    cachedBlobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net`,
      credential,
    )
  }
  return cachedBlobServiceClient
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Key',
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

type RequestBody = {
  spaceId?: number
  storyId?: number
  filename?: string
  contentType?: string
}

export async function sasToken(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: corsHeaders() }
  }

  const pluginKey = request.headers.get('x-plugin-key')
  if (!PLUGIN_SHARED_SECRET || pluginKey !== PLUGIN_SHARED_SECRET) {
    return {
      status: 401,
      headers: corsHeaders(),
      jsonBody: { error: 'Unauthorized' },
    }
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return {
      status: 400,
      headers: corsHeaders(),
      jsonBody: { error: 'Invalid JSON body' },
    }
  }

  const { spaceId, storyId, filename, contentType } = body

  if (!filename) {
    return {
      status: 400,
      headers: corsHeaders(),
      jsonBody: { error: 'filename is required' },
    }
  }

  context.log(`SAS request — space:${spaceId} story:${storyId} file:${filename}`)

  const blobName = `${storyId ?? 'unassigned'}/${Date.now()}-${sanitizeFilename(filename)}`

  try {
    const blobServiceClient = getBlobServiceClient()

    const startsOn = new Date(Date.now() - 60 * 1000) // small clock-skew buffer
    const expiresOn = new Date(Date.now() + SAS_TTL_MINUTES * 60 * 1000)

    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
      startsOn,
      expiresOn,
    )

    const sasQueryParams = generateBlobSASQueryParameters(
      {
        containerName: CONTAINER_NAME,
        blobName,
        permissions: BlobSASPermissions.parse('cw'), // create + write, no read/delete
        startsOn,
        expiresOn,
        contentType,
      },
      userDelegationKey,
      ACCOUNT_NAME,
    )

    const blobUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`
    const uploadUrl = `${blobUrl}?${sasQueryParams.toString()}`

    return {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      jsonBody: { uploadUrl, blobUrl },
    }
  } catch (error) {
    context.error('Failed to issue SAS token', error)
    return {
      status: 500,
      headers: corsHeaders(),
      jsonBody: { error: 'Could not issue upload URL' },
    }
  }
}

app.http('sasToken', {
  route: 'sas-token',
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: sasToken,
})
