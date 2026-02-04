import { Page } from '@playwright/test';
import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testSearchResultUrl =
  process.env.TEST_SEARCH_RESULT_URL ?? '/search-result';

const onSearch = async (page: Page) => {
  await page.getByTestId('search__input-searchPageInput').fill('yoga');
  await page.keyboard.down('Enter');
  await expect(page).toHaveURL(`/search-result?q=yoga`);
};

test.describe('Test WCAG for Search Result Page Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testSearchResultUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test.describe('Search result page - Default template', () => {
      test('should pass axe-core accessibility tests', async ({
        makeAxeBuilder,
      }) => {
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Search result page - Products tab', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await onSearch(page);
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Search result page - Categories tab', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await onSearch(page);
        await page.locator('[data-testid^="tabs__header"]').nth(1).click();
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
    test.describe('Search result page - Pages tab', () => {
      test('should pass axe-core accessibility tests', async ({
        page,
        makeAxeBuilder,
      }) => {
        await onSearch(page);
        await page.locator('[data-testid^="tabs__header"]').nth(2).click();
        const result = await makeAxeBuilder().analyze();
        expect(result.violations).toEqual([]);
      });
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
      test.describe('Search result page - Default template', () => {
        test('should pass input purpose compliance for user fields using autocomplete', async ({
          page,
        }) => {
          const result = await wcag135Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Products tab', () => {
        test('should pass input purpose compliance for user fields using autocomplete', async ({
          page,
        }) => {
          await onSearch(page);
          const result = await wcag135Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Categories tab', () => {
        test('should pass input purpose compliance for user fields using autocomplete', async ({
          page,
        }) => {
          await onSearch(page);
          await page.locator('[data-testid^="tabs__header"]').nth(1).click();
          const result = await wcag135Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Pages tab', () => {
        test('should pass input purpose compliance for user fields using autocomplete', async ({
          page,
        }) => {
          await onSearch(page);
          await page.locator('[data-testid^="tabs__header"]').nth(2).click();
          const result = await wcag135Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
    });
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.beforeEach(async ({ page }) => {
        // Use skip link to go to main content
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#main-content/);
      });
      test.describe('Search functionality', () => {
        test('should perform search using keyboard navigation', async ({
          page,
        }) => {
          // Focus on the search input using keyboard navigation
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('search__input-searchPageInput')
          ).toBeFocused();

          // Type search term and submit
          await page.keyboard.type('shirt');
          await page.keyboard.press('Enter');

          // Verify search results are displayed
          await expect(
            page.getByRole('tab', { name: 'Products' })
          ).toHaveAttribute('aria-selected', 'true');
        });
        test('should clear search query using keyboard', async ({ page }) => {
          const searchInput = page.getByTestId('search__input-searchPageInput');
          await page.keyboard.press('Tab');
          await expect(searchInput).toBeFocused();
          await page.keyboard.type('tank');
          await expect(searchInput).toHaveValue('tank');
          await page.keyboard.press('Control+a');
          await page.keyboard.press('Backspace');
          await expect(searchInput).toHaveValue('');
        });
        test('should clear search query using the clear button', async ({
          page,
        }) => {
          const searchInput = page.getByTestId('search__input-searchPageInput');
          await page.keyboard.press('Tab');
          await page.keyboard.type('tank');
          await page.keyboard.press('Tab');
          await expect(
            page.locator('[data-testid="search__clear"]:visible')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(searchInput).toHaveValue('');
        });
      });
      test.describe('Tab Navigation', () => {
        test.skip(
          () => true,
          'Already tested in the Search functionality of the LandingPageTemplate.spec.ts'
        );
      });

      test.describe('Filter Navigation', () => {
        test.skip(
          () => true,
          'Already tested in CategoryProductCategoryTemplate.spec.ts'
        );
      });

      test.describe('Sort Functionality', () => {
        test.skip(
          () => true,
          'Already tested in CategoryProductCategoryTemplate.spec.ts'
        );
      });

      test.describe('Product Grid Navigation', () => {
        test.skip(
          () => true,
          'Already tested in CategoryProductCategoryTemplate.spec.ts'
        );
      });
    });
    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test.describe('Search result page - Default template', () => {
        test('should pass language of parts tests', async ({ page }) => {
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Products tab', () => {
        test('should pass language of parts tests', async ({ page }) => {
          await onSearch(page);
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Categories tab', () => {
        test('should pass language of parts tests', async ({ page }) => {
          await onSearch(page);
          await page.locator('[data-testid^="tabs__header"]').nth(1).click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
      test.describe('Search result page - Pages tab', () => {
        test('should pass language of parts tests', async ({ page }) => {
          await onSearch(page);
          await page.locator('[data-testid^="tabs__header"]').nth(2).click();
          const result = await wcag312Helpers.runAllTests(page);
          expect(result.violations).toEqual([]);
        });
      });
    });
  });
});
