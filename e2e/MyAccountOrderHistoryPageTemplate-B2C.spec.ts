import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

// Get the test URL from the environment variables or use the default value
const testOrderHistoryUrl =
  process.env.TEST_MY_ACCOUNT_ORDER_HISTORY_URL ?? '/my-account/order-history';
test.describe('Test WCAG for My account - Order history Page Template - B2C', () => {
  test.beforeEach(async ({ b2cPage: { page } }) => {
    await page.goto(testOrderHistoryUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      b2cPage: { page },
      makeAxeBuilder,
    }) => {
      const result = await makeAxeBuilder(page).analyze();
      expect(result.violations).toEqual([]);
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.describe('Sidebar Navigation', () => {
        test.skip(() => true, 'Already tested in My account dashboard page');
      });
      test.describe('Breadcrumb Navigation', () => {
        test('should navigate through breadcrumb using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Start from the logout button
          await page.getByTestId('logout__button').focus();
          await expect(page.getByTestId('logout__button')).toBeFocused();
          // Move to the breadcrumb
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('breadcrumb-desktop').first()
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('breadcrumb-desktop').nth(1)
          ).toBeFocused();
        });
      });
      test.describe('Order History Table', () => {
        test.beforeEach(async ({ b2cPage: { page } }) => {
          // Start from the last breadcrumb link
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
        });
        test('should navigate through order history table using keyboard', async ({
          b2cPage: { page },
        }) => {
          const orderNumber = page.locator(
            '[data-testid="order-history__order-number"]:visible'
          );
          const orderNumberCount = await orderNumber.count();
          for (let i = 0; i < orderNumberCount; i++) {
            await page.keyboard.press('Tab');
            await expect(orderNumber.nth(i)).toBeFocused();
          }
          const loadMoreButton = page.getByTestId(
            'order-history__loadmore-btn'
          );
          if (await loadMoreButton.isVisible()) {
            await page.keyboard.press('Tab');
            await expect(loadMoreButton).toBeFocused();
          }
        });
        test('should navigate to order details page using keyboard', async ({
          b2cPage: { page },
        }) => {
          const orderNumber = page
            .locator('[data-testid="order-history__order-number"]:visible')
            .first();
          await page.keyboard.press('Tab');
          await expect(orderNumber).toBeFocused();
          const href = await orderNumber.getAttribute('href');
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(href as string);
        });
        test('should load more orders using keyboard', async ({
          b2cPage: { page },
        }) => {
          const loadMoreButton = page.getByTestId(
            'order-history__loadmore-btn'
          );
          if (await loadMoreButton.isVisible()) {
            // Start from the last order number
            const lastOrderNumber = page
              .locator('[data-testid="order-history__order-number"]:visible')
              .last();
            await lastOrderNumber.focus();
            await expect(lastOrderNumber).toBeFocused();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await expect(
              page.getByTestId('order-history__loadmore-btn')
            ).toHaveText('Loading...');
          }
        });
      });
    });

    test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
      test('should pass input purpose compliance for user fields using autocomplete', async ({
        b2cPage: { page },
      }) => {
        const result = await wcag135Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });

    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test('should pass language of parts tests', async ({
        b2cPage: { page },
      }) => {
        const result = await wcag312Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });
  });
});
