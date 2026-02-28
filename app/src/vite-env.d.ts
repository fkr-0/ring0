/// <reference types="vite/client" />

declare module 'virtual:org-files:*' {
  const content: string
  export default content
}

declare module 'virtual:glossary-seed' {
  const content: string
  export default content
}

declare module 'virtual:glossary-details' {
  const details: Record<string, string>
  export default details
}

declare module '*.org?raw' {
  const content: string
  export default content
}

declare module '*.org' {
  const content: string
  export default content
}

interface ImportMetaEnv {
  readonly VITE_GIT_HASH?: string
  readonly VITE_GIT_TAG?: string
  readonly VITE_DEPLOYED_AT?: string
}
