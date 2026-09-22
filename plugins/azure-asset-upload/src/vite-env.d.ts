/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SAS_TOKEN_ENDPOINT: string
  readonly VITE_PLUGIN_SHARED_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
