import { createStore } from 'zustand/vanilla';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = '@minigame/settings';

export interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  musicEnabled: boolean;
  loaded: boolean;
}

export interface SettingsActions {
  loadSettings: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleHaptic: () => Promise<void>;
  toggleMusic: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

export type SettingsStore = SettingsState & SettingsActions;

const DEFAULT_SETTINGS: Omit<SettingsState, 'loaded'> = {
  soundEnabled: true,
  hapticEnabled: true,
  musicEnabled: true,
};

export function createSettingsStore() {
  return createStore<SettingsStore>((set, get) => ({
    ...DEFAULT_SETTINGS,
    loaded: false,

    loadSettings: async () => {
      const saved = await getItem<Omit<SettingsState, 'loaded'>>(STORAGE_KEY);
      if (saved) {
        set({ ...saved, loaded: true });
      } else {
        set({ loaded: true });
      }
    },

    toggleSound: async () => {
      const newVal = !get().soundEnabled;
      set({ soundEnabled: newVal });
      await persistSettings(get());
    },

    toggleHaptic: async () => {
      const newVal = !get().hapticEnabled;
      set({ hapticEnabled: newVal });
      await persistSettings(get());
    },

    toggleMusic: async () => {
      const newVal = !get().musicEnabled;
      set({ musicEnabled: newVal });
      await persistSettings(get());
    },

    resetSettings: async () => {
      set({ ...DEFAULT_SETTINGS });
      await setItem(STORAGE_KEY, DEFAULT_SETTINGS);
    },
  }));
}

async function persistSettings(state: SettingsStore): Promise<void> {
  const { soundEnabled, hapticEnabled, musicEnabled } = state;
  await setItem(STORAGE_KEY, { soundEnabled, hapticEnabled, musicEnabled });
}
