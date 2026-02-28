/// <reference types="vite/client" />

declare module 'virtual:org-files:*' {
  const content: string
  export default content
}

declare module '*.org?raw' {
  const content: string
  export default content
}

declare module '*.org' {
  const content: string
  export default content
}
