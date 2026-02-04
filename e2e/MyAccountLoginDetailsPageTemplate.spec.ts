import { setupAuthenticate } from 'utils/authenticate';
import { expect, test } from 'utils/axe-test';
// Get the username and password from the environment variables or use the default values
const USERNAME = process.env.TEST_USERNAME ?? 'admin';
const PASSWORD = process.env.TEST_PASSWORD ?? '123$';

// Get the test URL from the environment variables or use the default value
const testLoginDetailsUrl =
  process.env.TEST_MY_ACCOUNT_LOGIN_DETAILS_URL ?? '/my-account/login-details';

test.describe('Test WCAG for My account - Login details Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticate(page, USERNAME, PASSWORD);
    await page.goto(testLoginDetailsUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Update email form', () => {
      test.describe('Without filled email form', () => {
        test('should pass axe-core accessibility tests', async ({
          page,
          makeAxeBuilder,
        }) => {
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
        test('should pass axe-core accessibility tests with error messages disabled', async ({
          page,
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', '');
          await page.getByTestId('email-details__submit').click();
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('With filled email form', () => {
        test('should display verification code step and pass axe-core accessibility tests', async ({
          page,
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
        test('should display verification code step and pass axe-core accessibility tests with error messages disabled', async ({
          page,
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await expect(
            page.getByTestId('email-details__code-field')
          ).toBeVisible();
          await page.getByTestId('email-details__submit').click();
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
        test('should pass axe-core accessibility tests with filled wrong code', async ({
          page,
          makeAxeBuilder,
        }) => {
          await page.fill('input[name="email"]', 'test@test.com');
          await page.getByTestId('email-details__submit').click();
          await page.fill('input[name="code"]', '12345');
          await page.getByTestId('email-details__submit').click();
          await page.waitForLoadState('networkidle');
          const result = await makeAxeBuilder().analyze();
          expect(result.violations).toEqual([]);
        });
      });
    });
    test.describe('Update password form', () => {
      test('should pass axe-core accessibility tests', async ({
        makeAxeBuilder,
      }) => {
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
      test('should pass axe-core accessibility tests with error messages displayed', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
      test('should show error messages and pass axe-core accessibility tests when current password is filled and new password is empty', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="currentPassword"]', '123$');
        await page.fill('input[name="newPassword"]', '');
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
      test('should show error messages and pass axe-core accessibility tests when current password is filled wrong and new password is filled', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.fill('input[name="currentPassword"]', '1234');
        await page.fill('input[name="newPassword"]', 'asdf');
        await page.getByTestId('password-details__submit').click();
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.beforeEach(async ({ page }) => {
      // Use skip link to go to main content
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content/);
    });
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.describe('Sidebar Navigation', () => {
        test.skip(() => true, 'Already verified in My account dashboard page');
      });
      test.describe('Breadcrumb Navigation', () => {
        test('should navigate through breadcrumb using keyboard', async ({
          page,
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
        test.beforeEach(async ({ page }) => {
          // Skip using keyboard Tab to go to the email form, start from the last breadcrumb link.
          await page.getByTestId('breadcrumb-desktop').nth(1).focus();
          await expect(
            page.getByTestId('breadcrumb-desktop').nth(1)
          ).toBeFocused();
        });
        test('Move through the email form using keyboard', async ({ page }) => {
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
        test('Fill the email form using keyboard', async ({ page }) => {
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
        test.beforeEach(async ({ page }) => {
          // Skip using keyboard Tab to go to the password form, start focus from the submit button email form
          const submitButton = page.getByTestId('email-details__submit');
          await submitButton.focus();
          await expect(submitButton).toBeFocused();
        });
        test('should move through the password form using keyboard', async ({
          page,
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
        test('Fill the password form using keyboard', async ({ page }) => {
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
  });
});
