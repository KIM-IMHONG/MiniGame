import { createSettingsStore } from '../useSettingsStore';
import { setStorageAdapter } from '../../utils/storage';
import type { StorageAdapter } from '../../utils/storage';

function createMockStorage(): StorageAdapter & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => { store[key] = value; },
    removeItem: async (key: string) => { delete store[key]; },
  };
}

describe('SettingsStore', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    setStorageAdapter(mockStorage);
  });

  it('기본 설정값', () => {
    const store = createSettingsStore();
    const state = store.getState();
    expect(state.soundEnabled).toBe(true);
    expect(state.hapticEnabled).toBe(true);
    expect(state.musicEnabled).toBe(true);
    expect(state.loaded).toBe(false);
  });

  it('loadSettings - 저장된 설정 로드', async () => {
    mockStorage.store['@minigame/settings'] = JSON.stringify({
      soundEnabled: false,
      hapticEnabled: true,
      musicEnabled: false,
    });
    const store = createSettingsStore();
    await store.getState().loadSettings();
    expect(store.getState().soundEnabled).toBe(false);
    expect(store.getState().musicEnabled).toBe(false);
    expect(store.getState().loaded).toBe(true);
  });

  it('toggleSound', async () => {
    const store = createSettingsStore();
    await store.getState().toggleSound();
    expect(store.getState().soundEnabled).toBe(false);
    await store.getState().toggleSound();
    expect(store.getState().soundEnabled).toBe(true);
  });

  it('toggleHaptic', async () => {
    const store = createSettingsStore();
    await store.getState().toggleHaptic();
    expect(store.getState().hapticEnabled).toBe(false);
  });

  it('toggleMusic', async () => {
    const store = createSettingsStore();
    await store.getState().toggleMusic();
    expect(store.getState().musicEnabled).toBe(false);
  });

  it('resetSettings', async () => {
    const store = createSettingsStore();
    await store.getState().toggleSound();
    await store.getState().toggleHaptic();
    await store.getState().resetSettings();
    expect(store.getState().soundEnabled).toBe(true);
    expect(store.getState().hapticEnabled).toBe(true);
  });

  it('storage에 영속화', async () => {
    const store = createSettingsStore();
    await store.getState().toggleSound();
    const saved = JSON.parse(mockStorage.store['@minigame/settings']);
    expect(saved.soundEnabled).toBe(false);
    expect(saved.hapticEnabled).toBe(true);
  });
});
