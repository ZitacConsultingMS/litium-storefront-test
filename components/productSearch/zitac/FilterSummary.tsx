import { Text } from 'components/elements/Text';
import List from 'components/icons/list';
import { useTranslations } from 'hooks/useTranslations';

/**
 * Renders a filter summary.
 * @param selectedFilterCount total selected filter count.
 * @param clearFilter an action to clear any selected filter.
 */

function FilterSummary({
  selectedFilterCount,
  clearFilter,
}: {
  selectedFilterCount?: number;
  clearFilter?: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="mt-2 flex items-center px-2 pb-1 lg:px-0 lg:pb-2">
      <List alt="list" data-testid="filter-summary__icon" />
      <Text
        inline={true}
        className="pl-2 text-sm uppercase text-primary lg:text-tertiary"
        data-testid="filter-summary__title"
      >
        {t('filtersummary.title')}
      </Text>
      &nbsp;
      <Text
        inline={true}
        className="text-sm"
        data-testid="filter-summary__selected-count"
      >
        ({selectedFilterCount})
      </Text>
      {!!selectedFilterCount && selectedFilterCount > 0 && (
        <div
          className="af:text-af-orange hidden cursor-pointer pl-2 text-sm text-seasea-blue lg:block"
          onClick={() => !!clearFilter && clearFilter()}
          data-testid="filter-summary__clear-btn"
        >
          {t('filtersummary.button.clear')}
        </div>
      )}
    </div>
  );
}

export default FilterSummary;
