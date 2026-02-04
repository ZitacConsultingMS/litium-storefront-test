import { expect, test } from 'utils/axe-test';

const testProductListUrl =
  process.env.TEST_PRODUCT_LIST_URL ?? '/product-list-page';

test.describe('Test WCAG for Product List Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testProductListUrl);
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
