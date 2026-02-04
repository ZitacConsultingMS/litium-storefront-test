import { CustomerAddress, CustomerAddressType } from 'models/address';
import {
  changeMyEmail,
  changeMyPassword,
  get,
  getUserAddresses,
  manageAddressForPerson,
} from './userService.server';

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

describe('userService', () => {
  describe('get() function', () => {
    test('should return current user organization', async () => {
      mockQueryServer.mockResolvedValue({
        me: {
          selectedOrganization: {
            organization: {
              id: 'foo',
            },
          },
          person: {
            organizations: {
              nodes: [
                {
                  organization: {
                    id: 'foo',
                    fields: {
                      _nameInvariantCulture: 'Foo',
                    },
                  },
                },
                {
                  organization: {
                    id: 'bar',
                    fields: {
                      _nameInvariantCulture: 'Bar',
                    },
                  },
                },
              ],
            },
          },
        },
      });
      const currentUser = await get();
      expect(currentUser).toEqual({
        selectedOrganization: {
          organization: {
            id: 'foo',
          },
        },
        person: {
          organizations: {
            nodes: [
              {
                organization: {
                  id: 'foo',
                  fields: {
                    _nameInvariantCulture: 'Foo',
                  },
                },
              },
              {
                organization: {
                  id: 'bar',
                  fields: {
                    _nameInvariantCulture: 'Bar',
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe('getUserAddresses function', () => {
    test('should return user addresses', async () => {
      mockQueryServer.mockResolvedValue({
        me: {
          person: {
            id: 'foo',
            addresses: [
              {
                id: 'bar',
                address1: '123 Main St',
                zipCode: '12345',
                country: 'SE',
                city: 'USA',
              },
            ],
          },
        },
      });

      const currentUser = await getUserAddresses();
      expect(currentUser).toEqual({
        me: {
          person: {
            id: 'foo',
            addresses: [
              {
                id: 'bar',
                address1: '123 Main St',
                zipCode: '12345',
                country: 'SE',
                city: 'USA',
              },
            ],
          },
        },
      });
    });
  });

  describe('manageAddressForPerson function', () => {
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
        manageAddressForPerson: { errors: null, customerAddress: mockFormData },
      });

      await manageAddressForPerson(mockFormData);

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
        manageAddressForPerson: { errors: null, customerAddress: mockFormData },
      });

      const formDataWithoutId = { ...mockFormData, id: '' };

      await manageAddressForPerson(formDataWithoutId);

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
      const result = await manageAddressForPerson(formData);

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
      const result = await manageAddressForPerson(formData);
      expect(result).toEqual([
        {
          message: 'Error message',
        },
      ]);
    });
  });

  describe('changeMyEmail function', () => {
    test('should return error as null if email is changed successfully', async () => {
      mockMutateServer.mockResolvedValue({
        changeMyEmail: {
          errors: null,
        },
      });

      const input = {
        token: 'token',
        verificationToken: '123456',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      const data = await changeMyEmail(input);
      expect(data).toEqual({
        errors: null,
      });
    });

    test('should return failure error if getting error from server', async () => {
      mockMutateServer.mockResolvedValue({
        changeMyEmail: {
          errors: {
            type: 'verification_token',
            message: 'Wrong verification token',
          },
        },
      });

      const input = {
        token: 'token',
        verificationToken: '123456',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      const data = await changeMyEmail(input);
      expect(data).toEqual({
        errors: {
          type: 'verification_token',
          message: 'Wrong verification token',
        },
      });
    });

    test('should throw error if getting errror from server', async () => {
      mockMutateServer.mockRejectedValue(new Error('Unexpected error'));

      const input = {
        token: 'token',
        verificationToken: '123456',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      await expect(changeMyEmail(input)).rejects.toThrow('Unexpected error');
    });
  });

  describe('changeMyPassword function', () => {
    test('should return error as null if password is changed successfully', async () => {
      mockMutateServer.mockResolvedValue({
        changeMyPassword: {
          errors: null,
        },
      });

      const input = {
        currentPassword: '1234567',
        newPassword: '1234568',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      const data = await changeMyPassword(input);
      expect(data).toEqual({
        errors: null,
      });
    });

    test('should return failure error if getting error from server', async () => {
      mockMutateServer.mockResolvedValue({
        changeMyPassword: {
          errors: {
            type: 'password_missmatch',
            message: 'incorrect password',
          },
        },
      });

      const input = {
        currentPassword: '1234567',
        newPassword: '1234568',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      const data = await changeMyPassword(input);
      expect(data).toEqual({
        errors: {
          type: 'password_missmatch',
          message: 'incorrect password',
        },
      });
    });

    test('should throw error if getting errror from server', async () => {
      mockMutateServer.mockRejectedValue(new Error('Unexpected error'));

      const input = {
        currentPassword: '1234567',
        newPassword: '1234568',
        notificationUrl: 'https://localhost/api/email/sendEmailAccountChanged',
      };
      await expect(changeMyPassword(input)).rejects.toThrow('Unexpected error');
    });
  });
});
