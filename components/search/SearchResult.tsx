'use client';
import { Tab, Tabs } from 'components/Tabs';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import { useTranslations } from 'hooks/useTranslations';
import { SearchContentType } from 'models/search';
import SearchSortItemInput from 'models/searchSortInputItem';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { buildUrl } from 'services/urlService';
import CategorySearchResult from './CategorySearchResult';
import PageSearchResult from './PageSearchResult';
import ProductSearchResult from './ProductSearchResult';

/**
 * Represents a search result component, which displays result in three tab items.
 * The component is used in both Quick search popup and Search result page.
 * @param result search result object.
 * @param onClose function to close the result popup.
 * @param showFilter flag to show/hide filter component in product search tab.
 * @param showLoadMore flag to show/hide load more button in product search tab.
 * @param showLinkToSearchResult flag to show/hide the link to search result page.
 * @param onLinkToSearchResultClick function to handle when clicking on link to search result page
 * @param hasFilter flag to check if there is any filter.
 * @param sorts a sorts list to render sort component in product search tab.
 * @returns
 */
const SearchResult = ({
  result,
  onClose,
  showFilter,
  showLoadMore,
  showLinkToSearchResult,
  onLinkToSearchResultClick,
  hasFilter = false,
  sorts,
}: {
  result?: SearchContentType;
  onClose?: () => void;
  showFilter?: boolean;
  showLoadMore?: boolean;
  showLinkToSearchResult?: boolean;
  onLinkToSearchResultClick?: (activeTab: number) => void;
  hasFilter?: boolean;
  sorts?: SearchSortItemInput[];
}) => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const tabIndexFromUrl = Number(searchParams.get('tab_index')) || 0;
    setActiveTab(tabIndexFromUrl);
  }, [searchParams]);

  if (!result) {
    return null;
  }
  const products = result.productSearch;
  const categories = result.categorySearch;
  const pages = result.pageSearch;

  const handleTabChange = (activeTab: number) => {
    setActiveTab(activeTab);
    if (!showLinkToSearchResult) {
      router.push(
        buildUrl(
          pathname,
          searchParams,
          {
            tab_index: activeTab,
          },
          true
        ),
        {
          scroll: false,
        }
      );
    }
  };

  return (
    <div className="mb-4">
      <Tabs onTabChange={handleTabChange} activeTab={activeTab}>
        <Tab header="searchresult.products.header">
          <LayoutSearchResult isEmpty={!products.totalCount && !hasFilter}>
            <ProductSearchResult
              products={result.productSearch}
              showFilter={showFilter}
              totalCount={products.totalCount}
              onItemClick={onClose}
              showLoadMore={showLoadMore}
              sorts={sorts}
            />
            {showLinkToSearchResult && (
              <SeeMoreButton
                onClick={() =>
                  onLinkToSearchResultClick &&
                  onLinkToSearchResultClick(activeTab)
                }
              ></SeeMoreButton>
            )}
          </LayoutSearchResult>
        </Tab>
        <Tab header="searchresult.categories.header">
          <LayoutSearchResult isEmpty={!categories.totalCount}>
            <Heading>{`${categories.totalCount} ${t(
              'searchresult.categories'
            )}`}</Heading>
            <CategorySearchResult items={categories} onItemClick={onClose} />
            {showLinkToSearchResult && (
              <SeeMoreButton
                onClick={() =>
                  onLinkToSearchResultClick &&
                  onLinkToSearchResultClick(activeTab)
                }
              ></SeeMoreButton>
            )}
          </LayoutSearchResult>
        </Tab>
        <Tab header="searchresult.pages.header">
          <LayoutSearchResult isEmpty={!pages.totalCount}>
            <Heading>{`${pages.totalCount} ${t(
              'searchresult.pages'
            )}`}</Heading>
            <PageSearchResult items={pages} onItemClick={onClose} />
            {showLinkToSearchResult && (
              <SeeMoreButton
                onClick={() =>
                  onLinkToSearchResultClick &&
                  onLinkToSearchResultClick(activeTab)
                }
              ></SeeMoreButton>
            )}
          </LayoutSearchResult>
        </Tab>
      </Tabs>
    </div>
  );
};

const SeeMoreButton = ({ onClick }: { onClick?: () => void }) => {
  const t = useTranslations();
  return (
    <div
      className="mt-4 flex justify-center"
      data-testid="searchresult__see-more-btn"
    >
      <Button
        className="w-full p-2 text-xl sm:w-80"
        fluid={true}
        rounded={true}
        onClick={onClick}
      >
        {t('searchresult.button.seemore')}
      </Button>
    </div>
  );
};

const LayoutSearchResult = ({
  children,
  isEmpty,
}: {
  children?: React.ReactNode;
  isEmpty: boolean;
}) => {
  const t = useTranslations();
  if (isEmpty)
    return (
      <div className="mt-8 text-3xl" data-testid="searchresult__nohits">
        <Text>{t('searchresult.nomatch')}</Text>
        <Text>{t('searchresult.trynewsearch')}</Text>
      </div>
    );
  return (
    <Fragment>
      <div className="mt-5">{children}</div>
    </Fragment>
  );
};

const Heading = ({
  children,
}: {
  children: React.ReactNode | string | undefined;
}) => {
  return (
    <div
      className="my-3 text-xs text-secondary-2"
      data-testid="searchresult__heading"
    >
      {children}
    </div>
  );
};

export default SearchResult;
