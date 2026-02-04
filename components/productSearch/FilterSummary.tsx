import { Button } from 'components/elements/Button';
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
    <div className="flex items-center rounded bg-secondary-3 px-2 py-1 lg:bg-primary lg:px-0 lg:py-2">
      <List data-testid="filter-summary__icon" />
      <Text
        inline={true}
        className="pl-2 text-sm text-primary lg:text-tertiary"
        data-testid="filter-summary__title"
      >
        {t('filtersummary.title')}
      </Text>
      &nbsp;
      <Text
        inline={true}
        className="text-sm text-primary lg:text-tertiary"
        data-testid="filter-summary__selected-count"
      >
        ({selectedFilterCount})
      </Text>
      {!!selectedFilterCount && selectedFilterCount > 0 && (
        <Button
          className="hidden !border-0 !bg-transparent pl-2 text-sm text-hyperlink lg:block"
          onClick={() => !!clearFilter && clearFilter()}
          data-testid="filter-summary__clear-btn"
        >
          {t('filtersummary.button.clear')}
        </Button>
      )}
    </div>
  );
}

export default FilterSummary;
