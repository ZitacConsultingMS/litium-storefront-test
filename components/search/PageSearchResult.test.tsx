import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generatePageSearchResultData } from '__mock__/generateMockData';
import * as dataServiceClient from 'services/dataService.client';
import PageSearchResult from './PageSearchResult';

jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

describe('PageSearchResult', () => {
  test('should render 70 page', () => {
    const data = generatePageSearchResultData(70);
    render(<PageSearchResult items={data} onItemClick={() => {}} />);
    expect(screen.queryAllByTestId('searchitem__url').length).toBe(70);
  });
  test('should show load more button', () => {
    const data = generatePageSearchResultData(70);
    data.pageInfo.hasNextPage = true;
    render(<PageSearchResult items={data} onItemClick={() => {}} />);
    expect(screen.getByTestId('searchitems__loadMore')).toBeVisible();
  });
  test('should not show load more button', () => {
    const data = generatePageSearchResultData(70);
    render(<PageSearchResult items={data} onItemClick={() => {}} />);
    expect(screen.queryByTestId('searchitems__loadMore')).toBeNull();
  });
  test('should query more data when clicking on load more button', async () => {
    const data = generatePageSearchResultData(20);
    data.pageInfo.hasNextPage = true;
    const queryDataSpy = jest.spyOn(dataServiceClient, 'queryClient');
    queryDataSpy.mockResolvedValue({
      pageSearch: {
        edges: [],
        totalCount: 0,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        nodes: [
          {
            __typename: 'page',
            blocks: {},
            name: 'Page name 21',
            url: '/page-21',
            fields: { _name: 'page', introduction: 'Page description 21' },
          },
        ],
      },
    });
    render(<PageSearchResult items={data} onItemClick={() => {}} />);

    const loadMoreButton = screen.getByTestId('searchitems__loadMore');
    await userEvent.click(loadMoreButton);
    expect(loadMoreButton).toHaveTextContent('pagesearchresult.button.loading');
    expect(screen.queryAllByTestId('searchitem__url').length).toBe(21);
  });
});
