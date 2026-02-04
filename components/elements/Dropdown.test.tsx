import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortResultItem } from 'models/filter';
import { SearchSortOrder } from 'models/searchSortInputItem';
import Dropdown from './Dropdown';

describe('Dropdown', () => {
  test('should not render dropdown if options flag is empty', () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[]}
        onChange={() => {}}
      />
    );
    expect(screen.queryByTestId('dropdown__button')).not.toBeInTheDocument();
  });
  test('should render all options in dropdown list correctly', () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    let options = screen.getAllByTestId('dropdown__option--desktop');
    expect(options.length).toBe(7);

    expect(options[0].textContent).toEqual('Popular');
    expect(options[1].textContent).toEqual('Article number');
    expect(options[2].textContent).toEqual('Recommended');
    expect(options[3].textContent).toEqual('Price - low to high');
    expect(options[4].textContent).toEqual('Price - high to low');
    expect(options[5].textContent).toEqual('Score - low to high');
    expect(options[6].textContent).toEqual('Score - high to low');

    options = screen.getAllByTestId('dropdown__option--mobile');
    expect(options.length).toBe(7);

    expect(options[0].textContent).toEqual('Popular');
    expect(options[1].textContent).toEqual('Article number');
    expect(options[2].textContent).toEqual('Recommended');
    expect(options[3].textContent).toEqual('Price - low to high');
    expect(options[4].textContent).toEqual('Price - high to low');
    expect(options[5].textContent).toEqual('Score - low to high');
    expect(options[6].textContent).toEqual('Score - high to low');
  });
  test('should render the heading correctly if available', () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    const heading = screen.getByTestId('dropdown__heading');
    expect(heading.textContent).toEqual('Sort');
  });
  test('should not render heading if not available', () => {
    render(
      <Dropdown
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    const heading = screen.getByTestId('dropdown__heading');
    expect(heading.textContent).toEqual('');
  });
  test('should render the button title correctly', () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[2]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    const button = screen.getByTestId('dropdown__button');
    expect(button.textContent).toEqual('Recommended');
  });
  test('should toggle/untoggle dropdown when clicking on button', async () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    const button = screen.getByTestId('dropdown__button');
    await userEvent.click(button);
    expect(
      screen.queryByTestId('dropdown__option--desktop-container')
    ).toHaveClass('top-10 scale-y-100 opacity-100');

    await userEvent.click(button);
    expect(
      screen.queryByTestId('dropdown__option--desktop-container')
    ).not.toHaveClass('top-10 scale-y-100 opacity-100');
  });
  test('should show dropdown on the left by default', () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    const button = screen.getByTestId('dropdown__button');
    userEvent.click(button);
    expect(
      screen.queryByTestId('dropdown__option--desktop-container')
    ).toHaveClass('left-0');
  });
  test('should hide dropdown when clicking outside', async () => {
    render(
      <Dropdown
        heading="Sort"
        textSelector={getTextSelector}
        selectedOptionSelector={() => mockSortCriteriaData[0]}
        options={[...mockSortCriteriaData]}
        onChange={() => {}}
      />
    );
    await userEvent.click(screen.getByTestId('dropdown__button'));
    expect(
      screen.queryByTestId('dropdown__option--desktop-container')
    ).toHaveClass('top-10 scale-y-100 opacity-100');

    await userEvent.click(document.body);
    expect(
      screen.queryByTestId('dropdown__option--desktop-container')
    ).not.toHaveClass('top-10 scale-y-100 opacity-100');
  });
});

function getTextSelector(option: SortResultItem) {
  return option.name;
}

const mockSortCriteriaData: SortResultItem[] = [
  {
    field: 'popular',
    order: SearchSortOrder.ASCENDING,
    name: 'Popular',
    selected: false,
  },
  {
    field: 'articlenumber',
    order: SearchSortOrder.ASCENDING,
    name: 'Article number',
    selected: false,
  },
  {
    field: 'recommended',
    order: SearchSortOrder.ASCENDING,
    name: 'Recommended',
    selected: false,
  },
  {
    field: 'price',
    order: SearchSortOrder.ASCENDING,
    name: 'Price - low to high',
    selected: false,
  },
  {
    field: 'price',
    order: SearchSortOrder.DESCENDING,
    name: 'Price - high to low',
    selected: false,
  },
  {
    field: 'score',
    order: SearchSortOrder.ASCENDING,
    name: 'Score - low to high',
    selected: false,
  },
  {
    field: 'score',
    order: SearchSortOrder.DESCENDING,
    name: 'Score - high to low',
    selected: false,
  },
];
