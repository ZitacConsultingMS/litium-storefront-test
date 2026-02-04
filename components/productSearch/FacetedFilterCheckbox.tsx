import { Checkbox } from 'components/elements/Checkbox';
import { Text } from 'components/elements/Text';
import { DistinctFacetItem } from 'models/filter';

/**
 * Renders a faceted filter checkbox.
 * @param props a faceted filter object.
 */
function FacetedFilterCheckbox({
  item,
  groupId,
  prefix,
  onChange,
}: {
  item?: DistinctFacetItem;
  groupId?: string;
  prefix?: string;
  onChange?: (value: string, groupId: string) => void;
}) {
  return (
    <>
      {item?.value && groupId ? (
        <Checkbox
          id={`${prefix ? `${prefix}-` : ''}faceted-filter-checkbox-${groupId}-${item.value}`}
          onChange={() => !!onChange && onChange(item.value, groupId)}
          checked={item.selected}
          data-testid={`faceted-filter-checkbox`}
        >
          <Text
            inline={true}
            data-testid={`faceted-filter-checkbox__label--${groupId}`}
            className="ml-2"
          >
            {item.name}
            {!isNaN(item?.count) && item.count != null && (
              <Text
                inline={true}
                data-testid={`faceted-filter-checkbox__quantity--${groupId}`}
              >
                &nbsp;({item?.count ?? 0})
              </Text>
            )}
          </Text>
        </Checkbox>
      ) : (
        ''
      )}
    </>
  );
}

export default FacetedFilterCheckbox;
