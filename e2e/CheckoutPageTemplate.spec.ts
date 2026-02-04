import { Page } from '@playwright/test';
import { expect, test } from 'utils/axe-test';
/**
 * This is a note to prepare for testing the checkout page template.
 * Setup country at the BO.
 * Setup direct payment method at the BO.
 * Setup 2 direct shipment methods at the BO.
 * Setup a discount code at the BO with code "123456"
 */
const DISCOUNT_CODE = '123456';

const fillAddressForm = async (page: Page) => {
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="address1"]', '123 Main St');
  await page.fill('input[name="zipCode"]', '12345');
  await page.fill('input[name="city"]', 'Stockholm');
  // Select country
  await page.click('#dropdown-label-country');
  await page.click('#dropdown-list-country [role="option"]:nth-child(1)');
  await page.fill('input[name="email"]', 'john.doe@example.com');
  await page.fill('input[name="phoneNumber"]', '1234567890');
};

const clearBillingAddressForm = async (page: Page) => {
  await page.fill('input[name="firstName"]', '');
  await page.fill('input[name="lastName"]', '');
  await page.fill('input[name="address1"]', '');
  await page.fill('input[name="city"]', '');
  await page.fill('input[name="zipCode"]', '');
  await page.fill('input[name="phoneNumber"]', '');
  await page.fill('input[name="email"]', '');
};

const addProductToCart = async (page: Page) => {
  const productUrl = process.env.TEST_PRODUCT_URL ?? '';
  await page.goto(productUrl);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('buy-button').click();
  await page.waitForLoadState('networkidle');
  const miniCartCount = page.getByTestId('mini-cart__count');
  await expect(miniCartCount).toHaveText('1');
};

const testCheckoutUrl = process.env.TEST_CHECKOUT_URL ?? '/checkout';

test.describe('Test WCAG for Checkout Page Template', () => {
  test.describe('Axe-core automated tests', () => {
    test.describe('Checkout page - Empty cart', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.goto(testCheckoutUrl);
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Checkout page - Cart with products', () => {
      test.beforeEach(async ({ page }) => {
        await addProductToCart(page);
        await page.goto(testCheckoutUrl);
        await page.waitForLoadState('networkidle');
      });
      test.describe('Step 1 - Delivery address', () => {
        test.describe('Without filled delivery address', () => {
          test('should pass axe-core accessibility tests', async ({
            makeAxeBuilder,
          }) => {
            const result = await makeAxeBuilder().analyze();
            expect(result.violations).toEqual([]);
          });
          test('should pass axe-core accessibility tests with error message displayed', async ({
            page,
            makeAxeBuilder,
          }) => {
            await page.getByTestId('address-form__submit').click();
            await page.waitForLoadState('networkidle');
            const result = await makeAxeBuilder().analyze();
            expect(result.violations).toEqual([]);
          });
        });
        test.describe('With filled delivery address', () => {
          test('should pass axe-core accessibility tests', async ({
            page,
            makeAxeBuilder,
          }) => {
            await fillAddressForm(page);
            const result = await makeAxeBuilder().analyze();
            expect(result.violations).toEqual([]);
          });
        });
      });
      test.describe('Step 2 - Select delivery options', () => {
        test('should pass axe-core accessibility tests', async ({
          page,
          makeAxeBuilder,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Step 3 - Select payment options and billing address and total summary', () => {
        test.describe('Billing address same as delivery address', () => {
          test('should pass axe-core accessibility tests', async ({
            page,
            makeAxeBuilder,
          }) => {
            await fillAddressForm(page);
            await page.getByTestId('address-form__submit').click();
            await page.waitForLoadState('networkidle');
            await page
              .getByTestId('checkout-wizard__delivery-option-continue')
              .click();
            await page.waitForLoadState('networkidle');
            const result = await makeAxeBuilder().analyze();
            expect(result.violations).toEqual([]);
          });
        });
        test.describe('Billing address different from delivery address', () => {
          test.describe('With filled billing address', () => {
            test('should pass axe-core accessibility tests', async ({
              page,
              makeAxeBuilder,
            }) => {
              await fillAddressForm(page);
              await page.getByTestId('address-form__submit').click();
              await page.waitForLoadState('networkidle');
              await page
                .getByTestId('checkout-wizard__delivery-option-continue')
                .click();
              await page.waitForLoadState('networkidle');
              await page.getByTestId('checkout-wizard__checkbox-label').click();
              await page.waitForLoadState('networkidle');
              const result = await makeAxeBuilder().analyze();
              expect(result.violations).toEqual([]);
            });
          });
          test.describe('Without filled billing address', () => {
            test('should pass axe-core accessibility tests', async ({
              page,
              makeAxeBuilder,
            }) => {
              await fillAddressForm(page);
              await page.getByTestId('address-form__submit').click();
              await page.waitForLoadState('networkidle');
              await page
                .getByTestId('checkout-wizard__delivery-option-continue')
                .click();
              await page.waitForLoadState('networkidle');
              await page.getByTestId('checkout-wizard__checkbox-label').click();
              await page.waitForLoadState('networkidle');
              await clearBillingAddressForm(page);
              await page.getByTestId('address-form__submit').click();
              await page.waitForLoadState('networkidle');
              const result = await makeAxeBuilder().analyze();
              expect(result.violations).toEqual([]);
            });
          });
        });
      });
      test.describe('Add discount code', () => {
        test('should pass axe-core accessibility tests', async ({
          page,
          makeAxeBuilder,
        }) => {
          await page.getByTestId('checkout__discount-code--show-input').click();
          await page
            .getByTestId('checkout__discount-code--apply-button')
            .click();
          await page.waitForLoadState('networkidle');
          const result1 = await makeAxeBuilder().analyze();
          expect(result1.violations).toEqual([]);
          await page
            .getByTestId('checkout__discount-code--input')
            .fill(DISCOUNT_CODE);
          await page
            .getByTestId('checkout__discount-code--apply-button')
            .click();
          const result2 = await makeAxeBuilder().analyze();
          expect(result2.violations).toEqual([]);
        });
      });
      test.describe('Update quantity with more option', () => {
        test('should pass axe-core accessibility tests', async ({
          page,
          makeAxeBuilder,
        }) => {
          //select dropdown quantity
          await page
            .getByTestId('quantity-input__select')
            .selectOption('quantityinput.option.more');
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
          await page.getByTestId('quantity-input__input').fill('100');
          await page.getByTestId('quantity-input__input-ok').click();
          await page.waitForLoadState('networkidle');
          const result2 = await makeAxeBuilder().analyze();
          expect(result2.violations).toEqual([]);
        });
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.beforeEach(async ({ page }) => {
      await addProductToCart(page);
      await page.goto(testCheckoutUrl);
      await page.waitForLoadState('networkidle');
    });
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test('should navigate through checkout page using keyboard', async ({
        page,
      }) => {
        // Go to main content through skip to content link
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        // Go through the cart section
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        // Go to delivery address section
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        const continueButton = page.getByTestId('address-form__submit');
        await expect(continueButton).toBeFocused();
      });
      test.describe('Cart Section', () => {
        test('should change quantity select using keyboard', async ({
          page,
        }) => {
          // Go to main content through skip to content link
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          // Go to cart section
          // Change quantity select using keyboard
          await page.keyboard.press('Tab');
          const quantitySelect = page
            .getByTestId('quantity-input__select')
            .first();
          await quantitySelect.selectOption('2');
          await expect(quantitySelect).toHaveValue('2');
        });
        test('should able to add a discount code using keyboard', async ({
          page,
        }) => {
          // Go to main content through skip to content link
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');

          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('checkout__discount-code')
          ).toBeVisible();

          // Add discount code
          await page.keyboard.press('Tab');
          await page.keyboard.type(DISCOUNT_CODE);
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('tag')).toBeVisible();
        });
      });
      test.describe('Delivery Address Section', () => {
        test('should fill delivery address form using keyboard', async ({
          page,
        }) => {
          // Go to main content through skip to content link
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          // Go through the cart section
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          // Go to delivery address section
          await page.keyboard.press('Tab');
          await page.keyboard.type('John');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Doe');
          await page.keyboard.press('Tab');
          await page.keyboard.type('12345');
          await page.keyboard.press('Tab');
          await page.keyboard.type('123 Main St');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Stockholm');
          await page.keyboard.press('Tab');
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Any company');
          await page.keyboard.press('Tab');
          await page.keyboard.type('john.doe@example.com');
          await page.keyboard.press('Tab');
          await page.keyboard.type('1234567890');
          await page.keyboard.press('Tab');
          const continueButton = page.getByTestId('address-form__submit');
          await expect(continueButton).toBeFocused();
        });
        test('should reopen the delivery address form using keyboard', async ({
          page,
        }) => {
          // Go to main content through skip to content link
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          // Go through the cart section
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          // Go to delivery address section
          await page.keyboard.press('Tab');
          await page.keyboard.type('John');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Doe');
          await page.keyboard.press('Tab');
          await page.keyboard.type('12345');
          await page.keyboard.press('Tab');
          await page.keyboard.type('123 Main St');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Stockholm');
          await page.keyboard.press('Tab');
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Any company');
          await page.keyboard.press('Tab');
          await page.keyboard.type('john.doe@example.com');
          await page.keyboard.press('Tab');
          await page.keyboard.type('1234567890');
          await page.keyboard.press('Tab');
          const continueButton = page.getByTestId('address-form__submit');
          await expect(continueButton).toBeFocused();
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await expect(
            page.getByTestId('address-summary__btnEdit')
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('STEP_DELIVERY_ADDRESS')).toBeVisible();
        });
      });
      test.describe('Delivery Options Section', () => {
        test('should select delivery option using keyboard', async ({
          page,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await expect(page.getByTestId('STEP_DELIVERY_OPTION')).toBeVisible();

          const deliveryOptions = page.getByTestId('listBox__item');
          const deliveryCount = await deliveryOptions.count();

          // Go to delivery options section
          await page.keyboard.press('Tab');
          for (let i = 0; i < deliveryCount; i++) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            expect(deliveryOptions.nth(i)).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('checkout-wizard__delivery-option-continue')
          ).toBeFocused();
        });
        test('should reopen the delivery options form using keyboard', async ({
          page,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await expect(page.getByTestId('STEP_DELIVERY_OPTION')).toBeVisible();

          const deliveryOptions = page.getByTestId('listBox__item');
          const deliveryCount = await deliveryOptions.count();

          // Go to delivery options section
          await page.keyboard.press('Tab');
          for (let i = 0; i < deliveryCount; i++) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await expect(deliveryOptions.nth(i)).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('checkout-wizard__delivery-option-continue')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('STEP_DELIVERY_OPTION')).toBeVisible();
        });
      });
      test.describe('Payment Options Section', () => {
        test('should select payment option using keyboard', async ({
          page,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await page
            .getByTestId('checkout-wizard__delivery-option-continue')
            .click();

          const paymentOptions = page.getByTestId('listBox__item');
          const paymentCount = await paymentOptions.count();

          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          for (let i = 0; i < paymentCount; i++) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            expect(paymentOptions.nth(i)).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('total-summary__place-order')
          ).toBeFocused();
        });
        test('should toggle billing address form using keyboard', async ({
          page,
        }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await expect(page.getByTestId('STEP_DELIVERY_OPTION')).toBeVisible();
          await page
            .getByTestId('checkout-wizard__delivery-option-continue')
            .click();
          await page.waitForLoadState('networkidle');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('checkout-wizard__billing-address-form')
          ).toBeVisible();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('checkout-wizard__billing-address-form')
          ).not.toBeVisible();
        });
        test('should confirm order using keyboard', async ({ page }) => {
          await fillAddressForm(page);
          await page.getByTestId('address-form__submit').click();
          await page.waitForLoadState('networkidle');
          await page
            .getByTestId('checkout-wizard__delivery-option-continue')
            .click();

          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          // Make sure payment option is selected
          await page.keyboard.press('Enter');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          await expect(
            page.getByTestId('order-confirmation__title')
          ).toBeVisible();
        });
      });
    });
  });
});
