/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_SQUARE_APPLICATION_ID: string
  readonly VITE_SQUARE_LOCATION_ID: string
  readonly VITE_API_BASE: string
  /** `sandbox` | `production` */
  readonly VITE_SQUARE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
