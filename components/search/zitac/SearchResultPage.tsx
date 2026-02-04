'use client';
import { Text } from 'components/elements/Text';
import { Button } from 'components/elements/zitac/Button';
import { useTranslations } from 'hooks/useTranslations';
import { SearchContentType } from 'models/search';
import SearchSortItemInput from 'models/searchSortInputItem';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildUrl } from 'services/urlService';
import ProductSearchResult from './SearchProductSearchResult';

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
  showTabs = true,
}: {
  result?: SearchContentType;
  onClose?: () => void;
  showFilter?: boolean;
  showLoadMore?: boolean;
  showLinkToSearchResult?: boolean;
  onLinkToSearchResultClick?: (activeTab: number) => void;
  hasFilter?: boolean;
  sorts?: SearchSortItemInput[];
  showTabs?: boolean;
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
    ('');
  };

  return (
    <div className="mb-4">
      <LayoutSearchResult isEmpty={!products.totalCount && !hasFilter}>
        <ProductSearchResult
          products={result.productSearch}
          showFilter={false}
          totalCount={products.totalCount}
          onItemClick={onClose}
          showLoadMore={showLoadMore}
          sorts={sorts}
          heading=""
          description=""
          breadcrumbs={[]}
          searchResultPage={true}
        />
        {showLinkToSearchResult && (
          <SeeMoreButton
            onClick={() =>
              onLinkToSearchResultClick && onLinkToSearchResultClick(activeTab)
            }
          ></SeeMoreButton>
        )}
      </LayoutSearchResult>
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
        className="text-l w-full p-2 sm:w-80"
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
  return <div>{children}</div>;
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
