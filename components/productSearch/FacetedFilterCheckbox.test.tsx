import { render, screen } from '@testing-library/react';
import mockFacetFiltersData from '__mock__/facetedFiltersData';
import { DistinctFacetItem, FacetGroupItem } from 'models/filter';
import FacetedFilterCheckbox from './FacetedFilterCheckbox';

describe('Faceted Filter Checkbox Component', () => {
  test('should render label and quantity of Color correctly', () => {
    const group: FacetGroupItem = mockFacetFiltersData[0];

    render(
      <FacetedFilterCheckbox
        item={group.items[0] as DistinctFacetItem}
        groupId={group.field}
      />
    );
    expect(
      screen.getByTestId('faceted-filter-checkbox__label--Color')
    ).toHaveTextContent('Black');
  });
  test('should render label and quantity of Brand correctly', () => {
    const group = mockFacetFiltersData[1];

    render(
      <FacetedFilterCheckbox
        item={group.items[0] as DistinctFacetItem}
        groupId={group.field}
      />
    );
    expect(
      screen.getByTestId('faceted-filter-checkbox__label--Brand')
    ).toHaveTextContent('Casall');
  });
  test('should render label and quantity of Size correctly', () => {
    const group: FacetGroupItem = mockFacetFiltersData[2];

    render(
      <FacetedFilterCheckbox
        item={group.items[0] as DistinctFacetItem}
        groupId={group.field}
      />
    );
    expect(
      screen.getByTestId('faceted-filter-checkbox__label--Size')
    ).toHaveTextContent('L');
  });
  test('should not render filter checkbox on empty data', () => {
    render(<FacetedFilterCheckbox />);
    expect(screen.queryByTestId('faceted-filter-checkbox__label--')).toBeNull();
    expect(
      screen.queryByTestId('faceted-filter-checkbox__quantity--')
    ).toBeNull();
  });
});
