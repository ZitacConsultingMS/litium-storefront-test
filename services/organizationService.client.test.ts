import { mutateClient } from './dataService.client';
import { deleteOrganizationAddress } from './organizationService.client';

jest.mock('./dataService.client', () => ({
  mutateClient: jest.fn(),
}));

describe('deleteOrganizationAddress', () => {
  const mockAddressId = '123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call mutateClient with correct variables', async () => {
    (mutateClient as jest.Mock).mockResolvedValue({
      removeAddressFromOrganization: { boolean: true, errors: null },
    });

    await deleteOrganizationAddress(mockAddressId);

    expect(mutateClient).toHaveBeenCalledWith({
      mutation: expect.anything(),
      variables: {
        input: {
          addressId: mockAddressId,
        },
      },
    });
  });

  test('should return errors if there are any', async () => {
    const mockErrors = [{ message: 'Error' }];
    (mutateClient as jest.Mock).mockResolvedValue({
      removeAddressFromOrganization: { boolean: false, errors: mockErrors },
    });

    const result = await deleteOrganizationAddress(mockAddressId);

    expect(result.removeAddressFromOrganization.errors).toEqual(mockErrors);
    expect(result.removeAddressFromOrganization.boolean).toBe(false);
  });

  test('should throw an error if mutateClient throws an unexpected error', async () => {
    (mutateClient as jest.Mock).mockRejectedValue(
      new Error('Unexpected Error')
    );

    await expect(deleteOrganizationAddress(mockAddressId)).rejects.toThrow(
      'Unexpected Error'
    );
  });
});
