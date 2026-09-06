import { expect, test } from '@playwright/test';
import candidates from '../../data/editorial/issues.json' with { type: 'json' };

test('every issue exposes its reviewed wording and traceable evidence', async ({ page }) => {
  for (const issue of candidates) {
    await page.goto(`/issues/${issue.slug}/`);
    await expect(page.locator('h1')).toHaveText(issue.title);
    await expect(page.locator('.lede')).toHaveText(issue.summary);
    await expect(page.getByText(issue.limits, { exact: false }).first()).toBeVisible();
    const evidence = page.getByTestId('claim-evidence');
    await expect(page.getByTestId('editorial-verification')).toBeHidden();
    await evidence.locator('> summary').click();
    await expect(page.getByTestId('editorial-verification')).toContainText(
      '人間による確認は未実施',
    );
    expect(await evidence.locator('a[href^="https://"]').count()).toBeGreaterThan(0);
    await evidence.locator('details > summary').first().click();
    await expect(evidence.locator('pre').first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
