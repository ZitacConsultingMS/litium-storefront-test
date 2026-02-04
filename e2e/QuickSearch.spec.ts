import { expect, test } from '@playwright/test';

test.describe('Quick search', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before testing.
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Navigate to a result item', () => {
    test('should be able to open an item', async ({ page }) => {
      await page.getByTestId('header__magnifier').click();
      await page.getByTestId('search__input').fill('yoga');
      const firstProductItem = page.getByTestId('product-card').first();
      const firstProductItemLink = await firstProductItem
        .locator('a')
        .first()
        .getAttribute('href');
      await firstProductItem.click();
      await expect(page).toHaveURL(firstProductItemLink as string);
      await expect(page.getByTestId('quicksearch')).not.toBeVisible();
    });
  });

  test.describe('Navigate to a search result page', () => {
    test('should be able to open a search result page', async ({ page }) => {
      await page.getByTestId('header__magnifier').click();
      await page.getByTestId('search__input').fill('yoga');
      await page.getByTestId('searchresult__see-more-btn').click();
      await expect(page).toHaveURL('/search-result?q=yoga');
      await expect(page.getByTestId('quicksearch')).not.toBeVisible();
    });
  });

  test.describe('See more button', () => {
    test('should not show see more button if there are no search hits after performing a search', async ({
      page,
    }) => {
      await page.getByTestId('header__magnifier').click();
      await page.getByTestId('search__input').fill('nohits');
      await expect(
        page.getByTestId('searchresult__see-more-btn')
      ).not.toBeVisible();
    });
  });
});
