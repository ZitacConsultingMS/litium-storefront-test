import { CustomerAddress, CustomerAddressType } from 'models/address';
import {
  getOrganizationAddresses,
  manageAddressForOrganization,
  selectOrganization,
} from './organizationService.server';

const mockQueryServer = jest.fn();
const mockMutateServer = jest.fn();
jest.mock('./dataService.server', () => ({
  queryServer: () => mockQueryServer(),
  mutateServer: (options: any) => mockMutateServer(options),
}));
const mockSetCookie = jest.fn();
jest.mock('utils/cookies', () => ({
  setCookieFromResponse: (result: any) => mockSetCookie(result),
}));
describe('organizationService', () => {
  describe('selectOrganization() function', () => {
    test('should set cookie from the response', async () => {
      mockMutateServer.mockResolvedValue({
        selectUserOrganization: {
          authentication: {
            cookieName: '.AspNetCore.Identity.Application',
            issuedAt: '2024-03-15T08:11:08.063Z',
            expiresIn: 1200,
          },
        },
      });
      const organizationId = 'foo';
      await selectOrganization(organizationId);
      expect(mockSetCookie).toHaveBeenCalledWith({
        selectUserOrganization: {
          authentication: {
            cookieName: '.AspNetCore.Identity.Application',
            issuedAt: '2024-03-15T08:11:08.063Z',
            expiresIn: 1200,
          },
        },
      });
    });
  });

  describe('manageAddressForOrganization function', () => {
    const mockFormData: CustomerAddress = {
      id: '123',
      address1: '123 Main St',
      city: 'Sample City',
      country: 'Sample Country',
      zipCode: '12345',
      phoneNumber: '123-456-7890',
    };
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('should call mutateServer with correct variables when formData has id', async () => {
      mockMutateServer.mockResolvedValue({
        manageAddressForOrganization: {
          errors: null,
          customerAddress: mockFormData,
        },
      });

      await manageAddressForOrganization(mockFormData);

      expect(mockMutateServer).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          input: {
            address: {
              address1: '123 Main St',
              city: 'Sample City',
              country: 'Sample Country',
              zipCode: '12345',
              phoneNumber: '123-456-7890',
            },
            addressId: '123',
          },
        },
      });
    });

    test('should fetch address types and set default address type id if formData has no id', async () => {
      const mockAddressTypes: CustomerAddressType[] = [
        { id: '1', name: 'Address' },
        { id: '2', name: 'Other' },
      ];
      mockQueryServer.mockResolvedValue({
        customerAddressTypes: mockAddressTypes,
      });
      mockMutateServer.mockResolvedValue({
        manageAddressForOrganization: {
          errors: null,
          customerAddress: mockFormData,
        },
      });

      const formDataWithoutId = { ...mockFormData, id: '' };

      await manageAddressForOrganization(formDataWithoutId);

      expect(mockQueryServer).toHaveBeenCalled();
      expect(mockMutateServer).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          input: {
            address: {
              address1: '123 Main St',
              city: 'Sample City',
              country: 'Sample Country',
              zipCode: '12345',
              phoneNumber: '123-456-7890',
              addressTypeId: '1',
            },
          },
        },
      });
    });

    test('should return errors null after updating user address', async () => {
      mockMutateServer.mockResolvedValue({
        errors: null,
      });

      const formData: CustomerAddress = {
        address1: '123 Main St',
        zipCode: '12345',
        country: 'SE',
        phoneNumber: '12345678',
        city: 'USA',
        id: '',
      };
      const result = await manageAddressForOrganization(formData);

      expect(result).toEqual({
        errors: null,
      });
    });

    test('should return errors if manageAddressForPerson mutation getting error', async () => {
      mockMutateServer.mockResolvedValue([
        {
          message: 'Error message',
        },
      ]);
      const formData: CustomerAddress = {
        address1: '123 Main St',
        zipCode: '12345',
        country: 'SE',
        phoneNumber: '12345678',
        city: 'USA',
        id: '',
      };
      const result = await manageAddressForOrganization(formData);
      expect(result).toEqual([
        {
          message: 'Error message',
        },
      ]);
    });
  });

  describe('getOrganizationAddresses function', () => {
    test('should return organization addresses', async () => {
      mockQueryServer.mockResolvedValue({
        me: {
          selectedOrganization: {
            organization: {
              addresses: [
                {
                  id: 'bar',
                  address1: '123 Main St',
                  zipCode: '12345',
                  country: 'SE',
                  city: 'USA',
                },
              ],
              id: 'foo',
            },
          },
        },
      });

      const orgAddresses = await getOrganizationAddresses();
      expect(orgAddresses).toEqual({
        me: {
          selectedOrganization: {
            organization: {
              addresses: [
                {
                  id: 'bar',
                  address1: '123 Main St',
                  zipCode: '12345',
                  country: 'SE',
                  city: 'USA',
                },
              ],
              id: 'foo',
            },
          },
        },
      });
    });
  });
});
