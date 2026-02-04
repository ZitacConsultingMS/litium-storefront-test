import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before testing.
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe.skip('Routing', () => {
    // Check navigation when clicking banner block
  });

  test.describe('Metadata', () => {
    test('should be able to render all social tags', async ({ page }) => {
      const titleLocator = await page
        .locator('head > meta[property="og:title"]')
        .getAttribute('content');
      expect.soft(titleLocator).toEqual('Home page');
      const typeLocator = await page
        .locator('head > meta[property="og:type"]')
        .getAttribute('content');
      expect.soft(typeLocator).toEqual('website');

      const urlLocator = await page
        .locator('head > meta[property="og:url"]')
        .getAttribute('content');
      expect.soft(urlLocator).toEqual('https://localhost/');

      const descriptionLocator = await page
        .locator('head > meta[property="og:description"]')
        .getAttribute('content');
      expect
        .soft(descriptionLocator)
        .toContain(`Great assortment of quality products`);
    });
  });

  test.describe('Mega menu', () => {
    test.describe('Desktop', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test('should hide submenu and backdrop on unhovering menu', async ({
        page,
      }) => {
        const hoverableNavigationMenu = page
          .getByTestId('primary-navigation-link')
          .first();

        await hoverableNavigationMenu.hover();
        //move to another position to unhover
        await page.getByTestId('header__magnifier').hover();

        await expect(
          hoverableNavigationMenu.locator('div').first()
        ).not.toBeVisible();
        await expect(
          page.getByTestId('hoverable-navigation__backdrop')
        ).not.toBeVisible();
      });
    });
  });
});
