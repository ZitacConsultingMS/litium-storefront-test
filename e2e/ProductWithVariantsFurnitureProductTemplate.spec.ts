import { expect, test } from 'utils/axe-test';

const testProductWithFurnitureProductUrl =
  process.env.TEST_PRODUCT_WITH_FURNITURE_PRODUCT_URL ?? '';

test.describe('Test WCAG for Product With Furniture Product Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testProductWithFurnitureProductUrl);
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
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');

      test.describe('Breadcrumb Navigation', () => {
        test('should navigate through breadcrumb links using keyboard', async ({
          page,
        }) => {
          await page.getByRole('link', { name: 'My Pages' }).focus();
          await expect(
            page.getByRole('link', { name: 'My Pages' })
          ).toBeFocused();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');
          // Test breadcrumb link is focused
          await expect(
            page.getByTestId('product-detail__category')
          ).toBeFocused();
        });
      });

      test.describe('Product Selection', () => {
        test('should navigate through color options using keyboard', async ({
          page,
        }) => {
          // Test color options
          const colorLinks = page.getByTestId('product-detail__color');
          const colorCount = await colorLinks.count();

          if (colorCount > 0) {
            for (let i = 0; i < colorCount; i++) {
              await colorLinks.nth(i).focus();
              await expect(colorLinks.nth(i)).toBeFocused();
            }
          }
        });
      });

      test.describe('Add to Cart Functionality', () => {
        test('should add product to cart using keyboard', async ({ page }) => {
          // Navigate to add to cart button
          const addToCartButton = page.getByRole('button', {
            name: 'Add to cart',
          });
          await addToCartButton.focus();
          await expect(addToCartButton).toBeFocused();

          // Add to cart with Enter key
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify button state changed
          await expect(
            page.getByRole('button', { name: 'Added to cart' })
          ).toBeVisible();

          // Verify cart icon shows item count
          const cartIcon = page.getByRole('button', { name: 'Your cart' });
          await expect(cartIcon).toContainText('1');
        });
      });

      test.describe('Product Information Accordions', () => {
        test('should navigate through accordion buttons using keyboard', async ({
          page,
        }) => {
          // Navigate to accordion area
          const accordionButtons = page.getByTestId('accordion__header-button');
          const buttonCount = await accordionButtons.count();

          if (buttonCount > 0) {
            // Focus on first accordion button
            await accordionButtons.first().focus();
            await expect(accordionButtons.first()).toBeFocused();

            // Toggle accordion with Enter key
            await page.keyboard.press('Enter');
            await expect(accordionButtons.first()).toHaveAttribute(
              'aria-expanded',
              'false'
            );

            // Navigate to next accordion button
            if (buttonCount > 1) {
              await page.keyboard.press('Tab');
              await expect(accordionButtons.nth(1)).toBeFocused();
              await expect(accordionButtons.nth(1)).toHaveAttribute(
                'aria-expanded',
                'false'
              );

              // Toggle second accordion
              await page.keyboard.press('Enter');
              await expect(accordionButtons.nth(1)).toHaveAttribute(
                'aria-expanded',
                'true'
              );
            }
          }
        });

        test('should expand and collapse accordions using keyboard', async ({
          page,
        }) => {
          // Test Product specification accordion
          const accordionButtons = page
            .getByTestId('accordion__header-button')
            .first();
          await accordionButtons.focus();
          await expect(accordionButtons).toBeFocused();

          // Expand accordion
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify accordion is expanded
          await expect(accordionButtons).toHaveAttribute(
            'aria-expanded',
            'false'
          );

          // Collapse accordion
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');

          // Verify accordion is collapsed
          await expect(accordionButtons).toHaveAttribute(
            'aria-expanded',
            'true'
          );
        });
      });

      test.describe('Skip Links', () => {
        test('should use skip to content link', async ({ page }) => {
          // Focus on skip link
          const skipLink = page.getByRole('link', { name: 'Skip to content' });
          await skipLink.focus();
          await expect(skipLink).toBeFocused();

          // Activate skip link
          await page.keyboard.press('Enter');

          // Verify focus moves to main content
          await expect(page).toHaveURL(/#main-content/);
        });
      });
    });
  });
});
