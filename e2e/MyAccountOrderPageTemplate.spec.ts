import { setupAuthenticate } from 'utils/authenticate';
import { expect, test } from 'utils/axe-test';

// Get the username and password from the environment variables or use the default values
const USERNAME = process.env.TEST_USERNAME ?? 'admin';
const PASSWORD = process.env.TEST_PASSWORD ?? '123$';

// Get the test URL from the environment variables or use the default value
const testMyOrderUrl =
  process.env.TEST_MY_ACCOUNT_ORDER_URL ??
  '/my-account/order?orderId=T3JkZXIKZEl0ZW1TeXN0ZW1JZD0wNTY0NDIzNzg3YmU0NTUyODVhNDU5NmY5ZDhjNDFlYSZDaGFubmVsU3lzdGVtSWQ9ZjkxNTAxZTY5OGI0NGQ5MThmNjU2NjQyMDI2YTE4YjA%3D';

test.describe('Test WCAG for My account - Order Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticate(page, USERNAME, PASSWORD);
    await page.goto(testMyOrderUrl);
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
