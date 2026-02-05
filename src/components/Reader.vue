<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { Word, Settings } from '@/types'

const props = defineProps<{
  word: Word | null
  settings: Settings
}>()

const emit = defineEmits<{
  loadRequest: []
}>()

const beforeRef = ref<HTMLElement | null>(null)
const anchorRef = ref<HTMLElement | null>(null)
const offset = ref(0)
const isReady = ref(false)

// Split word into parts for rendering
const wordParts = computed(() => {
  if (!props.word) return null

  const text = props.word.text
  const anchorIndex = props.word.anchorIndex

  return {
    before: text.slice(0, anchorIndex),
    anchor: text[anchorIndex] || '',
    after: text.slice(anchorIndex + 1),
  }
})

// Calculate offset to align anchor character to center line
watch(
  () => [props.word, props.settings.fontFamily, props.settings.fontSize],
  async () => {
    isReady.value = false
    await nextTick()
    if (beforeRef.value && anchorRef.value && props.word) {
      const beforeWidth = beforeRef.value.offsetWidth
      const anchorHalfWidth = anchorRef.value.offsetWidth / 2
      offset.value = beforeWidth + anchorHalfWidth
    } else {
      offset.value = 0
    }
    isReady.value = true
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="reader"
    :style="{
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
    }"
  >
    <!-- Focal point indicator (the vertical line) -->
    <div v-if="settings.showFocalLine" class="focal-line"></div>

    <!-- Word display -->
    <div v-if="word && wordParts" class="word-wrapper">
      <div
        class="word-container"
        :class="{ ready: isReady }"
        :style="{ transform: `translateX(-${offset}px)` }"
      >
        <span ref="beforeRef" class="before">{{ wordParts.before }}</span>
        <span ref="anchorRef" class="anchor">{{ wordParts.anchor }}</span>
        <span class="after">{{ wordParts.after }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <button v-else class="empty-state" @click="emit('loadRequest')">
      <span class="empty-text">Load a document to start reading</span>
    </button>
  </div>
</template>

<style scoped>
.reader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.focal-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 1.2em;
  background: var(--color-anchor);
  opacity: 0.25;
  pointer-events: none;
  z-index: 1;
}

.word-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.word-container {
  display: inline-block;
  white-space: nowrap;
  visibility: hidden;
}

.word-container.ready {
  visibility: visible;
}

.before,
.after {
  color: var(--color-text);
}

.anchor {
  color: var(--color-anchor);
  font-weight: 500;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 1rem 2rem;
  border-radius: 8px;
  transition: background 0.15s;
}

.empty-state:hover {
  background: var(--color-surface);
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 1rem;
}

.empty-state:hover .empty-text {
  color: var(--color-text);
}
</style>
