import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import keyCode from 'rc-util/lib/KeyCode';
import QuickSearch from './QuickSearch';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

describe('QuickSearch', () => {
  test('should render input search', async () => {
    render(<QuickSearch searchResultPageUrl={'/search'} />);
    await userEvent.click(screen.getByTestId('header__magnifier'));
    expect(screen.getByTestId('search__input')).toBeVisible();
  });
  test('should focus to search box when being visible', async () => {
    render(<QuickSearch searchResultPageUrl={'/search'} />);
    await userEvent.click(screen.getByTestId('header__magnifier'));
    await waitFor(() => {
      expect(screen.getByTestId('search__input')).toHaveFocus();
    });
  });
  test('should receive user search query', async () => {
    render(<QuickSearch searchResultPageUrl={'/search'} />);
    await userEvent.click(screen.getByTestId('header__magnifier'));
    await userEvent.type(screen.getByTestId('search__input'), 'foo');
    expect(screen.getByTestId('search__input')).toHaveValue('foo');
  });
  test('should clear text when clicking on clear button', async () => {
    render(<QuickSearch searchResultPageUrl={'/search'} />);
    await userEvent.click(screen.getByTestId('header__magnifier'));
    await userEvent.type(screen.getByTestId('search__input'), 'foo');
    await userEvent.click(screen.getByTestId('search__clear'));
    expect(screen.getByTestId('search__input')).toHaveValue('');
  });
  test('should render correct URL with search key after pressing enter', async () => {
    render(<QuickSearch searchResultPageUrl={'/search-result'} />);

    await userEvent.click(screen.getByTestId('header__magnifier'));
    await userEvent.type(screen.getByTestId('search__input'), 'foo');

    fireEvent.keyDown(screen.getByTestId('search__input'), {
      keyCode: keyCode.ENTER,
    });

    expect(mockPush).toHaveBeenCalledWith('/search-result?q=foo&tab_index=0');
  });
});
