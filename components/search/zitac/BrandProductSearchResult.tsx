'use client';
import clsx from 'clsx';
import { Accordion, AccordionPanel } from 'components/Accordion';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
import Dropdown from 'components/elements/zitac/Dropdown';
import ProductListSearch from 'components/products/zitac/ProductListSearch';
import FacetedFilterCompact from 'components/productSearch/zitac/FacetedFilterCompact';
import FacetedSearchGroup from 'components/productSearch/zitac/FacetedSearchGroup';
import FilterSummary from 'components/productSearch/zitac/FilterSummary';
import SubCategory from 'components/productSearch/zitac/SubCategory';
import Breadcrumb from 'components/zitac/Breadcrumb';
import { useTranslations } from 'hooks/useTranslations';
import { ProductSearchConnection } from 'models/(zitac)/products';
import {
  DistinctFacetItem,
  RangeFacetItem,
  SortResultItem,
} from 'models/filter';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import Image from 'next/image';
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useCallback, useState } from 'react';
import { buildUrl } from 'services/urlService';
import { getAbsoluteUrlFromString } from 'services/zitac/customImageService';
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
  brandImageUrl?: string | null;
  website: {
    imageServerUrl: string;
  };
  breadcrumbs: any[];
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
    brandImageUrl,
    website,
    breadcrumbs,
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
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="flex gap-12">
        {showFilter && (
          <div
            className={clsx(
              'hidden w-1/4 filter lg:block',
              sticky && 'sticky top-0 z-[2] h-max'
            )}
            data-testid="faceted-search__container--desktop"
          >
            <FilterSummary
              selectedFilterCount={selectedFilterCount}
              clearFilter={clearFilter}
            />
            <SubCategory subCategories={subCategories} />
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
          <Heading1 className="mb-6">{heading}</Heading1>
          <div className="mb-8 grid gap-8 md:gap-12 lg:grid-cols-3">
            {description && (
              <HtmlText
                className="col-span-3 lg:col-span-2 [&_p:first-of-type]:mt-0 [&_p:last-of-type]:mb-0 [&_p]:my-4"
                innerHTML={description}
              />
            )}

            {brandImageUrl && (
              <Image
                className="col-span-3 aspect-[2/1] w-full rounded-xl object-cover lg:col-span-1"
                src={getAbsoluteUrlFromString(
                  brandImageUrl,
                  website.imageServerUrl
                )}
                alt={heading || 'Brand image'}
                height={400}
                width={600}
              />
            )}
          </div>
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
            <ProductListSearch
              {...props.products}
              showLoadMoreButton={props.showLoadMore}
              onClick={onItemClick}
              categoryId={categoryId}
              productListId={productListId}
            />
          </div>
        </div>
      </div>
    </>
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
