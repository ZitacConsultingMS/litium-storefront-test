import { CustomerAddress } from 'models/address';
import { headers } from 'next/headers';
import { manageAddressForOrganization } from 'services/organizationService.server';
import { getHost } from 'utils/headers';
import updateOrganizationAddress from './updateOrganizationAddress';

// Mock the necessary imports
jest.mock('services/organizationService.server', () => ({
  manageAddressForOrganization: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn(),
}));

describe('updateOrganizationAddress', () => {
  const mockFormData = {
    id: '123',
    address1: '123 Main St',
    city: 'Sample City',
    country: 'SE',
    zipCode: '12345',
    phoneNumber: '123-456-7890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call manageAddressForOrganization with correct formData', async () => {
    (headers as jest.Mock).mockReturnValue({});
    (getHost as jest.Mock).mockReturnValue('http://localhost');
    const mockErrors = null;
    (manageAddressForOrganization as jest.Mock).mockResolvedValue({
      manageAddressForOrganization: { errors: null },
    });

    const result = await updateOrganizationAddress(mockFormData);

    expect(manageAddressForOrganization).toHaveBeenCalledWith(mockFormData);
    expect(result.errors).toEqual(mockErrors);
  });

  it('should handle errors from manageAddressForOrganization and return them', async () => {
    const mockErrors = [{ message: 'Error' }];
    (manageAddressForOrganization as jest.Mock).mockResolvedValue({
      manageAddressForOrganization: { errors: mockErrors },
    });

    const result = await updateOrganizationAddress(mockFormData);

    expect(result.errors).toEqual(mockErrors);
  });

  test('should handle network errors from manageAddressForOrganization and return them', async () => {
    const mockFormData: CustomerAddress = {
      address1: '123 Main St',
      zipCode: '12345',
      country: 'SE',
      phoneNumber: '12345678',
      city: 'USA',
      id: 'foo',
    };
    const networkError = {
      networkError: {
        result: {
          errors: [{ message: 'Network error' }],
        },
      },
    };
    (manageAddressForOrganization as jest.Mock).mockRejectedValue(networkError);
    const result = await updateOrganizationAddress(mockFormData);

    expect(result.errors).toEqual([{ message: 'Network error' }]);
  });

  it('should throw an error if an unexpected error occurs', async () => {
    (manageAddressForOrganization as jest.Mock).mockRejectedValue(
      new Error('Unexpected Error')
    );

    await expect(updateOrganizationAddress(mockFormData)).rejects.toThrow(
      'Unexpected Error'
    );
  });
});
