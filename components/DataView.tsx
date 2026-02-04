import { Fragment, ReactNode } from 'react';

/**
 * DataViewProps defines the type for the props accepted by DataView component.
 * T is a generic type parameter which represents the data type of the items.
 */
interface DataViewProps<T> {
  // items is an array of type T which represents the items to be displayed.
  items: T[];
  // renderItem is an optional function that takes an item of type T and returns a ReactNode.
  renderItem?: (item: T) => ReactNode;

  className?: string;
}

/**
 * Represents a component to display a list of items. It accepts a generic type T which represents the data type of the items.
 * @param items an array of items of type T to be displayed.
 * @param renderItem a function that takes an item of type T and returns a ReactNode. This function allows you to customize the rendering of each item.
 * If 'renderItem' is not provided, the items will be rendered directly in the list.
 * @param className optional custom css class name.
 * @example
 * const items = ['Item 1', 'Item 2', 'Item 3'];
 *
 * function renderCustomItem(item) {
 *   return <span style={{ color: 'blue' }}>{item}</span>;
 * }
 *
 * <DataView items={items} renderItem={renderCustomItem} />
 */
function DataView<T>({ items, renderItem, className }: DataViewProps<T>) {
  if (items.length === 0) return <Fragment></Fragment>;
  return (
    <div className={className}>
      <ul>
        {items.map((item: any, index) => (
          <li key={index}>{renderItem ? renderItem(item) : item}</li>
        ))}
      </ul>
    </div>
  );
}

export default DataView;
