import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testProductWithVariantsListProductUrl =
  process.env.TEST_PRODUCT_WITH_VARIANTS_LIST_PRODUCT_URL ?? '';

test.describe('Test WCAG for Product With Variants List Product Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testProductWithVariantsListProductUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      makeAxeBuilder,
    }) => {
      const result = await makeAxeBuilder().analyze();
      expect(result.violations).toEqual([]);
    });
  });
  test.describe("Test rules that axe-core doesn't cover", () => {
    test.describe('WCAG - 1.3.5 - Identify Input Purpose tests', () => {
      test('should pass input purpose compliance for user fields using autocomplete', async ({
        page,
      }) => {
        const result = await wcag135Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
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

      test.describe('Breadcrumb Navigation', () => {
        test('should navigate through breadcrumb links using keyboard', async ({
          page,
        }) => {
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('product-detail__category')
          ).toBeFocused();
        });
      });

      test.describe('Gallery Images', () => {
        test.skip(() => true, 'Already tested in ImageGallery.spec.ts');
      });

      test.describe('Product Selection', () => {
        test.beforeEach(async ({ page }) => {
          // Start focus from the last main image gallery
          await page.getByTestId('thumbs-gallery__main-image').last().focus();
        });
        test('should navigate throught all product variants using keyboard', async ({
          page,
        }) => {
          const quantiySelects = page.locator(
            '[data-testid="quantity-input__select"]:visible'
          );
          const quantiySelectsCount = await quantiySelects.count();
          const buyButtons = page.getByTestId('buy-button');
          for (let i = 0; i < quantiySelectsCount; i++) {
            await page.keyboard.press('Tab');
            await expect(quantiySelects.nth(i)).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(buyButtons.nth(i)).toBeFocused();
          }
        });
        test('should change quantity select using keyboard', async ({
          page,
        }) => {
          const quantitySelect = page
            .getByTestId('quantity-input__select')
            .first();
          await page.keyboard.press('Tab');
          await expect(quantitySelect).toBeFocused();
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('2');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('3');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('4');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('5');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('6');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('7');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('8');
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('9');
          await page.keyboard.press('ArrowDown');
          // Select the more option
          await expect(page.getByTestId('quantity-input__input')).toBeVisible();
          await page.getByTestId('quantity-input__input').type('100');
          await page.keyboard.press('Tab');
          await expect(
            page.getByTestId('quantity-input__input-ok')
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(quantitySelect).toHaveValue('100');
        });
        test('should add to cart using keyboard', async ({ page }) => {
          const quantitySelect = page
            .getByTestId('quantity-input__select')
            .first();
          const buyButton = page.getByTestId('buy-button').first();
          await page.keyboard.press('Tab'); // First quantity select
          await expect(quantitySelect).toBeFocused();
          await page.keyboard.press('ArrowDown');
          await expect(quantitySelect).toHaveValue('2');
          await page.keyboard.press('Tab');
          await expect(buyButton).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('button', { name: 'Added to cart' })
          ).toBeVisible();
          await expect(page.getByTestId('mini-cart__count')).toContainText('2');
        });
      });

      test.describe('Product Information Accordions', () => {
        test.beforeEach(async ({ page }) => {
          // Start from the last buy button
          await page
            .locator('[data-testid="buy-button"]:visible')
            .last()
            .focus();
        });
        test('should navigate through accordion buttons using keyboard', async ({
          page,
        }) => {
          const accordionButtons = page.getByTestId('accordion__header-button');
          const accordionButtonsCount = await accordionButtons.count();
          for (let i = 0; i < accordionButtonsCount; i++) {
            await page.keyboard.press('Tab');
            await expect(accordionButtons.nth(i)).toBeFocused();
          }
        });
        test('should expand and collapse accordions using keyboard', async ({
          page,
        }) => {
          const accordionButtons = page
            .getByTestId('accordion__header-button')
            .first();
          await page.keyboard.press('Tab');
          await expect(accordionButtons).toBeFocused();
          await expect(accordionButtons).toHaveAttribute(
            'aria-expanded',
            'true'
          );
          await page.keyboard.press('Enter');
          await expect(accordionButtons).toHaveAttribute(
            'aria-expanded',
            'false'
          );
          await page.keyboard.press('Enter');
          await expect(accordionButtons).toHaveAttribute(
            'aria-expanded',
            'true'
          );
        });
      });
    });
    test.describe('WCAG - 3.1.2 - Language of Parts', () => {
      test('should pass language of parts tests', async ({ page }) => {
        const result = await wcag312Helpers.runAllTests(page);
        expect(result.violations).toEqual([]);
      });
    });
  });
});
