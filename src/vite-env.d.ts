/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_ORIGIN: string
  readonly VITE_INSTITUTE_ID: string
  readonly VITE_API_BASE: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_ALLOWED_LOGIN_EMAILS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
