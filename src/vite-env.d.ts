/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'epubjs' {
  export interface Book {
    ready: Promise<void>
    packaging: {
      metadata: {
        title?: string
        creator?: string
      }
    }
    spine: {
      get(href: string): Section | undefined
      items: Array<{ href: string; index: number }>
    }
    load: (url: string) => Promise<Document>
  }

  export interface Section {
    load(load: (url: string) => Promise<Document>): Promise<Document>
  }

  export default function ePub(input: ArrayBuffer | string): Book
}
