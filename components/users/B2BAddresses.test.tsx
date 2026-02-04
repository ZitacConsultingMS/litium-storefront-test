import { render } from '@testing-library/react';
import { EmptyWebsite } from 'contexts/websiteContext';
import React from 'react';
import B2BAddresses from './B2BAddresses';

jest.mock('react', () => ({
  ...jest.requireActual<typeof React>('react'),
  useActionState: jest.fn().mockReturnValue([{}, jest.fn()]),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockGetWebsite = jest.fn();
jest.mock('services/websiteService.server', () => ({
  get: () => mockGetWebsite(),
}));

const mockGetOrganizationAddresses = jest.fn();
jest.mock('services/organizationService.server', () => ({
  getOrganizationAddresses: () => mockGetOrganizationAddresses(),
}));

describe('My account addresses Page - B2B', () => {
  beforeEach(() => {
    mockGetOrganizationAddresses.mockResolvedValue({
      me: {
        selectedOrganization: {
          roleOperations: [
            {
              roleOperationId: '_readOrders',
            },
            {
              roleOperationId: '_manageAddresses',
            },
          ],
          organization: {
            id: 'foo',
            addresses: [
              {
                id: 'bar',
                address1: '123 Main St',
                zipCode: '12345',
                country: 'SE',
                city: 'Stockholm',
                phoneNumber: '12345678',
              },
            ],
          },
        },
      },
    });

    mockGetWebsite.mockResolvedValue({
      ...EmptyWebsite,
      countries: [
        { code: 'SE', name: 'Sweden' },
        { code: 'USA', name: 'United State' },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('List view', () => {
    test('should render correct title and add button text', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);
      expect(
        container.getByTestId('my-account-address-b2b__title')
      ).toHaveTextContent('customeraddress.b2b.title');
      expect(
        container.getByTestId('my-account-address-b2b__add-button')
      ).toHaveTextContent('customeraddress.button.add');
    });

    test('should render correct addresses list data', async () => {
      mockGetOrganizationAddresses.mockResolvedValue({
        me: {
          selectedOrganization: {
            roleOperations: [
              {
                roleOperationId: '_readOrders',
              },
              {
                roleOperationId: '_manageAddresses',
              },
            ],
            organization: {
              id: 'foo',
              addresses: [
                {
                  id: 'bar',
                  address1: '123 Main St',
                  zipCode: '12345',
                  country: 'SE',
                  city: 'Stockholm',
                  phoneNumber: '12345678',
                },
                {
                  id: 'foo',
                  address1: '3 Big Avenue',
                  zipCode: '23456',
                  country: 'USA',
                  city: 'Houston',
                  phoneNumber: '23456789',
                },
              ],
            },
          },
        },
      });

      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getAllByTestId('my-account-address-b2b__address-row')
      ).toHaveLength(2);
      expect(
        container.getAllByTestId('my-account-address-b2b__address-info')[0]
      ).toHaveTextContent('123 Main St, 12345, Stockholm, Sweden');
      expect(
        container.getAllByTestId('my-account-address-b2b__address-info')[1]
      ).toHaveTextContent('3 Big Avenue, 23456, Houston, United State');
      expect(
        container.getAllByTestId('my-account-address-b2b__edit-button')
      ).toHaveLength(2);
      expect(
        container.getAllByTestId('my-account-address-b2b__edit-button')[0]
      ).toHaveTextContent('customeraddress.button.edit');
    });

    test('should render correct address row if data is missing', async () => {
      mockGetOrganizationAddresses.mockResolvedValue({
        me: {
          selectedOrganization: {
            roleOperations: [
              {
                roleOperationId: '_readOrders',
              },
              {
                roleOperationId: '_manageAddresses',
              },
            ],
            organization: {
              id: 'foo',
              addresses: [
                {
                  id: 'foo',
                  address1: '3 Big Avenue',
                  city: 'Houston',
                  phoneNumber: '23456789',
                },
              ],
            },
          },
        },
      });

      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getAllByTestId('my-account-address-b2b__address-row')
      ).toHaveLength(1);
      expect(
        container.getByTestId('my-account-address-b2b__address-info')
      ).toHaveTextContent('3 Big Avenue, Houston');
      expect(
        container.getAllByTestId('my-account-address-b2b__edit-button')
      ).toHaveLength(1);
      expect(
        container.getAllByTestId('my-account-address-b2b__edit-button')[0]
      ).toHaveTextContent('customeraddress.button.edit');
    });

    test('should get current user address info on page load', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      render(Result);

      expect(mockGetOrganizationAddresses).toHaveBeenCalled();
    });

    test('should get website texts and countries on page load', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      render(Result);

      expect(mockGetWebsite).toHaveBeenCalled();
    });

    test('should get user oganization data on page load', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      render(Result);

      expect(mockGetOrganizationAddresses).toHaveBeenCalled();
    });

    test('should render correct href value in add button', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getByTestId('my-account-address-b2b__add-button')
      ).toHaveAttribute('href', '?view=add');
    });

    test('should render correct href value in edit button', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getByTestId('my-account-address-b2b__edit-button')
      ).toHaveAttribute('href', '?view=edit&addressId=bar');
    });

    test('should render add, edit and delete button if user has manage addresses role operation', async () => {
      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getByTestId('my-account-address-b2b__add-button')
      ).toBeInTheDocument();
      expect(
        container.getByTestId('my-account-address-b2b__edit-button')
      ).toBeInTheDocument();
      expect(
        container.getByTestId('delete-address-button')
      ).toBeInTheDocument();
    });

    test('should not render add, edit and delete button if user does not have manage addresses role operation', async () => {
      mockGetOrganizationAddresses.mockResolvedValue({
        me: {
          selectedOrganization: {
            roleOperations: [
              {
                roleOperationId: '_readAddresses',
              },
            ],
            organization: {
              id: 'foo',
              addresses: [
                {
                  id: 'bar',
                  address1: '123 Main St',
                  zipCode: '12345',
                  country: 'SE',
                  city: 'Stockholm',
                  phoneNumber: '12345678',
                },
                {
                  id: 'foo',
                  address1: '3 Big Avenue',
                  zipCode: '23456',
                  country: 'USA',
                  city: 'Houston',
                  phoneNumber: '23456789',
                },
              ],
            },
          },
        },
      });

      const props = { searchParams: Promise.resolve({ view: null }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.queryByTestId('my-account-address-b2b__add-button')
      ).not.toBeInTheDocument();
      expect(
        container.queryByTestId('my-account-address-b2b__edit-button')
      ).not.toBeInTheDocument();
      expect(
        container.queryByTestId('my-account-address-b2b__delete-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('Add view', () => {
    test('should render correct page tilte', async () => {
      const props = { searchParams: Promise.resolve({ view: 'add' }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getByTestId('my-account-address-b2b__title')
      ).toHaveTextContent('customeraddress.addaddress.title');
    });
  });

  describe('Edit view', () => {
    test('should render correct page tilte', async () => {
      const props = { searchParams: Promise.resolve({ view: 'edit' }) };
      const Result = await B2BAddresses(props);
      const container = render(Result);

      expect(
        container.getByTestId('my-account-address-b2b__title')
      ).toHaveTextContent('customeraddress.editaddress.title');
    });
  });
});
