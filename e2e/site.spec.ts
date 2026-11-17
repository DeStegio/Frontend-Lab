import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('site', () => {
  test('landing leads into the playground and the about page', async ({ page, isMobile }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Make the web');
    await page.getByRole('link', { name: 'Enter Playground' }).first().click();
    await expect(page).toHaveURL(/\/playground$/);
    await expect(page.getByRole('main', { name: 'Playground' })).toBeVisible();

    if (!isMobile) {
      await page.getByRole('link', { name: 'About' }).click();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('allowed');
    }
  });

  test('the hero server can be poked', async ({ page }) => {
    await page.goto('/');
    const mascot = page.getByRole('button', { name: /Poke the server/ });
    await expect(mascot).toHaveAccessibleName(/happy/);
    await mascot.click();
    await expect(mascot).toHaveAccessibleName(/snoozing/);
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.getByText('404 · ERR NOT FOUND')).toBeVisible();
  });

  for (const path of ['/', '/about', '/playground']) {
    test(`${path} has no serious accessibility violations and no page overflow`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Packets and result pops on the wire are decorative (aria-hidden) and fade by design;
      // their information is also in the LED counter, the incident log and technical details.
      const results = await new AxeBuilder({ page })
        .exclude('.lab-result')
        .exclude('.lab-packet')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      );
      expect(serious, JSON.stringify(serious.map((v) => [v.id, v.nodes.length]))).toEqual([]);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow).toBe(false);
    });
  }
});
