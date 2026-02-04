import { expect, test } from 'utils/axe-test';
/**
 * This is a note to prepare for testing the my profile page template.
 * Setup an account with a customer address in the BO.
 * Configure some fields for this account in the BO with writable set to true: FirstName, LastName, Phone, Email.
 */
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testMyProfileUrl =
  process.env.TEST_MY_ACCOUNT_MY_PROFILE_URL ?? '/my-account/my-profile';

test.describe('Test WCAG for My account - My profile Page Template', () => {
  test.beforeEach(async ({ b2cPage: { page } }) => {
    await page.goto(testMyProfileUrl);
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

      test.describe('My profile form', () => {
        test.beforeEach(async ({ b2cPage: { page } }) => {
          // Start from the last breadcrumb link
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
          await expect(
            page.getByTestId('breadcrumb-desktop').nth(1)
          ).toBeFocused();
        });
        test('should navigate to my profile page using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Using keyboard to navigate through my profile page
          const fieldInput = page.getByTestId('string-value__input-field');
          const fieldInputLength = await fieldInput.count();
          for (let i = 0; i < fieldInputLength; i++) {
            if (await fieldInput.nth(i).isDisabled()) {
              continue;
            }
            await page.keyboard.press('Tab');
            await expect(fieldInput.nth(i)).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('profile-form__save')).toBeFocused();
        });
        test('should fill the profile form using keyboard', async ({
          b2cPage: { page },
        }) => {
          const fieldInput = page.getByTestId('string-value__input-field');
          // The email field is always disabled
          await page.keyboard.press('Tab');
          await page.keyboard.type('John'); // First name
          await expect(fieldInput.nth(0)).toHaveValue('John');
          await page.keyboard.press('Tab');
          await page.keyboard.type('Smith'); // Last name
          await expect(fieldInput.nth(1)).toHaveValue('Smith');
          await page.keyboard.press('Tab');
          await page.keyboard.type('1234567890'); // Phone
          await expect(fieldInput.nth(3)).toHaveValue('1234567890');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('profile-form__save')).toHaveText(
            'Saved'
          );
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
