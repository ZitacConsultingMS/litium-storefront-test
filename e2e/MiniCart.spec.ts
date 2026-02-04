import { expect, test } from '@playwright/test';

const PRODUCT_URL = process.env.TEST_PRODUCT_URL ?? '';

test.describe('Mini cart', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before testing.
    await page.goto(PRODUCT_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('mini-cart__count')).toBeHidden();
    // Add item into cart
    const buyButton = page.getByTestId('buy-button');
    await buyButton.click();
    await expect(buyButton).toHaveText('Add to cart');
    await expect(page.getByTestId('mini-cart__count')).toHaveText('1');
    await page.getByTestId('mini-cart__bag').click();
    await expect(page.getByTestId('mini-cart__sidebar')).toHaveClass(
      /opacity-100/
    );
    const articleNumber = await buyButton.getAttribute(
      'data-testarticlenumber'
    );
    await expect(page.getByTestId(articleNumber ?? '')).toBeVisible();
    await expect(page.getByTestId('cart-content__empty-cart')).toBeHidden();
  });

  test('Update item in mini cart', async ({ page }) => {
    const quantitySelect = page.getByTestId('quantity-input__select');
    await expect(quantitySelect).toHaveValue(/1/);
    await quantitySelect.selectOption('5');
    await expect(quantitySelect).toHaveValue(/5/);
    await quantitySelect.selectOption('More');
    const quantityInput = page.getByTestId('quantity-input__input');
    await quantityInput.fill('20');
    const quantityInputOk = page.getByTestId('quantity-input__input-ok');
    await quantityInputOk.click();
    await expect(quantitySelect).toHaveValue(/20/);
  });
  test('Remove item in mini cart', async ({ page }) => {
    const articleNumber = await page
      .getByTestId('buy-button')
      .getAttribute('data-testarticlenumber');
    await page.getByTestId(`${articleNumber}__remove-btn`).click();
    await expect(page.getByTestId(articleNumber ?? '')).toBeHidden();
    await expect(page.getByTestId('mini-cart__count')).toBeHidden();
    await expect(page.getByTestId('cart-content__empty-cart')).toBeVisible();
  });
});
