import { createScoreStore } from '../useScoreStore';
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

describe('ScoreStore', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    setStorageAdapter(mockStorage);
  });

  it('초기 상태', () => {
    const store = createScoreStore();
    expect(store.getState().highScores).toEqual({});
    expect(store.getState().loaded).toBe(false);
  });

  it('loadScores - 저장된 데이터 없을 때', async () => {
    const store = createScoreStore();
    await store.getState().loadScores();
    expect(store.getState().loaded).toBe(true);
    expect(store.getState().highScores).toEqual({});
  });

  it('loadScores - 저장된 데이터 있을 때', async () => {
    mockStorage.store['@minigame/highscores'] = JSON.stringify({ bubble: 1000 });
    const store = createScoreStore();
    await store.getState().loadScores();
    expect(store.getState().highScores).toEqual({ bubble: 1000 });
  });

  it('updateHighScore - 새 최고점 갱신', async () => {
    const store = createScoreStore();
    const updated = await store.getState().updateHighScore('bubble', 500);
    expect(updated).toBe(true);
    expect(store.getState().getHighScore('bubble')).toBe(500);
  });

  it('updateHighScore - 기존보다 낮으면 갱신 안 함', async () => {
    const store = createScoreStore();
    await store.getState().updateHighScore('bubble', 500);
    const updated = await store.getState().updateHighScore('bubble', 300);
    expect(updated).toBe(false);
    expect(store.getState().getHighScore('bubble')).toBe(500);
  });

  it('getHighScore - 없는 게임은 0 반환', () => {
    const store = createScoreStore();
    expect(store.getState().getHighScore('nonexistent')).toBe(0);
  });

  it('resetScores', async () => {
    const store = createScoreStore();
    await store.getState().updateHighScore('bubble', 500);
    await store.getState().resetScores();
    expect(store.getState().highScores).toEqual({});
  });

  it('storage에 영속화', async () => {
    const store = createScoreStore();
    await store.getState().updateHighScore('bubble', 1000);
    expect(mockStorage.store['@minigame/highscores']).toBeDefined();
    const saved = JSON.parse(mockStorage.store['@minigame/highscores']);
    expect(saved.bubble).toBe(1000);
  });
});
