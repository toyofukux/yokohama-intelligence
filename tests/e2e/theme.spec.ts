import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { yokohamaSunTimes } from '../../packages/core/theme';

test.use({ timezoneId: 'America/Los_Angeles' });

test('blue theme is used today and every palette stays readable', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-05T00:00:00Z'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
  for (const theme of ['yokohama', 'yokohama-night', 'green-expo']) {
    await page.goto(`/?theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', `/favicon-${theme}.svg`);
  }
});
test('static HTML switches at sunset and sunrise without reload, even outside Japan', async ({
  page,
}) => {
  const sun = yokohamaSunTimes(Date.parse('2026-09-05T12:00:00+09:00'));
  await page.clock.install({ time: new Date(sun.sunset - 1000) });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
  await page.clock.fastForward(61000);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama-night');
  await page.clock.setSystemTime(new Date('2026-09-06T00:00:00+09:00'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama-night');
  const tomorrow = yokohamaSunTimes(Date.parse('2026-09-06T12:00:00+09:00'));
  await page.clock.setSystemTime(new Date(tomorrow.sunrise));
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
});
test('night remains readable on comparisons, search, and ward detail', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-05T23:00:00+09:00'));
  for (const path of ['/wards/', '/search/', '/wards/naka/']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama-night');
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});
test('unknown preview values fall back to the scheduled theme', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-05T00:00:00Z'));
  await page.goto('/?theme=invalid');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'yokohama');
});
