import { render, screen } from '@testing-library/react';
import Table, { IColumnType } from './Table';

interface Item {
  id: number;
  name: string;
  age: number;
}

const data: Item[] = [
  { id: 1, name: 'John Doe', age: 28 },
  { id: 2, name: 'Jane Smith', age: 34 },
  { id: 3, name: 'Alice Johnson', age: 25 },
];

const columns: IColumnType<Item>[] = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  {
    key: 'actions',
    title: 'Actions',
    render: (item) => <button onClick={() => alert(item.name)}>Alert</button>,
  },
];

describe('Table component', () => {
  test('should render table headers correctly', () => {
    render(<Table data={data} columns={columns} />);
    columns.forEach((column) => {
      expect(screen.getByText(column.title)).toBeInTheDocument();
    });
  });

  test('should render table rows correctly', () => {
    render(<Table data={data} columns={columns} />);
    data.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.age.toString())).toBeInTheDocument();
    });
  });

  test('should render custom render function correctly', () => {
    render(<Table data={data} columns={columns} />);
    expect(screen.getAllByText('Alert')).toHaveLength(3);
  });

  test('should apply a custom class name to table', () => {
    const className = 'my-custom-class';
    render(<Table data={data} columns={columns} className={className} />);
    expect(screen.getByRole('table')).toHaveClass(className);
  });
  test('should apply a custom width to a column', async () => {
    const columns: IColumnType<Item>[] = [
      { key: 'name', title: 'Name', width: '100px' },
      { key: 'age', title: 'Age' },
    ];
    render(<Table data={data} columns={columns} />);
    await expect(screen.getByText('Name')).toHaveStyle({
      'min-width': '100px',
    });
  });
});
