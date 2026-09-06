import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('citizen can find a ward, compare, and open the actual source', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('横浜の暮らし');
  await page.getByRole('link', { name: '港北区', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('港北区の、いまを知る。');
  await expect(page.locator('.stats a.source-icon').first()).toHaveAttribute(
    'href',
    /www\.city\.yokohama\.lg\.jp\/.*\.html$/,
  );
  await page.getByRole('link', { name: 'ほかの区と比べる →' }).click();
  await page.getByLabel('比べる指標').selectOption('household_size');
  await expect(page.locator('#value-heading')).toContainText('1世帯あたり人数');
  await page.getByLabel('統計の時点').selectOption('2024-01-01');
  await expect(page.locator('#comparison-body tr')).toHaveCount(18);
  const link = page.locator('#comparison-body a.cite').first();
  await expect(link).toHaveAccessibleName('横浜市の掲載ページを開く');
  const href = (await link.getAttribute('href')) ?? '';
  expect(href).toMatch(/^https:\/\/www\.city\.yokohama\.lg\.jp\//);
  expect(href).not.toMatch(/\.csv(?:[?#]|$)/);
  expect(href).toMatch(/\.html(?:[?#]|$)/);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveText('');
  const response = await page.request.get(href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/html');
  expect(await response.text()).toContain('横浜市');
});
test('reading mode preserves the facts and limitations', async ({ page }) => {
  await page.goto('/issues/population/');
  const facts = await page.locator('.fact-list').textContent();
  await expect(page.locator('#reading-details')).toBeHidden();
  await page.getByRole('button', { name: '詳しく読む' }).click();
  await expect(page.locator('#reading-details')).toBeVisible();
  expect(await page.locator('.fact-list').textContent()).toBe(facts);
  await expect(page.getByText('まだ分からないこと', { exact: true })).toBeVisible();
});
test('local search handles Japanese and zero results without a server request', async ({
  page,
}) => {
  await page.goto('/search/');
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.getByRole('searchbox').fill('都筑');
  await expect(page.locator('#search-results .result')).toHaveCount(1);
  await page.getByRole('searchbox').fill('<script>not-a-query</script>');
  await expect(page.getByRole('status')).toContainText('0件');
  expect(requests).toHaveLength(0);
});
test('core pages have no serious accessibility defects or horizontal overflow', async ({
  page,
}) => {
  for (const path of ['/', '/wards/', '/issues/population/', '/search/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
test('invalid route returns real 404', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ページが見つかりません');
});

test('comparison controls wait for their code on a slow connection', async ({ page }) => {
  let release: (() => void) | undefined;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/_astro/*.js', async (route) => {
    await delayed;
    await route.continue();
  });
  await page.goto('/wards/', { waitUntil: 'commit' });
  await expect(page.getByLabel('比べる指標')).toBeDisabled();
  release?.();
  await expect(page.getByLabel('比べる指標')).toBeEnabled();
  await page.getByLabel('比べる指標').selectOption('household_size');
  await expect(page.locator('#value-heading')).toContainText('1世帯あたり人数');
});
