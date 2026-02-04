import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { useRouter } from 'next/navigation';
import AddressForm from './AddressForm'; // Adjust the import path as necessary

jest.mock('hooks/useTranslations');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/test-path'),
}));

const mockUseTranslations = useTranslations as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const mockCountries = [
  { name: 'U.S.A.', code: 'US' },
  { name: 'Österrike', code: 'AT' },
  { name: 'Swedish', code: 'SE' },
];
const mockWebsites = {
  ...EmptyWebsite,
  culture: {
    code: 'sv-SE',
  },
  countries: mockCountries,
};

const t = (key: string) => key;

describe('AddressForm', () => {
  beforeEach(() => {
    mockUseTranslations.mockReturnValue(t);
    mockUseRouter.mockReturnValue({
      replace: jest.fn(),
    });
  });

  test('should render the form with default values', () => {
    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm
          onSubmit={jest.fn()}
          value={{
            id: '1',
            address1: '123 Main St',
            zipCode: '12345',
            city: 'Sample City',
            country: 'US',
            phoneNumber: '123456789',
          }}
        />
      </WebsiteContext.Provider>
    );

    expect(screen.getByTestId('customer-address__address')).toHaveValue(
      '123 Main St'
    );
    expect(screen.getByTestId('customer-address__zipcode')).toHaveValue(
      '12345'
    );
    expect(screen.getByTestId('customer-address__city')).toHaveValue(
      'Sample City'
    );
    expect(screen.getByTestId('customer-address__country')).toHaveValue('US');
    expect(screen.getByTestId('customer-address__phone-number')).toHaveValue(
      '123456789'
    );
  });

  test('should call onSubmit with form data', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({ errors: [] });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={mockOnSubmit} />
      </WebsiteContext.Provider>
    );

    fireEvent.change(screen.getByTestId('customer-address__address'), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByTestId('customer-address__zipcode'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByTestId('customer-address__city'), {
      target: { value: 'Sample City' },
    });
    fireEvent.change(screen.getByTestId('customer-address__phone-number'), {
      target: { value: '123-456-7890' },
    });

    const items = screen.queryAllByTestId('dropdown-field__item');
    act(() => {
      items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    fireEvent.click(screen.getByTestId('customer-address__submit'));

    await waitFor(() =>
      expect(mockOnSubmit).toHaveBeenCalledWith({
        address1: '123 Main St',
        zipCode: '12345',
        city: 'Sample City',
        country: 'SE',
        phoneNumber: '123-456-7890',
        id: '',
      })
    );
  });

  test('should show errors if form submission fails', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({
      errors: [{ message: 'Error message' }],
    });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={mockOnSubmit} />
      </WebsiteContext.Provider>
    );

    fireEvent.click(screen.getByTestId('customer-address__submit'));
    await waitFor(() =>
      expect(screen.getAllByTestId('error-text')[0]).toHaveTextContent(
        'Error message'
      )
    );
  });

  test('should throw an error if an unexpected error occurs', async () => {
    const mockOnSubmit = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={mockOnSubmit} />
      </WebsiteContext.Provider>
    );

    fireEvent.click(screen.getByTestId('customer-address__submit'));
    await waitFor(() =>
      expect(mockOnSubmit()).rejects.toThrow('Unexpected error')
    );
  });
  test('should redirect on cancel button click', () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={jest.fn()} showCancelBtn={true} />
      </WebsiteContext.Provider>
    );

    fireEvent.click(screen.getByTestId('customer-address__cancel'));

    expect(mockReplace).toHaveBeenCalledWith('/test-path');
  });

  test('should not redirect if form submission successes and should redirect is false', async () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm
          onSubmit={jest.fn()}
          showCancelBtn={true}
          shouldRedirect={false}
        />
      </WebsiteContext.Provider>
    );

    fireEvent.click(screen.getByTestId('customer-address__submit'));
    await waitFor(() => {
      expect(screen.queryAllByTestId('error-text').length).toEqual(0);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  test('should redirect if form submission successes and should redirect is true', async () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    });
    const mockOnSubmit = jest.fn().mockResolvedValue({
      errors: null,
      customerAddress: {
        address1: '123 Main St',
        city: 'Sample City',
        zipCode: '12345',
        country: 'SE',
        phoneNumber: '123-456-7890',
        id: '1',
      },
    });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={mockOnSubmit} showCancelBtn={true} />
      </WebsiteContext.Provider>
    );

    fireEvent.click(screen.getByTestId('customer-address__submit'));
    await waitFor(
      () => {
        expect(screen.queryAllByTestId('error-text').length).toEqual(0);
        expect(mockReplace).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  test('should sorted the country list alphabetically', () => {
    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={jest.fn()} />
      </WebsiteContext.Provider>
    );
    const items = screen.queryAllByTestId('dropdown-field__item');

    expect(items[0]).toHaveTextContent('Swedish');
    expect(items[1]).toHaveTextContent('U.S.A.');
    expect(items[2]).toHaveTextContent('Österrike');
  });

  test('should reset value if form submission successes', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue({
      errors: null,
      customerAddress: {
        address1: '123 Main St',
        city: 'Sample City',
        zipCode: '12345',
        country: 'SE',
        phoneNumber: '123-456-7890',
        id: '1',
      },
    });

    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <AddressForm onSubmit={mockOnSubmit} />
      </WebsiteContext.Provider>
    );

    fireEvent.change(screen.getByTestId('customer-address__address'), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByTestId('customer-address__zipcode'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByTestId('customer-address__city'), {
      target: { value: 'Sample City' },
    });
    fireEvent.change(screen.getByTestId('customer-address__phone-number'), {
      target: { value: '123-456-7890' },
    });

    const items = screen.queryAllByTestId('dropdown-field__item');
    act(() => {
      items[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    fireEvent.click(screen.getByTestId('customer-address__submit'));

    await waitFor(() =>
      expect(mockOnSubmit).toHaveBeenCalledWith({
        address1: '123 Main St',
        zipCode: '12345',
        city: 'Sample City',
        country: 'SE',
        phoneNumber: '123-456-7890',
        id: '',
      })
    );

    fireEvent.change(screen.getByTestId('customer-address__address'), {
      target: { value: '123456 Main St' },
    });
    fireEvent.click(screen.getByTestId('customer-address__submit'));

    await waitFor(() =>
      expect(mockOnSubmit).toHaveBeenCalledWith({
        address1: '123456 Main St',
        zipCode: '12345',
        city: 'Sample City',
        country: 'SE',
        phoneNumber: '123-456-7890',
        id: '1',
      })
    );
  });
});
