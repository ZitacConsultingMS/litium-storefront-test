import { Page } from '@playwright/test';
/**
 * Setup authentication for the page
 * @param page - The page to authenticate
 * @param username - The username to authenticate
 * @param password - The password to authenticate
 */
export const setupAuthenticate = async (
  page: Page,
  username: string,
  password: string
) => {
  await page.goto(process.env.TEST_LOGIN_URL ?? '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL(process.env.TEST_MY_ACCOUNT_URL ?? '/my-account');
};
