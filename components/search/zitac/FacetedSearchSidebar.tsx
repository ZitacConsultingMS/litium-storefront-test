'use client';
import { Text } from 'components/elements/Text';
import { Accordion, AccordionPanel } from 'components/zitac/Accordion';
import FilterSidebar from 'components/zitac/FilterSidebar';
import { useTranslations } from 'hooks/useTranslations';
import { DistinctFacetItem, RangeFacetItem } from 'models/filter';
import FacetedSearchGroup from '../../productSearch/zitac/FacetedSearchGroup';
import FilterSummary from '../../productSearch/zitac/FilterSummary';

interface FacetedSearchSidebarProps {
  facets: any[];
  subCategories?: any[];
  selectedFilterCount: number;
  onFacetedChange: (value: string, groupId: string) => void;
  clearFilter: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FacetedSearchSidebar({
  facets,
  subCategories,
  selectedFilterCount,
  onFacetedChange,
  clearFilter,
  isOpen,
  onClose,
}: FacetedSearchSidebarProps) {
  const t = useTranslations();

  // Filter out groups that don't have any valid children to display
  // Uses the same logic as FacetedSearchGroup
  const hasValidItems = (group: any): boolean => {
    if (
      !group.items ||
      !Array.isArray(group.items) ||
      group.items.length === 0
    ) {
      return false;
    }

    const filteredItems = group.items.filter(
      (item: DistinctFacetItem | RangeFacetItem) => {
        if (group.__typename === 'RangeFacet') {
          return true;
        }
        const distinctItem = item as DistinctFacetItem;
        return distinctItem.name && distinctItem.count > 0;
      }
    );

    return filteredItems.length > 0;
  };

  return (
    <FilterSidebar
      visible={isOpen}
      onClose={onClose}
      position="left"
      blockScroll={false}
      className="p-0"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-5 pb-4 pt-5">
          <Text className="text-lg font-semibold">
            {t('productsearchresult.filter.title')}
          </Text>
        </div>

        {/* Content */}
        <div className="scrollbar-none flex-1 overflow-y-auto overflow-x-hidden pb-5 pl-5 [&_ol]:ml-0 [&_ol]:list-none [&_ol]:pl-0 [&_ul]:ml-0 [&_ul]:list-none [&_ul]:pl-0">
          <FilterSummary
            selectedFilterCount={selectedFilterCount}
            clearFilter={clearFilter}
          />

          <Accordion>
            {facets.filter(hasValidItems).map((group, groupIndex) => (
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
      </div>
    </FilterSidebar>
  );
}
