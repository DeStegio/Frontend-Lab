import { expect, test, type Page } from '@playwright/test';

const status = (page: Page) => page.getByRole('status').first();
const stickers = (page: Page) =>
  page.getByRole('list', { name: 'Active conditions' }).getByRole('listitem');

/** On phones the controls live in a bottom sheet. */
async function openControls(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: /^Controls/ }).click();
}

test.describe('playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('the store works with every control at default', async ({ page }) => {
    await expect(status(page)).toContainText(/Idle/);
    await page.getByRole('button', { name: 'Add Ceramic Mug to cart' }).click();
    await expect(page.getByRole('button', { name: 'Cart, 1 item' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search products' }).fill('lamp');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Desk Lamp' })).toBeVisible();
  });

  test('a quick mode changes how the store behaves', async ({ page, isMobile }) => {
    await openControls(page, isMobile);
    await page.getByRole('button', { name: 'Slow network' }).click();
    if (isMobile) await page.getByRole('button', { name: 'Close controls' }).click();

    await expect(stickers(page)).toContainText(['latency 6 s']);
    await expect(page.getByRole('img', { name: 'Server mood: snoozing' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Kitchen', exact: true }).click();
    // 6 s latency: the request is visibly in flight before it lands.
    await expect(page.locator('[aria-busy="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Glass Carafe' })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('offline shows the banner and the no-connection state', async ({ page, isMobile }) => {
    if (isMobile) await page.getByRole('button', { name: 'Offline' }).click();
    else await page.getByRole('switch', { name: /Offline/ }).check();
    await expect(page.getByText('You’re offline.')).toBeVisible();
    await page.getByRole('button', { name: 'Desk', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'No connection' })).toBeVisible();
  });

  test('chaos counts down, engages, and reset puts everything back', async ({ page, isMobile }) => {
    const engage = isMobile
      ? page.getByRole('button', { name: 'Chaos', exact: true })
      : page.getByRole('button', { name: 'Engage chaos' });
    await engage.click();
    await expect(status(page)).toContainText(/Chaos/, { timeout: 5_000 });
    await expect(stickers(page).first()).toBeVisible();

    await page.getByRole('button', { name: 'Reset all conditions' }).click();
    await expect(page.getByText(/Fresh start\./).first()).toBeVisible();
    await expect(status(page)).toContainText(/Idle/);
    await expect(page.getByRole('button', { name: 'Cart, 0 items' })).toBeVisible();
  });

  test('controls work from the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard flow is checked on desktop');
    const latency = page.getByRole('slider', { name: 'Latency' });
    await latency.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(latency).toHaveAttribute('aria-valuetext', '1 s');
    await expect(stickers(page)).toContainText(['latency 1 s']);
    await page.getByRole('button', { name: 'Remove latency' }).focus();
    await page.keyboard.press('Enter');
    await expect(latency).toHaveAttribute('aria-valuetext', 'instant');
  });

  test('the mobile sheet opens and closes with Escape', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Phone layout only');
    await openControls(page, isMobile);
    const sheet = page.getByRole('dialog', { name: 'Lab controls' });
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('taps inside the sheet keep it open; the backdrop closes it', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Phone layout only');
    await openControls(page, isMobile);
    const sheet = page.getByRole('dialog', { name: 'Lab controls' });
    const box = (await sheet.boundingBox())!;
    await page.mouse.click(box.x + 4, box.y + box.height / 2); // the sheet's own edge padding
    await expect(sheet).toBeVisible();
    await page.mouse.click(box.x + box.width / 2, Math.max(4, box.y - 40)); // backdrop above it
    await expect(sheet).toBeHidden();
  });

  test('extreme content stays inside the screen', async ({ page, isMobile }) => {
    await openControls(page, isMobile);
    await page.getByRole('button', { name: 'Wordy' }).click();
    if (isMobile) await page.getByRole('button', { name: 'Close controls' }).click();
    await expect(page.getByRole('heading', { name: /Çéråmîç|Céråmîç/ })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
