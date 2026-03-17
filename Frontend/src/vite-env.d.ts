/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
