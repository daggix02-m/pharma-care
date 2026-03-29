/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string;
  readonly NEXT_PUBLIC_CONVEX_URL?: string;
  readonly VITE_CONVEX_SITE_URL?: string;
  readonly VITE_CHAPA_SECRET_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __CONVEX_URL_FROM_DEPLOYMENT__: string;
