import { act, fireEvent, render, screen } from '@testing-library/react';
import { Order } from 'models/order';
import { queryClient } from 'services/dataService.client';
import { approveOrderForOrganization } from 'services/orderService.server';
import OrderHistory from './OrderHistory';

jest.mock('services/dataService.client');
jest.mock('services/orderService.server');
jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

const mockQueryClient = queryClient as jest.Mock;
const mockApprove = approveOrderForOrganization as jest.Mock;

const mockOrders: Order[] = [
  {
    id: '1',
    orderDate: new Date(),
    orderNumber: 'ORD-12345',
    status: 'Pending',
    grandTotal: 100,
    tags: [],
    rows: [],
  },
  {
    id: '2',
    orderDate: new Date(),
    orderNumber: 'ORD-67890',
    status: 'Completed',
    grandTotal: 200,
    tags: ['_awaitOrderApproval'],
    rows: [],
  },
];

const mockPageInfo = {
  hasPreviousPage: false,
  hasNextPage: true,
};

describe('OrderHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles loading more orders', async () => {
    mockQueryClient.mockResolvedValue({
      me: {
        orders: {
          nodes: [
            {
              id: '3',
              orderDate: '2023-07-03T12:00:00Z',
              orderNumber: 'ORD-11111',
              status: 'Shipped',
              grandTotal: 300,
              tags: [],
              rows: [],
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    });

    render(<OrderHistory nodes={mockOrders} pageInfo={mockPageInfo} />);

    fireEvent.click(screen.getByText('orderhistory.btn.loadmore'));
    expect(queryClient).toHaveBeenCalled();
    await screen.findAllByText('ORD-11111');
  });

  test('handles approve order', async () => {
    mockApprove.mockResolvedValue({
      approveOrderForOrganization: { boolean: true },
    });

    mockQueryClient.mockResolvedValue({
      me: {
        selectedOrganization: {
          organization: {
            orders: {
              nodes: [...mockOrders],
              pageInfo: {
                hasNextPage: false,
              },
            },
          },
        },
      },
    });

    render(
      <OrderHistory
        nodes={mockOrders}
        pageInfo={mockPageInfo}
        showOrganizationOrders={true}
        hasApproveOrder={true}
      />
    );

    act(() => {
      fireEvent.click(screen.getAllByTestId('order-history__approve-btn')[1]);
    });

    expect(mockApprove).toHaveBeenCalledWith('2');
  });
});
