/**
 * Calculate the Optimal Recognition Point (ORP) anchor index for a word.
 * This is the character that should be highlighted and aligned vertically.
 *
 * Rules (based on Spritz RSVP system):
 * - 1–3 letters: 1st letter (index 0)
 * - 4–5 letters: 2nd letter (index 1)
 * - 6–9 letters: 3rd letter (index 2)
 * - 10+ letters: 4th letter (index 3)
 */
export function calculateAnchorIndex(word: string): number {
  const len = word.length

  if (len <= 3) return 0
  if (len <= 5) return 1
  if (len <= 9) return 2
  return 3
}

/**
 * Extract punctuation from the end of a word.
 * Returns the punctuation character(s) if present, undefined otherwise.
 */
export function extractPunctuation(word: string): string | undefined {
  const match = word.match(/[.,;:!?'")\]]+$/)
  return match ? match[0] : undefined
}

/**
 * Get the clean word text without trailing punctuation.
 */
export function getCleanWord(word: string): string {
  return word.replace(/[.,;:!?'")\]]+$/, '')
}
