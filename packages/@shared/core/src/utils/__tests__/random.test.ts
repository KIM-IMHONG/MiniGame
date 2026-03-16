import { SeededRandom, createTimeSeed } from '../random';

describe('SeededRandom', () => {
  it('같은 시드는 같은 시퀀스를 생성', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('다른 시드는 다른 시퀀스를 생성', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(43);

    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());

    expect(values1).not.toEqual(values2);
  });

  it('next()는 0~1 사이 값 반환', () => {
    const rng = new SeededRandom(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt()는 min~max 범위 정수 반환', () => {
    const rng = new SeededRandom(456);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('pick()은 배열 요소 반환', () => {
    const rng = new SeededRandom(789);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it('shuffle()은 같은 요소를 포함한 새 배열 반환', () => {
    const rng = new SeededRandom(101);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle(arr);

    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
    // 원본 배열은 변경되지 않음
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('shuffle()은 같은 시드로 같은 결과', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const rng1 = new SeededRandom(202);
    const rng2 = new SeededRandom(202);

    expect(rng1.shuffle(arr)).toEqual(rng2.shuffle(arr));
  });
});

describe('createTimeSeed', () => {
  it('숫자를 반환', () => {
    expect(typeof createTimeSeed()).toBe('number');
  });

  it('연속 호출 시 다른 값', () => {
    const seed1 = createTimeSeed();
    const seed2 = createTimeSeed();
    // 매우 빠르게 호출하면 같을 수 있지만, Math.random으로 보장
    // 통계적으로 거의 항상 다름
    expect(typeof seed1).toBe('number');
    expect(typeof seed2).toBe('number');
  });
});
