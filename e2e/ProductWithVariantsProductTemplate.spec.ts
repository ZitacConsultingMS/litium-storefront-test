import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testProductWithVariantsProductUrl =
  process.env.TEST_PRODUCT_WITH_VARIANTS_PRODUCT_URL ?? '';

test.describe('Test WCAG for Product With Variants Product Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testProductWithVariantsProductUrl);
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
        test('should navigate through color options using keyboard', async ({
          page,
        }) => {
          // Test color options
          const colorLinks = page.getByTestId('product-detail__color');
          const colorCount = await colorLinks.count();

          for (let i = 0; i < colorCount; i++) {
            await page.keyboard.press('Tab');
            await expect(colorLinks.nth(i)).toBeFocused();
          }
        });

        test('should navigate through size options using keyboard', async ({
          page,
        }) => {
          // Start focus from the last color option
          const colorLinks = page.locator(
            '[data-testid="product-detail__color"]'
          );
          await colorLinks.last().focus();

          // Test size options
          const sizeLinks = page.locator(
            '[data-testid="product-detail__size"]'
          );
          const sizeCount = await sizeLinks.count();

          for (let i = 0; i < sizeCount; i++) {
            await page.keyboard.press('Tab');
            await expect(sizeLinks.nth(i)).toBeFocused();
          }
        });
      });

      test.describe('Add to Cart Functionality', () => {
        test('should add product to cart using keyboard', async ({ page }) => {
          // Start from the last size option
          const sizeLinks = page.locator(
            '[data-testid="product-detail__size"]'
          );
          await sizeLinks.last().focus();
          await expect(sizeLinks.last()).toBeFocused();

          // Navigate to add to cart button
          const addToCartButton = page.getByRole('button', {
            name: 'Add to cart',
          });
          await page.keyboard.press('Tab');
          await expect(addToCartButton).toBeFocused();

          // Add to cart with Enter key
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify button state changed
          await expect(
            page.getByRole('button', { name: 'Added to cart' })
          ).toBeVisible();

          // Verify cart icon shows item count
          const cartIcon = page.getByTestId('mini-cart__count');
          await expect(cartIcon).toContainText('1');
        });
      });

      test.describe('Product Information Accordions', () => {
        test.beforeEach(async ({ page }) => {
          // Start from the add to cart button
          await page.getByTestId('buy-button').focus();
        });
        test('should navigate through accordion buttons using keyboard', async ({
          page,
        }) => {
          // Navigate to accordion area
          const accordionButtons = page.getByTestId('accordion__header-button');
          const buttonCount = await accordionButtons.count();

          for (let i = 0; i < buttonCount; i++) {
            await page.keyboard.press('Tab');
            await expect(accordionButtons.nth(i)).toBeFocused();
          }
        });

        test('should expand and collapse accordions using keyboard', async ({
          page,
        }) => {
          const accordionButtons = page.getByTestId('accordion__header-button');
          const buttonCount = await accordionButtons.count();

          for (let i = 0; i < buttonCount; i++) {
            await page.keyboard.press('Tab');
            await expect(accordionButtons.nth(i)).toBeFocused();
            if (
              (await accordionButtons.nth(i).getAttribute('aria-expanded')) ===
              'false'
            ) {
              await page.keyboard.press('Enter');
              await expect(accordionButtons.nth(i)).toHaveAttribute(
                'aria-expanded',
                'true'
              );
            } else {
              await page.keyboard.press('Enter');
              await expect(accordionButtons.nth(i)).toHaveAttribute(
                'aria-expanded',
                'false'
              );
            }
          }
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
