import { Page } from '@playwright/test';
import { expect, test } from 'utils/axe-test';

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
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.describe('Search functionality', () => {
        test('should perform search using keyboard navigation', async ({
          page,
        }) => {
          // Focus on the search input using keyboard navigation
          await page.getByTestId('search__input-searchPageInput').focus();

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
          await searchInput.focus();
          await expect(searchInput).toBeFocused();
          await page.keyboard.press('Control+a');
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
          await searchInput.focus();
          await expect(searchInput).toBeFocused();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(searchInput).toHaveValue('');
        });
      });
      test.describe('Tab Navigation', () => {
        test.beforeEach(async ({ page }) => {
          await onSearch(page);
        });
        test('should allow tab switching', async ({ page }) => {
          // Navigate to Products tab (should be selected by default)
          const productsTab = page.getByRole('tab', { name: 'Products' });
          await productsTab.focus();
          await expect(productsTab).toBeFocused();
          await expect(productsTab).toHaveAttribute('aria-selected', 'true');

          // Navigate to Categories tab using Arrow Right
          const categoriesTab = page.getByRole('tab', { name: 'Categories' });
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(categoriesTab).toBeFocused();
          await expect(productsTab).toHaveAttribute('aria-selected', 'false');
          await expect(categoriesTab).toHaveAttribute('aria-selected', 'true');

          // Navigate to Pages tab using Arrow Right
          const pagesTab = page.getByRole('tab', { name: 'Pages' });
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(pagesTab).toBeFocused();
          await expect(categoriesTab).toHaveAttribute('aria-selected', 'false');
          await expect(pagesTab).toHaveAttribute('aria-selected', 'true');

          // Navigate back to Categories tab using Arrow Left
          await page.keyboard.press('ArrowLeft');
          await page.keyboard.press('Shift+Tab');
          await expect(categoriesTab).toBeFocused();
          await expect(categoriesTab).toHaveAttribute('aria-selected', 'true');
          await expect(pagesTab).toHaveAttribute('aria-selected', 'false');
        });

        test('should navigate through content tab using keyboard', async ({
          page,
        }) => {
          // Navigate to Products tab (should be selected by default)
          const productsTab = page.getByRole('tab', { name: 'Products' });
          await productsTab.focus();
          await expect(productsTab).toBeFocused();
          await expect(productsTab).toHaveAttribute('aria-selected', 'true');

          // Navigate to Categories tab using Arrow Right
          const categoriesTab = page.getByRole('tab', { name: 'Categories' });
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(categoriesTab).toBeFocused();
          await expect(categoriesTab).toHaveAttribute('aria-selected', 'true');
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('searchitem__url').first()
          ).toBeFocused();
        });
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
  });
});
