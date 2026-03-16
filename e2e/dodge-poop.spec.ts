import { test, expect } from '@playwright/test';

test.describe('Dodge Poop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should load the app without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.reload();
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test('should display score bar', async ({ page }) => {
    const scoreText = page.getByText('0');
    await expect(scoreText.first()).toBeVisible();
  });

  test('should display player character', async ({ page }) => {
    // Player is rendered with emoji
    await page.waitForTimeout(1000);
    // Take screenshot to verify
    await page.screenshot({ path: 'e2e/screenshots/dodge-poop.png' });
  });

  test('should spawn falling objects over time', async ({ page }) => {
    // Wait for objects to spawn
    await page.waitForTimeout(3000);
    // Poop emoji should appear
    const poop = page.getByText('💩');
    await expect(poop.first()).toBeVisible({ timeout: 5000 });
  });

  test('should respond to mouse movement', async ({ page }) => {
    // Move mouse across the game area
    await page.mouse.move(100, 400);
    await page.mouse.down();
    await page.mouse.move(200, 400);
    await page.mouse.up();
    await page.waitForTimeout(500);
    // Game should still be running
    const scoreText = page.getByText(/\d+/);
    await expect(scoreText.first()).toBeVisible();
  });
});
