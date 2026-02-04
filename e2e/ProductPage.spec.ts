import { expect, test } from '@playwright/test';

const PRODUCT_URL = process.env.TEST_PRODUCT_URL ?? '';

test.describe('Product page', () => {
  test.describe('Detail', () => {
    test.beforeEach(async ({ page }) => {
      // Go to the starting url before testing.
      await page.goto(PRODUCT_URL);
      await page.waitForLoadState('networkidle');
    });

    test.describe('Metadata', () => {
      test('should render title with the same value as product name', async ({
        page,
      }) => {
        const titleLocator = await page.locator('head > title').innerText();
        const productName = await page
          .getByTestId('product-detail__name')
          .textContent();
        expect(titleLocator).toEqual(`${productName} | Litium Accelerator`);
      });

      test('should render the correct social tags', async ({ page }) => {
        const titleTag = await page
          .locator('head > meta[property="og:title"]')
          .getAttribute('content');
        const productName = await page
          .getByTestId('product-detail__name')
          .textContent();
        expect.soft(titleTag).toEqual(productName);

        const typeTag = await page
          .locator('head > meta[property="og:type"]')
          .getAttribute('content');
        expect.soft(typeTag).toEqual('website');

        const urlTag = await page
          .locator('head > meta[property="og:url"]')
          .getAttribute('content');
        expect.soft(urlTag).toContain(`https://localhost${PRODUCT_URL}`);

        const imageTag = await page
          .locator('head > meta[property="og:image"]')
          .first()
          .getAttribute('content');
        expect.soft(imageTag).toBeDefined();
      });
    });

    test.describe('Data', () => {
      test('should be able to change color', async ({ page }) => {
        const selectorColor = page
          .getByTestId('product-detail__color')
          .and(page.locator('.border-secondary-2'))
          .first();
        const selectorColorLink = await selectorColor.getAttribute('href');
        await selectorColor.click();
        await expect(page).toHaveURL(selectorColorLink as string);
      });

      test('should be able to change size', async ({ page }) => {
        const selectorSize = page
          .getByTestId('product-detail__color')
          .and(page.locator('.border-secondary-2'))
          .first();
        const selectorSizeLink = await selectorSize.getAttribute('href');
        await selectorSize.click();
        await expect(page).toHaveURL(selectorSizeLink as string);
      });

      test('should have the first field group expanded as default', async ({
        page,
      }) => {
        const accordionContent = page.getByTestId('accordion__panel').first();

        await expect(accordionContent).toHaveClass(/max-h-max/);
      });
    });

    test.describe('Buy button', () => {
      test('should update the label to Added to cart after product is successfully added to cart', async ({
        page,
      }) => {
        const buyButtonWrapper = page.getByTestId('buy-button-wrapper');
        const buyButton = page.getByTestId('buy-button');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--loading');
        await expect(buyButtonWrapper).toHaveClass('buy-button--success');
        await expect(buyButton).toContainText('Added to cart');
      });
      test('should update cart after product is successfully added to cart', async ({
        page,
      }) => {
        const buyButtonWrapper = page.getByTestId('buy-button-wrapper');
        const buyButton = page.getByTestId('buy-button');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--loading');
        await expect(buyButtonWrapper).toHaveClass('buy-button--success');
        await expect(page.getByTestId('mini-cart__count')).toHaveText('1');
      });
      test('should prevent multiple clicking while adding to cart is processing', async ({
        page,
      }) => {
        const buyButtonWrapper = page.getByTestId('buy-button-wrapper');
        const buyButton = page.getByTestId('buy-button');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--loading');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--success');
        await buyButton.click();
        await expect(buyButtonWrapper).not.toHaveClass('buy-button--loading');
      });
      test('should be able to add product to cart again after it is added to cart', async ({
        page,
      }) => {
        const buyButtonWrapper = page.getByTestId('buy-button-wrapper');
        const buyButton = page.getByTestId('buy-button');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--loading');
        await expect(buyButtonWrapper).toHaveClass('buy-button--success');
        await expect(buyButtonWrapper).not.toHaveClass('buy-button--success');
        await buyButton.click();
        await expect(buyButtonWrapper).toHaveClass('buy-button--loading');
      });
    });
  });
});
