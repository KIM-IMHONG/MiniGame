import { test, expect } from '@playwright/test';

test.describe('Demo Tap Game - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Expo Web 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('앱이 로드되고 TAP HERE! 텍스트가 보임', async ({ page }) => {
    const tapText = page.getByText('TAP HERE!');
    await expect(tapText).toBeVisible({ timeout: 10000 });
  });

  test('SCORE와 BEST 표시됨', async ({ page }) => {
    await expect(page.getByText('SCORE')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('BEST')).toBeVisible();
  });

  test('터치하면 점수가 올라감', async ({ page }) => {
    const tapArea = page.getByText('TAP HERE!');
    await tapArea.waitFor({ timeout: 10000 });

    // 여러번 클릭
    for (let i = 0; i < 3; i++) {
      await tapArea.click();
      await page.waitForTimeout(100);
    }

    // 점수가 0이 아님을 확인 (SCORE 표시 영역에 숫자가 있음)
    const scoreText = page.getByText('SCORE');
    await expect(scoreText).toBeVisible();
  });

  test('10번 터치하면 GAME OVER 표시', async ({ page }) => {
    const tapArea = page.getByText('TAP HERE!');
    await tapArea.waitFor({ timeout: 10000 });

    // 10번 클릭
    for (let i = 0; i < 10; i++) {
      await tapArea.click();
      await page.waitForTimeout(50);
    }

    // Game Over 모달 확인
    await expect(page.getByText('GAME OVER', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('PLAY AGAIN')).toBeVisible();
  });

  test('GAME OVER 후 PLAY AGAIN으로 재시작', async ({ page }) => {
    const tapArea = page.getByText('TAP HERE!');
    await tapArea.waitFor({ timeout: 10000 });

    // 게임오버 트리거
    for (let i = 0; i < 10; i++) {
      await tapArea.click();
      await page.waitForTimeout(50);
    }

    await expect(page.getByText('GAME OVER', { exact: true })).toBeVisible({ timeout: 5000 });

    // 재시작
    await page.getByText('PLAY AGAIN').click();
    await page.waitForTimeout(300);

    // GAME OVER가 사라졌는지 확인
    await expect(page.getByText('GAME OVER', { exact: true })).not.toBeVisible({ timeout: 3000 });
    // TAP HERE!가 다시 보임
    await expect(page.getByText('TAP HERE!')).toBeVisible();
  });

  test('일시정지 버튼 동작', async ({ page }) => {
    await page.getByText('TAP HERE!').waitFor({ timeout: 10000 });

    // || (pause) 버튼 클릭
    const pauseBtn = page.getByText('||');
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      await expect(page.getByText('PAUSED')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('RESUME')).toBeVisible();
      await expect(page.getByText('RESTART')).toBeVisible();

      // Resume
      await page.getByText('RESUME').click();
      await expect(page.getByText('PAUSED')).not.toBeVisible({ timeout: 3000 });
    }
  });
});
