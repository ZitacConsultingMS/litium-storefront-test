import { expect, test } from 'utils/axe-test';
import { wcag135Helpers } from './utils/wcag-rules/1.3.5-IdentifyInputPurpose-helpers';
import { wcag312Helpers } from './utils/wcag-rules/3.1.2-LanguageOfParts-helpers';

const testCategoryUrl = process.env.TEST_CATEGORY_URL ?? '/woman';

test.describe('Test WCAG for Category Product Category Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testCategoryUrl);
    await page.waitForLoadState('networkidle');
  });
  test.describe('Axe-core automated tests', () => {
    test('should pass axe-core accessibility tests', async ({
      makeAxeBuilder,
      page,
    }) => {
      const result = await makeAxeBuilder(page).analyze();
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
    test.describe('WCAG 2.1.1 - Keyboard', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');
      test.beforeEach(async ({ page }) => {
        // Use skip link to reach the main content
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#main-content/);
      });
      test.describe('Breadcrumb', () => {
        test('should using tab to go to all elements', async ({ page }) => {
          const count = await page.getByTestId('breadcrumb-desktop').count();
          const maxBreadcrumbLink = Math.max(count - 2, 0);
          for (let i = 0; i < maxBreadcrumbLink; i++) {
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('breadcrumb-desktop').nth(i + 1)
            ).toBeFocused();
          }
        });
      });
      test.describe('Sub category', () => {
        test.beforeEach(async ({ page }) => {
          // Start from the last breadcrumb link
          const breadcrumb = page.getByTestId('breadcrumb-desktop');
          const count = await breadcrumb.count();
          const maxBreadcrumbLink = Math.max(count - 2, 0);
          await breadcrumb.nth(maxBreadcrumbLink).focus();
        });
        test('should using tab to go to all elements', async ({ page }) => {
          const subCategorys = page.getByTestId('sub-category');
          const count = await subCategorys.count();
          for (let i = 0; i < count; i++) {
            await page.keyboard.press('Tab');
            await expect(subCategorys.nth(i)).toBeFocused();
          }
        });
        test('should navigate to sub category using keyboard and enter', async ({
          page,
        }) => {
          const subCategorys = page.getByTestId('sub-category');
          const count = await subCategorys.count();
          if (count > 0) {
            await page.keyboard.press('Tab');
            const subCategoryUrl = await subCategorys
              .first()
              .getAttribute('href');
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(subCategoryUrl as string);
          }
        });
      });
      test.describe('Product search result', () => {
        test.beforeEach(async ({ page }) => {
          // start from the last sub category link
          const subCategorys = page.getByTestId('sub-category');
          const count = await subCategorys.count();
          await subCategorys.nth(count - 1).focus();
          await expect(subCategorys.nth(count - 1)).toBeFocused();
        });
        test.describe('Faceted filter', () => {
          test('should using keyboard to expand and collapse faceted filter', async ({
            page,
          }) => {
            await page.keyboard.press('Tab');
            const accordionHeaderButton = page
              .getByTestId('accordion__header-button')
              .first();
            await expect(accordionHeaderButton).toBeFocused();
            await expect(accordionHeaderButton).toHaveAttribute(
              'aria-expanded',
              'true'
            );
            await page.keyboard.press('Enter');
            expect(accordionHeaderButton).toHaveAttribute(
              'aria-expanded',
              'false'
            );
          });
          test('should using keyboard to navigate through faceted filter', async ({
            page,
          }) => {
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('accordion__header-button').first()
            ).toBeFocused();
            const filterCheckboxes = page
              .getByTestId('faceted-filter-checkbox-label')
              .locator('span:before');
            const count = await filterCheckboxes.count();
            for (let i = 0; i < count; i++) {
              await page.keyboard.press('Tab');
              await expect(filterCheckboxes.nth(i)).toBeFocused();
            }
          });
          test('should apply checkbox filter using keyboard', async ({
            page,
          }) => {
            const accordionHeaderButton = page
              .getByTestId('accordion__header-button')
              .first();
            const firstCheckboxInput = page
              .getByTestId('faceted-filter-checkbox-label')
              .first()
              .locator('input');
            await page.keyboard.press('Tab');
            await expect(accordionHeaderButton).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(firstCheckboxInput).not.toBeChecked();
            await page.keyboard.press('Enter');
            await expect(firstCheckboxInput).toBeChecked();
          });
          test('should navigate throught all accordion headers', async ({
            page,
          }) => {
            const accordionHeaders = page.locator(
              '[data-testid="accordion__header-button"]:visible'
            );
            const count = await accordionHeaders.count();
            for (let i = 0; i < count; i++) {
              await page.keyboard.press('Tab');
              await expect(accordionHeaders.nth(i)).toBeFocused();
              if (
                (await accordionHeaders
                  .nth(i)
                  .getAttribute('aria-expanded')) === 'true'
              ) {
                await page.keyboard.press('Enter');
                await expect(accordionHeaders.nth(i)).toHaveAttribute(
                  'aria-expanded',
                  'false'
                );
              }
            }
          });
          test('should apply slider filter using keyboard', async ({
            page,
          }) => {
            const accordionHeaderButton = page
              .locator('[data-testid="accordion__header-button"]:visible')
              .last();
            accordionHeaderButton.focus();
            await expect(accordionHeaderButton).toBeFocused();
            if (
              (await accordionHeaderButton.getAttribute('aria-expanded')) ===
              'false'
            ) {
              await page.keyboard.press('Enter');
              await expect(accordionHeaderButton).toHaveAttribute(
                'aria-expanded',
                'true'
              );
            }
            await page.keyboard.press('Tab');
            await expect(
              page.locator('.rc-slider-handle:visible').first()
            ).toBeFocused();
            const currentMinPrice = await page
              .locator('.rc-slider-handle:visible')
              .first()
              .getAttribute('aria-valuenow');
            const currentMaxPrice = await page
              .locator('.rc-slider-handle:visible')
              .last()
              .getAttribute('aria-valuenow');
            await page.keyboard.press('ArrowRight');
            const newMinPrice = currentMinPrice
              ? parseInt(currentMinPrice) + 1
              : 0;
            await expect(page).toHaveURL(
              testCategoryUrl + '?Price=' + newMinPrice + '-' + currentMaxPrice
            );
            await page.keyboard.press('Tab');
            await expect(
              page.locator('.rc-slider-handle:visible').last()
            ).toBeFocused();
            await page.keyboard.press('ArrowLeft');
            const newMaxPrice = currentMaxPrice
              ? parseInt(currentMaxPrice) - 1
              : 0;
            await expect(page).toHaveURL(
              testCategoryUrl + '?Price=' + newMinPrice + '-' + newMaxPrice
            );
          });
          test('should clear filter using keyboard', async ({ page }) => {
            const accordionHeaderButton = page
              .locator('[data-testid="accordion__header-button"]:visible')
              .first();
            const checkboxInput = page
              .locator('[data-testid="faceted-filter-checkbox-label"]:visible')
              .first()
              .locator('input');

            await page.keyboard.press('Tab'); // Accordion header button
            await page.keyboard.press('Tab'); // Checkbox
            await page.keyboard.press('Enter');
            await expect(checkboxInput).toBeChecked();
            await expect(
              page.locator('[data-testid="filter-summary__clear-btn"]:visible')
            ).toBeVisible();
            await page.keyboard.press('Shift+Tab');
            await expect(accordionHeaderButton).toBeFocused();
            await page.keyboard.press('Shift+Tab');
            await expect(
              page.locator('[data-testid="filter-summary__clear-btn"]:visible')
            ).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(testCategoryUrl);
            await expect(checkboxInput).not.toBeChecked();
            await expect(
              page.locator('[data-testid="filter-summary__clear-btn"]:visible')
            ).not.toBeVisible();
          });
        });
        test.describe('Sort functionality', () => {
          test.beforeEach(async ({ page }) => {
            // Start from the last accordion header button
            const accordionHeaderButton = page
              .locator('[data-testid="accordion__header-button"]:visible')
              .last();
            await accordionHeaderButton.focus();
            await expect(accordionHeaderButton).toBeFocused();
          });
          test('should using tab to go to all sort options', async ({
            page,
          }) => {
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('dropdown__button')).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(
              page.getByTestId('dropdown__option--desktop-container')
            ).toBeVisible();
            const sortOptions = page.getByTestId('dropdown__option--desktop');
            const count = await sortOptions.count();
            for (let i = 0; i < count; i++) {
              await page.keyboard.press('Tab');
              await expect(sortOptions.nth(i)).toBeFocused();
            }
          });
          test('should using tab and enter to apply sort', async ({ page }) => {
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('dropdown__button')).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(
              page.getByTestId('dropdown__option--desktop-container')
            ).toBeVisible();
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('dropdown__option--desktop').first()
            ).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('dropdown__option--desktop').nth(1)
            ).toBeFocused();
            await page.keyboard.press('Enter');
            const sortOptionName = await page
              .getByTestId('dropdown__option--desktop')
              .nth(1)
              .textContent();
            expect(page.getByTestId('dropdown__button')).toHaveText(
              sortOptionName as string
            );
          });
          test('should using Escape to close dropdown', async ({ page }) => {
            await page.keyboard.press('Tab');
            await expect(page.getByTestId('dropdown__button')).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(
              page.getByTestId('dropdown__option--desktop-container')
            ).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(
              page.getByTestId('dropdown__option--desktop-container')
            ).not.toBeVisible();
          });
        });
        test.describe('Product card', () => {
          test.beforeEach(async ({ page }) => {
            // Start from the sort dropdown button
            const sortDropdownButton = page.getByTestId('dropdown__button');
            await sortDropdownButton.focus();
            await expect(sortDropdownButton).toBeFocused();
          });
          test('should using tab to go to all elements', async ({ page }) => {
            const productList = page.locator(
              '[data-testid="product-card"]:visible'
            );
            const count = await productList.count();
            for (let i = 0; i < count; i++) {
              await page.keyboard.press('Tab');
              await expect(
                productList.nth(i).getByTestId('product-card__url')
              ).toBeFocused();
              await page.keyboard.press('Tab');
              await expect(
                productList.nth(i).getByTestId('product-card__information')
              ).toBeFocused();
            }
            // Go to the load more button
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('product-list__load-more')
            ).toBeFocused();
          });
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
