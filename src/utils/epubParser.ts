import ePub from 'epubjs'
import type { Document, Chapter, Paragraph, Sentence, Word } from '@/types'
import { calculateAnchorIndex, extractPunctuation } from './anchorCalculator'

/**
 * Parse an EPUB file into a structured Document.
 */
export async function parseEpub(file: File): Promise<Document> {
  const arrayBuffer = await file.arrayBuffer()
  const book = ePub(arrayBuffer)

  await book.ready

  const metadata = await book.loaded.metadata
  const title = metadata.title || file.name.replace(/\.epub$/i, '')
  const chapters = await extractChapters(book)

  return {
    title,
    chapters,
  }
}

/**
 * Extract chapters from the EPUB spine.
 */
async function extractChapters(book: ReturnType<typeof ePub>): Promise<Chapter[]> {
  const chapters: Chapter[] = []
  const spine = book.spine as { each: (callback: (section: SpineItem) => void) => void }

  const sections: SpineItem[] = []
  spine.each((section) => sections.push(section))

  for (const section of sections) {
    try {
      // Load the section content
      const contents = await section.load(book.load.bind(book))

      // contents might be a Document or an Element
      let doc: globalThis.Document
      if (contents instanceof globalThis.Document) {
        doc = contents
      } else if (contents && typeof contents === 'object' && 'ownerDocument' in contents) {
        doc = (contents as Element).ownerDocument!
      } else if (typeof contents === 'string') {
        // If it's a string, parse it
        const parser = new DOMParser()
        doc = parser.parseFromString(contents, 'application/xhtml+xml')
      } else {
        // Try to get innerHTML and parse
        const html = section.contents?.innerHTML || ''
        if (!html) continue
        const parser = new DOMParser()
        doc = parser.parseFromString(html, 'text/html')
      }

      const text = extractTextFromElement(doc.body || doc.documentElement)
      if (text.trim().length === 0) continue

      // Try to extract chapter title from the first heading
      const heading = doc.querySelector('h1, h2, h3')
      const chapterTitle = heading?.textContent?.trim()

      const paragraphs = parseParagraphsFromText(text)

      if (paragraphs.length > 0) {
        chapters.push({
          title: chapterTitle,
          paragraphs,
        })
      }
    } catch (e) {
      console.warn('Failed to load section:', e)
      continue
    }
  }

  return chapters
}

interface SpineItem {
  load: (loader: (url: string) => Promise<unknown>) => Promise<unknown>
  contents?: { innerHTML: string }
}

/**
 * Extract text content from an element, preserving paragraph structure.
 */
function extractTextFromElement(element: Element): string {
  const textParts: string[] = []

  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        textParts.push(text)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tagName = el.tagName.toLowerCase()

      // Skip script and style
      if (tagName === 'script' || tagName === 'style') {
        return
      }

      // Add paragraph break before block elements
      if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tagName)) {
        textParts.push('\n\n')
      } else if (tagName === 'br') {
        textParts.push('\n')
      }

      // Process children
      for (const child of Array.from(node.childNodes)) {
        processNode(child)
      }

      // Add paragraph break after block elements
      if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tagName)) {
        textParts.push('\n\n')
      }
    }
  }

  processNode(element)

  return textParts
    .join(' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Parse extracted text into paragraphs.
 */
function parseParagraphsFromText(text: string): Paragraph[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const rawParagraphs = normalized.split(/\n\s*\n+/)

  return rawParagraphs
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0)
    .map((p) => ({
      sentences: parseSentences(p),
    }))
}

/**
 * Parse a paragraph into sentences.
 */
function parseSentences(paragraph: string): Sentence[] {
  const normalized = paragraph.replace(/\s+/g, ' ').trim()
  const sentenceRegex = /[^.!?]+[.!?]+["']?|[^.!?]+$/g
  const matches = normalized.match(sentenceRegex)

  if (!matches) {
    return [{ words: parseWords(normalized) }]
  }

  return matches
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => ({
      words: parseWords(s),
    }))
}

/**
 * Parse a sentence into words.
 */
function parseWords(sentence: string): Word[] {
  const rawWords = sentence.split(/\s+/).filter((w) => w.length > 0)

  return rawWords.map((raw) => {
    const punctuation = extractPunctuation(raw)
    const text = raw

    return {
      text,
      anchorIndex: calculateAnchorIndex(text.replace(/[.,;:!?'")\]]+$/, '')),
      punctuation,
    }
  })
}
