import { expect, test } from '@playwright/test';

test.describe('Category page', () => {
  test.describe('Faceted Search', () => {
    test.describe('On Desktop screen', () => {
      test.skip(({ isMobile }) => isMobile === true, 'Check on Desktop only');

      test.describe('Without search param', () => {
        test.beforeEach(async ({ page }) => {
          // Go to the starting url before testing.
          await page.goto('/woman');
          await page.waitForLoadState('networkidle');
        });

        test('Should be able to render distinct faceted filter', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const groupFilter = containerDesktop.getByTestId('accordion__header');
          await expect(groupFilter).not.toHaveCount(0);
        });

        test('Should have the first filter group expanded as default', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const accordionContent = containerDesktop
            .getByTestId('accordion__panel')
            .first();

          await expect(accordionContent).toHaveClass(/max-h-max/);
        });

        test('Should show correct number of selected filters', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(0)');

          const facetedFilterColor = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');
        });

        test('Should be able to expand/collapse filter group', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const accordionHeader = containerDesktop
            .getByTestId('accordion__header')
            .first();
          const accordionContent = containerDesktop
            .getByTestId('accordion__panel')
            .first();

          await accordionHeader.click();
          await expect(accordionContent).toHaveClass(/max-h-0/);
          await accordionHeader.click();
          await expect(accordionContent).toHaveClass(/max-h-max/);
        });

        test('Should be able to add/remove search param after clicking on distinct filter', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const facetedFilterColor = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          const facetedFilterColorGreen = facetedFilterColor.getByText('Green');

          await facetedFilterColorBlack.click();
          await expect(page).toHaveURL('/woman?Color=Black');

          await facetedFilterColorGreen.click();
          await expect(page).toHaveURL('/woman?Color=Black&Color=Green');

          await facetedFilterColorBlack.click();
          await expect(page).toHaveURL('/woman?Color=Green');

          await facetedFilterColorGreen.click();
          await expect(page).toHaveURL('/woman');
        });

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const facetedFilterColor = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(page).toHaveURL('/woman?Color=Black');
          await containerDesktop
            .getByTestId('filter-summary__clear-btn')
            .click();
          await expect(page).toHaveURL('/woman');
        });

        test('Should show correct number of selected filters after changing slider value', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(0)');

          await containerDesktop
            .getByTestId('accordion__header')
            .getByText('Price')
            .click();
          const slider = containerDesktop
            .getByTestId('faceted-filter-slider__range')
            .first();
          const sliderHandle = slider.locator('.rc-slider-handle-1');
          await sliderHandle.click();
          await page.keyboard.down('ArrowRight');

          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');
        });

        test('Should update URL with correct search param after changing slider value', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          await containerDesktop
            .getByTestId('accordion__header')
            .getByText('Price')
            .click();
          const slider = containerDesktop
            .getByTestId('faceted-filter-slider__range')
            .first();
          const sliderHandle = slider.locator('.rc-slider-handle-1');
          await sliderHandle.click();
          await page.keyboard.down('ArrowRight');

          await expect(page).toHaveURL('/woman?Price=101-3500');
        });
      });

      test.describe('With search param', () => {
        test.beforeEach(async ({ page }) => {
          // Go to the starting url before testing.
          await page.goto(
            '/woman?sort_by=popular&sort_direction=ASCENDING&Color=Green'
          );
          await page.waitForLoadState('networkidle');
        });

        test('Should show correct number of selected filters', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');

          const facetedFilterColor = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(
            containerDesktop.getByTestId('filter-summary__selected-count')
          ).toHaveText('(2)');
        });

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerDesktop = page.getByTestId(
            'faceted-search__container--desktop'
          );
          const facetedFilterColor = containerDesktop.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(page).toHaveURL(
            '/woman?sort_by=popular&sort_direction=ASCENDING&Color=Green&Color=Black'
          );
          await containerDesktop
            .getByTestId('filter-summary__clear-btn')
            .click();
          await expect(page).toHaveURL(
            '/woman?sort_by=popular&sort_direction=ASCENDING'
          );
        });
      });
    });

    test.describe('On Mobile screen', () => {
      test.skip(({ isMobile }) => !isMobile, 'Check on Mobile only');

      test.describe('Without search param', () => {
        test.beforeEach(async ({ page }) => {
          // Go to the starting url before testing.
          await page.goto('/woman');
          await page.waitForLoadState('networkidle');

          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const filterSummary = containerMobile.getByTestId(
            'faceted-filter__summary'
          );
          await filterSummary.click();
        });

        test('Should show filter sidebar after clicking on filter button', async ({
          page,
        }) => {
          await expect(page.getByTestId('sidebar__backdrop')).toBeVisible();
        });

        test('Should cancel any filter selections made since the filter panel was opened after clicking on close icon', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();

          await page.getByTestId('faceted-filter__close-btn').click();
          await expect(page).toHaveURL('/woman');
        });

        test('Should show correct number of products after selecting filter', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();

          const showButton = containerMobile.getByTestId(
            'faceted-filter__show-btn'
          );
          await expect(showButton).toContainText('55');
        });

        test('Should be able to expand/collapse filter group', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const accordionHeader = containerMobile
            .getByTestId('accordion__header')
            .first();
          const accordionContent = containerMobile
            .getByTestId('accordion__panel')
            .first();

          await accordionHeader.click();
          await expect(accordionContent).toHaveClass(/max-h-0/);
          await accordionHeader.click();
          await expect(accordionContent).toHaveClass(/max-h-max/);
        });

        test('Should have the first filter group expanded as default', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const accordionContent = containerMobile
            .getByTestId('accordion__panel')
            .first();

          await expect(accordionContent).toHaveClass(/max-h-max/);
        });

        test('Should show correct number of selected filters', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');
        });

        test('Should update correct URL after clicking on show button', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();

          containerMobile
            .getByTestId('accordion__header')
            .getByText('Price')
            .click();

          const slider = containerMobile
            .getByTestId('faceted-filter-slider__range')
            .first();
          const sliderHandle = slider.locator('.rc-slider-handle-1');
          await sliderHandle.click();
          await page.keyboard.down('ArrowRight');
          await page.waitForTimeout(200);

          const showButton = containerMobile.getByTestId(
            'faceted-filter__show-btn'
          );
          await showButton.click();
          await expect(page).toHaveURL('/woman?Color=Black&Price=101-3500');
        });

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(0)');

          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');

          await containerMobile
            .getByTestId('faceted-filter__clear-btn')
            .click();
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(0)');
        });

        test('Should show correct number of selected filters after changing slider value', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(0)');

          await containerMobile
            .getByTestId('accordion__header')
            .getByText('Price')
            .click();
          const slider = containerMobile
            .getByTestId('faceted-filter-slider__range')
            .first();
          const sliderHandle = slider.locator('.rc-slider-handle-1');
          await sliderHandle.click();
          await page.keyboard.down('ArrowRight');

          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');
        });
      });

      test.describe('With search param', () => {
        test.beforeEach(async ({ page }) => {
          // Go to the starting url before testing.
          await page.goto(
            '/woman?sort_by=popular&sort_direction=ASCENDING&Color=Green'
          );
          await page.waitForLoadState('networkidle');

          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const filterSummary = containerMobile.getByTestId(
            'faceted-filter__summary'
          );
          await filterSummary.click();
        });

        test('Should cancel any filter selections made since the filter panel was opened after clicking on close icon', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();

          await containerMobile
            .getByTestId('faceted-filter__close-btn')
            .click();
          await expect(page).toHaveURL(
            '/woman?sort_by=popular&sort_direction=ASCENDING&Color=Green'
          );
        });

        test('Should clear all filters after clicking on clear button', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(1)');

          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();
          await expect(
            containerMobile.getByTestId('filter-summary__selected-count')
          ).toHaveText('(2)');

          await containerMobile
            .getByTestId('faceted-filter__clear-btn')
            .click();
          await containerMobile.getByTestId('faceted-filter__show-btn').click();
          await expect(page).toHaveURL(
            '/woman?sort_by=popular&sort_direction=ASCENDING'
          );
        });

        test('Should update correct URL after clicking on show button', async ({
          page,
        }) => {
          const containerMobile = page.getByTestId(
            'faceted-search__container--mobile'
          );
          const facetedFilterColor = containerMobile.getByTestId(
            'faceted-filter-checkbox__label--Color'
          );
          const facetedFilterColorBlack = facetedFilterColor.getByText('Black');
          await facetedFilterColorBlack.click();

          await containerMobile
            .getByTestId('accordion__header')
            .getByText('Price')
            .click();
          const slider = containerMobile
            .getByTestId('faceted-filter-slider__range')
            .first();
          const sliderHandle = slider.locator('.rc-slider-handle-1');
          await sliderHandle.click();
          await page.keyboard.down('ArrowRight');
          await page.waitForTimeout(200);

          const showButton = containerMobile.getByTestId(
            'faceted-filter__show-btn'
          );
          await showButton.click();
          await expect(page).toHaveURL(
            '/woman?sort_by=popular&sort_direction=ASCENDING&Color=Green&Color=Black&Price=401-2000'
          );
        });
      });
    });
  });
});
