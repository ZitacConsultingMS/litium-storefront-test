import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListBox from './ListBox';

describe('ListBox', () => {
  test('should not render listbox if value variable is empty', () => {
    const value = mockOptions(0);
    render(
      <ListBox
        value={value}
        idSelector={idSelector}
        childrenSelector={getChildrenSelector}
        selectedOption={value[0]}
      />
    );

    expect(screen.queryByTestId('listBox__list')).not.toBeInTheDocument();
  });
  test('should render all options in listbox list correctly', () => {
    const value = mockOptions(4);
    render(
      <ListBox
        value={value}
        idSelector={idSelector}
        childrenSelector={getChildrenSelector}
        selectedOption={value[0]}
      />
    );

    expect(screen.queryByTestId('listBox__list')).toBeInTheDocument();
    expect(screen.getAllByTestId('listBox__item').length).toEqual(4);
  });
  test("should render children's element correctly", () => {
    const value = mockOptions(5);
    render(
      <ListBox
        value={value}
        idSelector={idSelector}
        childrenSelector={getChildrenSelector}
        selectedOption={value[0]}
      />
    );
    let options = screen.getAllByTestId('listBox__item');
    expect(options[0].textContent).toEqual('Display Country 0');
    expect(options[1].textContent).toEqual('Display Country 1');
    expect(options[2].textContent).toEqual('Display Country 2');
    expect(options[3].textContent).toEqual('Display Country 3');
    expect(options[4].textContent).toEqual('Display Country 4');
  });
  test('should render selected option correctly', () => {
    const value = mockOptions(5);
    render(
      <ListBox
        value={value}
        idSelector={idSelector}
        childrenSelector={getChildrenSelector}
        selectedOption={value[3]}
      />
    );
    let options = screen.getAllByTestId('listBox__item');
    expect(options[3]).toHaveClass('border-black');
  });
  test('should select option correctly', async () => {
    let value = mockOptions(5);
    const mockOnChange = jest.fn((option) => option.id);
    render(
      <ListBox
        value={value}
        idSelector={idSelector}
        childrenSelector={getChildrenSelector}
        onChange={mockOnChange}
        selectedOption={value[3]}
      />
    );
    let options = screen.getAllByTestId('listBox__item');
    await userEvent.click(options[4]);
    expect(mockOnChange.mock.results[0].value).toBe(4);
  });
});

const mockOptions = (value: number) => {
  let tmp = [];
  for (let i = 0; i < value; i++) {
    tmp.push({
      id: i,
      name: `Country ${i}`,
    });
  }
  return tmp;
};

const idSelector = (option: any) => option.id;

const getChildrenSelector = (option: any) => {
  return <div>Display {option.name}</div>;
};
