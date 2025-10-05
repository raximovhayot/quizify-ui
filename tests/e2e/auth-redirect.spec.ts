import { test, expect } from '@playwright/test';

// These smoke tests assert baseline redirect behavior for unauthenticated users.
// They don't rely on a signed-in harness yet.

test.describe('Unauthenticated redirects', () => {
  test('root (/) redirects to /sign-in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('/student redirects to /sign-in?redirect=%2Fstudent', async ({ page }) => {
    await page.goto('/student');
    // redirect param should be URL-encoded
    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fstudent/);
  });
});
