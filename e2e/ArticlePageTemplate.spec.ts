import { expect, test } from 'utils/axe-test';

const testArticleUrl = process.env.TEST_ARTICLE_URL ?? '/terms-and-conditions';

test.describe('Test WCAG for Article Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testArticleUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      makeAxeBuilder,
    }) => {
      const result = await makeAxeBuilder().analyze();
      expect(result.violations).toEqual([]);
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {});
});
