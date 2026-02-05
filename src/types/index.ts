export interface Word {
  text: string
  anchorIndex: number
  punctuation?: string
}

export interface Sentence {
  words: Word[]
}

export interface Paragraph {
  sentences: Sentence[]
}

export interface Chapter {
  title?: string
  paragraphs: Paragraph[]
}

export interface Document {
  title: string
  chapters: Chapter[]
}

export interface PlaybackPosition {
  chapterIndex: number
  paragraphIndex: number
  sentenceIndex: number
  wordIndex: number
}

export interface Settings {
  wpm: number
  fontFamily: string
  fontSize: number
  theme: 'dark' | 'light'
  showFocalLine: boolean
  commaPauseMultiplier: number
  periodPauseMultiplier: number
  paragraphPauseMs: number
  chapterPauseMs: number
}

export type FontOption = {
  name: string
  family: string
  category: 'serif' | 'sans-serif' | 'monospace'
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', family: 'Inter, sans-serif', category: 'sans-serif' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'sans-serif' },
  { name: 'Atkinson Hyperlegible', family: '"Atkinson Hyperlegible", sans-serif', category: 'sans-serif' },
  { name: 'Literata', family: 'Literata, serif', category: 'serif' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'serif' },
  { name: 'Source Serif 4', family: '"Source Serif 4", serif', category: 'serif' },
  { name: 'Libre Baskerville', family: '"Libre Baskerville", serif', category: 'serif' },
  { name: 'IBM Plex Mono', family: '"IBM Plex Mono", monospace', category: 'monospace' },
  { name: 'Roboto Mono', family: '"Roboto Mono", monospace', category: 'monospace' },
]

export const DEFAULT_SETTINGS: Settings = {
  wpm: 250,
  fontFamily: 'Inter, sans-serif',
  fontSize: 48,
  theme: 'dark',
  showFocalLine: false,
  commaPauseMultiplier: 1.0,
  periodPauseMultiplier: 1.7,
  paragraphPauseMs: 0,
  chapterPauseMs: 0,
}
