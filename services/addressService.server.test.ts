import { getAddressType } from './addressService.server';

const mockQueryServer = jest.fn();
jest.mock('./dataService.server', () => ({
  queryServer: () => mockQueryServer(),
}));

describe('getAddressType function', () => {
  test('should return customer address types', async () => {
    mockQueryServer.mockResolvedValue({
      customerAddressTypes: [
        {
          name: 'Address',
          id: 'foo',
        },
      ],
    });

    const currentUser = await getAddressType();
    expect(currentUser).toEqual([
      {
        name: 'Address',
        id: 'foo',
      },
    ]);
  });
});
