'use client';
import clsx from 'clsx';
import { Accordion, AccordionPanel } from 'components/Accordion';
import Dropdown from 'components/elements/Dropdown';
import { Text } from 'components/elements/Text';
import FacetedFilterCompact from 'components/productSearch/FacetedFilterCompact';
import FacetedSearchGroup from 'components/productSearch/FacetedSearchGroup';
import FilterSummary from 'components/productSearch/FilterSummary';
import ProductList from 'components/products/ProductList';
import { useTranslations } from 'hooks/useTranslations';
import {
  DistinctFacetItem,
  RangeFacetItem,
  SortResultItem,
} from 'models/filter';
import { ProductSearchConnection } from 'models/products';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useCallback, useState } from 'react';
import { buildUrl } from 'services/urlService';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Represents the Product search result component
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
  sorts?: SearchSortItemInput[];
  productListId?: string;
}) {
  const {
    showFilter = true,
    onItemClick,
    sticky = false,
    categoryId,
    sorts,
    productListId,
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
    (option: SortResultItem) => {
      const { field: sort_by, order: sort_direction } = option;
      router.push(
        buildUrl(pathname, searchParams, { sort_by, sort_direction }, true),
        {
          scroll: false,
        }
      );
      setSortCriteria((preState) => {
        if (preState) {
          return preState.map((opt: any) => {
            const newOpt = { ...opt };
            newOpt.selected = false;
            if (
              opt.field === option.field &&
              (!opt.order || opt.order === option.order)
            ) {
              newOpt.selected = true;
            }
            return newOpt;
          });
        }
      });
    },
    [pathname, router, searchParams]
  );
  const [sortCriteria, setSortCriteria] = useState(sorts);
  const sortBy = searchParams?.get('sort_by');
  const sortDirection = searchParams?.get('sort_direction');
  const selectedOption = (options: SortResultItem[]) =>
    options.find(
      (option) =>
        option.selected ||
        (option.field === sortBy &&
          (!option.order || option.order === sortDirection))
    ) || options[0];
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
    <div className="flex">
      {showFilter && (
        <div
          className={clsx(
            'hidden w-1/5 lg:block',
            sticky && 'sticky top-0 z-[2] h-max'
          )}
          data-testid="faceted-search__container--desktop"
        >
          <FilterSummary
            selectedFilterCount={selectedFilterCount}
            clearFilter={clearFilter}
          />
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
      <div className={clsx(showFilter && 'w-full lg:w-4/5')}>
        <div
          className={clsx(
            'flex items-center justify-between py-2',
            sticky && 'sticky top-0 z-[1] -mx-5 bg-primary px-5'
          )}
        >
          {showFilter && (
            <div
              className="lg:hidden"
              data-testid="faceted-search__container--mobile"
            >
              <FacetedFilterCompact
                facetedFilters={props.products.facets}
                totalCount={props.products.totalCount}
                categoryId={categoryId}
                productListId={productListId}
              />
            </div>
          )}
          <Text
            className="text-xs text-secondary-2"
            data-testid="searchresult__heading"
          >
            {props.totalCount} {t('productsearchresult.products')}
          </Text>
          {sortCriteria && sortCriteria.length > 0 && (
            <Dropdown
              heading={'productsearchresult.sort.title'}
              options={sortCriteria}
              onChange={onSortCriteriaChange}
              textSelector={getTextSelector}
              selectedOptionSelector={selectedOption}
            />
          )}
        </div>
        <div>
          <ProductList
            {...props.products}
            showLoadMoreButton={props.showLoadMore}
            onClick={onItemClick}
            categoryId={categoryId}
            productListId={productListId}
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

function getTextSelector(option?: SortResultItem) {
  if (!option) {
    return null;
  }
  return option.name;
}

export default ProductSearchResult;
