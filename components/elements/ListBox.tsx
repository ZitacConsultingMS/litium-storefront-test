import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { Fragment } from 'react';

/**
 * Represents a ListBox component to display a list of options
 * @param value the option list of listbox
 * @param onChange a callback after selected option
 * @param childrenSelector a function to get display children's element from option
 * @param selectedOption a selected option in options
 * @param idSelector a function to extract Id from an item
 * @example
 * <ListBox
      childrenSelector={(option) => (<span>{option.country}</span>)}
      selectedOption={option}
      options={[{country: 'France', selected: true}, {country: 'Germany', selected: false}]}
      onChange={(option) => {}}
      idSelector={(option) => option.country}
    />
 */
function ListBox({
  value,
  childrenSelector,
  onChange,
  selectedOption,
  idSelector,
}: {
  value: any[];
  childrenSelector: (option: any) => React.ReactElement;
  onChange?: (option: any) => void;
  selectedOption: any;
  idSelector: (option: any) => string | null;
}) {
  if (!value || value.length == 0) {
    return <Fragment></Fragment>;
  }
  return (
    <div data-testid="listBox__list">
      {value.map((option: any) => (
        <Button
          key={`listBox-${idSelector(option)}`}
          className={clsx(
            'mb-3 w-full rounded-md border !bg-transparent px-3 py-2 text-left',
            idSelector(selectedOption) === idSelector(option) && 'border-black'
          )}
          onClick={() => onChange && onChange(option)}
          data-testid="listBox__item"
        >
          {childrenSelector(option)}
        </Button>
      ))}
    </div>
  );
}

export default ListBox;
