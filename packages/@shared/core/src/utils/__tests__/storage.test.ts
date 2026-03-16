import { setStorageAdapter, getItem, setItem, removeItem } from '../storage';
import type { StorageAdapter } from '../storage';

function createMockStorage(): StorageAdapter & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: async (key: string) => store[key] ?? null,
    setItem: async (key: string, value: string) => { store[key] = value; },
    removeItem: async (key: string) => { delete store[key]; },
  };
}

describe('storage', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    setStorageAdapter(mockStorage);
  });

  it('setItem + getItem 으로 객체 저장/조회', async () => {
    await setItem('test', { score: 100, name: 'player' });
    const result = await getItem<{ score: number; name: string }>('test');
    expect(result).toEqual({ score: 100, name: 'player' });
  });

  it('존재하지 않는 키는 null 반환', async () => {
    const result = await getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('removeItem으로 삭제', async () => {
    await setItem('temp', 'data');
    await removeItem('temp');
    expect(await getItem('temp')).toBeNull();
  });

  it('잘못된 JSON은 null 반환', async () => {
    mockStorage.store['bad'] = 'not-json{{{';
    const result = await getItem('bad');
    expect(result).toBeNull();
  });

  it('배열 저장/조회', async () => {
    await setItem('arr', [1, 2, 3]);
    expect(await getItem<number[]>('arr')).toEqual([1, 2, 3]);
  });
});
