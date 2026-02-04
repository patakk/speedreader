import type { Document, Paragraph, Sentence, Word } from '@/types'
import { calculateAnchorIndex, extractPunctuation } from './anchorCalculator'

/**
 * Parse plain text into a structured Document.
 */
export function parseText(text: string, title: string = 'Untitled'): Document {
  const paragraphs = parseParagraphs(text)

  return {
    title,
    chapters: [
      {
        title: undefined,
        paragraphs,
      },
    ],
  }
}

/**
 * Parse text into paragraphs (split by double newlines or multiple newlines).
 */
function parseParagraphs(text: string): Paragraph[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const rawParagraphs = normalized.split(/\n\s*\n+/)

  return rawParagraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => ({
      sentences: parseSentences(p),
    }))
}

/**
 * Parse a paragraph into sentences.
 * Uses a simple regex to split on sentence-ending punctuation.
 */
function parseSentences(paragraph: string): Sentence[] {
  // Normalize whitespace within the paragraph
  const normalized = paragraph.replace(/\s+/g, ' ').trim()

  // Split on sentence boundaries while keeping the punctuation
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
    const text = raw // Keep original with punctuation for display

    return {
      text,
      anchorIndex: calculateAnchorIndex(text.replace(/[.,;:!?'")\]]+$/, '')),
      punctuation,
    }
  })
}
