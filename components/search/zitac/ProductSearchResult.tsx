'use client';
import clsx from 'clsx';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
import ProductList from 'components/products/zitac/ProductList';
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
  subCategories?: any;
  sorts?: SearchSortItemInput[];
  productListId?: string;
  heading: string;
  description: string;
  breadcrumbs?: any[];
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
    // Filters: keep navigation soft and non-scrolling; computed param name
    (value: string, groupId: string) => {
      router.replace(
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
            if (opt.id === option.field && opt.order === option.order) {
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
        (option.field === sortBy && option.order === sortDirection)
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
    <div className="w-full">
      <Heading1 className="mb-5">{heading}</Heading1>
      {description && <HtmlText className="pb-10" innerHTML={description} />}
      <div
        className={clsx(
          'flex items-center justify-between pb-4 pt-2',
          sticky && 'sticky top-0 z-[1] -mx-5 px-5'
        )}
      >
        <Text
          className="text-secondary-2"
          data-testid="searchresult__heading"
        >
          {props.totalCount} {t('productsearchresult.products')}
        </Text>
      </div>
      <div>
        <ProductList
          {...props.products}
          showLoadMoreButton={props.showLoadMore}
          onClick={onItemClick}
          categoryId={categoryId}
          productListId={productListId}
          searchResultPage={searchResultPage}
        />
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
