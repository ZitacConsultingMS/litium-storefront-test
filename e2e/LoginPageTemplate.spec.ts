import { expect, test } from 'utils/axe-test';

/**
 * This is a note to prepare for testing the login page template.
 * Setup B2B user to check organization select displayed
 * Setup B2B user in the BO: username: user_b2b, password: 123
 * Setup user_b2b with multiple organizations
 */
const USERNAME = 'user_b2b';
const PASSWORD = '123';

const testLoginUrl = process.env.TEST_LOGIN_URL ?? '/login';

test.describe('Test WCAG for Login Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testLoginUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Login page - Default template', () => {
      test('should pass axe-core accessibility tests with default template', async ({
        makeAxeBuilder,
      }) => {
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Login page - Login with empty username/password', () => {
      test('should pass axe-core accessibility tests with error message displayed', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.getByTestId('login-form__submit').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Login page - Login with invalid username/password', () => {
      test('should pass axe-core accessibility tests with general error message displayed', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.getByTestId('login-form__username').fill('test');
        await page.getByTestId('login-form__password').fill('test');
        await page.getByTestId('login-form__submit').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Login page - Login with B2B user', () => {
      test('should pass axe-core accessibility tests with organization select displayed', async ({
        page,
        makeAxeBuilder,
      }) => {
        await page.getByTestId('login-form__username').fill(USERNAME);
        await page.getByTestId('login-form__password').fill(PASSWORD);
        await page.getByTestId('login-form__submit').click();
        await page.waitForLoadState('networkidle');
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');

      test.describe('Login Form Navigation', () => {
        test('should navigate through form elements using keyboard', async ({
          page,
        }) => {
          // Navigate to username field
          const usernameField = page.getByRole('textbox', {
            name: 'User name',
          });
          await usernameField.focus();
          await expect(usernameField).toBeFocused();

          // Navigate to password field
          await page.keyboard.press('Tab');
          const passwordField = page.getByRole('textbox', { name: 'Password' });
          await expect(passwordField).toBeFocused();

          // Navigate to show/hide password button
          await page.keyboard.press('Tab');
          const showPasswordButton = page.getByRole('button', {
            name: 'login.showpassword',
          });
          await expect(showPasswordButton).toBeFocused();

          // Navigate to login button
          await page.keyboard.press('Tab');
          const loginButton = page.getByTestId('login-form__submit');
          await expect(loginButton).toBeFocused();
        });
      });

      test.describe('Form Interaction', () => {
        test('should fill form fields using keyboard', async ({ page }) => {
          // Focus on username field
          const usernameField = page.getByRole('textbox', {
            name: 'User name',
          });
          await usernameField.focus();
          await expect(usernameField).toBeFocused();

          // Type username
          await page.keyboard.type('testuser');
          await expect(usernameField).toHaveValue('testuser');

          // Navigate to password field
          await page.keyboard.press('Tab');
          const passwordField = page.getByRole('textbox', { name: 'Password' });
          await expect(passwordField).toBeFocused();

          // Type password
          await page.keyboard.type('testpassword');
          await expect(passwordField).toHaveValue('testpassword');
        });

        test('should submit form using keyboard', async ({ page }) => {
          // Fill form fields
          const usernameField = page.getByRole('textbox', {
            name: 'User name',
          });
          await usernameField.fill('testuser');

          const passwordField = page.getByRole('textbox', { name: 'Password' });
          await passwordField.fill('testpassword');

          // Submit form with Enter key
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify error message appears (expected for invalid credentials)
          await expect(
            page.getByText(
              'The username or password seems to be incorrect. Please try again.'
            )
          ).toBeVisible();
        });
      });

      test.describe('Show/Hide Password', () => {
        test('should toggle password visibility using keyboard', async ({
          page,
        }) => {
          // Fill password field
          const passwordField = page.getByRole('textbox', { name: 'Password' });
          await passwordField.fill('testpassword');

          // Focus on show password button
          const showPasswordButton = page.getByRole('button', {
            name: 'login.showpassword',
          });
          await showPasswordButton.focus();
          await expect(showPasswordButton).toBeFocused();

          // Toggle password visibility with Enter key
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify button text changed to hide password
          await expect(
            page.getByRole('button', { name: 'login.hidepassword' })
          ).toBeVisible();

          // Toggle back with Enter key
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify button text changed back to show password
          await expect(
            page.getByRole('button', { name: 'login.showpassword' })
          ).toBeVisible();
        });
      });
    });
  });
});
