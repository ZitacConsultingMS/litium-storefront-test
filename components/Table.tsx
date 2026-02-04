import { ReactNode } from 'react';

/**
 * IColumnType defines the structure for each column in the Table component.
 * T is a generic type parameter representing the data type of the items.
 */
export interface IColumnType<T> {
  // key is the unique identifier for the column and is used to extract values from the data items.
  key: string;
  // title is the header text displayed for the column.
  title: string;
  // render is an optional function that takes an item of type T and returns a ReactNode.
  // This function allows custom rendering for the column.
  // If the 'render' function is not provided for a column, the Table component will display the value of the item corresponding to the column's 'key'.
  render?: (item: T) => ReactNode;
  // A fixed column width
  width?: string;
}

/**
 * TableProps defines the type for the props accepted by the Table component.
 * T is a generic type parameter representing the data type of the items.
 */
interface TableProps<T> {
  // data is an array of items of type T to be displayed in the table.
  data: T[];
  // columns is an array of IColumnType objects defining the columns of the table.
  columns: IColumnType<T>[];
  // className is an optional prop for applying custom CSS classes to the table.
  className?: string;
}

/**
 * Represents a component to display a list of items in a tabular format. It accepts a generic type T which represents the data type of the items.
 * @param data an array of items of type T to be displayed in the table.
 * @param columns an array of IColumnType<T> objects defining the columns of the table. Each IColumnType object should have a 'key', 'title', and optionally a 'render' function.
 * @param className optional custom css class name.
 * @example
 * interface Item {
 *  id: number;
 *  name: string;
 *  age: number;
 * }
 *
 * const data: Item[] = [
 *  { id: 1, name: 'John Doe', age: 28 },
 *  { id: 2, name: 'Jane Smith', age: 34 },
 *  { id: 3, name: 'Alice Johnson', age: 25 },
 * ];
 *
 * const columns: IColumnType<Item>[] = [
 *  { key: 'name', title: 'Name', width: '100px' },
 *  { key: 'age', title: 'Age' },
 *  {
 *    key: 'actions',
 *    title: 'Actions',
 *    render: (item) => <button onClick={() => alert(item.name)}>Alert</button>,
 *  }
 * ];
 *
 * <Table data={data} columns={columns} className="my-custom-class" />
 */
function Table<T>({ data, columns, className }: TableProps<T>) {
  const getValue = (item: any, column: any) => {
    return item[column.key as keyof typeof item];
  };
  return (
    <table className={className}>
      <thead>
        <tr>
          {columns.map((column, columnIndex) => (
            <th
              key={columnIndex}
              className="px-4 py-2 text-left text-sm"
              style={{ minWidth: column.width }}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, itemIndex) => (
          <tr key={itemIndex} className="border">
            {columns.map((column, columnIndex) => (
              <td className="px-4 py-3" key={columnIndex}>
                {column.render ? column.render(item) : getValue(item, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
