import { expect, test } from 'utils/axe-test';

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
    test.describe('WCAG 2.1.1 - Keyboard Navigation', () => {
      test.describe('Breadcrumb Navigation', () => {
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
      });
      test.describe('Product Selection', () => {
        test.describe('Change quantity select', () => {
          test('should navigate through quantity select using keyboard', async ({
            page,
          }) => {
            await page.getByTestId('quantity-input__select').first().focus();
            await expect(
              page.getByTestId('quantity-input__select').first()
            ).toBeFocused();
          });
          test('should change quantity select using keyboard', async ({
            page,
          }) => {
            const quantitySelect = page
              .getByTestId('quantity-input__select')
              .first();
            await quantitySelect.focus();
            await expect(quantitySelect).toBeFocused();
            await quantitySelect.selectOption('1');
            await expect(quantitySelect).toHaveValue('1');

            // Select the more option
            await quantitySelect.selectOption('quantityinput.option.more');
            await expect(
              page.getByTestId('quantity-input__input')
            ).toBeVisible();
            await page.getByTestId('quantity-input__input').fill('100');
            await page.getByTestId('quantity-input__input-ok').click();
            await expect(quantitySelect).toHaveValue('100');
          });
          test('should add to cart using keyboard', async ({ page }) => {
            const quantitySelect = page
              .getByTestId('quantity-input__select')
              .first();
            await quantitySelect.focus();
            await expect(quantitySelect).toBeFocused();
            await quantitySelect.selectOption('5');
            await expect(quantitySelect).toHaveValue('5');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await expect(
              page.getByRole('button', { name: 'Added to cart' })
            ).toBeVisible();
            await expect(
              page.getByRole('button', { name: 'Your cart' })
            ).toContainText('5');
          });
        });
      });

      test.describe('Product Information Accordions', () => {
        test('should navigate through accordion buttons using keyboard', async ({
          page,
        }) => {
          const accordionButtons = page.getByTestId('accordion__header-button');
          await accordionButtons.focus();
          await expect(accordionButtons).toBeFocused();
        });
        test('should expand and collapse accordions using keyboard', async ({
          page,
        }) => {
          const accordionButtons = page
            .getByTestId('accordion__header-button')
            .first();
          await accordionButtons.focus();
          await expect(accordionButtons).toBeFocused();
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
  });
});
