import { createStore } from 'zustand/vanilla';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = '@minigame/highscores';

export interface ScoreState {
  highScores: Record<string, number>;
  loaded: boolean;
}

export interface ScoreActions {
  loadScores: () => Promise<void>;
  updateHighScore: (gameId: string, score: number) => Promise<boolean>;
  getHighScore: (gameId: string) => number;
  resetScores: () => Promise<void>;
}

export type ScoreStore = ScoreState & ScoreActions;

export function createScoreStore() {
  return createStore<ScoreStore>((set, get) => ({
    highScores: {},
    loaded: false,

    loadScores: async () => {
      const saved = await getItem<Record<string, number>>(STORAGE_KEY);
      if (saved) {
        set({ highScores: saved, loaded: true });
      } else {
        set({ loaded: true });
      }
    },

    updateHighScore: async (gameId: string, score: number) => {
      const current = get().highScores[gameId] ?? 0;
      if (score <= current) return false;

      const newScores = { ...get().highScores, [gameId]: score };
      set({ highScores: newScores });
      await setItem(STORAGE_KEY, newScores);
      return true;
    },

    getHighScore: (gameId: string) => {
      return get().highScores[gameId] ?? 0;
    },

    resetScores: async () => {
      set({ highScores: {} });
      await setItem(STORAGE_KEY, {});
    },
  }));
}
