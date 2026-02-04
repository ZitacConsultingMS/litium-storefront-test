import { expect, test } from 'utils/axe-test';
/**
 * This is a note to prepare for testing the landing page template.
 * Setup the first primary navigation with one children banner link
 * Setup the second primary navigation without children link
 * Setup main content with one banner in a block with a link
 * Setup main content with two bannner in a block with links
 */

test.describe('Test WCAG for Landing Page Template', () => {
  const testLandingPageUrl = process.env.TEST_LANDING_PAGE_URL ?? '/';
  test.beforeEach(async ({ page }) => {
    await page.goto(testLandingPageUrl);
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
      test.describe('Header Navigation', () => {
        test.describe('Skip to content link', () => {
          test('should navigate through header elements using keyboard', async ({
            page,
          }) => {
            await page.keyboard.press('Tab');
            const skipLink = page.getByRole('link', {
              name: 'Skip to content',
            });
            await expect(skipLink).toBeFocused();
          });
          test('should use skip to content link', async ({ page }) => {
            await page.keyboard.press('Tab');
            const skipLink = page.getByRole('link', {
              name: 'Skip to content',
            });
            await expect(skipLink).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(/#main-content/);
          });
        });
        test('should navigate through logo link using keyboard', async ({
          page,
        }) => {
          await page.keyboard.press('Tab'); // Skip link
          await page.keyboard.press('Tab');
          const logoLink = page.getByRole('link', { name: 'Go to homepage' });
          await expect(logoLink).toBeFocused();
        });
        test.describe('Primary navigation', () => {
          test.beforeEach(async ({ page }) => {
            // Setup focus on the logo link
            await page.keyboard.press('Tab'); // Skip link
            await page.keyboard.press('Tab'); // Logo link
            await expect(
              page.getByRole('link', { name: 'Go to homepage' })
            ).toBeFocused();
          });
          test.describe('With children', () => {
            test('should navigate through the first primary navigation menu using keyboard', async ({
              page,
            }) => {
              const firstPrimaryLinkWrapper = page
                .getByTestId('primary-navigation-link')
                .nth(0);
              const firstPrimaryLink = firstPrimaryLinkWrapper.getByTestId(
                'primary-navigation-link__link'
              );
              const bannerLink = firstPrimaryLinkWrapper.getByTestId(
                'primary-navigation-banner'
              );
              await expect(
                await firstPrimaryLinkWrapper.getAttribute('aria-expanded')
              ).toBe('false');
              await expect(
                await firstPrimaryLinkWrapper.getAttribute('aria-haspopup')
              ).toBe('true');
              await page.keyboard.press('Tab');
              await expect(firstPrimaryLink).toBeFocused();
              // should expand children menu on focus
              await expect(
                await firstPrimaryLinkWrapper.getAttribute('aria-expanded')
              ).toBe('true');
              await page.keyboard.press('Tab');
              await expect(bannerLink).toBeFocused();
            });
          });
          test.describe('Without children', () => {
            test.beforeEach(async ({ page }) => {
              // Skip press keyboard Tab multiple times, use focus() to reach the banner link
              const firstPrimaryLinkWrapper = page
                .getByTestId('primary-navigation-link')
                .nth(0);
              const firstPrimaryLink = firstPrimaryLinkWrapper.getByTestId(
                'primary-navigation-link__link'
              );
              await firstPrimaryLink.focus();
              await expect(firstPrimaryLink).toBeFocused();
              const bannerLink = firstPrimaryLinkWrapper.getByTestId(
                'primary-navigation-banner'
              );
              await page.keyboard.press('Tab');
              await expect(bannerLink).toBeFocused();
            });
            test('should navigate through the second primary navigation menu using keyboard', async ({
              page,
            }) => {
              const secondPrimaryLinkWrapper = page
                .getByTestId('primary-navigation-link')
                .nth(1);
              const secondPrimaryLink = secondPrimaryLinkWrapper.getByTestId(
                'primary-navigation-link__link'
              );
              await expect(
                await secondPrimaryLinkWrapper.getAttribute('aria-haspopup')
              ).toBe('false');
              await page.keyboard.press('Tab');
              await expect(secondPrimaryLink).toBeFocused();
            });
          });
        });
        test.describe('My Pages', () => {
          test('should navigate through my pages using keyboard', async ({
            page,
          }) => {
            const myPagesLink = page.getByRole('link', { name: 'My Pages' });
            const secondaryNavigationLink = page
              .getByTestId('primary-navigation-link__link')
              .nth(1);
            await secondaryNavigationLink.focus();
            await expect(secondaryNavigationLink).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(myPagesLink).toBeFocused();
          });
        });
      });
      test.describe('Search Functionality', () => {
        // Helper function to navigate to search button
        const navigateToSearchButton = async (page: any) => {
          await page.keyboard.press('Tab');
          const searchButton = page.getByTestId('header__magnifier');
          await expect(searchButton).toBeFocused();
          return searchButton;
        };

        // Helper function to open search popup
        const openSearchPopup = async (page: any) => {
          await navigateToSearchButton(page);
          await page.keyboard.press('Enter');
          await expect(page.getByTestId('quicksearch')).toBeVisible();
          await expect(page.getByTestId('search__input')).toBeFocused();
        };

        // Helper function to perform a search
        const performSearch = async (page: any, searchTerm: string) => {
          const searchInput = page.getByTestId('search__input');
          await searchInput.fill(searchTerm);
          await page.waitForLoadState('networkidle');
          return searchInput;
        };

        test.beforeEach(async ({ page }) => {
          // Navigate to My Pages link to establish starting position
          const myPagesLink = page.getByRole('link', { name: 'My Pages' });
          await myPagesLink.focus();
          await expect(myPagesLink).toBeFocused();
        });

        test('should open search popup using keyboard navigation', async ({
          page,
        }) => {
          await openSearchPopup(page);
        });

        test('should perform search and clear results using keyboard', async ({
          page,
        }) => {
          // Open search popup
          await openSearchPopup(page);

          // Perform search
          const searchInput = await performSearch(page, 'hoodie');

          // Verify search results appear
          await expect(page.getByTestId('searchresult__heading')).toBeVisible();

          // Test clearing search input using keyboard shortcuts
          await page.keyboard.press('Control+a');
          await page.keyboard.press('Backspace');
          await expect(searchInput).toHaveValue('');

          // Test clearing search input using clear button
          await performSearch(page, 'hoodie');
          await page.keyboard.press('Tab');
          await expect(page.getByTestId('search__clear')).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(searchInput).toHaveValue('');
        });

        test('should navigate between search result tabs using keyboard', async ({
          page,
        }) => {
          // Open search and perform search
          await openSearchPopup(page);
          await performSearch(page, 'hoodie');

          // Wait for search results to load
          await expect(page.getByTestId('searchresult__heading')).toBeVisible();

          await page.keyboard.press('Tab'); // Clear button

          // Navigate to products tab
          await page.keyboard.press('Tab');
          const productsTab = page.getByTestId('tabs__header').first();
          await expect(productsTab).toBeFocused();

          // Navigate to categories tab
          const categoriesTab = page.getByTestId('tabs__header').nth(1);
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(categoriesTab).toBeFocused();

          // Navigate to pages tab
          const pagesTab = page.getByTestId('tabs__header').nth(2);
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(pagesTab).toBeFocused();
        });

        test('should navigate to products tab content using keyboard', async ({
          page,
        }) => {
          // Open search and perform search
          await openSearchPopup(page);
          await performSearch(page, 'hoodie');
          await page.waitForLoadState('networkidle');

          // Navigate to products tab
          const productsTab = page.getByTestId('tabs__header').first();
          await productsTab.focus();
          await expect(productsTab).toBeFocused();

          // Verify products tab content is visible
          const seeMoreButton = page.getByTestId('searchresult__see-more-btn');
          const productUrl = page.getByTestId('product-card__url');
          const productCount = await productUrl.count();
          const productInformation = page.getByTestId(
            'product-card__information'
          );
          for (let i = 0; i < productCount; i++) {
            await page.keyboard.press('Tab');
            await expect(productUrl.nth(i)).toBeFocused();
            await page.keyboard.press('Tab');
            await expect(productInformation.nth(i)).toBeFocused();
          }
          // Navigate to see more button
          await page.keyboard.press('Tab');
          await expect(seeMoreButton.locator('button')).toBeFocused();
        });

        test('should navigate to categories tab content using keyboard', async ({
          page,
        }) => {
          // Open search and perform search
          await openSearchPopup(page);
          await performSearch(page, 'hoodie');
          await page.waitForLoadState('networkidle');

          // Skip press keyboard Tab multiple times, use focus() to reach the products tab
          const productsTab = page.getByTestId('tabs__header').first();
          await productsTab.focus();
          await expect(productsTab).toBeFocused();

          // Navigate to categories tab
          const categoriesTab = page.getByTestId('tabs__header').nth(1);
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(categoriesTab).toBeFocused();
          await expect(page.getByTestId('tabs__panel')).toBeVisible();

          // Verify categories tab content is visible
          const searchItem = page.getByTestId('searchitem__url');
          const searchItemCount = await searchItem.count();
          if (searchItemCount > 0) {
            for (let i = 0; i < searchItemCount; i++) {
              await page.keyboard.press('Tab');
              await expect(searchItem.nth(i)).toBeFocused();
            }
            // Navigate to see more button
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('searchresult__see-more-btn').locator('button')
            ).toBeFocused();
          } else {
            await expect(
              page.getByTestId('searchresult__nohits')
            ).toBeVisible();
          }
        });
        test('should navigate to pages tab content using keyboard', async ({
          page,
        }) => {
          // Open search and perform search
          await openSearchPopup(page);
          await performSearch(page, 'hoodie');
          await page.waitForLoadState('networkidle');

          // Skip press keyboard Tab multiple times, use focus() to reach the products tab
          // Navigate to categories tab
          const categoriesTab = page.getByTestId('tabs__header').nth(1);
          await categoriesTab.focus();
          await page.keyboard.press('Enter');
          await expect(categoriesTab).toBeFocused();

          // Navigate to pages tab
          const pagesTab = page.getByTestId('tabs__header').nth(2);
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('Tab');
          await expect(pagesTab).toBeFocused();

          // Verify pages tab content is visible
          const searchItem = page.getByTestId('searchitem__url');
          const searchItemCount = await searchItem.count();
          if (searchItemCount > 0) {
            for (let i = 0; i < searchItemCount; i++) {
              await page.keyboard.press('Tab');
              await expect(searchItem.nth(i)).toBeFocused();
            }
            // Navigate to see more button
            await page.keyboard.press('Tab');
            await expect(
              page.getByTestId('searchresult__see-more-btn').locator('button')
            ).toBeFocused();
          } else {
            await expect(
              page.getByTestId('searchresult__nohits')
            ).toBeVisible();
          }
        });

        test('should close search popup using keyboard', async ({ page }) => {
          // Open search popup
          await openSearchPopup(page);

          // Close search with Escape key
          await page.keyboard.press('Escape');

          // Verify search popup is closed
          await expect(page.getByTestId('quicksearch')).not.toBeVisible();
        });
      });

      test.describe('Mini cart functionality', () => {
        test.beforeEach(async ({ page }) => {
          // Skip press keyboard Tab multiple times, use focus() to reach the quicksearch button
          const quicksearchButton = page.getByTestId('header__magnifier');
          await quicksearchButton.focus();
          await expect(quicksearchButton).toBeFocused();
          // Navigate to mini cart button
          await page.keyboard.press('Tab');
          await expect(
            page.getByRole('button', { name: 'Your cart' })
          ).toBeFocused();
        });
        test('should open mini cart using keyboard', async ({ page }) => {
          // Open cart with Enter key
          await page.keyboard.press('Enter');

          // Verify cart panel is visible
          await expect(page.getByTestId('mini-cart__sidebar')).toBeVisible();
        });
        test('should close mini cart using keyboard', async ({ page }) => {
          // Open cart with Enter key
          await page.keyboard.press('Enter');
          // Verify cart panel is visible
          await expect(page.getByTestId('mini-cart__sidebar')).toBeVisible();
          // Close cart with Escape key
          await page.keyboard.press('Escape');

          // Verify cart is closed
          await expect(
            page.getByTestId('mini-cart__sidebar')
          ).not.toBeVisible();
        });
        test('should close mini cart using the close button', async ({
          page,
        }) => {
          // Open cart with Enter key
          await page.keyboard.press('Enter');
          // Verify cart panel is visible
          await expect(page.getByTestId('mini-cart__sidebar')).toBeVisible();
          // Close cart with the close button
          await expect(
            page.getByRole('button', { name: 'Close cart' })
          ).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(
            page.getByTestId('mini-cart__sidebar')
          ).not.toBeVisible();
        });
      });

      test.describe('Main Content Navigation', () => {
        test.beforeEach(async ({ page }) => {
          // Use skip link to reach the main content
          await page.keyboard.press('Tab');
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(/#main-content/);
        });
        test('should navigate through main banner links using keyboard', async ({
          page,
        }) => {
          const blockBanner = page.getByTestId('block-banner').first();
          // Verify first banner block
          const blockBannerLinkHref = blockBanner.getByTestId(
            'block-banner__link-href'
          );
          const actionTextButton = blockBanner.getByTestId(
            'block-banner__action-text'
          );
          await page.keyboard.press('Tab');
          await expect(blockBannerLinkHref).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(actionTextButton).toBeFocused();

          // Verify second banner block
          // Verify first banner link
          const secondBlockBanner = page.getByTestId('block-banner').nth(1);
          const secondBlockBannerLinkHref1 = secondBlockBanner
            .getByTestId('block-banner__link-href')
            .first();
          const secondActionTextButton1 = secondBlockBanner
            .getByTestId('block-banner__action-text')
            .first();
          await page.keyboard.press('Tab');
          await expect(secondBlockBannerLinkHref1).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(secondActionTextButton1).toBeFocused();

          // Verify second banner link
          const secondBlockBannerLinkHref2 = secondBlockBanner
            .getByTestId('block-banner__link-href')
            .nth(1);
          const secondActionTextButton2 = secondBlockBanner
            .getByTestId('block-banner__action-text')
            .nth(1);
          await page.keyboard.press('Tab');
          await expect(secondBlockBannerLinkHref2).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(secondActionTextButton2).toBeFocused();
        });
      });
    });
  });
});
