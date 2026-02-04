import { CustomerAddress } from 'models/address';
import { headers } from 'next/headers';
import { manageAddressForPerson } from 'services/userService.server';
import { getHost } from 'utils/headers';
import updateUserAddress from './updateUserAddress';

// Mock the necessary imports
jest.mock('services/userService.server', () => ({
  manageAddressForPerson: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

jest.mock('utils/headers', () => ({
  getHost: jest.fn(),
}));

describe('updateUserAddress', () => {
  const mockFormData = {
    id: '',
    address1: '123 Main St',
    city: 'Sample City',
    country: 'SE',
    zipCode: '12345',
    phoneNumber: '123-456-7890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call manageAddressForPerson with correct formData', async () => {
    (headers as jest.Mock).mockReturnValue({});
    (getHost as jest.Mock).mockReturnValue('http://localhost');
    (manageAddressForPerson as jest.Mock).mockResolvedValue({
      manageAddressForPerson: {
        errors: null,
        customerAddress: { ...mockFormData, id: '123' },
      },
    });

    const result = await updateUserAddress(mockFormData);

    expect(manageAddressForPerson).toHaveBeenCalledWith(mockFormData);
    expect(result.errors).toBeNull();
    expect(result.customerAddress).toEqual({
      id: '123',
      address1: '123 Main St',
      city: 'Sample City',
      country: 'SE',
      zipCode: '12345',
      phoneNumber: '123-456-7890',
    });
  });

  test('should handle errors from manageAddressForPerson and return them', async () => {
    const mockErrors = [{ message: 'Error' }];
    (manageAddressForPerson as jest.Mock).mockResolvedValue({
      manageAddressForPerson: { errors: mockErrors, customerAddress: null },
    });

    const result = await updateUserAddress(mockFormData);

    expect(result.errors).toEqual(mockErrors);
    expect(result.customerAddress).toBeUndefined();
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
    (manageAddressForPerson as jest.Mock).mockRejectedValue(networkError);
    const result = await updateUserAddress(mockFormData);

    expect(result.errors).toEqual([{ message: 'Network error' }]);
  });

  it('should throw an error if an unexpected error occurs', async () => {
    (manageAddressForPerson as jest.Mock).mockRejectedValue(
      new Error('Unexpected Error')
    );

    await expect(updateUserAddress(mockFormData)).rejects.toThrow(
      'Unexpected Error'
    );
  });
});
