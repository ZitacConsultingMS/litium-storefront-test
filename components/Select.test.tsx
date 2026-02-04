import { fireEvent, render, screen } from '@testing-library/react';
import Select from './Select';

const options = [
  { id: '1', name: 'Option 1' },
  { id: '2', name: 'Option 2' },
  { id: '3', name: 'Option 3' },
];

const textSelector = (option: any) => option.name;
const idSelector = (option: any) => option.id;

describe('Select component', () => {
  test('should render empty option if options array is empty', () => {
    render(
      <Select
        value={null}
        onChange={jest.fn()}
        options={[]}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
    expect(
      screen.queryAllByTestId('single-select-field__item')[0]
    ).toHaveTextContent('form.select.none.value');
  });

  test('should render option list when clicked and options array is not empty', () => {
    render(
      <Select
        value={null}
        onChange={jest.fn()}
        options={options}
        placeholder="Select an option"
        textSelector={textSelector}
        idSelector={idSelector}
        data-testid="select-field"
      />
    );

    fireEvent.click(screen.getByTestId('select-field'));

    expect(screen.getByTestId('select-field__items')).toHaveClass(
      'opacity-100 scale-y-100'
    );
    expect(screen.queryAllByTestId('single-select-field__item').length).toBe(4);
    expect(
      screen.queryAllByTestId('single-select-field__item')[0]
    ).toHaveTextContent('form.select.none.value');
    expect(
      screen.queryAllByTestId('single-select-field__item')[1]
    ).toHaveTextContent('Option 1');
    expect(
      screen.queryAllByTestId('single-select-field__item')[2]
    ).toHaveTextContent('Option 2');
    expect(
      screen.queryAllByTestId('single-select-field__item')[3]
    ).toHaveTextContent('Option 3');
  });

  test('should selects an option in single-select mode', () => {
    const handleChange = jest.fn();
    render(
      <Select
        value={null}
        onChange={handleChange}
        options={options}
        placeholder="Select an option"
        textSelector={textSelector}
        idSelector={idSelector}
        data-testid="select-field"
      />
    );

    fireEvent.click(screen.getByTestId('select-field'));
    fireEvent.click(screen.queryAllByTestId('single-select-field__item')[1]);

    expect(handleChange).toHaveBeenCalledWith([options[0]]);
  });

  test('should deselects an option in multi-select mode', async () => {
    const handleChange = jest.fn();
    render(
      <Select
        value={[options[0]]}
        onChange={handleChange}
        options={options}
        placeholder="Select options"
        textSelector={textSelector}
        idSelector={idSelector}
        multiSelect={true}
        data-testid="select-field"
      />
    );

    fireEvent.click(screen.getByTestId('select-field'));
    fireEvent.click(screen.queryAllByTestId('multi-select-field__item')[0]);
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  test('should check keyboard navigation correctly', () => {
    const handleChange = jest.fn();
    render(
      <Select
        value={null}
        onChange={handleChange}
        options={options}
        placeholder="Select an option"
        textSelector={textSelector}
        idSelector={idSelector}
        data-testid="select-field"
      />
    );

    fireEvent.click(screen.getByTestId('select-field'));
    fireEvent.keyDown(screen.getByTestId('select-field'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByTestId('select-field'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByTestId('select-field'), { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith([options[0]]);
  });

  test('should handles blur event', () => {
    const handleChange = jest.fn();
    render(
      <Select
        value={null}
        onChange={handleChange}
        options={options}
        placeholder="Select an option"
        textSelector={textSelector}
        idSelector={idSelector}
        data-testid="select-field"
      />
    );

    fireEvent.click(screen.getByTestId('select-field'));
    fireEvent.blur(screen.getByTestId('select-field'));

    expect(screen.getByTestId('select-field__items')).toHaveClass(
      'opacity-0 scale-y-0'
    );
  });
});
