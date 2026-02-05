<script setup lang="ts">
defineProps<{
  progress: number
  currentWord: number
  totalWords: number
}>()
</script>

<template>
  <div class="progress-bar">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
    <div class="progress-info">
      <span class="progress-count">{{ currentWord + 1 }} / {{ totalWords }}</span>
      <span class="progress-percent">{{ Math.round(progress) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem 1rem;
  background: var(--color-bg);
}

.progress-track {
  height: 3px;
  background: var(--color-surface);
  border-radius: 1.5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 1.5px;
  transition: width 0.1s ease-out;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
