/**
 * Test WCAG 2.1.1 - Keyboard Navigation for Image Gallery
 */

import { expect, test } from 'utils/axe-test';

const testImageGalleryUrl = process.env.TEST_PRODUCT_URL ?? '';

test.describe('Gallery Images', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testImageGalleryUrl);
    await page.waitForLoadState('networkidle');

    // Start focus from breadcrumb link
    await page.getByTestId('product-detail__category').focus();
  });
  test('should navigate through gallery thumbnail images using keyboard', async ({
    page,
  }) => {
    const galleryImageThumbnails = page.getByTestId(
      'thumbs-gallery__thumbnail-image'
    );
    const imageCount = await galleryImageThumbnails.count();
    for (let i = 0; i < imageCount; i++) {
      await page.keyboard.press('Tab');
      await expect(galleryImageThumbnails.nth(i)).toBeFocused();
    }
  });
  test('should navigate through gallery main images using keyboard', async ({
    page,
  }) => {
    // Start focus from the last thumbnail image
    const galleryImageThumbnails = page.getByTestId(
      'thumbs-gallery__thumbnail-image'
    );
    await galleryImageThumbnails.last().focus();

    const galleryMainImages = page.getByTestId('thumbs-gallery__main-image');
    const imageCount = await galleryMainImages.count();
    for (let i = 0; i < imageCount; i++) {
      await page.keyboard.press('Tab');
      await expect(galleryMainImages.nth(i)).toBeFocused();
    }
  });
  test.describe('Gallery Image Popup', () => {
    test.beforeEach(async ({ page }) => {
      // Start focus from the first main image
      const galleryMainImages = page.getByTestId('thumbs-gallery__main-image');
      await galleryMainImages.first().focus();

      // Open gallery image popup using keyboard
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('image-gallery__modal')).toBeVisible();
    });
    test('should navigate through gallery thumbnail images in image popup using keyboard', async ({
      page,
    }) => {
      const container = page.getByTestId('image-gallery__modal');
      const galleryImageThumbnails = container.getByTestId(
        'thumbs-gallery__thumbnail-image'
      );
      const imageCount = await galleryImageThumbnails.count();
      for (let i = 0; i < imageCount; i++) {
        await page.keyboard.press('Tab');
        await expect(galleryImageThumbnails.nth(i)).toBeFocused();
      }
    });
    test('should navigate through gallery main images in image popup using keyboard', async ({
      page,
    }) => {
      // Start from the last thumbnail image
      const container = page.getByTestId('image-gallery__modal');
      const galleryImageThumbnails = container.getByTestId(
        'thumbs-gallery__thumbnail-image'
      );
      await galleryImageThumbnails.last().focus();

      const galleryMainImages = container.getByTestId(
        'thumbs-gallery__main-image'
      );
      const imageCount = await galleryMainImages.count();
      for (let i = 0; i < imageCount; i++) {
        await page.keyboard.press('Tab');
        await expect(galleryMainImages.nth(i)).toBeFocused();
      }
    });

    test('should close gallery image popup using Escape key', async ({
      page,
    }) => {
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('image-gallery__modal')).not.toBeVisible();
    });

    test('should close gallery image popup using the close button', async ({
      page,
    }) => {
      // Start from the last main image
      const container = page.getByTestId('image-gallery__modal');
      const galleryMainImages = container.getByTestId(
        'thumbs-gallery__main-image'
      );
      await galleryMainImages.last().focus();

      const closeButton = container.getByTestId('image-gallery__close');
      await page.keyboard.press('Tab');
      await expect(closeButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(container).not.toBeVisible();
    });
  });
});
