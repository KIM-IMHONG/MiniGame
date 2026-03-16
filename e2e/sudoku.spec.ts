import { test, expect } from '@playwright/test';

test.describe('Sudoku', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('should load the app without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.reload();
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });

  test('should display score bar', async ({ page }) => {
    const scoreText = page.getByText('0');
    await expect(scoreText.first()).toBeVisible();
  });

  test('should display difficulty and timer', async ({ page }) => {
    const mediumText = page.getByText('MEDIUM');
    await expect(mediumText).toBeVisible();

    // Timer should show 0:XX format
    const timer = page.getByText(/^\d+:\d{2}$/);
    await expect(timer.first()).toBeVisible();
  });

  test('should display number pad (1-9)', async ({ page }) => {
    for (let i = 1; i <= 9; i++) {
      const numBtn = page.getByText(String(i), { exact: true });
      await expect(numBtn.first()).toBeVisible();
    }
  });

  test('should display tool buttons', async ({ page }) => {
    await expect(page.getByText('MEMO')).toBeVisible();
    await expect(page.getByText('ERASE')).toBeVisible();
    await expect(page.getByText('HINT')).toBeVisible();
  });

  test('should display mistake indicators', async ({ page }) => {
    // Should show "O O O" (no mistakes yet)
    const indicators = page.getByText('O O O');
    await expect(indicators).toBeVisible();
  });

  test('should take a screenshot for visual verification', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/sudoku.png' });
  });
});
