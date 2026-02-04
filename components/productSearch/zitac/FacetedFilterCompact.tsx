'use client';
import { gql } from '@apollo/client';
import { cloneDeep } from '@apollo/client/utilities';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import Close from 'components/icons/zitac/close';
import { Accordion, AccordionPanel } from 'components/zitac/Accordion';
import FilterSidebar from 'components/zitac/FilterSidebar';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import {
  DistinctFacetItem,
  FacetGroupItem,
  RangeFacetItem,
} from 'models/filter';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchFacetItemInput, encodeId } from 'models/searchFacetItemInput';
import { SearchParams } from 'models/searchParams';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useContext, useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { useDebouncedCallback } from 'use-debounce';
import FacetedFilterCheckbox from '../FacetedFilterCheckbox';
import FacetedFilterSlider from '../zitac/FacetedFilterSlider';
import FilterSummary from './FilterSummary';

/**
 * Renders a faceted search compact
 * @param facetedFilters a list of faceted filter group
 * @param totalCount total product of the current filter
 * @param categoryId an optional category system Id to search products under a specific category.
 * @param productListId an optional entity system Id to search a specific product list.
 */
const FacetedFilterCompact = (props: {
  facetedFilters: FacetGroupItem[];
  totalCount: number;
  categoryId?: string;
  productListId?: string;
}) => {
  const t = useTranslations();
  const filters = useContext(WebsiteContext).filters;
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchParamsObj, setSearchParamsObj] = useState(
    SearchParams.fromReadonlyURLSearchParams(searchParams)
  );
  const [currentFilters, setCurrentFilters] = useState(props.facetedFilters);
  const [totalCount, setTotalCount] = useState(props.totalCount);
  const selectedFilterCount = currentFilters.reduce(
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

  const onShowFilter = () => {
    setVisible(true);
  };
  const loadData = async (searchParamsObj: SearchParams) => {
    const facets = SearchFacetItemInput.fromSearchParams(
      searchParamsObj,
      filters
    );
    const productParams = new ProductSearchQueryInput({
      text: searchParamsObj['q'],
      categoryId: props.categoryId,
      includeChildren: true,
      productListId: props.productListId,
    });
    const result = await search(productParams, facets);
    setTotalCount(result?.productSearch?.totalCount || 0);
  };
  const onFacetFilterSliderChange = useDebouncedCallback(
    async (value: string, groupId: string) => {
      const newSearchParams = new SearchParams(searchParamsObj);
      if (!value) {
        delete newSearchParams[groupId];
      } else {
        newSearchParams[groupId] = value;
      }
      const clone = cloneDeep(currentFilters);
      clone.forEach((g: any) => {
        if (encodeId(g.field) === groupId) {
          g.items[0].selectedMin = value?.split('-')[0];
          g.items[0].selectedMax = value?.split('-')[1];
        }
      });
      setSearchParamsObj(newSearchParams);
      setCurrentFilters(clone);
      await loadData(newSearchParams);
    },
    200
  );
  const onFacetFilterDistinctChange = async (
    value: string,
    groupId: string
  ) => {
    searchParamsObj.toogle(
      {
        [groupId]: value,
      },
      false
    );
    const clone = cloneDeep(currentFilters);
    clone.forEach((g) => {
      if (encodeId(g.field) === groupId) {
        g.items.forEach((opt: any) => {
          if (opt.value === value) {
            opt.selected = !opt.selected;
          }
        });
      }
    });
    setCurrentFilters(clone);
    await loadData(searchParamsObj);
  };
  const onShow = () => {
    router.push(`${pathname}${searchParamsObj.toString()}`);
    setVisible(false);
  };
  const onClose = () => {
    setVisible(false);
    setCurrentFilters(props.facetedFilters);
    setTotalCount(props.totalCount);
    setSearchParamsObj(SearchParams.fromReadonlyURLSearchParams(searchParams));
  };
  const onClear = async () => {
    const newSearchParams = new SearchParams();
    const clone = cloneDeep(currentFilters);

    Object.keys(searchParamsObj).forEach((key) => {
      if (key == 'q' || key == 'sort_by' || key == 'sort_direction') {
        if (newSearchParams[key]) {
          newSearchParams[key] = searchParams.getAll(key);
        } else {
          newSearchParams[key] = searchParams.get(key) || '';
        }
      }
    });
    setSearchParamsObj(newSearchParams);
    clone.forEach((g) => {
      g.items.forEach((opt: any) => {
        opt.selected = false;
        if (g.field === '#Price') {
          opt.selectedMin = 0;
          opt.selectedMax = 0;
          opt.selected = false;
        }
      });
    });
    setCurrentFilters(clone);
    await loadData(newSearchParams);
  };
  useEffect(() => {
    setCurrentFilters(props.facetedFilters);
    setTotalCount(props.totalCount);
    setSearchParamsObj(SearchParams.fromReadonlyURLSearchParams(searchParams));
  }, [props.facetedFilters, props.totalCount, searchParams]);
  return (
    <Fragment>
      <div onClick={onShowFilter} data-testid="faceted-filter__summary">
        <FilterSummary selectedFilterCount={selectedFilterCount} />
      </div>
      <FilterSidebar
        className="left-0 flex flex-col overflow-auto overflow-x-hidden duration-200"
        visible={visible}
        fullscreen={true}
        position="bottom"
        data-testid="faceted-filter__popup"
      >
        <div className="mb-3 flex items-center justify-between">
          <Text inline={true} className="text-lg font-bold">
            {t('facetedfiltercompact.title')}{' '}
            <Text
              inline={true}
              data-testid="faceted-filter__selected-filter-count"
            >
              ({selectedFilterCount})
            </Text>
          </Text>
          <Close
            className="h-4 w-4"
            alt="close"
            onClick={onClose}
            data-testid="faceted-filter__close-btn"
          />
        </div>
        <div className="flex-1">
          <Accordion>
            {currentFilters.map((group, groupIndex) => (
              <AccordionPanel
                header={
                  group.name
                    ? group.name
                    : t(`productsearchresult.facets.${group.field}`)
                }
                key={groupIndex}
              >
                <ul className="font-dark-gray mb-2 flex flex-col gap-5 text-sm">
                  {group.items
                    ?.filter((item) => {
                      if (group.__typename === 'RangeFacet') {
                        return true; // Range facets don't have count, so always show them
                      }
                      const distinctItem = item as DistinctFacetItem;
                      return distinctItem.name && distinctItem.count > 0; // Only show items with count > 0
                    })
                    ?.sort((a, b) => {
                      if (group.__typename === 'RangeFacet') {
                        return 0; // Range facets don't need sorting
                      }
                      const itemA = a as DistinctFacetItem;
                      const itemB = b as DistinctFacetItem;
                      return itemA.name.localeCompare(itemB.name, 'sv', { numeric: true });
                    })
                    ?.map((item, itemIndex) => {
                      return group.__typename === 'RangeFacet' ? (
                        <li key={`${group.name}-${itemIndex}`}>
                          <FacetedFilterSlider
                            item={item as RangeFacetItem}
                            groupId={encodeId(group.field)}
                            onChange={onFacetFilterSliderChange}
                          />
                        </li>
                      ) : (
                        <li key={`${group.name}-${itemIndex}`}>
                          <FacetedFilterCheckbox
                            item={item as DistinctFacetItem}
                            groupId={group.field}
                            onChange={onFacetFilterDistinctChange}
                          />
                        </li>
                      );
                    })}
                </ul>
              </AccordionPanel>
            ))}
          </Accordion>
        </div>
        <div className="sticky -bottom-5 -my-5 flex items-center justify-evenly bg-primary py-5">
          <Button
            rounded={true}
            className="w-36 border-none bg-secondary-3 py-2 text-sm text-primary"
            onClick={onClear}
            data-testid="faceted-filter__clear-btn"
            disabled={selectedFilterCount === 0}
          >
            {t('facetedfiltercompact.button.clear')}
          </Button>
          <Button
            rounded={true}
            className="w-36 border-none bg-secondary py-2 text-sm text-secondary"
            onClick={onShow}
            data-testid="faceted-filter__show-btn"
          >
            {t('facetedfiltercompact.button.show')}{' '}
            <span data-testid="faceted-filter__total-count">{totalCount}</span>
          </Button>
        </div>
      </FilterSidebar>
    </Fragment>
  );
};

const SEARCH = gql`
  query GetProductSearch(
    $productQuery: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
  ) {
    productSearch(query: $productQuery, facets: $facets) {
      totalCount
    }
  }
`;
async function search(
  productParams: ProductSearchQueryInput,
  facets: SearchFacetItemInput[]
) {
  return await queryClient({
    query: SEARCH,
    variables: {
      productQuery: { ...productParams },
      facets,
    },
  });
}

export default FacetedFilterCompact;
