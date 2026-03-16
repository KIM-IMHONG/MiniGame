import { calculateGameArea, scaleSize } from '../screen';

describe('calculateGameArea', () => {
  it('기본 옵션으로 게임 영역 계산', () => {
    const area = calculateGameArea({ width: 375, height: 812 });
    expect(area.width).toBe(375);
    expect(area.offsetTop).toBe(60); // scoreBarHeight
    expect(area.offsetBottom).toBe(50); // bannerHeight
    expect(area.height).toBe(812 - 60 - 50);
  });

  it('커스텀 inset 적용', () => {
    const area = calculateGameArea(
      { width: 375, height: 812 },
      { topInset: 44, bottomInset: 34, bannerHeight: 50, scoreBarHeight: 60 },
    );
    expect(area.offsetTop).toBe(44 + 60);
    expect(area.offsetBottom).toBe(34 + 50);
    expect(area.height).toBe(812 - 104 - 84);
  });
});

describe('scaleSize', () => {
  it('기준 375에서 1:1', () => {
    expect(scaleSize(100, 375)).toBe(100);
  });

  it('큰 화면에서 스케일업', () => {
    expect(scaleSize(100, 750)).toBe(200);
  });

  it('작은 화면에서 스케일다운', () => {
    expect(scaleSize(100, 320)).toBeCloseTo(85.33, 1);
  });
});
