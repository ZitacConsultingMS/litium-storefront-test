import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import { EmptyWebsite, WebsiteContext } from 'contexts/websiteContext';
import { Order } from 'models/order';
import { queryClient } from 'services/dataService.client';
import {
  approveOrderForOrganization,
  repeatOrderForOrganization,
} from 'services/orderService.server';
import OrderDetail from './OrderDetail';

jest.mock('services/dataService.client');
jest.mock('services/orderService.server');
jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

const mockQueryClient = queryClient as jest.Mock;
const mockRepeat = repeatOrderForOrganization as jest.Mock;
const mockApprove = approveOrderForOrganization as jest.Mock;

const mockWebsites = {
  ...EmptyWebsite,
  countries: [{ code: 'SE', name: 'Sweden' }],
};

const mockOrder: Order = {
  id: 'ORD-id',
  orderDate: new Date('2024-09-23T12:00:00Z'),
  shippingCostIncludingVat: 20,
  totalFeesIncludingVat: 50,
  productTotalIncludingVat: 486.25,
  tags: ['_awaitOrderApproval'],
  orderNumber: 'ORD-number',
  shippingAddress: {
    address1: 'Main street 1',
    zipCode: '123 45',
    city: 'Stockholm',
    country: 'SE',
    email: 'anna.larsson@gmail.com',
    firstName: 'Anna',
    lastName: 'Larsson',
    organizationName: 'ORG-name',
    phoneNumber: '0000000000',
  },
  discountInfos: [
    {
      discountType: 'OrderDiscount',
      resultOrderRow: {
        totalIncludingVat: -20,
      },
    },
    {
      discountType: 'DiscountedProductPrice',
      resultOrderRow: {
        totalIncludingVat: -86.25,
      },
    },
  ],
  grandTotal: 450,
  totalVat: 90,
  rows: [
    {
      rowType: 'PRODUCT',
      rowId: '1',
      articleNumber: 'PRO-act-1',
      quantity: 1,
      totalIncludingVat: 486.25,
      product: {
        id: 'PRO-id-1',
        url: '/',
        name: 'PRO-name-1',
        smallImages: [
          {
            dimension: {
              height: 80,
              width: 56,
            },
            url: '/',
          },
        ],
      },
      discountInfos: [
        {
          discountType: 'DiscountedProductPrice',
          resultOrderRow: {
            totalIncludingVat: -86.25,
          },
        },
      ],
    },
    {
      rowType: 'FEE',
      rowId: '2',
      articleNumber: 'directpayment:DirectPay',
      quantity: 1,
      totalIncludingVat: 50,
      discountInfos: [],
    },
    {
      rowType: 'SHIPPING_FEE',
      rowId: '3',
      articleNumber: 'DirectShipment:standardPackage',
      quantity: 1,
      totalIncludingVat: 20,
      discountInfos: [],
    },
    {
      rowType: 'DISCOUNT',
      rowId: '4',
      articleNumber: 'PRO-act-1',
      quantity: 1,
      totalIncludingVat: -86.25,
      discountInfos: [],
    },
    {
      rowType: 'DISCOUNT',
      rowId: '5',
      articleNumber: '',
      quantity: 1,
      totalIncludingVat: -20,
      discountInfos: [],
    },
  ],
  status: 'Confirmed',
};

describe('OrderDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render information of order detail correctly', () => {
    const cart = generateCartLineItemData(1, 1, 0);
    render(
      <WebsiteContext.Provider value={mockWebsites}>
        <CartContextProvider value={cart}>
          <OrderDetail
            orderDetail={mockOrder}
            hasPlaceOrder={true}
            hasApproveOrder={true}
          />
        </CartContextProvider>
      </WebsiteContext.Provider>
    );

    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__repeat-btn`)
    ).toHaveTextContent('orderdetail.btn.repeat');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__approve-btn`)
    ).toHaveTextContent('orderdetail.btn.approve');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__print-btn`)
    ).toHaveTextContent('orderdetail.btn.print');

    expect(
      screen.getByText(`orderdetail.order ${mockOrder.orderNumber}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__date`)
    ).toHaveTextContent('2024-09-23');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__total`)
    ).toHaveTextContent(`${mockOrder.grandTotal}`);

    expect(screen.getByText('orderdetail.shippingaddress')).toBeInTheDocument();
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__name`)
    ).toHaveTextContent(
      `${mockOrder?.shippingAddress?.firstName} ${mockOrder?.shippingAddress?.lastName}`
    );
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__address`)
    ).toHaveTextContent(`${mockOrder?.shippingAddress?.address1}`);
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__zipcode-city`)
    ).toHaveTextContent(
      `${mockOrder?.shippingAddress?.zipCode} ${mockOrder?.shippingAddress?.city}`
    );
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__country`)
    ).toHaveTextContent('Sweden');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__email`)
    ).toHaveTextContent(`${mockOrder?.shippingAddress?.email}`);
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__phone`)
    ).toHaveTextContent(`${mockOrder?.shippingAddress?.phoneNumber}`);

    expect(screen.getByText('orderdetail.ordersummary')).toBeInTheDocument();
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__itemssubtotal`)
    ).toHaveTextContent('400 SEK');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__fees`)
    ).toHaveTextContent('50 SEK');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__delivery`)
    ).toHaveTextContent('20 SEK');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__discount`)
    ).toHaveTextContent('20 SEK');
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__vat`)
    ).toHaveTextContent(`${mockOrder.totalVat}`);
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__grandTotal`)
    ).toHaveTextContent(`${mockOrder.grandTotal}`);
    expect(
      screen.getByTestId(`${mockOrder.orderNumber}__status`)
    ).toHaveTextContent('orderhistory.status.confirmed');
    expect(screen.getByText('orderdetail.items')).toBeInTheDocument();
  });

  test('handles repeat order', async () => {
    mockRepeat.mockResolvedValue({
      repeatOrderForOrganization: { boolean: true },
    });
    const productLines = mockOrder.rows.filter(
      (row) => row.rowType === 'PRODUCT'
    );

    render(
      <OrderDetail
        orderDetail={mockOrder}
        hasPlaceOrder={true}
        hasApproveOrder={true}
      />
    );

    await userEvent.click(
      screen.getByTestId(`${mockOrder.orderNumber}__repeat-btn`)
    );
    expect(mockRepeat).toHaveBeenCalledWith(productLines);
  });

  test('handles approve order', async () => {
    mockApprove.mockResolvedValue({
      approveOrderForOrganization: { boolean: true },
    });

    mockQueryClient.mockResolvedValue({
      node: { ...mockOrder },
    });

    render(
      <OrderDetail
        orderDetail={mockOrder}
        hasPlaceOrder={true}
        hasApproveOrder={true}
      />
    );

    await userEvent.click(
      screen.getByTestId(`${mockOrder.orderNumber}__approve-btn`)
    );
    expect(mockApprove).toHaveBeenCalledWith(mockOrder.id);
  });

  test('handles print order', async () => {
    const windowPrint = jest.spyOn(window, 'print');

    render(
      <OrderDetail
        orderDetail={mockOrder}
        hasPlaceOrder={true}
        hasApproveOrder={true}
      />
    );

    await userEvent.click(
      screen.getByTestId(`${mockOrder.orderNumber}__print-btn`)
    );
    expect(windowPrint).toHaveBeenCalledWith();
  });
});
