import { setupAuthenticate } from 'utils/authenticate';
import { expect, test } from 'utils/axe-test';
// Get the username and password from the environment variables or use the default values
const USERNAME = process.env.TEST_USERNAME ?? 'admin';
const PASSWORD = process.env.TEST_PASSWORD ?? '123$';

// Get the test URL from the environment variables or use the default value
const testOrderHistoryUrl =
  process.env.TEST_MY_ACCOUNT_ORDER_HISTORY_URL ?? '/my-account/order-history';
test.describe('Test WCAG for My account - Order history Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticate(page, USERNAME, PASSWORD);
    await page.goto(testOrderHistoryUrl);
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
