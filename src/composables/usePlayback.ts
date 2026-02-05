import { ref, computed, watch } from 'vue'
import type { Document, Word, PlaybackPosition, Settings } from '@/types'

export function usePlayback(settings: { value: Settings }) {
  const document = ref<Document | null>(null)
  const isPlaying = ref(false)
  const position = ref<PlaybackPosition>({
    chapterIndex: 0,
    paragraphIndex: 0,
    sentenceIndex: 0,
    wordIndex: 0,
  })

  let timeoutId: number | null = null

  // Current word being displayed
  const currentWord = computed<Word | null>(() => {
    if (!document.value) return null

    const chapter = document.value.chapters[position.value.chapterIndex]
    if (!chapter) return null

    const paragraph = chapter.paragraphs[position.value.paragraphIndex]
    if (!paragraph) return null

    const sentence = paragraph.sentences[position.value.sentenceIndex]
    if (!sentence) return null

    return sentence.words[position.value.wordIndex] ?? null
  })

  // Current chapter
  const currentChapter = computed(() => {
    if (!document.value) return null
    return document.value.chapters[position.value.chapterIndex] ?? null
  })

  // Total word count
  const totalWords = computed(() => {
    if (!document.value) return 0
    let count = 0
    for (const chapter of document.value.chapters) {
      for (const para of chapter.paragraphs) {
        for (const sentence of para.sentences) {
          count += sentence.words.length
        }
      }
    }
    return count
  })

  // Current word index (global)
  const currentWordIndex = computed(() => {
    if (!document.value) return 0
    let count = 0

    for (let c = 0; c < position.value.chapterIndex; c++) {
      const chapter = document.value.chapters[c]
      for (const para of chapter.paragraphs) {
        for (const sentence of para.sentences) {
          count += sentence.words.length
        }
      }
    }

    const chapter = document.value.chapters[position.value.chapterIndex]
    if (chapter) {
      for (let p = 0; p < position.value.paragraphIndex; p++) {
        const para = chapter.paragraphs[p]
        for (const sentence of para.sentences) {
          count += sentence.words.length
        }
      }

      const para = chapter.paragraphs[position.value.paragraphIndex]
      if (para) {
        for (let s = 0; s < position.value.sentenceIndex; s++) {
          count += para.sentences[s].words.length
        }
        count += position.value.wordIndex
      }
    }

    return count
  })

  // Progress percentage
  const progress = computed(() => {
    if (totalWords.value === 0) return 0
    return (currentWordIndex.value / totalWords.value) * 100
  })

  // Calculate delay for current word
  function getWordDelay(): number {
    const baseDelay = 60000 / settings.value.wpm
    const word = currentWord.value

    if (!word) return baseDelay

    // Check for punctuation-based pauses
    if (word.punctuation) {
      if (word.punctuation.includes(',')) {
        return baseDelay * settings.value.commaPauseMultiplier
      }
      if (/[.!?;:]/.test(word.punctuation)) {
        return baseDelay * settings.value.periodPauseMultiplier
      }
    }

    return baseDelay
  }

  // Check if at end of document
  function isAtEnd(): boolean {
    if (!document.value) return true

    const chapters = document.value.chapters
    const lastChapter = chapters[chapters.length - 1]
    if (!lastChapter) return true

    const lastPara = lastChapter.paragraphs[lastChapter.paragraphs.length - 1]
    if (!lastPara) return true

    const lastSentence = lastPara.sentences[lastPara.sentences.length - 1]
    if (!lastSentence) return true

    return (
      position.value.chapterIndex === chapters.length - 1 &&
      position.value.paragraphIndex === lastChapter.paragraphs.length - 1 &&
      position.value.sentenceIndex === lastPara.sentences.length - 1 &&
      position.value.wordIndex === lastSentence.words.length - 1
    )
  }

  // Advance to next word
  function advance(): { paragraphBreak: boolean; chapterBreak: boolean } {
    if (!document.value) return { paragraphBreak: false, chapterBreak: false }

    const chapter = document.value.chapters[position.value.chapterIndex]
    if (!chapter) return { paragraphBreak: false, chapterBreak: false }

    const para = chapter.paragraphs[position.value.paragraphIndex]
    if (!para) return { paragraphBreak: false, chapterBreak: false }

    const sentence = para.sentences[position.value.sentenceIndex]
    if (!sentence) return { paragraphBreak: false, chapterBreak: false }

    // Try next word in sentence
    if (position.value.wordIndex < sentence.words.length - 1) {
      position.value.wordIndex++
      return { paragraphBreak: false, chapterBreak: false }
    }

    // Try next sentence in paragraph
    if (position.value.sentenceIndex < para.sentences.length - 1) {
      position.value.sentenceIndex++
      position.value.wordIndex = 0
      return { paragraphBreak: false, chapterBreak: false }
    }

    // Try next paragraph in chapter
    if (position.value.paragraphIndex < chapter.paragraphs.length - 1) {
      position.value.paragraphIndex++
      position.value.sentenceIndex = 0
      position.value.wordIndex = 0
      return { paragraphBreak: true, chapterBreak: false }
    }

    // Try next chapter
    if (position.value.chapterIndex < document.value.chapters.length - 1) {
      position.value.chapterIndex++
      position.value.paragraphIndex = 0
      position.value.sentenceIndex = 0
      position.value.wordIndex = 0
      return { paragraphBreak: true, chapterBreak: true }
    }

    return { paragraphBreak: false, chapterBreak: false }
  }

  // Playback loop
  function scheduleNext() {
    if (!isPlaying.value || !document.value) return

    if (isAtEnd()) {
      isPlaying.value = false
      return
    }

    const delay = getWordDelay()
    const { paragraphBreak, chapterBreak } = advance()

    let extraDelay = 0
    if (chapterBreak) {
      extraDelay = settings.value.chapterPauseMs
    } else if (paragraphBreak) {
      extraDelay = settings.value.paragraphPauseMs
    }

    timeoutId = window.setTimeout(scheduleNext, delay + extraDelay)
  }

  // Control functions
  function play() {
    if (!document.value || isAtEnd()) return
    isPlaying.value = true
    scheduleNext()
  }

  function pause() {
    isPlaying.value = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function togglePlayPause() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function restart() {
    pause()
    position.value = {
      chapterIndex: 0,
      paragraphIndex: 0,
      sentenceIndex: 0,
      wordIndex: 0,
    }
  }

  function jumpToChapter(chapterIndex: number) {
    if (!document.value) return
    if (chapterIndex < 0 || chapterIndex >= document.value.chapters.length) return

    pause()
    position.value = {
      chapterIndex,
      paragraphIndex: 0,
      sentenceIndex: 0,
      wordIndex: 0,
    }
  }

  // Jump forward/backward by words
  function jumpWords(count: number) {
    if (!document.value) return
    pause()

    for (let i = 0; i < Math.abs(count); i++) {
      if (count > 0) {
        // Forward
        if (!isAtEnd()) {
          advance()
        }
      } else {
        // Backward
        const chapter = document.value.chapters[position.value.chapterIndex]
        if (!chapter) break

        const para = chapter.paragraphs[position.value.paragraphIndex]
        if (!para) break

        const sentence = para.sentences[position.value.sentenceIndex]
        if (!sentence) break

        if (position.value.wordIndex > 0) {
          position.value.wordIndex--
        } else if (position.value.sentenceIndex > 0) {
          position.value.sentenceIndex--
          const prevSentence = para.sentences[position.value.sentenceIndex]
          position.value.wordIndex = prevSentence.words.length - 1
        } else if (position.value.paragraphIndex > 0) {
          position.value.paragraphIndex--
          const prevPara = chapter.paragraphs[position.value.paragraphIndex]
          position.value.sentenceIndex = prevPara.sentences.length - 1
          const prevSentence = prevPara.sentences[position.value.sentenceIndex]
          position.value.wordIndex = prevSentence.words.length - 1
        } else if (position.value.chapterIndex > 0) {
          position.value.chapterIndex--
          const prevChapter = document.value.chapters[position.value.chapterIndex]
          position.value.paragraphIndex = prevChapter.paragraphs.length - 1
          const prevPara = prevChapter.paragraphs[position.value.paragraphIndex]
          position.value.sentenceIndex = prevPara.sentences.length - 1
          const prevSentence = prevPara.sentences[position.value.sentenceIndex]
          position.value.wordIndex = prevSentence.words.length - 1
        }
      }
    }
  }

  // Jump to a specific word index
  function jumpToWord(targetIndex: number) {
    if (!document.value) return
    pause()

    if (targetIndex < 0) targetIndex = 0
    if (targetIndex >= totalWords.value) targetIndex = totalWords.value - 1

    let count = 0
    for (let c = 0; c < document.value.chapters.length; c++) {
      const chapter = document.value.chapters[c]
      for (let p = 0; p < chapter.paragraphs.length; p++) {
        const para = chapter.paragraphs[p]
        for (let s = 0; s < para.sentences.length; s++) {
          const sentence = para.sentences[s]
          for (let w = 0; w < sentence.words.length; w++) {
            if (count === targetIndex) {
              position.value = {
                chapterIndex: c,
                paragraphIndex: p,
                sentenceIndex: s,
                wordIndex: w,
              }
              return
            }
            count++
          }
        }
      }
    }
  }

  function setDocument(doc: Document) {
    pause()
    document.value = doc
    position.value = {
      chapterIndex: 0,
      paragraphIndex: 0,
      sentenceIndex: 0,
      wordIndex: 0,
    }
  }

  // Clean up on settings WPM change while playing
  watch(
    () => settings.value.wpm,
    () => {
      if (isPlaying.value) {
        // Restart the timer with new WPM
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        scheduleNext()
      }
    }
  )

  return {
    document,
    isPlaying,
    position,
    currentWord,
    currentChapter,
    totalWords,
    currentWordIndex,
    progress,
    play,
    pause,
    togglePlayPause,
    restart,
    jumpToChapter,
    jumpWords,
    jumpToWord,
    setDocument,
  }
}
