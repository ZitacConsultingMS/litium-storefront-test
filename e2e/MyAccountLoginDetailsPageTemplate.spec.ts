import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testLoginDetailsUrl =
  process.env.TEST_MY_ACCOUNT_LOGIN_DETAILS_URL ?? '/my-account/login-details';

test.describe('Test WCAG for My account - Login details Page Template', () => {
  test.beforeEach(async ({ b2cPage: { page } }) => {
    await page.goto(testLoginDetailsUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Update email form', () => {
      test.describe('Without filled email form', () => {
        test('should pass axe-core accessibility tests', async ({
          b2cPage: { page },
          makeAxeBuilder,
        }) => {
          const result = await makeAxeBuilder(page).analyze();
          expect(result.violations).toEqual([]);
        });
        test('should pass axe-core accessibility tests with error messages disabled', async ({
          b2cPage: { page },
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', '');
          await page.getByTestId('email-details__submit').click();
          const result = await makeAxeBuilder(page).analyze();
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('With filled email form', () => {
        test('should display verification code step and pass axe-core accessibility tests', async ({
          b2cPage: { page },
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          const result = await makeAxeBuilder(page).analyze();
          expect(result.violations).toEqual([]);
        });
        test('should display verification code step and pass axe-core accessibility tests with error messages disabled', async ({
          b2cPage: { page },
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          await page.getByTestId('email-details__submit').click();
          const result = await makeAxeBuilder(page).analyze();
          expect(result.violations).toEqual([]);
        });
        test('should pass axe-core accessibility tests with filled wrong code', async ({
          b2cPage: { page },
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await page.fill('input[name="code"]', '12345');
          await page.getByTestId('email-details__submit').click();
          await page.waitForLoadState('networkidle');
          const result = await makeAxeBuilder(page).analyze();
          expect(result.violations).toEqual([]);
        });
      });
    });
    test.describe('Update password form', () => {
      test('should pass axe-core accessibility tests', async ({
        b2cPage: { page },
        makeAxeBuilder,
      }) => {
        const result = await makeAxeBuilder(page).analyze();
        expect(result.violations).toEqual([]);
      });
      test('should pass axe-core accessibility tests with error messages displayed', async ({
        b2cPage: { page },
        makeAxeBuilder,
      }) => {
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder(page).analyze();
        expect(result.violations).toEqual([]);
      });
      test('should show error messages and pass axe-core accessibility tests when current password is filled and new password is empty', async ({
        b2cPage: { page },
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="currentPassword"]', '123$');
        await page.fill('input[name="newPassword"]', '');
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder(page).analyze();
        expect(result.violations).toEqual([]);
      });
      test('should show error messages and pass axe-core accessibility tests when current password is filled wrong and new password is filled', async ({
        b2cPage: { page },
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="currentPassword"]', '1234');
        await page.fill('input[name="newPassword"]', 'asdf');
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder(page).analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
      test('should pass input purpose compliance for user fields using autocomplete', async ({
        b2cPage: { page },
      }) => {
        const result = await wcag135Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.describe('Sidebar Navigation', () => {
        test.skip(() => true, 'Already verified in My account dashboard page');
      });
      test.describe('Breadcrumb Navigation', () => {
        test('should navigate through breadcrumb using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Skip using Tab to go to breadcrumb, start from the logout button
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
      test.describe('Form Email', () => {
        test.beforeEach(async ({ b2cPage: { page } }) => {
          // Skip using keyboard Tab to go to the email form, start from the last breadcrumb link.
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
          await expect(
            page.getByTestId('breadcrumb-desktop').nth(1)
          ).toBeFocused();
        });
        test('Move through the email form using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Move to the email field
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('email-details__email-field')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          // Move to the code field
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeFocused();
          // Move to the submit button
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('email-details__submit')).toBeFocused();
        });
        test('Fill the email form using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Move to the email field
          await page.keyboard.press('Tab');
          await page.keyboard.type('test@test.com');
          await expect(
            page.getByTestId('email-details__email-field')
          ).toHaveValue('test@test.com');
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          // Move to the code field
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeFocused();
          await page.keyboard.type('12345');
          await expect(
            page.getByTestId('email-details__code-field')
          ).toHaveValue('12345');
          // Move to the submit button
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('email-details__submit')).toBeFocused();
        });
      });
      test.describe('Form Password', () => {
        test.beforeEach(async ({ b2cPage: { page } }) => {
          // Skip using keyboard Tab to go to the password form, start focus from the submit button email form
          const submitButton = page.getByTestId('email-details__submit');
          await submitButton.focus();
          await expect(submitButton).toBeFocused();
        });
        test('should move through the password form using keyboard', async ({
          b2cPage: { page },
        }) => {
          // Move to the current password field
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('password-details__current-password')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Show password' }).first()
          ).toBeFocused();
          // Toggle current password visibility using keyboard
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('button', { name: 'Hide password' })
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Hide password' })
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('button', { name: 'Show password' }).first()
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Show password' }).first()
          ).toBeFocused();
          // Move to the new password field
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('password-details__new-password')
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Show password' }).nth(1)
          ).toBeFocused();
          // Toggle new password visibility using keyboard
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('button', { name: 'Hide password' })
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Hide password' })
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('button', { name: 'Show password' }).nth(1)
          ).toBeVisible();
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Show password' }).nth(1)
          ).toBeFocused();
          // Move to the submit button
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('password-details__submit')
          ).toBeFocused();
        });
        test('Fill the password form using keyboard', async ({
          b2cPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await page.keyboard.type('123$');
          await expect(
            page.getByTestId('password-details__current-password')
          ).toHaveValue('123$');
          // Move to the toggle button
          await page.keyboard.press('Tab');
          // Move to the new password field
          await page.keyboard.press('Tab');
          await page.keyboard.type('123$');
          await expect(
            page.getByTestId('password-details__new-password')
          ).toHaveValue('123$');
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('password-details__submit')).toHaveText(
            /Saved/
          );
        });
      });
    });
    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test('Default template - should pass language of parts tests', async ({
        b2cPage: { page },
      }) => {
        const result = await wcag312Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
      test.describe('Update email form', () => {
        test('should pass language of parts tests with error messages disabled', async ({
          b2cPage: { page },
        }) => {
          await page.fill('input[name="email"]', '');
          await page.getByTestId('email-details__submit').click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
        test('should display verification code step and pass language of parts tests', async ({
          b2cPage: { page },
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
        test('should display verification code step and pass language of parts tests with error messages disabled', async ({
          b2cPage: { page },
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          await page.getByTestId('email-details__submit').click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
        test('should pass language of parts tests with filled wrong code', async ({
          b2cPage: { page },
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await page.fill('input[name="code"]', '12345');
          await page.getByTestId('email-details__submit').click();
          await page.waitForLoadState('networkidle');
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Update password form', () => {
        test('should pass language of parts tests with error messages displayed', async ({
          b2cPage: { page },
        }) => {
          await page.getByTestId('password-details__submit').click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
        test('should show error messages and pass axe-core accessibility tests when current password is filled wrong and new password is filled', async ({
          b2cPage: { page },
        }) => {
          await page.fill('input[name="currentPassword"]', '1234');
          await page.fill('input[name="newPassword"]', 'asdf');
          await page.getByTestId('password-details__submit').click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
    });
  });
});
