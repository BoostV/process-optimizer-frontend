/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_SERVER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
