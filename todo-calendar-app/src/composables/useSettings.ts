import { ref, watch } from 'vue';

export interface NotificationSettings {
  daysBefore: number[]; // Array of days before exam to send notifications (e.g., [7, 3])
}

const defaultSettings: NotificationSettings = {
  daysBefore: [7, 3] // Default: 7 days and 3 days before
};

// Load settings from localStorage
function loadSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return { ...defaultSettings };
}

// Save settings to localStorage
function saveSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

const settings = ref<NotificationSettings>(loadSettings());

// Watch for changes and save
watch(settings, (newSettings) => {
  saveSettings(newSettings);
}, { deep: true });

export function useSettings() {
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const resetSettings = () => {
    settings.value = { ...defaultSettings };
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
}


