<script setup lang="ts">
import { ref } from 'vue'
import type { Document } from '@/types'
import { parseEpub } from '@/utils/epubParser'
import { parseText } from '@/utils/textParser'

const emit = defineEmits<{
  documentLoaded: [doc: Document]
}>()

const isOpen = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const textInput = ref('')
const textTitle = ref('')
const activeTab = ref<'epub' | 'text'>('epub')
const isDragging = ref(false)

function open() {
  isOpen.value = true
}

defineExpose({ open })

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await loadEpub(file)
  }
}

async function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file && file.name.endsWith('.epub')) {
    await loadEpub(file)
  } else {
    error.value = 'Please drop a valid EPUB file'
  }
}

async function loadEpub(file: File) {
  isLoading.value = true
  error.value = null

  try {
    const doc = await parseEpub(file)
    emit('documentLoaded', doc)
    isOpen.value = false
    textInput.value = ''
    textTitle.value = ''
  } catch (e) {
    error.value = `Failed to load EPUB: ${e instanceof Error ? e.message : 'Unknown error'}`
  } finally {
    isLoading.value = false
  }
}

function loadText() {
  if (!textInput.value.trim()) {
    error.value = 'Please enter some text'
    return
  }

  const doc = parseText(textInput.value, textTitle.value || 'Pasted Text')
  emit('documentLoaded', doc)
  isOpen.value = false
  textInput.value = ''
  textTitle.value = ''
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}
</script>

<template>
  <div class="file-upload">
    <button class="upload-toggle" @click="isOpen = true" title="Load document">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span>Load</span>
    </button>

    <!-- Modal -->
    <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Load Document</h2>
          <button class="modal-close" @click="isOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'epub' }"
            @click="activeTab = 'epub'"
          >
            EPUB File
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'text' }"
            @click="activeTab = 'text'"
          >
            Paste Text
          </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="error">{{ error }}</div>

        <!-- EPUB Tab -->
        <div v-if="activeTab === 'epub'" class="tab-content">
          <div
            class="drop-zone"
            :class="{ dragging: isDragging, loading: isLoading }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <div v-if="isLoading" class="loading-spinner"></div>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p>Drop EPUB file here or click to browse</p>
              <input
                type="file"
                accept=".epub"
                class="file-input"
                @change="handleFileSelect"
              />
            </template>
          </div>
        </div>

        <!-- Text Tab -->
        <div v-if="activeTab === 'text'" class="tab-content">
          <input
            v-model="textTitle"
            type="text"
            class="text-title-input"
            placeholder="Title (optional)"
          />
          <textarea
            v-model="textInput"
            class="text-input"
            placeholder="Paste your text here..."
          ></textarea>
          <button class="load-text-btn" @click="loadText" :disabled="!textInput.trim()">
            Load Text
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 100;
}

.upload-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s;
}

.upload-toggle:hover {
  background: var(--color-surface-hover);
}

.upload-toggle svg {
  width: 18px;
  height: 18px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal {
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--color-bg);
}

.modal-close svg {
  width: 18px;
  height: 18px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;
}

.tab:hover {
  background: var(--color-bg);
}

.tab.active {
  color: var(--color-accent);
  box-shadow: inset 0 -2px 0 var(--color-accent);
}

.error {
  margin: 1rem 1.25rem 0;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 100, 100, 0.1);
  color: #ff6464;
  font-size: 0.875rem;
}

.tab-content {
  padding: 1.25rem;
}

.drop-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--color-accent);
  background: rgba(255, 255, 255, 0.02);
}

.drop-zone.loading {
  pointer-events: none;
}

.drop-zone svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.drop-zone p {
  margin: 0;
  text-align: center;
  font-size: 0.875rem;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.text-title-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
}

.text-title-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.text-input {
  width: 100%;
  height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  resize: vertical;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.load-text-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-bg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    opacity 0.15s;
}

.load-text-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.load-text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
