'use client';
import { gql } from '@apollo/client';
import Sidebar from 'components/Sidebar';
import { Button } from 'components/elements/Button';
import Close from 'components/icons/close';
import Magnifier from 'components/icons/magnifier';
import SearchInput from 'components/search/SearchInput';
import SearchResult from 'components/search/SearchResult';
import { useTranslations } from 'hooks/useTranslations';
import { CategorySearchQueryInput } from 'models/categorySearchQueryInput';
import { PageSearchQueryInput } from 'models/pageSearchQueryInput';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchContentType } from 'models/search';
import { useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { useDebounce } from 'use-debounce';

/**
 * Render a search component
 * @returns
 */
function QuickSearch({ searchResultPageUrl }: { searchResultPageUrl: string }) {
  const t = useTranslations();
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
    setSearchBoxVisibility(true);
    // Focus the input after a short delay to ensure the sidebar is visible
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    const search = async (text: string) => {
      const productParams = new ProductSearchQueryInput({ text });
      const pageParams = new PageSearchQueryInput(text);
      const categoryParams = new CategorySearchQueryInput(text);
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
    };

    const aborterCtrl = new AbortController();
    !debouncedSearchText && setResult(undefined);
    debouncedSearchText.length >= 2 && search(debouncedSearchText);
    return () => {
      aborterCtrl.abort();
    };
  }, [debouncedSearchText]);

  const handleSeeMore = useCallback(
    (activeTab = 0) => {
      router.push(`${searchResultPageUrl}?q=${text}&tab_index=${activeTab}`);
      handleCloseForm();
    },
    [router, searchResultPageUrl, text, handleCloseForm]
  );

  return (
    <Fragment>
      <Button
        className="h-5 w-5 !border-0 !bg-transparent p-0 text-primary"
        onClick={handleShowForm}
        data-testid="header__magnifier"
        aria-label={t('commons.opensearch')}
      >
        <Magnifier />
      </Button>
      <Sidebar
        visible={searchBoxVisibility}
        fullscreen={true}
        position="top"
        className="!p-0 duration-200"
        data-testid="quicksearch"
        blockScroll={true}
        onClose={handleCloseForm}
      >
        <div className="h-full overflow-auto overflow-x-hidden">
          <div className="container m-auto p-5">
            <div className="mb-8 flex justify-end">
              <Button
                className="!border-0 !bg-transparent p-0 text-primary"
                aria-label={t('commons.closesearch')}
                onClick={handleCloseForm}
                data-testid="quicksearch__close"
              >
                <Close />
              </Button>
            </div>
            <SearchInput
              value={text}
              onChange={(value: string) => setText(value)}
              onEnterKeyDown={handleSeeMore}
              ref={searchInputRef}
            />
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
      </Sidebar>
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
      totalCount
      pageInfo {
        hasNextPage
      }
      nodes {
        ...ProductCard
      }
    }

    pageSearch(query: $pageQuery, first: $first, after: $after) {
      ...PageSearchResult
    }

    categorySearch(query: $categoryQuery, first: $first, after: $after) {
      ...CategorySearchResult
    }
  }
`;

export default QuickSearch;
