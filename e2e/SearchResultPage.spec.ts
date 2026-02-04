import { expect, test } from '@playwright/test';

test.describe('Search result page', () => {
  test.describe('Without search param', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the starting url before testing.
      await page.goto('/search-result');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Metadata', () => {
      test('should be able to render all social tags', async ({ page }) => {
        const titleLocator = await page
          .locator('head > meta[property="og:title"]')
          .getAttribute('content');
        expect.soft(titleLocator).toEqual('Search result');

        const typeLocator = await page
          .locator('head > meta[property="og:type"]')
          .getAttribute('content');
        expect.soft(typeLocator).toEqual('website');

        const urlLocator = await page
          .locator('head > meta[property="og:url"]')
          .getAttribute('content');
        expect.soft(urlLocator).toEqual('https://localhost/search-result');

        const descriptionLocator = await page
          .locator('head > meta[property="og:description"]')
          .getAttribute('content');
        expect.soft(descriptionLocator).toContain(`Search result`);
      });
    });

    test.describe('Search input', () => {
      test('should update url with search text when pressing enter', async ({
        page,
      }) => {
        await page.getByRole('main').getByTestId('search__input').fill('yoga');
        page.keyboard.down('Enter');
        await expect(page).toHaveURL('/search-result?q=yoga');
      });
    });
  });

  test.describe('With search param', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the starting url before testing.
      await page.goto('/search-result?q=black%20and%20white&Size=M');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Navigate to a result item', () => {
      test('should be able to open an item', async ({ page }) => {
        const firstProductItem = page.getByTestId('product-card').first();
        const firstProductItemLink = await firstProductItem
          .locator('a')
          .first()
          .getAttribute('href');
        await firstProductItem.click();
        await expect(page).toHaveURL(firstProductItemLink as string);
      });
    });

    test.describe('Load more button', () => {
      test('should show load more button when items are over 50', async ({
        page,
      }) => {
        const loadMoreButton = page.getByTestId('product-list__load-more');
        await expect(loadMoreButton).toBeVisible();
      });

      test('should show loading when clicking on load more button', async ({
        page,
      }) => {
        const loadMoreButton = page.getByTestId('product-list__load-more');
        await loadMoreButton.click();

        await expect(loadMoreButton).toContainText('Loading');
      });

      test.describe('Search input', () => {
        test('should display value the same with url search param', async ({
          page,
        }) => {
          const searchInput = page
            .getByRole('main')
            .getByTestId('search__input');
          await expect(searchInput).toHaveValue('black and white');
        });
      });
    });

    test.describe('Faceted Search', () => {
      test.describe('On Desktop screen', () => {
        test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const accorrdionSize = containerDesktop
            .getByTestId('accordion__header')
            .getByText('Size');
          await accorrdionSize.click();
          const facetedFilterSize = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Size'
          );
          const facetedFilterSizeL = await facetedFilterSize.getByText('L');
          await facetedFilterSizeL.click();
          await expect(page).toHaveURL(
            '/search-result?q=black%20and%20white&Size=M&Size=L'
          );
          await containerDesktop
            .getByTestId('filter-summary__clear-btn')
            .click();
          await expect(page).toHaveURL('/search-result?q=black%20and%20white');
        });
      });

      test.describe('On Mobile screen', () => {
        test.skip(({ isMobile }) => !isMobile, 'Check on Mobile only');

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const filterSummary = containerMobile.getByTestId(
            'faceted-filter__summary'
          );
          await filterSummary.click();
          const accorrdionSize = containerMobile
            .getByTestId('accordion__header')
            .getByText('Size');
          await accorrdionSize.click();
          const facetedFilterSize = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Size'
          );
          const facetedFilterSizeL = facetedFilterSize.getByText('L');
          await facetedFilterSizeL.click();
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(2)');

          await containerMobile
            .getByTestId('faceted-filter__clear-btn')
            .click();
          await containerMobile.getByTestId('faceted-filter__show-btn').click();
          await expect(page).toHaveURL('/search-result?q=black%20and%20white');
        });
      });
    });
  });
});
