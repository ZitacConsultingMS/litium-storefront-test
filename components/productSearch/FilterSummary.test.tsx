import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterSummary from './FilterSummary';

describe('Filter Summary Component', () => {
  test('should render the information correctly', () => {
    render(<FilterSummary selectedFilterCount={2} />);
    expect(screen.getByTestId('filter-summary__icon')).toBeInTheDocument();
    expect(screen.getByTestId('filter-summary__title')).toHaveTextContent(
      'filtersummary.title'
    );
    expect(
      screen.getByTestId('filter-summary__selected-count')
    ).toHaveTextContent('(2)');
    expect(screen.getByTestId('filter-summary__clear-btn')).toHaveTextContent(
      'filtersummary.button.clear'
    );
  });
  test('should call clearFilter function when clicking clear button', async () => {
    render(
      <FilterSummary
        selectedFilterCount={2}
        clearFilter={() => {
          console.log('clear filter');
        }}
      />
    );
    console.log = jest.fn();
    await userEvent.click(screen.getByTestId('filter-summary__clear-btn'));
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('clear filter');
  });
});
