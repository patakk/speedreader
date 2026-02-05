<script setup lang="ts">
import { ref } from 'vue'
import { FONT_OPTIONS, type Settings } from '@/types'

defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  updateSetting: [key: keyof Settings, value: Settings[keyof Settings]]
}>()

const isOpen = ref(false)
</script>

<template>
  <div class="settings-panel" :class="{ open: isOpen }">
    <!-- Backdrop to close on outside click -->
    <div v-if="isOpen" class="settings-backdrop" @click="isOpen = false"></div>

    <button class="settings-toggle" @click="isOpen = !isOpen" title="Settings">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </button>

    <div class="settings-content">
      <h3 class="settings-title">Settings</h3>

      <!-- Theme -->
      <div class="setting-group">
        <label class="setting-label">Theme</label>
        <div class="setting-buttons">
          <button
            class="setting-btn"
            :class="{ active: settings.theme === 'dark' }"
            @click="emit('updateSetting', 'theme', 'dark')"
          >
            Dark
          </button>
          <button
            class="setting-btn"
            :class="{ active: settings.theme === 'light' }"
            @click="emit('updateSetting', 'theme', 'light')"
          >
            Light
          </button>
        </div>
      </div>

      <!-- Font Family -->
      <div class="setting-group">
        <label class="setting-label">Font</label>
        <select
          class="setting-select"
          :value="settings.fontFamily"
          @change="emit('updateSetting', 'fontFamily', ($event.target as HTMLSelectElement).value)"
        >
          <optgroup label="Sans Serif">
            <option
              v-for="font in FONT_OPTIONS.filter((f) => f.category === 'sans-serif')"
              :key="font.name"
              :value="font.family"
              :style="{ fontFamily: font.family }"
            >
              {{ font.name }}
            </option>
          </optgroup>
          <optgroup label="Serif">
            <option
              v-for="font in FONT_OPTIONS.filter((f) => f.category === 'serif')"
              :key="font.name"
              :value="font.family"
              :style="{ fontFamily: font.family }"
            >
              {{ font.name }}
            </option>
          </optgroup>
          <optgroup label="Monospace">
            <option
              v-for="font in FONT_OPTIONS.filter((f) => f.category === 'monospace')"
              :key="font.name"
              :value="font.family"
              :style="{ fontFamily: font.family }"
            >
              {{ font.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Font Size -->
      <div class="setting-group">
        <label class="setting-label">
          Font Size
          <span class="setting-value">{{ settings.fontSize }}px</span>
        </label>
        <input
          type="range"
          class="setting-slider"
          min="24"
          max="96"
          step="2"
          :value="settings.fontSize"
          @input="emit('updateSetting', 'fontSize', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <!-- Focal Line -->
      <div class="setting-group">
        <label class="setting-label">
          Focal Line
          <button
            class="setting-toggle-btn"
            :class="{ active: settings.showFocalLine }"
            @click="emit('updateSetting', 'showFocalLine', !settings.showFocalLine)"
          >
            {{ settings.showFocalLine ? 'On' : 'Off' }}
          </button>
        </label>
      </div>

      <!-- Pause Settings -->
      <div class="setting-group">
        <label class="setting-label">
          Comma Pause
          <span class="setting-value">{{ Math.round((settings.commaPauseMultiplier - 1) * 100) }}%</span>
        </label>
        <input
          type="range"
          class="setting-slider"
          min="1"
          max="2"
          step="0.1"
          :value="settings.commaPauseMultiplier"
          @input="emit('updateSetting', 'commaPauseMultiplier', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">
          Period Pause
          <span class="setting-value">{{ Math.round((settings.periodPauseMultiplier - 1) * 100) }}%</span>
        </label>
        <input
          type="range"
          class="setting-slider"
          min="1"
          max="3"
          step="0.1"
          :value="settings.periodPauseMultiplier"
          @input="emit('updateSetting', 'periodPauseMultiplier', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">
          Paragraph Pause
          <span class="setting-value">{{ settings.paragraphPauseMs }}ms</span>
        </label>
        <input
          type="range"
          class="setting-slider"
          min="0"
          max="1000"
          step="50"
          :value="settings.paragraphPauseMs"
          @input="emit('updateSetting', 'paragraphPauseMs', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">
          Chapter Pause
          <span class="setting-value">{{ settings.chapterPauseMs }}ms</span>
        </label>
        <input
          type="range"
          class="setting-slider"
          min="0"
          max="3000"
          step="100"
          :value="settings.chapterPauseMs"
          @input="emit('updateSetting', 'chapterPauseMs', Number(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
}

.settings-toggle {
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
  transition: background 0.15s, transform 0.15s;
}

.settings-toggle:hover {
  background: var(--color-surface-hover);
}

.settings-toggle svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.settings-panel.open .settings-toggle svg {
  transform: rotate(90deg);
}

.settings-content {
  position: absolute;
  top: 52px;
  right: 0;
  width: 280px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition:
    opacity 0.2s,
    visibility 0.2s,
    transform 0.2s;
}

.settings-panel.open .settings-content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.settings-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.setting-value {
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.setting-buttons {
  display: flex;
  gap: 0.5rem;
}

.setting-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.setting-btn:hover {
  border-color: var(--color-text-muted);
}

.setting-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}

.setting-toggle-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.setting-toggle-btn:hover {
  border-color: var(--color-text-muted);
}

.setting-toggle-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg);
}

.setting-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.setting-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border);
  border-radius: 2px;
  outline: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
}

.setting-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
}
</style>
