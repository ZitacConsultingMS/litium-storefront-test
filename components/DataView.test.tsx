import { render, screen } from '@testing-library/react';
import DataView from './DataView';

// Sample string items for testing
const stringItems = ['Item 1', 'Item 2', 'Item 3'];

// Sample object items for testing
const objectItems = [
  { id: 1, name: 'Object 1', value: 100 },
  { id: 2, name: 'Object 2', value: 200 },
  { id: 3, name: 'Object 3', value: 300 },
];

// Custom render function for string
const renderCustomItem = (item: string) => (
  <span style={{ color: 'blue' }}>{item}</span>
);

// Custom render function for objects
const renderCustomObjectItem = (item: {
  id: number;
  name: string;
  value: number;
}) => (
  <div>
    <span style={{ fontWeight: 'bold' }}>{item.name}</span>:{' '}
    <span>{item.value}</span>
  </div>
);

describe('DataView Component', () => {
  test('should render string items without crashing', () => {
    render(<DataView items={stringItems} />);
    stringItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('should render string items with custom renderItem function', () => {
    render(<DataView items={stringItems} renderItem={renderCustomItem} />);
    stringItems.forEach((item) => {
      const renderedItem = screen.getByText(item);
      expect(renderedItem).toBeInTheDocument();
      expect(renderedItem).toHaveStyle('color: blue');
    });
  });

  test('should render object items without crashing', () => {
    render(
      <DataView
        items={objectItems}
        renderItem={(item) => `${item.name}: ${item.value}`}
      />
    );
    objectItems.forEach((item) => {
      expect(
        screen.getByText(`${item.name}: ${item.value}`)
      ).toBeInTheDocument();
    });
  });

  test('should render object items with custom renderItem function', () => {
    render(
      <DataView items={objectItems} renderItem={renderCustomObjectItem} />
    );
    objectItems.forEach((item) => {
      const nameElement = screen.getByText(item.name);
      const valueElement = screen.getByText(item.value.toString());
      expect(nameElement).toBeInTheDocument();
      expect(valueElement).toBeInTheDocument();
      expect(nameElement).toHaveStyle('font-weight: bold');
    });
  });

  test('should render with a custom class name', () => {
    const customClassName = 'custom-class';
    const { container } = render(
      <DataView items={stringItems} className={customClassName} />
    );
    expect(container.firstChild).toHaveClass(customClassName);
  });

  test('should render an empty fragment when items array is empty', () => {
    const { container } = render(<DataView items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
