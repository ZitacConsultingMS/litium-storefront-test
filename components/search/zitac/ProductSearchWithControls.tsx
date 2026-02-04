'use client';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import MotorsokProductGrid from 'components/products/zitac/MotorsokProductGrid';
import { useTranslations } from 'hooks/useTranslations';
import { ProductSearchConnection } from 'models/(zitac)/products';
import { SortResultItem } from 'models/filter';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { buildUrl } from 'services/urlService';
import { useDebouncedCallback } from 'use-debounce';
import FilterSortControls from './FilterSortControls';
import ProductSearchResult from './ProductSearchResult';

interface ProductSearchWithControlsProps {
  showFilter?: boolean;
  products: ProductSearchConnection;
  totalCount: number;
  onItemClick?: () => void;
  showLoadMore?: boolean;
  sticky?: boolean;
  categoryId?: string;
  subCategories?: any[];
  sorts?: SearchSortItemInput[];
  productListId?: string;
  heading?: string;
  description?: string;
  breadcrumbs?: any[];
  searchResultPage?: boolean;
  className?: string;
  belowControls?: React.ReactNode;
  hiddenFacetFields?: string[];
  groupByCategory?: boolean;
}

export default function ProductSearchWithControls({
  showFilter = true,
  products,
  totalCount,
  onItemClick,
  showLoadMore = true,
  sticky = false,
  categoryId,
  subCategories,
  sorts,
  productListId,
  heading,
  description,
  breadcrumbs,
  searchResultPage = false,
  className = '',
  belowControls,
  hiddenFacetFields = [],
  groupByCategory = false,
}: ProductSearchWithControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [isSorting, setIsSorting] = useState(false);

  // Reset sorting state when component re-renders with new data
  useEffect(() => {
    setIsSorting(false);
  }, [products]);

  // Filters: client-side soft navigation
  // - Uses computed param {[groupId]: value} and router.replace to avoid history growth
  // - Shows a lightweight overlay while pending
  // Future: client-side data fetch for grid, optimistic UI, cache by query
  const onFacetedChange = useDebouncedCallback(
    (value: string, groupId: string) => {
      startTransition(() => {
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
      });
    },
    200
  );

  const onSortCriteriaChange = useCallback(
    (option: SortResultItem) => {
      const { field: sort_by, order: sort_direction } = option;
      setIsSorting(true);
      router.push(
        buildUrl(pathname, searchParams, { sort_by, sort_direction }, true),
        {
          scroll: false,
        }
      );
    },
    [pathname, router, searchParams]
  );

  const clearFilter = useCallback(() => {
    router.push(buildUrlToCleanFilter(pathname, searchParams));
  }, [pathname, router, searchParams]);

  const selectedOption = (options: SortResultItem[]) => {
    const sortBy = searchParams.get('sort_by');
    const sortDirection = searchParams.get('sort_direction');
    
    const found = options.find(
      (option) => {
        // Match by field and order if both are present
        if (sortBy && sortDirection) {
          return option.field === sortBy && option.order === sortDirection;
        }
        // Match by field only if no direction is specified
        if (sortBy && !sortDirection) {
          return option.field === sortBy && (!option.order || option.order === '');
        }
        // Use selected option if no URL parameters
        if (!sortBy && !sortDirection) {
          return option.selected;
        }
        return false;
      }
    );
    
    return found || options[0];
  };

  // Filter out hidden facets
  const filteredFacets = products?.facets?.filter(
    (facet) => !hiddenFacetFields.includes(facet.field)
  ) || [];

  const selectedFilterCount = filteredFacets?.reduce(
    (accumulator, currentValue) =>
      accumulator +
      (currentValue.__typename === 'RangeFacet'
        ? (currentValue.items as any[])?.filter(
            (item: any) => item.selectedMax && item.selectedMin
          ).length
        : (currentValue.items as any[])?.filter((item: any) => item.selected)
            .length),
    0
  );

  return (
    <div className={className}>
      <div className="container relative mx-auto">
        {(isPending || isSorting) && (
          <div className="pointer-events-none fixed inset-0 z-20 bg-white/30">
          </div>
        )}
        
        {/* Heading and Description */}
        {(heading || description) && (
          <div className="w-full">
            {heading && <Heading1 className="mb-5">{heading}</Heading1>}
            {description && <HtmlText className="pb-10" innerHTML={description} />}
          </div>
        )}

        {/* Filter Controls */}
        <FilterSortControls
          showFilter={showFilter}
          sorts={sorts}
          selectedOption={selectedOption}
          onSortCriteriaChange={onSortCriteriaChange}
          selectedFilterCount={selectedFilterCount}
          facets={filteredFacets}
          subCategories={subCategories}
          onFacetedChange={onFacetedChange}
          clearFilter={clearFilter}
        />

        {/* Between Container */}
        {selectedFilterCount === 0 && belowControls}

        {/* Product Grid */}
        {groupByCategory ? (
          <MotorsokProductGrid
            products={{
              ...products,
              facets: filteredFacets,
            }}
            totalCount={totalCount}
            showLoadMore={showLoadMore}
            categoryId={categoryId}
            productListId={productListId}
            onItemClick={onItemClick}
            searchResultPage={searchResultPage}
            groupByCategory={groupByCategory}
          />
        ) : (
          <ProductSearchResult
            products={{
              ...products,
              facets: filteredFacets,
            }}
            totalCount={totalCount}
            showLoadMore={showLoadMore}
            sticky={sticky}
            categoryId={categoryId}
            subCategories={subCategories}
            sorts={sorts}
            productListId={productListId}
            heading=""
            description=""
            breadcrumbs={breadcrumbs}
            searchResultPage={searchResultPage}
            showFilter={false}
            onItemClick={onItemClick}
          />
        )}
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

