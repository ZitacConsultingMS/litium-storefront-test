import { expect, test } from 'utils/axe-test';

// abcd is a non-existent page
const testErrorUrl = process.env.TEST_ERROR_URL ?? '/abcd';

test.describe('Test WCAG for Error Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testErrorUrl);
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
