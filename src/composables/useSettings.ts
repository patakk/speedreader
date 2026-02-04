import { ref, watch } from 'vue'
import { DEFAULT_SETTINGS, type Settings } from '@/types'

const STORAGE_KEY = 'epub-speed-reader-settings'

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors
  }
}

// Global reactive settings
const settings = ref<Settings>(loadSettings())

// Watch and persist changes
watch(settings, (newSettings) => saveSettings(newSettings), { deep: true })

export function useSettings() {
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    settings.value[key] = value
  }

  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return {
    settings,
    updateSetting,
    resetSettings,
  }
}
