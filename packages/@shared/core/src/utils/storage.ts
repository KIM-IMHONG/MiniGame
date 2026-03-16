/**
 * AsyncStorage 래퍼 - 타입 안전한 로컬 저장소
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let storageAdapter: StorageAdapter | null = null;

export function setStorageAdapter(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}

function getAdapter(): StorageAdapter {
  if (!storageAdapter) {
    throw new Error(
      'Storage adapter not initialized. Call setStorageAdapter() first.',
    );
  }
  return storageAdapter;
}

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await getAdapter().getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await getAdapter().setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await getAdapter().removeItem(key);
}
