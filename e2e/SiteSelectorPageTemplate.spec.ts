import { expect, test } from 'utils/axe-test';
const testSiteSelectorUrl =
  process.env.TEST_SITE_SELECTOR_URL ?? '/test-site-selector';
test.describe('Test WCAG for Site Selector Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testSiteSelectorUrl);
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
