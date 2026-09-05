import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('blue theme is used today and every palette stays readable', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-05T00:00:00Z'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
  for (const theme of ['yokohama', 'green-expo']) {
    await page.goto(`/?theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', `/favicon-${theme}.svg`);
  }
});
test('deployed static HTML can switch at event dates without a rebuild', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-03-18T14:59:59Z') });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
  await page.clock.fastForward(61000);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'green-expo');
  await page.clock.setSystemTime(new Date('2027-09-26T15:00:00Z'));
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
});
test('unknown preview values fall back to the scheduled theme', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-05T00:00:00Z'));
  await page.goto('/?theme=invalid');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
});
