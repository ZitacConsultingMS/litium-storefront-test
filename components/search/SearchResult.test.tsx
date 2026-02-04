import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  generateCategorySearchResultData,
  generatePageSearchResultData,
  generateProductSearchResultData,
} from '__mock__/generateMockData';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import SearchResult from './SearchResult';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams('q=tops')),
}));

jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  preload: jest.fn(),
}));

describe('SearchResult', () => {
  test('should render nothing if there is no result', async () => {
    const result = render(
      <SearchResult result={undefined} onClose={() => {}} />
    );
    expect(result.container).toBeEmptyDOMElement();
  });
  test('should render an empty message when result is empty', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(0, 1),
          categorySearch: generateCategorySearchResultData(0, 1),
          pageSearch: generatePageSearchResultData(0),
        }}
        onClose={() => {}}
      />
    );
    expect(screen.queryByTestId('searchresult__nohits')).toHaveTextContent(
      'searchresult.nomatchsearchresult.trynewsearch'
    );
  });

  test('should render the correct information of category item', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(1),
        }}
        onClose={() => {}}
      />
    );
    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(screen.queryAllByTestId('searchitem__url')[0]).toHaveAttribute(
      'href',
      '/category-0'
    );
    expect(screen.queryAllByTestId('searchitem__name')[0]).toHaveTextContent(
      'Category name 0'
    );
    expect(
      screen.queryAllByTestId('searchitem__description')[0]
    ).toHaveTextContent('Description 0');
    expect(
      screen.queryAllByTestId('searchitem__linkLabel')[0]
    ).toHaveTextContent('categorysearchresult.linklabel');
  });
  test('should render the correct information of page item', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(1),
        }}
        onClose={() => {}}
      />
    );
    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    expect(screen.queryAllByTestId('searchitem__url')[0]).toHaveAttribute(
      'href',
      '/page-0'
    );
    expect(screen.queryAllByTestId('searchitem__name')[0]).toHaveTextContent(
      'Page name 0'
    );
    expect(
      screen.queryAllByTestId('searchitem__description')[0]
    ).toHaveTextContent('Page description 0');
    expect(
      screen.queryAllByTestId('searchitem__linkLabel')[0]
    ).toHaveTextContent(`${window.location.origin}/page-0`);
  });

  test('should render the correct heading of products tab', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(1),
        }}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId('searchresult__heading')).toHaveTextContent(
      '20 products'
    );
  });
  test('should render the correct heading of categories tab', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(1),
        }}
        onClose={() => {}}
      />
    );
    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(screen.getByTestId('searchresult__heading')).toHaveTextContent(
      '2 searchresult.categories'
    );
  });
  test('should render the correct heading of pages tab', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(4),
        }}
        onClose={() => {}}
      />
    );
    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    expect(screen.getByTestId('searchresult__heading')).toHaveTextContent(
      '4 searchresult.pages'
    );
  });
  test('should render correct active tab from url', () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('q=tops&tab_index=1')
    );
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(0, 1),
          categorySearch: generateCategorySearchResultData(1, 1),
          pageSearch: generatePageSearchResultData(0),
        }}
        onClose={() => {}}
      />
    );

    expect(screen.queryAllByTestId('tabs__header')[1]).toHaveClass(
      '!border-secondary pb-1 !text-primary'
    );
    expect(screen.getByTestId('tabs__panel').textContent).toContain(
      '1 searchresult.categories'
    );
  });
  test('should render see more button when there is result and showSeeMore is true', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(20, 1),
          categorySearch: generateCategorySearchResultData(2, 1),
          pageSearch: generatePageSearchResultData(4),
        }}
        onClose={() => {}}
        showLinkToSearchResult={true}
        onLinkToSearchResultClick={() => {}}
      />
    );

    expect(screen.getByTestId('searchresult__see-more-btn')).toBeVisible();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(screen.getByTestId('searchresult__see-more-btn')).toBeVisible();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    expect(screen.getByTestId('searchresult__see-more-btn')).toBeVisible();
  });
  test('should not render see more button when there is no result and showSeeMore is true', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(0, 1),
          categorySearch: generateCategorySearchResultData(0, 1),
          pageSearch: generatePageSearchResultData(0),
        }}
        onClose={() => {}}
        showLinkToSearchResult={true}
        onLinkToSearchResultClick={() => {}}
      />
    );

    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();
  });
  test('should not render see more button when showSeeMore is false', async () => {
    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(0, 1),
          categorySearch: generateCategorySearchResultData(0, 1),
          pageSearch: generatePageSearchResultData(0),
        }}
        onClose={() => {}}
      />
    );

    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();

    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    expect(
      screen.queryByTestId('searchresult__see-more-btn')
    ).not.toBeInTheDocument();
  });
  test('should call onLinkToSearchResultClick function with correct active tab number after clicking on see more button', async () => {
    const onLinkToSearchResultClick = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValueOnce(
      new URLSearchParams('q=tops&tab_index=0')
    );

    render(
      <SearchResult
        result={{
          productSearch: generateProductSearchResultData(2, 1),
          categorySearch: generateCategorySearchResultData(1, 1),
          pageSearch: generatePageSearchResultData(1),
        }}
        onClose={() => {}}
        showLinkToSearchResult={true}
        onLinkToSearchResultClick={onLinkToSearchResultClick}
      />
    );

    await userEvent.click(
      screen
        .queryByTestId('searchresult__see-more-btn')
        ?.querySelector('button')!
    );
    expect(onLinkToSearchResultClick).toHaveBeenCalled();
    expect(onLinkToSearchResultClick).toHaveBeenCalledWith(0);

    await userEvent.click(screen.queryAllByTestId('tabs__header')[1]);
    await userEvent.click(
      screen
        .queryByTestId('searchresult__see-more-btn')
        ?.querySelector('button')!
    );
    expect(onLinkToSearchResultClick).toHaveBeenCalled();
    expect(onLinkToSearchResultClick).toHaveBeenCalledWith(1);

    await userEvent.click(screen.queryAllByTestId('tabs__header')[2]);
    await userEvent.click(
      screen
        .queryByTestId('searchresult__see-more-btn')
        ?.querySelector('button')!
    );
    expect(onLinkToSearchResultClick).toHaveBeenCalled();
    expect(onLinkToSearchResultClick).toHaveBeenCalledWith(2);
  });
});
