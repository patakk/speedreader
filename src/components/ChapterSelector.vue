<script setup lang="ts">
import type { Document } from '@/types'

defineProps<{
  document: Document | null
  currentChapterIndex: number
}>()

const emit = defineEmits<{
  selectChapter: [index: number]
}>()
</script>

<template>
  <div v-if="document && document.chapters.length > 1" class="chapter-selector">
    <label class="chapter-label">Chapter</label>
    <select
      class="chapter-select"
      :value="currentChapterIndex"
      @change="emit('selectChapter', Number(($event.target as HTMLSelectElement).value))"
    >
      <option
        v-for="(chapter, index) in document.chapters"
        :key="index"
        :value="index"
      >
        {{ chapter.title || `Chapter ${index + 1}` }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.chapter-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chapter-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.chapter-select {
  min-width: 180px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.chapter-select:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>
