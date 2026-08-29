import { expect, test } from '@playwright/test';

test('Clerk sign-in card mounts for signed-out visitors', async ({ page }) => {
  await page.goto('/');

  const authMount = page.locator('#clerkAuthMount');
  await expect(authMount.locator('input').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#appView')).toBeHidden();
});

test('sign-up path is offered next to sign-in', async ({ page }) => {
  await page.goto('/');

  const authMount = page.locator('#clerkAuthMount');
  await expect(authMount.getByRole('link', { name: /sign up/i })).toBeVisible({ timeout: 20_000 });
});
