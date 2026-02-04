import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebsiteContext } from 'contexts/websiteContext';
import { OrderAddress } from 'models/address';
import B2BAddressForm from './B2BAddressForm';

let capturedFormInstance: any = null;

jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useForm: jest.fn((options) => {
      const instance = actual.useForm(options);
      capturedFormInstance = instance;
      return instance;
    }),
  };
});

// Mock the dataService.client module
jest.mock('services/dataService.client', () => ({
  queryClient: jest.fn(),
}));

// Mock the useTranslations hook
jest.mock('hooks/useTranslations', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'addressform.billingaddress': 'Billing Address',
      'addressform.shippingaddress': 'Shipping Address',
      'addressform.selectaddress': 'Select Address',
      'addressform.contactperson': 'Contact Person',
      'addressform.organizationname': 'Organization Name',
      'addressform.address': 'Address',
      'addressform.zip': 'ZIP Code',
      'addressform.city': 'City',
      'addressform.country': 'Country',
      'addressform.firstname': 'First Name',
      'addressform.lastname': 'Last Name',
      'addressform.email': 'Email',
      'addressform.phone': 'Phone',
      'addressform.button.continue': 'Continue',
      'form.required': 'This field is required',
      'addressform.other.address': 'Other address',
    };
    return translations[key] || key;
  },
}));

const mockCountries = [
  { code: 'SE', name: 'Sweden' },
  { code: 'US', name: 'United States' },
  { code: 'NO', name: 'Norway' },
];

const mockWebsiteContext = {
  homePageUrl: '',
  myPagesPageUrl: '',
  searchResultPageUrl: '',
  checkoutPageUrl: '',
  receiptPageUrl: '',
  countries: mockCountries,
  filters: [],
  imageServerUrl: '',
  notFoundPageUrl: '',
  generalErrorPageUrl: '',
  loginPageUrl: '',
  orderPageUrl: '',
  culture: { code: 'sv-SE' },
  texts: [],
  logoTypeMain: { url: '', dimension: {} },
  analytics: { googleTagManager: '' },
  languageCode: 'sv',
};

const mockOrganizationData = {
  fields: {
    _nameInvariantCulture: 'Test Organization',
  },
  addresses: [
    {
      id: 'addr1',
      careOf: 'Test Care Of',
      address1: 'Test Street 123',
      houseNumber: '123',
      houseExtension: 'A',
      address2: 'Test Address 2',
      zipCode: '12345',
      city: 'Test City',
      state: 'Test State',
      country: 'SE',
    },
    {
      id: 'addr2',
      address1: 'Another Street 456',
      zipCode: '54321',
      city: 'Another City',
      country: 'US',
    },
  ],
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <WebsiteContext.Provider value={mockWebsiteContext}>
      {component}
    </WebsiteContext.Provider>
  );
};

describe('B2BAddressForm', () => {
  const mockOnSubmit = jest.fn();
  const { queryClient } = require('services/dataService.client');

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.mockResolvedValue({
      me: {
        selectedOrganization: {
          organization: mockOrganizationData,
        },
      },
    });
  });

  test('should render form with shipping address title by default', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    });
  });

  test('should render form with billing address title when isBillingAddress is true', async () => {
    renderWithContext(
      <B2BAddressForm onSubmit={mockOnSubmit} isBillingAddress={true} />
    );

    await waitFor(() => {
      expect(screen.getByText('Billing Address')).toBeInTheDocument();
    });
  });

  test('should load organization addresses and display them in dropdown', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });

    // Click on dropdown to open it
    await userEvent.click(screen.getByTestId('address-form__select-address'));

    await waitFor(() => {
      // Should show formatted addresses plus "Other address" option
      expect(
        screen.getByText(
          'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Another Street 456, 54321 Another City, United States'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Other address')).toBeInTheDocument();
    });
  });

  test('should show contact person fields when organization address is selected', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Contact Person')).toBeInTheDocument();
    });

    // Should show contact person fields
    expect(screen.getByTestId('address-form__first-name')).toBeInTheDocument();
    expect(screen.getByTestId('address-form__last-name')).toBeInTheDocument();
    expect(screen.getByTestId('address-form__email')).toBeInTheDocument();
    expect(
      screen.getByTestId('address-form__phone-number')
    ).toBeInTheDocument();
  });

  test('should show all address fields when "Other address" is selected', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Select Address')).toBeInTheDocument();
    });

    // Click on dropdown and select "Other address"
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(screen.getByText('Other address')).toBeInTheDocument();
    });

    const otherAddressOption = screen.getByText('Other address');
    await userEvent.click(otherAddressOption);

    // Should show all address fields
    expect(
      screen.getByTestId('address-form__organization-name')
    ).toBeInTheDocument();
    expect(screen.getByTestId('address-form__address')).toBeInTheDocument();
    expect(screen.getByTestId('address-form__zipcode')).toBeInTheDocument();
    expect(screen.getByTestId('address-form__city')).toBeInTheDocument();
    expect(screen.getByTestId('address-form__country')).toBeInTheDocument();
  });

  test('should populate form fields when organization address is selected', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);
    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });
    // Click on dropdown and select first address
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(
        screen.getByText(
          'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
        )
      ).toBeInTheDocument();
    });

    const firstAddressOption = screen.getByText(
      'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
    );
    await userEvent.click(firstAddressOption);
    // Test form values using captured instance
    await waitFor(() => {
      expect(capturedFormInstance).toBeTruthy();
      const organizationNameValue =
        capturedFormInstance.getValues('organizationName');
      expect(organizationNameValue).toBe('Test Organization');
    });
  });

  test('should clear address fields when switching to "Other address"', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });

    // First select an organization address
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(
        screen.getByText(
          'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
        )
      ).toBeInTheDocument();
    });

    const firstAddressOption = screen.getByText(
      'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
    );
    await userEvent.click(firstAddressOption);

    // Then switch to "Other address"
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(screen.getByText('Other address')).toBeInTheDocument();
    });

    const otherAddressOption = screen.getByText('Other address');
    await userEvent.click(otherAddressOption);

    // Address fields should be cleared
    await waitFor(() => {
      expect(screen.getByTestId('address-form__organization-name')).toHaveValue(
        ''
      );
      expect(screen.getByTestId('address-form__address')).toHaveValue('');
      expect(screen.getByTestId('address-form__zipcode')).toHaveValue('');
      expect(screen.getByTestId('address-form__city')).toHaveValue('');
    });
  });

  test('should load form with initial values when value prop is provided', async () => {
    const initialValue: OrderAddress = {
      idAddress: 'addr1',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      zipCode: '12345',
      city: 'Test City',
      country: 'SE',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      organizationName: 'Test Org',
    };

    renderWithContext(
      <B2BAddressForm onSubmit={mockOnSubmit} value={initialValue} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('address-form__first-name')).toHaveValue(
        'John'
      );
      expect(screen.getByTestId('address-form__last-name')).toHaveValue('Doe');
      expect(screen.getByTestId('address-form__email')).toHaveValue(
        'john@example.com'
      );
      expect(screen.getByTestId('address-form__phone-number')).toHaveValue(
        '1234567890'
      );
    });
  });

  test('should show validation errors when submitting empty form', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });

    // Select "Other address" to show all fields
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(screen.getByText('Other address')).toBeInTheDocument();
    });

    const otherAddressOption = screen.getByText('Other address');
    await userEvent.click(otherAddressOption);

    // Submit empty form
    await userEvent.click(screen.getByTestId('address-form__submit'));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getAllByTestId('error-text')).toHaveLength(9); // All required fields
    });
  });

  test('should verify form values when form is submitted with valid data', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });

    // Select "Other address" to show all fields
    await userEvent.click(screen.getByTestId('address-form__select-address'));
    await waitFor(() => {
      expect(screen.getByText('Other address')).toBeInTheDocument();
    });

    const otherAddressOption = screen.getByText('Other address');
    await userEvent.click(otherAddressOption);

    // Fill in all required fields
    await userEvent.type(
      screen.getByTestId('address-form__organization-name'),
      'Test Organization'
    );
    await userEvent.type(
      screen.getByTestId('address-form__address'),
      '123 Test St'
    );
    await userEvent.type(screen.getByTestId('address-form__zipcode'), '12345');
    await userEvent.type(screen.getByTestId('address-form__city'), 'Test City');
    await userEvent.type(
      screen.getByTestId('address-form__first-name'),
      'John'
    );
    await userEvent.type(screen.getByTestId('address-form__last-name'), 'Doe');
    await userEvent.type(
      screen.getByTestId('address-form__email'),
      'john@example.com'
    );
    await userEvent.type(
      screen.getByTestId('address-form__phone-number'),
      '1234567890'
    );

    // Select country
    const countryDropdown = screen
      .getByTestId('address-form__country')
      .closest('[role="combobox"]');
    if (countryDropdown) {
      await userEvent.click(countryDropdown);
      await waitFor(() => {
        expect(screen.getByText('Sweden')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Sweden'));
    }

    await waitFor(() => {
      expect(capturedFormInstance).toBeTruthy();
      const formValues = capturedFormInstance.getValues();
      expect(formValues.organizationName).toBe('Test Organization');
      expect(formValues.address1).toBe('123 Test St');
      expect(formValues.zipCode).toBe('12345');
      expect(formValues.city).toBe('Test City');
      expect(formValues.country).toBe('SE');
      expect(formValues.firstName).toBe('John');
      expect(formValues.lastName).toBe('Doe');
      expect(formValues.email).toBe('john@example.com');
      expect(formValues.phoneNumber).toBe('1234567890');
    });
  });

  test('should handle case when no organization addresses are available', async () => {
    queryClient.mockResolvedValue({
      me: {
        selectedOrganization: {
          organization: {
            fields: {
              _nameInvariantCulture: 'Test Organization',
            },
            addresses: [],
          },
        },
      },
    });

    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('address-form__select-address')
      ).toBeInTheDocument();
    });

    // Click on dropdown
    await userEvent.click(screen.getByTestId('address-form__select-address'));

    const selectAddressCombobox = screen.getByRole('combobox', {
      name: /select address/i,
    });
    const dropdownItems = within(selectAddressCombobox).getAllByTestId(
      'dropdown-field__item'
    );

    await waitFor(() => {
      expect(dropdownItems).toHaveLength(1);
      expect(dropdownItems[0]).toHaveTextContent('Other address');
    });
  });

  test('should handle GraphQL query error gracefully', async () => {
    queryClient.mockImplementation(() =>
      Promise.reject(new Error('GraphQL Error'))
    );

    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    // Should still render the form even if query fails
    await waitFor(() => {
      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    });
  });

  test('should format organization addresses correctly', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Select Address')).toBeInTheDocument();
    });

    // Click on dropdown to see formatted addresses
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));

    await waitFor(() => {
      // First address should be formatted with all parts
      expect(
        screen.getByText(
          'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
        )
      ).toBeInTheDocument();
      // Second address should be formatted without optional parts
      expect(
        screen.getByText(
          'Another Street 456, 54321 Another City, United States'
        )
      ).toBeInTheDocument();
    });
  });

  test('should sort organization addresses alphabetically', async () => {
    renderWithContext(<B2BAddressForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Select Address')).toBeInTheDocument();
    });

    // Click on dropdown
    await userEvent.click(screen.getByTestId('dropdown-field__toggle'));

    await waitFor(() => {
      const addressItems = screen.getAllByTestId('dropdown-field__item');
      // "Another Street..." should come before "Test Care Of..." alphabetically
      expect(addressItems[0]).toHaveTextContent(
        'Another Street 456, 54321 Another City, United States'
      );
      expect(addressItems[1]).toHaveTextContent(
        'Test Care Of, Test Street 123 123 A, Test Address 2, 12345 Test City, Test State, Sweden'
      );
    });
  });
});
