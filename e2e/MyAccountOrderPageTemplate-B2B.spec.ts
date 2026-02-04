import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

// Get the test URL from the environment variables or use the default value
const testMyOrderUrl = process.env.TEST_MY_ACCOUNT_B2B_ORDER_URL ?? '';

test.describe('Test WCAG for My account - Order Page Template', () => {
  test.beforeEach(async ({ b2bPage: { page } }) => {
    await page.goto(testMyOrderUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      makeAxeBuilder,
      b2bPage: { page },
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
          b2bPage: { page },
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
      test.describe('Order Details', () => {
        test.beforeEach(async ({ b2bPage: { page } }) => {
          // Start from the last breadcrumb link
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
          await expect(
            page.getByTestId('breadcrumb-desktop').nth(1)
          ).toBeFocused();
        });

        test('should navigate through order details using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('order-details__repeat-btn')
          ).toBeFocused();
          if (!page.getByTestId('order-details__approve-btn').isDisabled()) {
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('order-details__approve-btn')
            ).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('order-details__print-btn')
          ).toBeFocused();

          const cartLineItem = page.getByTestId('cart-line-item__image');
          const cartLineItemCount = await cartLineItem.count();

          for (let i = 0; i < cartLineItemCount; i++) {
            await page.keyboard.press('Tab');
            await expect(cartLineItem.nth(i)).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('cart-line-item__name').nth(i)
            ).toBeFocused();
          }
        });
        test('should repeat order using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('order-details__repeat-btn')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('order-details__repeat-btn')
          ).toHaveText(''); // show tick icon
        });
        test('should approve order using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab'); // Repeat button
          // Skip if approve button is disabled
          if (
            await page.getByTestId('order-details__approve-btn').isDisabled()
          ) {
            test.skip();
            return;
          }

          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('order-details__approve-btn')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await expect(
            page.getByTestId('order-details__approve-btn')
          ).toBeDisabled();
        });
        test('should print order using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab'); // Repeat button
          if (
            !(await page.getByTestId('order-details__approve-btn').isDisabled())
          ) {
            await page.keyboard.press('Tab'); // Approve button
          }
          await page.keyboard.press('Tab'); // Print button
          await expect(
            page.getByTestId('order-details__print-btn')
          ).toBeFocused();
          // Listen for the dialog event
          await page.evaluate(
            '(() => {window.waitForPrintDialog = new Promise(f => window.print = f);})()'
          );
          await page.keyboard.press('Enter');
          await page.waitForFunction('window.waitForPrintDialog');
        });
      });
    });

    test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
      test('should pass input purpose compliance for user fields using autocomplete', async ({
        b2bPage: { page },
      }) => {
        const result = await wcag135Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });

    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test('should pass language of parts tests', async ({
        b2bPage: { page },
      }) => {
        const result = await wcag312Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });
  });
});
