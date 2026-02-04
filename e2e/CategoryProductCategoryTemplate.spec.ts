import { expect, test } from 'utils/axe-test';

const testCategoryUrl = process.env.TEST_CATEGORY_URL ?? '/woman';

test.describe('Test WCAG for Category Product Category Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testCategoryUrl);
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
