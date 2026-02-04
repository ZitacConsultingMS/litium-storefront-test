import { setupAuthenticate } from 'utils/authenticate';
import { expect, test } from 'utils/axe-test';

/**
 * This is a note to prepare for testing the addresses page template.
 * Setup full my account page templates: dashboard, order, order history, my profile, login details, addresses.
 * Setup an account B2C user with a customer address in the BO.
 * Setup an account B2B user with a customer address in the BO.
 */

// Get the username and password from the environment variables or use the default values
const USERNAME = process.env.TEST_USERNAME ?? 'admin';
const PASSWORD = process.env.TEST_PASSWORD ?? '123$';

// Get the test URL from the environment variables or use the default value
const testMyAccountAddressesUrl =
  process.env.TEST_MY_ACCOUNT_ADDRESSES_URL ?? '/my-account/manage-addresses';
test.describe('Test WCAG for My account - Addresses Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticate(page, USERNAME, PASSWORD);
    await page.goto(testMyAccountAddressesUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Without filled customer address form', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="address1"]', '');
        await page.fill('input[name="city"]', '');
        await page.fill('input[name="zipCode"]', '');
        await page.fill('input[name="phoneNumber"]', '');
        await page.getByTestId('customer-address__submit').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('With filled customer address form', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="address1"]', '123 Main St');
        await page.click('#dropdown-label-country');
        await page.click('#dropdown-list-country [role="option"]:nth-child(1)');
        await page.fill('input[name="city"]', 'Anytown');
        await page.fill('input[name="zipCode"]', '12345');
        await page.fill('input[name="phoneNumber"]', '1234567890');
        await page.getByTestId('customer-address__submit').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test('should navigate through breadcrumb using keyboard', async ({
        page,
      }) => {
        // Skip press keyboard Tab multiple times, use focus() to reach the logout button
        await page.getByTestId('logout__button').focus();
        await expect(page.getByTestId('logout__button')).toBeFocused();
        // Using keyboard to navigate through breadcrumb
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('breadcrumb-desktop').first()
        ).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('breadcrumb-desktop').nth(1)
        ).toBeFocused();
      });
      test('should navigate through addresses using keyboard', async ({
        page,
      }) => {
        // Skip press keyboard Tab multiple times, use focus() to reach the breadcrumb
        await page.getByTestId('breadcrumb-desktop').nth(1).focus();
        await expect(
          page.getByTestId('breadcrumb-desktop').nth(1)
        ).toBeFocused();
        // Using keyboard to navigate through addresses
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('customer-address__address')
        ).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('customer-address__zipcode')
        ).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByTestId('customer-address__city')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('combobox')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('customer-address__phone-number')
        ).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('customer-address__submit')
        ).toBeFocused();
      });
      test('should fill address form using keyboard', async ({ page }) => {
        // Skip press keyboard Tab multiple times, use focus() to reach the breadcrumb
        await page.getByTestId('breadcrumb-desktop').nth(1).focus();
        await expect(
          page.getByTestId('breadcrumb-desktop').nth(1)
        ).toBeFocused();
        // Using keyboard to fill address form
        await page.keyboard.press('Tab');
        await page.keyboard.type('123 Main St');
        await expect(page.getByTestId('customer-address__address')).toHaveValue(
          '123 Main St'
        );
        await page.keyboard.press('Tab');
        await page.keyboard.type('12345');
        await page.keyboard.press('Tab');
        await expect(page.getByTestId('customer-address__zipcode')).toHaveValue(
          '12345'
        );
        await page.keyboard.type('Anytown');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('customer-address__city')).toHaveValue(
          'Anytown'
        );
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Tab');
        await page.keyboard.type('1234567890');
        await expect(
          page.getByTestId('customer-address__phone-number')
        ).toHaveValue('1234567890');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('customer-address__submit')).toHaveText(
          /Saved/
        );
      });
    });
  });
});
