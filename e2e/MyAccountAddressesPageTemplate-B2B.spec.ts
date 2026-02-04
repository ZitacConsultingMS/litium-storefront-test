import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

/**
 * This is a note to prepare for testing the addresses page template.
 * Setup an account B2B user has manage addresses role in the BO.
 */

// Get the test URL from the environment variables or use the default value
const testMyAccountAddressesUrl =
  process.env.TEST_MY_ACCOUNT_ADDRESSES_URL ?? '/my-account/manage-addresses';
test.describe('Test WCAG for My account - Addresses Page Template', () => {
  test.beforeEach(async ({ b2bPage: { page } }) => {
    await page.goto(testMyAccountAddressesUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Without filled customer address form', () => {
      test('should pass axe-core accessibility tests', async ({
        b2bPage: { page },
        makeAxeBuilder,
      }) => {
        const result = await makeAxeBuilder(page).analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.describe('Sidebar Navigation', () => {
        test.skip(() => true, 'Already tested in My account dashboard page');
      });
      test('should navigate through breadcrumb using keyboard', async ({
        b2bPage: { page },
      }) => {
        // Start from the logout button
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
        b2bPage: { page },
      }) => {
        // Start from the last breadcrumb link
        await page.getByTestId('breadcrumb-desktop').nth(1).focus();
        await expect(
          page.getByTestId('breadcrumb-desktop').nth(1)
        ).toBeFocused();
        // Using keyboard to navigate through addresses
        await page.keyboard.press('Tab');
        await expect(
          page.getByTestId('my-account-address-b2b__add-button')
        ).toBeFocused();
        const addressList = page.getByTestId(
          'my-account-address-b2b__address-list'
        );
        if (await addressList.isVisible()) {
          const editButton = addressList.getByTestId(
            'my-account-address-b2b__edit-button'
          );
          const editButtonCount = await editButton.count();
          const deleteButton = addressList.getByTestId('delete-address-button');
          for (let i = 0; i < editButtonCount; i++) {
            await page.keyboard.press('Tab');
            await expect(editButton.nth(i)).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(deleteButton.nth(i)).toBeFocused();
          }
        }
      });
      test.describe('Add new address', () => {
        test.beforeEach(async ({ b2bPage: { page } }) => {
          // Start from the last breadcrumb link
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
          // Using keyboard to fill address form
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('my-account-address-b2b__add-button')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(/\?view=add/);
        });
        test('should navigate to add new address page using keyboard', async ({
          b2bPage: { page },
        }) => {
          // Using keyboard to navigate to add new address page
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__address')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__zipcode')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__city')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(page.getByRole('combobox')).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__phone-number')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__cancel')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__submit')
          ).toBeFocused();
        });
        test('should fill new address form using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await page.keyboard.type('123 Main St');
          await expect(
            page.getByTestId('customer-address__address')
          ).toHaveValue('123 Main St');
          await page.keyboard.press('Tab');
          await page.keyboard.type('12345');
          await expect(
            page.getByTestId('customer-address__zipcode')
          ).toHaveValue('12345');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Anytown');
          await expect(page.getByTestId('customer-address__city')).toHaveValue(
            'Anytown'
          );
          await page.keyboard.press('Tab');
          await expect(page.getByRole('combobox')).toBeFocused();
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__phone-number')
          ).toBeFocused();
          await page.keyboard.type('1234567890');
          await expect(
            page.getByTestId('customer-address__phone-number')
          ).toHaveValue('1234567890');
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__cancel')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('customer-address__submit')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('customer-address__submit')).toHaveText(
            /Saved/
          );
          await expect(page).not.toHaveURL(/\?view=add/);
        });
        test('should cancel new address form using keyboard', async ({
          b2bPage: { page },
        }) => {
          // Use focus() to reach the cancel button
          await page.getByTestId('customer-address__cancel').focus();
          await page.keyboard.press('Enter');
          await expect(page).not.toHaveURL(/\?view=add/);
        });
      });
      test.describe('Edit address', () => {
        test.beforeEach(async ({ b2bPage: { page } }) => {
          // Start from the add address button
          await page.getByTestId('my-account-address-b2b__add-button').focus();
          // Using keyboard to navigate to edit address page
        });
        test('should navigate to edit address page using keyboard', async ({
          b2bPage: { page },
        }) => {
          // Using keyboard to navigate to edit address page
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('my-account-address-b2b__edit-button').first()
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(/\?view=edit/);
        });
        test.describe('Edit address form', () => {
          test.skip(
            () => true,
            'The edit address page have the same form as the add address page'
          );
        });
      });
      test.describe('Delete address', () => {
        test.beforeEach(async ({ b2bPage: { page } }) => {
          // Start from the edit address button
          await page
            .getByTestId('my-account-address-b2b__edit-button')
            .first()
            .focus();
          // Using keyboard to navigate to delete address page
        });
        test('should show delete address confirmation dialog using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('delete-address-button').first()
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('confirmation-dialog__title').first()
          ).toBeVisible();
        });
        test('should cancel delete address confirmation dialog using keyboard', async ({
          b2bPage: { page },
        }) => {
          await page.getByTestId('delete-address-button').first().focus();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('confirmation-dialog__cancel-button').first()
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('confirmation-dialog__title').first()
          ).not.toBeVisible();
        });
        test('should delete address using keyboard', async ({
          b2bPage: { page },
        }) => {
          const firstAddress = page
            .getByTestId('my-account-address-b2b__address-row')
            .first();
          const addressInfo = await firstAddress
            .getByTestId('my-account-address-b2b__address-info')
            .textContent();
          await firstAddress
            .getByTestId('delete-address-button')
            .first()
            .focus();
          await page.keyboard.press('Enter');
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('confirmation-dialog__ok-button').first()
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('confirmation-dialog__title').first()
          ).not.toBeVisible();
          await expect(
            page.getByRole('textbox', { name: addressInfo ?? '' })
          ).not.toBeVisible();
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
