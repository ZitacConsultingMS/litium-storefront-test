import { Page } from '@playwright/test';
import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

/**
 * This is a note to prepare for testing the checkout page template.
 * Setup country at the BO.
 * Setup direct payment method at the BO.
 * Setup direct shipment method at the BO.
 * Setup a discount code at the BO with code "testFreegift"
 */
const testCheckoutUrl = process.env.TEST_CHECKOUT_URL ?? '/checkout';
const testProductUrl = process.env.TEST_PRODUCT_URL ?? '';

const fillAddressForm = async (page: Page) => {
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="address1"]', '123 Main St');
  // Select country
  await page.click('#dropdown-label-country');
  await page.click('#dropdown-list-country [role="option"]:nth-child(1)');
  await page.fill('input[name="city"]', 'Anytown');
  await page.fill('input[name="zipCode"]', '12345');
  await page.fill('input[name="phoneNumber"]', '1234567890');
  await page.fill('input[name="email"]', 'john.doe@example.com');
};

const addProductToCart = async (page: Page) => {
  await page.goto(testProductUrl);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('buy-button').click();
  await page.waitForLoadState('networkidle');
  const miniCartCount = page.getByTestId('mini-cart__count');
  await expect(miniCartCount).toHaveText('1');
};

test.describe('Test WCAG for Checkout Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await addProductToCart(page);
    await page.goto(testCheckoutUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Confirmation page', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await fillAddressForm(page);
        await page.getByTestId('address-form__submit').click();
        await page.waitForLoadState('networkidle');
        await page.click('[data-testid="listBox__item"]:nth-child(1)');
        await page.waitForLoadState('networkidle');
        await page
          .getByTestId('checkout-wizard__delivery-option-continue')
          .click();
        await page.waitForLoadState('networkidle');
        await page.click('[data-testid="listBox__item"]:nth-child(1)');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('total-summary__place-order').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe("Test rules that axe-core doesn't cover", () => {
      test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
        test('should pass input purpose compliance for user fields using autocomplete', async ({
          page,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await page.click('[data-testid="listBox__item"]:nth-child(1)');
          await page.waitForLoadState('networkidle');
          await page
            .getByTestId('checkout-wizard__delivery-option-continue')
            .click();
          await page.waitForLoadState('networkidle');
          await page.click('[data-testid="listBox__item"]:nth-child(1)');
          await page.waitForLoadState('networkidle');
          await page.getByTestId('total-summary__place-order').click();
          await page.waitForLoadState('networkidle');
          const result = await wcag135Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
    });
    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test('should pass language of parts tests', async ({ page }) => {
        await fillAddressForm(page);
        await page.getByTestId('address-form__submit').click();
        await page.waitForLoadState('networkidle');
        await page.click('[data-testid="listBox__item"]:nth-child(1)');
        await page.waitForLoadState('networkidle');
        await page
          .getByTestId('checkout-wizard__delivery-option-continue')
          .click();
        await page.waitForLoadState('networkidle');
        await page.click('[data-testid="listBox__item"]:nth-child(1)');
        await page.waitForLoadState('networkidle');
        await page.getByTestId('total-summary__place-order').click();
        await page.waitForLoadState('networkidle');
        const result = await wcag312Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });
  });
});
