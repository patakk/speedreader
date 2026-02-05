<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import Reader from '@/components/Reader.vue'
import Controls from '@/components/Controls.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import FileUpload from '@/components/FileUpload.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import ChapterSelector from '@/components/ChapterSelector.vue'
import { useSettings } from '@/composables/useSettings'
import { usePlayback } from '@/composables/usePlayback'
import type { Document, Settings } from '@/types'

const { settings, updateSetting } = useSettings()
const playback = usePlayback(settings)

// Ensure settings is always available for templates
const currentSettings = computed(() => settings.value)

// Ref to FileUpload component
const fileUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)

function openFileUpload() {
  fileUploadRef.value?.open()
}

// Title display
const documentTitle = computed(() => playback.document.value?.title || 'EPUB Speed Reader')

// Handle document load
function handleDocumentLoaded(doc: Document) {
  playback.setDocument(doc)
}

// Keyboard shortcuts
function handleKeydown(event: KeyboardEvent) {
  // Ignore if typing in an input
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return
  }

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      playback.togglePlayPause()
      break
    case 'ArrowLeft':
      event.preventDefault()
      playback.jumpWords(-1)
      break
    case 'ArrowRight':
      event.preventDefault()
      playback.jumpWords(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      updateSetting('wpm', Math.min(900, settings.value.wpm + 10))
      break
    case 'ArrowDown':
      event.preventDefault()
      updateSetting('wpm', Math.max(100, settings.value.wpm - 10))
      break
    case 'KeyR':
      if (!event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        playback.restart()
      }
      break
    case 'KeyT':
      if (!event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        updateSetting('theme', settings.value.theme === 'dark' ? 'light' : 'dark')
      }
      break
  }
}

// Apply theme to document
watch(
  () => settings.value.theme,
  (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  },
  { immediate: true }
)

// Update page title
watch(documentTitle, (title) => {
  document.title = title
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app" :class="{ playing: playback.isPlaying.value }">
    <!-- Header with title (shown when paused) -->
    <header v-if="!playback.isPlaying.value && playback.document.value" class="header">
      <h1 class="title">{{ documentTitle }}</h1>
      <ChapterSelector
        :document="playback.document.value"
        :current-chapter-index="playback.position.value.chapterIndex"
        @select-chapter="playback.jumpToChapter"
      />
    </header>

    <!-- File upload button -->
    <FileUpload ref="fileUploadRef" @document-loaded="handleDocumentLoaded" />

    <!-- Settings panel -->
    <SettingsPanel
      v-if="currentSettings"
      :settings="currentSettings"
      @update-setting="(key: keyof Settings, value: Settings[keyof Settings]) => updateSetting(key, value)"
    />

    <!-- Main reading area -->
    <main class="main">
      <Reader v-if="currentSettings" :word="playback.currentWord.value" :settings="currentSettings" @load-request="openFileUpload" />
    </main>

    <!-- Controls (shown when paused or has document) -->
    <footer v-if="playback.document.value && currentSettings" class="footer">
      <Controls
        :is-playing="playback.isPlaying.value"
        :settings="currentSettings"
        :current-word-index="playback.currentWordIndex.value"
        :total-words="playback.totalWords.value"
        @toggle-play="playback.togglePlayPause"
        @restart="playback.restart"
        @jump-words="playback.jumpWords"
        @jump-to-word="playback.jumpToWord"
        @update-wpm="(wpm) => updateSetting('wpm', wpm)"
      />
    </footer>

    <!-- Progress bar (always visible when document loaded) -->
    <ProgressBar
      v-if="playback.document.value"
      :progress="playback.progress.value"
      :current-word="playback.currentWordIndex.value"
      :total-words="playback.totalWords.value"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
  transition: background 0.3s;
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  flex-wrap: wrap;
  z-index: 10;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text);
  text-align: center;
}

.main {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  padding-bottom: 180px; /* Space for controls and progress */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.footer {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(transparent, var(--color-bg) 20%);
  pointer-events: none;
}

.footer > * {
  pointer-events: auto;
}

/* Hide non-essential UI during playback */
.app.playing .header {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.app.playing:hover .header {
  opacity: 1;
  pointer-events: auto;
}
</style>
