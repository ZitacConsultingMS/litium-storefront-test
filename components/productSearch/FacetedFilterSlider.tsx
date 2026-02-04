import Currency from 'components/Currency';
import { RangeFacetItem } from 'models/filter';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Fragment, useEffect, useState } from 'react';

/**
 * Renders a faceted filter slider.
 * @param item a faceted filter item object.
 * @param groupId a faceted filter group id value.
 * @param onChange event occurs when the value of a slider is changed.
 */
function FacetedFilterSlider({
  item,
  groupId,
  onChange,
}: {
  item: RangeFacetItem;
  groupId: string;
  onChange?: (value: string, groupId: string) => void;
}) {
  const { min, max, selectedMin, selectedMax } = item;
  const [selectedRange, setSelectedRange] = useState([
    selectedMin || min,
    selectedMax || max,
  ]);

  const handleChange = (value: any) => {
    const [valueMin, valueMax] = value;
    setSelectedRange(value);
    if (valueMin === min && valueMax === max) {
      onChange && onChange('', groupId);
    } else {
      onChange && onChange(value.join('-').toString(), groupId);
    }
  };

  useEffect(() => {
    const currentMin = selectedMin && selectedMin > min ? selectedMin : min;
    const currentMax = selectedMax && selectedMax < max ? selectedMax : max;
    setSelectedRange([currentMin, currentMax]);
  }, [max, min, selectedMax, selectedMin]);

  return (
    <Fragment>
      <div className="mb-4 flex justify-center">
        <Currency
          data-testid="faceted-filter-slider__selected-min"
          price={selectedRange[0]}
        />
        &nbsp;-&nbsp;
        <Currency
          data-testid="faceted-filter-slider__selected-max"
          price={selectedRange[1]}
        />
      </div>
      <div className="mx-5" data-testid="faceted-filter-slider__range">
        <Slider
          range
          min={min}
          max={max}
          onChange={(value: any) => handleChange(value)}
          value={selectedRange}
          styles={{
            track: { backgroundColor: '#c0c0c0', height: 1 },
            handle: {
              width: 35,
              height: 35,
              border: '1px solid #c0c0c0',
              marginTop: -17,
              opacity: 1,
              boxShadow: 'none',
              zIndex: 0,
            },
            rail: { backgroundColor: '#dedede', height: 1 },
          }}
        />
      </div>
    </Fragment>
  );
}

export default FacetedFilterSlider;
