'use client';
import {
  DistinctFacetItem,
  FacetGroupItem,
  RangeFacetItem,
} from 'models/filter';
import { encodeId } from 'models/searchFacetItemInput';
import { Fragment } from 'react';
import FacetedFilterCheckbox from '../FacetedFilterCheckbox';
import FacetedFilterSlider from './FacetedFilterSlider';

/**
 * Renders a faceted filter group on desktop.
 * @param group a faceted filter group object.
 */
function FacetedSearchGroup({
  group,
  onChange,
}: {
  group: FacetGroupItem;
  onChange?: (value: string, groupId: string) => void;
}) {
  return (
    <Fragment>
      <ul className="mb-2 flex flex-col gap-5 text-sm font-light">
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
                  onChange={onChange}
                />
              </li>
            ) : (
              <li key={`${group.name}-${itemIndex}`}>
                <FacetedFilterCheckbox
                  item={item as DistinctFacetItem}
                  groupId={encodeId(group.field)}
                  onChange={onChange}
                />
              </li>
            );
          })}
      </ul>
    </Fragment>
  );
}

export default FacetedSearchGroup;
