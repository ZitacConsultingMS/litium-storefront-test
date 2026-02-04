import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateProductItems } from '__mock__/generateMockData';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { ProductItem } from 'models/products';
import ImageGallery from './ImageGallery';

const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

describe('Image Gallery Component', () => {
  describe('Thumbs Gallery', () => {
    test('should not render image if not available', () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      expect(
        screen.queryAllByTestId('thumbs-gallery__thumbnail-image')
      ).toHaveLength(0);
      expect(
        screen.queryAllByTestId('thumbs-gallery__main-image')
      ).toHaveLength(0);
    });

    test('should render correct number of images', () => {
      const productItem: ProductItem = generateProductItems(1, 2)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      expect(
        screen.queryAllByTestId('thumbs-gallery__thumbnail-image')
      ).toHaveLength(2);
      expect(
        screen.queryAllByTestId('thumbs-gallery__main-image')
      ).toHaveLength(2);
    });

    test('should be able to show lightbox after clicking on main image', async () => {
      const productItem: ProductItem = generateProductItems(1, 2)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      act(() => {
        fireEvent.click(screen.getAllByTestId('horizontal-gallery__image')[0]);
      });
      expect(screen.queryByTestId('sidebar__backdrop')).toBeInTheDocument();
    });
  });
  describe('Horizontal Gallery', () => {
    test('should not render image if not available', () => {
      const productItem: ProductItem = generateProductItems(1, 0)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      expect(screen.queryAllByTestId('horizontal-gallery__image')).toHaveLength(
        0
      );
    });

    test('should render correct number of images', () => {
      const productItem: ProductItem = generateProductItems(1, 2)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      expect(screen.queryAllByTestId('horizontal-gallery__image')).toHaveLength(
        2
      );
    });

    test('should be able to show lightbox after clicking on main image', async () => {
      const productItem: ProductItem = generateProductItems(1, 2)[0];
      render(
        <WebsiteContextProvider value={MockWebsite}>
          <ImageGallery
            thumbnailImages={productItem.thumbnailImages}
            largeImages={productItem.largeImages}
            alternativeText={productItem.name ?? ''}
          ></ImageGallery>
        </WebsiteContextProvider>
      );

      act(() => {
        fireEvent.click(screen.getAllByTestId('horizontal-gallery__image')[0]);
      });
      expect(screen.queryByTestId('sidebar__backdrop')).toBeInTheDocument();
    });
  });
});
