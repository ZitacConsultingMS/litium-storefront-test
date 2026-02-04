'use client';
import clsx from 'clsx';
import { Accordion, AccordionPanel } from 'components/Accordion';
import { Heading1 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import ProductListSearch from 'components/products/zitac/ProductListSearch';
import FacetedFilterCompact from 'components/productSearch/zitac/FacetedFilterCompact';
import FacetedSearchGroup from 'components/productSearch/zitac/FacetedSearchGroup';
import FilterSummary from 'components/productSearch/zitac/FilterSummary';
import SubCategory from 'components/productSearch/zitac/SubCategory';
import { useTranslations } from 'hooks/useTranslations';
import { ProductSearchConnection } from 'models/(zitac)/products';
import {
  DistinctFacetItem,
  RangeFacetItem,
  SortResultItem,
} from 'models/filter';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useCallback } from 'react';
import { buildUrl } from 'services/urlService';
import { useDebouncedCallback } from 'use-debounce';
import SortDropdown from './SortDropdown';

/**
 * Represents the Product search result component for search results
 * @param showFilter flag to show/hide filter component in product search tab.
 * @param products product search result to render.
 * @param totalCount total product count.
 * @param onItemClick function to be executed when a product is clicked.
 * @param showLoadMore flag to show/hide load more button in product search tab.
 * @param sticky flag to indicate whether the filter and sort buttons are sticky at top.
 * @param categoryId identify number of category id
 * @param sorts a sorts list to render sort component in product search tab.
 * @param productListId identify number of product list id
 * @returns
 */
function ProductSearchResult(props: {
  showFilter?: boolean;
  products: ProductSearchConnection;
  totalCount: number;
  onItemClick?: () => void;
  showLoadMore?: boolean;
  sticky?: boolean;
  categoryId?: string;
  subCategories?: any;
  sorts?: SearchSortItemInput[];
  productListId?: string;
  heading: string;
  description: string;
  breadcrumbs: any[];
  searchResultPage?: boolean;
}) {
  const {
    showFilter = true,
    onItemClick,
    sticky = false,
    categoryId,
    subCategories,
    sorts,
    productListId,
    heading,
    description,
    breadcrumbs,
    searchResultPage,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const onFacetedChange = useDebouncedCallback(
    (value: string, groupId: string) => {
      router.push(
        buildUrl(
          pathname,
          searchParams,
          {
            [groupId]: value,
          },
          groupId === 'Price' ? true : false
        ),
        {
          scroll: false,
        }
      );
    },
    200
  );
  const clearFilter = useCallback(() => {
    router.push(buildUrlToCleanFilter(pathname, searchParams), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);
  const onSortCriteriaChange = useCallback(
    (option?: SortResultItem) => {
      if (!option) {
        return;
      }
      const { field: sort_by, order: sort_direction } = option;
      router.push(
        buildUrl(pathname, searchParams, { sort_by, sort_direction }, true),
        {
          scroll: false,
        }
      );
    },
    [pathname, router, searchParams]
  );

  const sortBy = searchParams?.get('sort_by');
  const sortDirection = searchParams?.get('sort_direction');
  const selectedOption = (options: SortResultItem[]) => {
    const found = options.find((option) => {
      // Match by field and order if both are present
      if (sortBy && sortDirection) {
        return option.field === sortBy && option.order === sortDirection;
      }
      // Match by field only if no direction is specified
      if (sortBy && !sortDirection) {
        return (
          option.field === sortBy && (!option.order || option.order === '')
        );
      }
      // Use selected option if no URL parameters
      if (!sortBy && !sortDirection) {
        return option.selected;
      }
      return false;
    });

    return found || options[0];
  };
  const selectedFilterCount = props.products?.facets?.reduce(
    (accumulator, currentValue) =>
      accumulator +
      (currentValue.__typename === 'RangeFacet'
        ? (currentValue.items as RangeFacetItem[])?.filter(
            (item: RangeFacetItem) => item.selectedMax && item.selectedMin
          ).length
        : (currentValue.items as DistinctFacetItem[])?.filter(
            (item: DistinctFacetItem) => item.selected
          ).length),
    0
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {showFilter && (
        <div
          className="w-full lg:w-1/4"
          data-testid="faceted-search__container--desktop"
        >
          <FilterSummary
            selectedFilterCount={selectedFilterCount}
            clearFilter={clearFilter}
          />
          {subCategories && subCategories.length > 0 && (
            <SubCategory subCategories={subCategories} />
          )}
          <Accordion>
            {props.products.facets.map((group, groupIndex) => (
              <AccordionPanel
                header={
                  group.name
                    ? group.name
                    : t(`productsearchresult.facets.${group.field}`)
                }
                key={groupIndex}
              >
                <FacetedSearchGroup
                  key={`${group.name}-${groupIndex}`}
                  onChange={onFacetedChange}
                  group={group}
                />
              </AccordionPanel>
            ))}
          </Accordion>
        </div>
      )}
      <div className={clsx(showFilter && 'w-full lg:w-3/4')}>
        <Heading1 className="mb-5">{heading}</Heading1>
        {description && <Text className="pb-10">{description}</Text>}
        {sorts && sorts.length > 0 && (
          <div className="mb-4 flex justify-center">
            <SortDropdown
              sorts={sorts}
              selectedOption={selectedOption}
              onSortCriteriaChange={onSortCriteriaChange}
            />
          </div>
        )}
        <div
          className={clsx(
            'flex items-center justify-between pb-4 pt-2',
            sticky && 'sticky top-0 z-[1] -mx-5 px-5'
          )}
        >
          {showFilter && (
            <div
              className="lg:hidden"
              data-testid="faceted-search__container--mobile"
            >
              {' '}
              <FacetedFilterCompact
                facetedFilters={props.products.facets}
                totalCount={props.products.totalCount}
                categoryId={categoryId}
                productListId={productListId}
              />
            </div>
          )}
          <Text
            className="text-secondary-2"
            data-testid="searchresult__heading"
          >
            {props.totalCount} {t('productsearchresult.products')}
          </Text>
        </div>
        <div>
          <ProductListSearch
            {...props.products}
            showLoadMoreButton={props.showLoadMore}
            onClick={onItemClick}
            categoryId={categoryId}
            productListId={productListId}
            searchResultPage={searchResultPage}
          />
        </div>
      </div>
    </div>
  );
}

function buildUrlToCleanFilter(
  pathname: string | null,
  searchParams: ReadonlyURLSearchParams
): string {
  const searchParamsObj = SearchParams.clearFilter(searchParams);
  return `${pathname}${searchParamsObj.toString()}`;
}

export default ProductSearchResult;
