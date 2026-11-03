import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// UI state slice — manages global UI concerns like loading and dark mode.
interface UiState {
  globalLoading: boolean;
  darkMode: boolean;
}

// Hydrate dark mode preference from localStorage to prevent flash of wrong theme
const getInitialDarkMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Respect system preference if no stored preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState: UiState = {
  globalLoading: false,
  darkMode: getInitialDarkMode(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(state.darkMode));
      }
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(state.darkMode));
      }
    },
  },
});

export const { setGlobalLoading, toggleDarkMode, setDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
