import { ref } from 'vue';

const isDark = ref(false);

// Get stored preference or system preference
function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  } catch {
    return false;
  }
}

// Apply theme
function applyTheme(dark: boolean) {
  isDark.value = dark;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark);
  }
  try {
    localStorage.setItem('darkMode', dark.toString());
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

// Initialize on first import
if (typeof window !== 'undefined') {
  const initial = getInitialTheme();
  applyTheme(initial);
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    // Only auto-update if user hasn't manually set a preference
    const stored = localStorage.getItem('darkMode');
    if (stored === null) {
      applyTheme(e.matches);
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
}

export function useDarkMode() {
  const toggleDarkMode = () => {
    applyTheme(!isDark.value);
  };
  
  return {
    isDark,
    toggleDarkMode
  };
}

