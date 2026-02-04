import { expect, Locator, test } from '@playwright/test';

test.describe('Category page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before testing.
    await page.goto('/woman');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Data', () => {
    test('should be able to display product item in list', async ({ page }) => {
      const productItems = page.getByTestId('product-card');
      await expect(productItems).not.toHaveCount(0);
    });
  });

  test.describe('Routing', () => {
    let firstProductItem: Locator;
    let productItems: Locator;

    test.beforeEach(async ({ page }) => {
      productItems = page.getByTestId('product-card');
      firstProductItem = productItems.first();
    });

    test('should be able to go to product detail', async ({ page }) => {
      const firstProductItemLink = await firstProductItem
        .locator('a')
        .first()
        .getAttribute('href');
      expect(firstProductItemLink).not.toBeNull();
      await firstProductItem.click();
      await expect(page).toHaveURL(firstProductItemLink as string);
    });

    test('should pass the correct product name to detail page', async ({
      page,
    }) => {
      const firstProductItemName = await firstProductItem
        .getByTestId('product-card__name')
        .textContent();
      await firstProductItem.click();
      const firstProductDetailName = await page
        .getByTestId('product-detail__name')
        .textContent();
      expect(firstProductItemName).toEqual(firstProductDetailName);
    });
  });

  test.describe('Metadata', () => {
    test('should be able to render all social tags', async ({ page }) => {
      const titleLocator = await page
        .locator('head > meta[property="og:title"]')
        .getAttribute('content');
      expect.soft(titleLocator).toEqual('Woman');

      const typeLocator = await page
        .locator('head > meta[property="og:type"]')
        .getAttribute('content');
      expect.soft(typeLocator).toEqual('website');

      const urlLocator = await page
        .locator('head > meta[property="og:url"]')
        .getAttribute('content');
      expect.soft(urlLocator).toContain(`https://localhost/woman`);

      const imageLocator = await page
        .locator('head > meta[property="og:image"]')
        .getAttribute('content');
      expect.soft(imageLocator).toBeDefined();

      const imageSecureLocator = await page
        .locator('head > meta[property="og:image:secure_url"]')
        .getAttribute('content');
      expect.soft(imageSecureLocator).toBeDefined();

      const descriptionLocator = await page
        .locator('head > meta[property="og:description"]')
        .getAttribute('content');
      expect
        .soft(descriptionLocator)
        .toContain(`High-quality activewear for running, the gym or yoga`);
    });
  });

  test.describe('Load more button', () => {
    let loadMoreButton: Locator;

    test.beforeEach(async ({ page }) => {
      loadMoreButton = page.getByTestId('product-list__load-more');
    });
    test.describe('when clicking on load more button', () => {
      test(`should load more 20 products per click`, async ({ page }) => {
        if (loadMoreButton) {
          await loadMoreButton.click();
          const productItems = page.getByTestId('product-card');
          expect(await productItems.count()).toBeLessThanOrEqual(40);
        }
      });
    });
  });

  test.describe('Sort drop down button', () => {
    test.describe('On Desktop screen', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test('Should be able to add/replace search param when clicking on sort criteria', async ({
        page,
      }) => {
        await page.getByTestId('dropdown__button').click();
        const sortCriteriaOptions = page.getByTestId(
          'dropdown__option--desktop'
        );
        await sortCriteriaOptions.nth(1).click();
        await expect(page).toHaveURL(
          '/woman?sort_by=articlenumber&sort_direction=ASCENDING'
        );
        expect(
          await page.getByTestId('dropdown__button').textContent()
        ).toEqual('Article number');
        await page.getByTestId('dropdown__button').click();
        await sortCriteriaOptions.nth(3).click();
        await expect(page).toHaveURL(
          '/woman?sort_by=price&sort_direction=ASCENDING'
        );
        expect(
          await page.getByTestId('dropdown__button').textContent()
        ).toEqual('Price - low to high');
      });
    });

    test.describe('On Mobile screen', () => {
      test.skip(({ isMobile }) => !isMobile, 'Check on Mobile only');

      test('Should be able to add/replace search param when clicking on sort criteria', async ({
        page,
      }) => {
        await page.getByTestId('dropdown__button').click();
        const sortCriteriaOptions = page.getByTestId(
          'dropdown__option--mobile'
        );
        await sortCriteriaOptions.nth(1).click();
        await expect(page).toHaveURL(
          '/woman?sort_by=articlenumber&sort_direction=ASCENDING'
        );
        expect(
          await page.getByTestId('dropdown__button').textContent()
        ).toEqual('Article number');
        await page.getByTestId('dropdown__button').click();
        await sortCriteriaOptions.nth(3).click();
        await expect(page).toHaveURL(
          '/woman?sort_by=price&sort_direction=ASCENDING'
        );
        expect(
          await page.getByTestId('dropdown__button').textContent()
        ).toEqual('Price - low to high');
      });
    });
  });

  test.describe('Buy button', () => {
    test.skip(
      () => true,
      'Skip when Buy button is not visible in Category page'
    );
    test('should update cart after product is successfully added to cart', async ({
      page,
    }) => {
      await page.goto(process.env.TEST_PRODUCT_URL || '');
      const firstBuyButtonWrapper = page
        .getByTestId('buy-button-wrapper')
        .first();
      const firstBuyButton = page.getByTestId('buy-button').first();
      await firstBuyButton.click();
      await expect(firstBuyButtonWrapper).toHaveClass('buy-button--loading');
      await expect(firstBuyButtonWrapper).toHaveClass('buy-button--success');
      await expect(page.getByTestId('mini-cart__count')).toHaveText('1');
    });
  });

  test.describe('Breadcrumb', () => {
    test('should be able to go to Home page when clicking on breadcrumb', async ({
      page,
    }) => {
      const firstBreadcrumbPage = page.getByTestId('breadcrumb').first();
      const firstBreadcrumbPageLink =
        await firstBreadcrumbPage.getAttribute('href');
      expect(firstBreadcrumbPageLink).not.toBeNull();
      await firstBreadcrumbPage.click();
      await expect(page).toHaveURL(firstBreadcrumbPageLink as string);
    });
  });

  test.describe('Sub category', () => {
    test('should be able to go to sub category page', async ({ page }) => {
      const firstSubCategory = page.getByTestId('sub-category').first();
      const firstSubCategoryLink = await firstSubCategory.getAttribute('href');
      expect(firstSubCategoryLink).not.toBeNull();
      await firstSubCategory.click();
      await expect(page).toHaveURL(firstSubCategoryLink as string);
    });
  });
});
