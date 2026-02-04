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
  onChange,
}: {
  item?: DistinctFacetItem;
  groupId?: string;
  onChange?: (value: string, groupId: string) => void;
}) {
  return (
    <>
      {item?.value && groupId ? (
        <Checkbox
          id={`faceted-filter-checkbox-${item.value}-${groupId}`}
          onChange={() => !!onChange && onChange(item.value, groupId)}
          checked={item.selected}
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
