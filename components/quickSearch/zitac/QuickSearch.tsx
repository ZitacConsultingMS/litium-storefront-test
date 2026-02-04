'use client';
import { gql } from '@apollo/client';
import clsx from 'clsx';
import SearchInput from 'components/search/zitac/SearchInput';
import SearchResult from 'components/search/zitac/SearchResult';
import SidebarSearch from 'components/zitac/SidebarSearch';
import { useTranslations } from 'hooks/useTranslations';
import { CategorySearchQueryInput } from 'models/categorySearchQueryInput';
import { PageSearchQueryInput } from 'models/pageSearchQueryInput';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchContentType } from 'models/search';
import { useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { useDebounce } from 'use-debounce';
import { getIsB2B } from 'utils/isB2B';

/**
 * Render a search component
 * @returns
 */
function QuickSearch({
  searchResultPageUrl,
  zsThemeID,
}: {
  searchResultPageUrl: string;
  zsThemeID?: string;
}) {
  const isB2B = getIsB2B({ zsThemeID });
  const router = useRouter();
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);

  const [text, setText] = useState('');
  const [result, setResult] = useState<SearchContentType | undefined>(
    undefined
  );
  const [debouncedSearchText] = useDebounce(text, 200);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleCloseForm = useCallback(() => {
    searchInputRef.current?.blur();
    setSearchBoxVisibility(false);
  }, []);
  const handleShowForm = useCallback(() => {
    searchInputRef.current?.focus();
    setSearchBoxVisibility(true);
  }, []);

  useEffect(() => {
    const search = async (text: string) => {
      const productParams = new ProductSearchQueryInput({ text });
      const pageParams = new PageSearchQueryInput(text);
      const categoryParams = new CategorySearchQueryInput(text);

      try {
        const data = await queryClient({
          query: SEARCH,
          variables: {
            productQuery: { ...productParams },
            pageQuery: { ...pageParams },
            categoryQuery: { ...categoryParams },
            first: 10,
            after: '0',
          },
          context: {
            fetchOptions: {
              signal: aborterCtrl.signal,
            },
          },
        });
        setResult(data);
      } catch (error: any) {
        // If productSearch fails due to missing category/productList,
        // try to get pages and categories only
        if (
          error?.graphQLErrors?.some((e: any) =>
            e.message?.includes('Category or ProductList need to be specified')
          )
        ) {
          try {
            const pageAndCategoryData = await queryClient({
              query: SEARCH_WITHOUT_PRODUCTS,
              variables: {
                pageQuery: { ...pageParams },
                categoryQuery: { ...categoryParams },
                first: 10,
                after: '0',
              },
              context: {
                fetchOptions: {
                  signal: aborterCtrl.signal,
                },
              },
            });
            setResult({
              ...pageAndCategoryData,
              productSearch: {
                totalCount: 0,
                pageInfo: { hasNextPage: false },
                nodes: [],
                facets: [],
              },
            });
          } catch {
            setResult(undefined);
          }
        } else {
          // For other errors, set undefined
          setResult(undefined);
        }
      }
    };

    const aborterCtrl = new AbortController();
    !debouncedSearchText && setResult(undefined);
    // Only perform search for B2B
    if (isB2B && debouncedSearchText.length >= 2) {
      search(debouncedSearchText);
    }
    return () => {
      aborterCtrl.abort();
    };
  }, [debouncedSearchText, isB2B]);

  const handleSeeMore = useCallback(
    (activeTab = 0) => {
      router.push(`${searchResultPageUrl}?q=${text}&tab_index=${activeTab}`);
      handleCloseForm();
    },
    [router, searchResultPageUrl, text, handleCloseForm]
  );

  const t = useTranslations();

  const handleSearchInput = (value: string) => {
    setText(value);
    if (value === '') {
      handleCloseForm();
    } else if (isB2B) {
      handleShowForm();
    }
  };

  return (
    <Fragment>
      <SearchInput
        value={text}
        onChange={handleSearchInput}
        onEnterKeyDown={isB2B ? handleSeeMore : undefined}
        ref={searchInputRef}
      />
      {isB2B && (
        <SidebarSearch
          visible={searchBoxVisibility}
          fullscreen={true}
          position="top"
          className="!p-0 duration-200"
          data-testid="quicksearch"
          onClose={handleCloseForm}
        >
          <div
            className={clsx(
              'h-3/4 max-h-fit overflow-auto overflow-x-hidden bg-body-background pb-8 shadow-sm'
            )}
          >
            <div className="m-auto px-5 md:container">
              <SearchResult
                result={result}
                onClose={handleCloseForm}
                showFilter={false}
                showLoadMore={false}
                showLinkToSearchResult={true}
                onLinkToSearchResultClick={(activeTab) =>
                  handleSeeMore(activeTab)
                }
              />
            </div>
          </div>
        </SidebarSearch>
      )}
    </Fragment>
  );
}

const SEARCH = gql`
  query Search(
    $productQuery: ProductSearchQueryInput!
    $categoryQuery: CategorySearchQueryInput!
    $pageQuery: PageSearchQueryInput!
    $first: Int
    $after: String
  ) {
    productSearch(query: $productQuery, first: $first, after: $after) {
      ...ProductSearchResult
    }

    pageSearch(query: $pageQuery, first: $first, after: $after) {
      ...PageSearchResult
    }

    categorySearch(query: $categoryQuery, first: $first, after: $after) {
      ...CategorySearchResult
    }
  }
`;

const SEARCH_WITHOUT_PRODUCTS = gql`
  query SearchWithoutProducts(
    $categoryQuery: CategorySearchQueryInput!
    $pageQuery: PageSearchQueryInput!
    $first: Int
    $after: String
  ) {
    pageSearch(query: $pageQuery, first: $first, after: $after) {
      ...PageSearchResult
    }

    categorySearch(query: $categoryQuery, first: $first, after: $after) {
      ...CategorySearchResult
    }
  }
`;

export default QuickSearch;
