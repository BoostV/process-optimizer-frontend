/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_SERVER: string
  readonly VITE_BASE_PATH: string
  readonly VITE_BRANCH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
