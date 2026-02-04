import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testMyAccountUrl = process.env.TEST_MY_ACCOUNT_URL ?? '/my-account';

test.describe('Test WCAG for My account - Dashboard Page Template', () => {
  test.beforeEach(async ({ b2cPage: { page } }) => {
    await page.goto(testMyAccountUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      makeAxeBuilder,
      b2cPage: { page },
    }) => {
      const result = await makeAxeBuilder(page).analyze();
      expect(result.violations).toEqual([]);
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.beforeEach(async ({ b2cPage: { page } }) => {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#main-content/);
      });
      test.describe('Sidebar Navigation', () => {
        test('should navigate through sidebar using keyboard', async ({
          b2cPage: { page },
        }) => {
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('side-menu__title')).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('side-menu__toggle-tablet')
          ).toBeFocused();

          await page.keyboard.press('Tab'); // Treeview
          const treeviewLinks = page.getByTestId('tree-item__link');
          const treeviewLinksCount = await treeviewLinks.count();
          for (let i = 0; i < treeviewLinksCount; i++) {
            await page.keyboard.press('Tab');
            await expect(treeviewLinks.nth(i)).toBeFocused();
          }
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('logout__button')).toBeFocused();
        });
        test('should toggle sidebar using keyboard', async ({
          b2cPage: { page },
        }) => {
          await page.keyboard.press('Tab'); // side menu title
          // should toggle sidebar
          await page.keyboard.press('Tab'); // side menu toggle button
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('side-menu')).not.toBeVisible();
          await expect(
            page.getByTestId('article__toggle-tablet')
          ).toBeVisible();
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('side-menu')).toBeVisible();
          await expect(
            page.getByTestId('article__toggle-tablet')
          ).not.toBeVisible();
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
