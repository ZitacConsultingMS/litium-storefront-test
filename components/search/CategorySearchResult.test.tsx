import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  generateCategorySearchResultData,
  generateImages,
  generateProductSearchResultData,
} from '__mock__/generateMockData';
import * as dataService from 'services/dataService.client';
import CategorySearchResult from './CategorySearchResult';

jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

describe('SearchResultContext', () => {
  test('should render 70 categories', () => {
    const data = generateCategorySearchResultData(70, 2);
    render(<CategorySearchResult items={data} onItemClick={() => {}} />);
    expect(screen.queryAllByTestId('searchitem__url').length).toBe(70);
  });
  test('should show load more button', () => {
    const data = generateCategorySearchResultData(70, 2);
    data.pageInfo.hasNextPage = true;
    render(<CategorySearchResult items={data} onItemClick={() => {}} />);
    expect(screen.getByTestId('searchitems__loadMore')).toBeVisible();
  });
  test('should not show load more button', () => {
    const data = generateCategorySearchResultData(20, 2);
    render(<CategorySearchResult items={data} onItemClick={() => {}} />);
    expect(screen.queryByTestId('searchitems__loadMore')).toBeNull();
  });
  test('should render SEO description if description is not available', () => {
    const data = generateCategorySearchResultData(1, 2);
    data.nodes[0].description = '';
    data.nodes[0].fields = {
      _seoDescription: 'SEO Description',
    };
    render(<CategorySearchResult items={data} onItemClick={() => {}} />);
    expect(screen.getByTestId('searchitem__description')).toHaveTextContent(
      'SEO Description'
    );
  });
  test('should query more data when clicking on load more button', async () => {
    const data = generateCategorySearchResultData(20, 2);
    data.pageInfo.hasNextPage = true;
    const queryDataSpy = jest.spyOn(dataService, 'queryClient');
    queryDataSpy.mockResolvedValue({
      categorySearch: {
        nodes: [
          {
            __typename: 'category',
            name: 'Category name 21',
            description: 'Description 21',
            images: generateImages(0),
            url: '/category-21',
            products: generateProductSearchResultData(0, 0),
          },
        ],
        edges: [],
        totalCount: 21,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });
    render(<CategorySearchResult items={data} onItemClick={() => {}} />);

    const loadMoreButton = screen.getByTestId('searchitems__loadMore');
    await userEvent.click(loadMoreButton);
    expect(loadMoreButton).toHaveTextContent(
      'categorysearchresult.button.loading'
    );
    expect(screen.queryAllByTestId('searchitem__url').length).toBe(21);
  });
});
