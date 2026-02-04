import { test as setup } from '@playwright/test';

const b2bUsername = process.env.TEST_USERNAME_B2B ?? 'b2b';
const b2bPassword = process.env.TEST_PASSWORD_B2B ?? '123$';
const b2cUsername = process.env.TEST_USERNAME ?? 'admin';
const b2cPassword = process.env.TEST_PASSWORD ?? '123$';

const b2bFile = 'playwright/.auth/b2b.json';

setup('authenticate as B2B user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto(process.env.TEST_LOGIN_URL ?? '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="username"]', b2bUsername);
  await page.fill('input[name="password"]', b2bPassword);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');

  await page.click('#dropdown-label-id');
  await page.click('#dropdown-list-id [role="option"]:nth-child(1)');
  await page.getByTestId('select-organization-form__submit').click();
  await page.waitForLoadState('networkidle');

  await page.context().storageState({ path: b2bFile });
});

const b2cFile = 'playwright/.auth/b2c.json';

setup('authenticate as B2C user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto(process.env.TEST_LOGIN_URL ?? '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="username"]', b2cUsername);
  await page.fill('input[name="password"]', b2cPassword);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForURL(process.env.TEST_MY_ACCOUNT_URL ?? '/my-account');

  await page.context().storageState({ path: b2cFile });
});
