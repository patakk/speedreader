<script setup lang="ts">
import { ref } from 'vue'
import type { Settings } from '@/types'

defineProps<{
  isPlaying: boolean
  settings: Settings
  currentWordIndex: number
  totalWords: number
}>()

const emit = defineEmits<{
  togglePlay: []
  restart: []
  jumpWords: [count: number]
  jumpToWord: [index: number]
  updateWpm: [wpm: number]
}>()

const showJumpInput = ref(false)
const jumpInputValue = ref('')

function handleJumpSubmit() {
  const index = parseInt(jumpInputValue.value, 10)
  if (!isNaN(index) && index >= 0) {
    emit('jumpToWord', index)
  }
  showJumpInput.value = false
  jumpInputValue.value = ''
}

function openJumpInput(currentIndex: number) {
  jumpInputValue.value = String(currentIndex)
  showJumpInput.value = true
}
</script>

<template>
  <div class="controls">
    <div class="controls-row">
      <!-- Previous word -->
      <button
        class="control-btn"
        @click="emit('jumpWords', -1)"
        title="Previous word (Left)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <!-- Play/Pause -->
      <button
        class="control-btn control-btn-primary"
        @click="emit('togglePlay')"
        :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
      >
        <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!-- Next word -->
      <button
        class="control-btn"
        @click="emit('jumpWords', 1)"
        title="Next word (Right)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <!-- Restart -->
      <button class="control-btn" @click="emit('restart')" title="Restart (R)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>

    <!-- Word position (clickable to jump) -->
    <div class="position-control">
      <button
        v-if="!showJumpInput"
        class="position-btn"
        @click="openJumpInput(currentWordIndex)"
        title="Click to jump to word"
      >
        {{ currentWordIndex }} / {{ totalWords }}
      </button>
      <form v-else class="jump-form" @submit.prevent="handleJumpSubmit">
        <input
          v-model="jumpInputValue"
          type="number"
          min="0"
          :max="totalWords - 1"
          class="jump-input"
          placeholder="Word #"
          autofocus
          @blur="showJumpInput = false"
          @keydown.esc="showJumpInput = false"
        />
        <span class="jump-total">/ {{ totalWords }}</span>
      </form>
    </div>

    <!-- WPM slider -->
    <div class="wpm-control">
      <label class="wpm-label">
        <span class="wpm-value">{{ settings.wpm }} WPM</span>
        <input
          type="range"
          class="wpm-slider"
          min="100"
          max="900"
          step="10"
          :value="settings.wpm"
          @input="emit('updateWpm', Number(($event.target as HTMLInputElement).value))"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.control-btn:hover {
  background: var(--color-surface-hover);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.control-btn-primary {
  width: 56px;
  height: 56px;
  background: var(--color-accent);
  color: var(--color-bg);
}

.control-btn-primary:hover {
  background: var(--color-accent-hover);
}

.control-btn-primary svg {
  width: 24px;
  height: 24px;
}

.position-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.position-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.position-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.jump-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jump-input {
  width: 70px;
  padding: 0.25rem 0.35rem;
  border: 1px solid var(--color-accent);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
  -moz-appearance: textfield;
}

.jump-input::-webkit-outer-spin-button,
.jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.jump-input:focus {
  outline: none;
}

.jump-total {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.wpm-control {
  width: 100%;
  max-width: 300px;
}

.wpm-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.wpm-value {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.wpm-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-surface);
  border-radius: 2px;
  outline: none;
}

.wpm-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
  transition: transform 0.1s;
}

.wpm-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.wpm-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
}
</style>
