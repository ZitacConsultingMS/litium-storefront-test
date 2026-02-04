import { render, screen } from '@testing-library/react';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { OrderAddress } from 'models/address';
import AddressSummary from './AddressSummary';

const MockWebsite = {
  ...EmptyWebsite,
  countries: [{ code: 'SE', name: 'Sweden' }],
};

describe('Address Summary Component', () => {
  test('should render the title but hide the button edit', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: '',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary
          title="Address summary"
          value={shippingAddress}
          showEdit={false}
        />
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('address-summary__title').textContent).toEqual(
      'Address summary'
    );
    expect(screen.queryByTestId('address-summary__btnEdit')).toBeNull();
  });
  test('should not render the title but show the button edit', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: '',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary value={shippingAddress} onEdit={() => {}} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryByTestId('address-summary__title')).toBeNull();
    expect(screen.getByTestId('address-summary__btnEdit')).toBeVisible();
  });
  test('should render information with the company name correctly', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: 'NIPAZ',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary value={shippingAddress} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryByTestId('address-summary__title')).toBeNull();
    expect(screen.getByTestId('address-summary__name')?.textContent).toEqual(
      'Avis Bradshaw, NIPAZ'
    );
    expect(screen.getByTestId('address-summary__address')?.textContent).toEqual(
      '346 Harkness Avenue, 1785, Ada, Sweden'
    );
    expect(screen.getByTestId('address-summary__contact')?.textContent).toEqual(
      'avisbradshaw@nipaz.com, +1 (958) 569-2722'
    );
  });
  test('should render information without the company name correctly', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: '',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary value={shippingAddress} />
      </WebsiteContext.Provider>
    );
    expect(screen.queryByTestId('address-summary__title')).toBeNull();
    expect(screen.getByTestId('address-summary__name')?.textContent).toEqual(
      'Avis Bradshaw'
    );
    expect(screen.getByTestId('address-summary__address')?.textContent).toEqual(
      '346 Harkness Avenue, 1785, Ada, Sweden'
    );
    expect(screen.getByTestId('address-summary__contact')?.textContent).toEqual(
      'avisbradshaw@nipaz.com, +1 (958) 569-2722'
    );
  });

  test('should included a customized class name', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: '',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary value={shippingAddress} className="mb-8" />
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('address-summary').getAttribute('class')).toEqual(
      'text-sm mb-8'
    );
  });
  test('should not included a customized class name', () => {
    const shippingAddress: OrderAddress = {
      firstName: 'Avis',
      lastName: 'Bradshaw',
      organizationName: '',
      email: 'avisbradshaw@nipaz.com',
      phoneNumber: '+1 (958) 569-2722',
      address1: '346 Harkness Avenue',
      zipCode: '1785',
      city: 'Ada',
      country: 'SE',
    };
    render(
      <WebsiteContext.Provider value={MockWebsite}>
        <AddressSummary value={shippingAddress} />
      </WebsiteContext.Provider>
    );
    expect(screen.getByTestId('address-summary').getAttribute('class')).toEqual(
      'text-sm'
    );
  });
});
