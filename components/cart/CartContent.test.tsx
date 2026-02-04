import { render, screen } from '@testing-library/react';
import { generateCartLineItemData } from '__mock__/generateMockData';
import CartContextProvider from 'contexts/cartContext';
import WebsiteContextProvider, { EmptyWebsite } from 'contexts/websiteContext';
import { Cart, DiscountInfo } from 'models/cart';
import { OrderRow } from 'models/order';
import { DiscountType } from 'utils/constants';
import CartContent from './CartContent';

const MockWebsite = {
  ...EmptyWebsite,
  imageServerUrl: 'https://localhost/',
};

const mockDiscountInfos: DiscountInfo[] = [
  {
    discountType: 'OrderDiscount',
    resultOrderRow: {
      totalIncludingVat: -100,
      totalExcludingVat: -80,
      description: 'OrderDiscount description',
      rowId: 'OrderDiscount',
      rowType: 'DISCOUNT',
      articleNumber: '',
      quantity: 1,
      discountInfos: [],
    },
  },
  {
    discountType: 'FreeDelivery',
    resultOrderRow: {
      totalIncludingVat: -10,
      totalExcludingVat: -8,
      description: 'FreeDelivery description',
      rowId: 'FreeDelivery',
      rowType: 'DISCOUNT',
      articleNumber: '',
      quantity: 1,
      discountInfos: [],
    },
  },
];

const mockFeeRows: OrderRow[] = [
  {
    rowType: 'SHIPPING_FEE',
    rowId: 'shipping1',
    articleNumber: 'DirectShipment:expressPackage',
    quantity: 1,
    totalIncludingVat: 10,
    totalExcludingVat: 8,
    description: 'DirectShipment:expressPackage',
    discountInfos: [],
  },
  {
    rowType: 'FEE',
    rowId: 'fee1',
    articleNumber: 'directpayment:DirectPay',
    quantity: 1,
    totalIncludingVat: 50,
    totalExcludingVat: 40,
    description: 'directpayment:DirectPay',
    discountInfos: [],
  },
  {
    rowType: 'TAX',
    rowId: 'tax1',
    articleNumber: '',
    quantity: 1,
    totalIncludingVat: 10,
    totalExcludingVat: 8,
    description: 'Tax 1 description',
    discountInfos: [],
  },
];

describe('Cart Content Component', () => {
  const renderWithContext = (
    component: React.ReactElement,
    cart: Cart = generateCartLineItemData(1, 1, 0),
    showPricesIncludingVat: boolean = true
  ) => {
    return render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContextProvider value={{ ...cart, showPricesIncludingVat }}>
          {component}
        </CartContextProvider>
      </WebsiteContextProvider>
    );
  };

  test('should render asterisk and text explain if product discount and order discount are applied for order row', () => {
    const cart: Cart = generateCartLineItemData(1, 10, 2, true);

    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContent rows={cart.rows} />
      </WebsiteContextProvider>
    );
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeInTheDocument();
  });
  test('should not render asterisk if only product discount or order discount is applied for order row', () => {
    const cart: Cart = generateCartLineItemData(
      1,
      1,
      1,
      false,
      DiscountType.ProductDiscount
    );
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContent rows={cart.rows} />
      </WebsiteContextProvider>
    );
    expect(screen.queryByTestId('abc-xyz-0__asterisk')).toBeNull();
  });
  test('should render empty cart content if there is no items', () => {
    const cart: Cart = generateCartLineItemData(0, 10, 2, true);
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContent rows={cart.rows} />
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('cart-content__empty-cart')).toBeInTheDocument();
  });
  test('should call onClose function on clicking the keep shopping button', async () => {
    const cart: Cart = generateCartLineItemData(0, 10, 2, true);
    const onClose = jest.fn();
    render(
      <WebsiteContextProvider value={MockWebsite}>
        <CartContent onClose={onClose} rows={cart.rows} />
      </WebsiteContextProvider>
    );
    expect(screen.getByTestId('cart-content__empty-cart')).toBeInTheDocument();
    await screen.getByTestId('cart-content__keep-shopping').click();
    expect(onClose).toHaveBeenCalled();
  });

  describe('Cost Details', () => {
    test('should not render the cost details if showCostDetails is false', () => {
      const cart: Cart = generateCartLineItemData(1, 1, 0);
      cart.rows = [...cart.rows, ...mockFeeRows];

      renderWithContext(
        <CartContent
          showCostDetails={false}
          rows={cart.rows}
          totalVat={cart.totalVat}
        />,
        cart
      );

      expect(
        screen.queryByTestId('cart-content__cost-details')
      ).not.toBeInTheDocument();
    });

    test('should render the cost details if showCostDetails is true', () => {
      const cart: Cart = generateCartLineItemData(1, 1, 0);
      cart.rows = [...cart.rows, ...mockFeeRows];

      renderWithContext(
        <CartContent
          showCostDetails={true}
          rows={cart.rows}
          totalVat={cart.totalVat}
        />,
        cart
      );

      expect(
        screen.queryByTestId('cart-content__cost-details')
      ).toBeInTheDocument();
    });

    describe('Order discount', () => {
      test('should not render the discount if there is no order discount', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);

        renderWithContext(<CartContent rows={cart.rows} />);

        expect(
          screen.queryByTestId('cart-content__discount')
        ).not.toBeInTheDocument();
      });

      test('should render correct the discounts and use the description as the label', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.discountInfos = mockDiscountInfos;

        renderWithContext(
          <CartContent rows={cart.rows} discountInfos={cart.discountInfos} />,
          cart
        );

        expect(
          screen.getByTestId('cart-content__discount-name-OrderDiscount')
        ).toHaveTextContent('OrderDiscount description');
        expect(
          screen.getByTestId('cart-content__discount-price-OrderDiscount')
        ).toHaveTextContent('−100');
      });

      test('should render correct line items if have multiple order discount', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.discountInfos = [
          ...mockDiscountInfos,
          {
            discountType: 'MixAndMatch',
            resultOrderRow: {
              totalIncludingVat: -100,
              totalExcludingVat: -80,
              description: 'MixAndMatch description',
              rowId: 'MixAndMatch',
              rowType: 'DISCOUNT',
              articleNumber: '',
              quantity: 1,
              discountInfos: [],
            },
          },
        ];

        renderWithContext(
          <CartContent rows={cart.rows} discountInfos={cart.discountInfos} />,
          cart
        );

        // Discount 1
        expect(
          screen.getByTestId('cart-content__discount-name-OrderDiscount')
        ).toHaveTextContent('OrderDiscount description');
        expect(
          screen.getByTestId('cart-content__discount-price-OrderDiscount')
        ).toHaveTextContent('−100');
        // Discount 2
        expect(
          screen.getByTestId('cart-content__discount-name-MixAndMatch')
        ).toHaveTextContent('MixAndMatch description');
        expect(
          screen.getByTestId('cart-content__discount-price-MixAndMatch')
        ).toHaveTextContent('−100');
      });

      test('should render order discount price including VAT if showPricesIncludingVat is true', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.discountInfos = mockDiscountInfos;

        renderWithContext(
          <CartContent rows={cart.rows} discountInfos={cart.discountInfos} />,
          cart,
          true
        );

        expect(
          screen.getByTestId('cart-content__discount-price-OrderDiscount')
        ).toHaveTextContent('−100');
      });

      test('should render order discount price excluding VAT if showPricesIncludingVat is false', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.discountInfos = mockDiscountInfos;

        renderWithContext(
          <CartContent rows={cart.rows} discountInfos={cart.discountInfos} />,
          cart,
          false
        );

        expect(
          screen.getByTestId('cart-content__discount-price-OrderDiscount')
        ).toHaveTextContent('−80');
      });
    });

    describe('Subtotal of the products and discounts', () => {
      test('should not render the subtotal if there are no shipping fee, fee, or tax rows', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);

        renderWithContext(<CartContent rows={cart.rows} />);

        expect(
          screen.queryByTestId('cart-content__subtotal')
        ).not.toBeInTheDocument();
      });

      test('should render the subtotal if there are any shipping fee, fee or tax rows with no order discount', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(
          <CartContent rows={cart.rows} totalVat={cart.totalVat} />,
          cart
        );

        expect(screen.getByTestId('cart-content__subtotal')).toHaveTextContent(
          '698'
        );
      });

      test('should render the subtotal if there are any shipping fee, fee or tax rows with order discount', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];
        cart.discountInfos = mockDiscountInfos;

        renderWithContext(
          <CartContent rows={cart.rows} discountInfos={cart.discountInfos} />,
          cart
        );

        expect(screen.getByTestId('cart-content__subtotal')).toHaveTextContent(
          '598'
        );
      });

      test('should render the subtotal price including VAT if showPricesIncludingVat is true', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(<CartContent rows={cart.rows} />, cart, true);

        expect(screen.getByTestId('cart-content__subtotal')).toHaveTextContent(
          '698'
        );
      });

      test('should render the subtotal price excluding VAT if showPricesIncludingVat is false', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(<CartContent rows={cart.rows} />, cart, false);

        expect(screen.getByTestId('cart-content__subtotal')).toHaveTextContent(
          '560'
        );
      });
    });

    describe('Shipping fee, fee, tax', () => {
      test('should not render the shipping fee, fee, tax if there are no shipping fee, fee or tax rows', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);

        renderWithContext(<CartContent rows={cart.rows} />);

        expect(
          screen.queryByTestId('cart-content__shipping-price-shipping1')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('cart-content__fee-price-fee1')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('cart-content__tax-price-tax1')
        ).not.toBeInTheDocument();
      });

      test('should render the shipping fee, fee , tax with correct value and use the description as the label', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(<CartContent rows={cart.rows} />, cart);

        // Shipping fee
        expect(
          screen.queryByTestId('cart-content__shipping-name-shipping1')
        ).toHaveTextContent('DirectShipment:expressPackage');
        expect(
          screen.getByTestId('cart-content__shipping-price-shipping1')
        ).toHaveTextContent('10');
        // Fee
        expect(
          screen.getByTestId('cart-content__fee-name-fee1')
        ).toHaveTextContent('directpayment:DirectPay');
        expect(
          screen.getByTestId('cart-content__fee-price-fee1')
        ).toHaveTextContent('50');
        // Tax
        expect(
          screen.getByTestId('cart-content__tax-name-tax1')
        ).toHaveTextContent('Tax 1 description');
        expect(
          screen.getByTestId('cart-content__tax-price-tax1')
        ).toHaveTextContent('10');
      });

      test('should use default description if the shipping fee, fee missing description', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [
          ...cart.rows,
          {
            rowType: 'SHIPPING_FEE',
            rowId: 'shipping1',
            articleNumber: '',
            quantity: 1,
            totalIncludingVat: 10,
            totalExcludingVat: 8,
            description: '',
            discountInfos: [],
          },
          {
            rowType: 'FEE',
            rowId: 'fee1',
            articleNumber: '',
            quantity: 1,
            totalIncludingVat: 50,
            totalExcludingVat: 40,
            description: '',
            discountInfos: [],
          },
          {
            rowType: 'TAX',
            rowId: 'tax1',
            articleNumber: '',
            quantity: 1,
            totalIncludingVat: 10,
            totalExcludingVat: 8,
            description: '',
            discountInfos: [],
          },
        ];

        renderWithContext(<CartContent rows={cart.rows} />, cart);

        expect(
          screen.queryByTestId('cart-content__shipping-name-shipping1')
        ).toHaveTextContent('cartcontent.shippingfee.title');
        expect(
          screen.getByTestId('cart-content__fee-name-fee1')
        ).toHaveTextContent('cartcontent.handlingfee.title');
        expect(
          screen.getByTestId('cart-content__tax-name-tax1')
        ).toHaveTextContent('cartcontent.handlingtax.title');
      });

      test('should render shipping discount line when shipping discount is available', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [
          ...cart.rows,
          {
            rowType: 'SHIPPING_FEE',
            rowId: 'shipping1',
            articleNumber: 'DirectShipment:expressPackage',
            quantity: 1,
            totalIncludingVat: 10,
            totalExcludingVat: 8,
            description: 'DirectShipment:expressPackage',
            discountInfos: [
              {
                discountType: 'FreeDelivery',
                resultOrderRow: {
                  rowId: 'FreeDelivery',
                  totalIncludingVat: -10,
                  totalExcludingVat: -8,
                  rowType: 'DISCOUNT',
                  articleNumber: '',
                  quantity: 1,
                  discountInfos: [],
                },
              },
            ],
          },
        ];

        renderWithContext(<CartContent rows={cart.rows} />, cart);

        expect(
          screen.getByTestId('cart-content__shipping-price-shipping1')
        ).toHaveTextContent('0');
        expect(
          screen.getByTestId('cart-content__shipping-discount-shipping1')
        ).toHaveTextContent('10');
      });

      test('should render correct line items if have multiple shipping fee, fee or tax rows', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [
          ...cart.rows,
          ...mockFeeRows,
          {
            rowType: 'SHIPPING_FEE',
            rowId: 'ShippingFee',
            articleNumber: 'ShippingFee',
            quantity: 1,
            totalIncludingVat: 100,
            totalExcludingVat: 80,
            description: 'Shipping fee',
            discountInfos: [],
          },
          {
            rowType: 'FEE',
            rowId: 'InstallationFee',
            articleNumber: 'InstallationFee',
            quantity: 1,
            totalIncludingVat: 200,
            totalExcludingVat: 160,
            description: 'Installation fee',
            discountInfos: [],
          },
          {
            rowType: 'TAX',
            rowId: 'tax2',
            articleNumber: '',
            quantity: 1,
            totalIncludingVat: 20,
            totalExcludingVat: 10,
            description: 'Tax 2 description',
            discountInfos: [],
          },
        ];

        renderWithContext(<CartContent rows={cart.rows} />, cart);

        // Shipping fee 1
        expect(
          screen.getByTestId('cart-content__shipping-name-shipping1')
        ).toHaveTextContent('DirectShipment:expressPackage');
        expect(
          screen.getByTestId('cart-content__shipping-price-shipping1')
        ).toHaveTextContent('10');
        // Shipping fee 2
        expect(
          screen.getByTestId('cart-content__shipping-name-ShippingFee')
        ).toHaveTextContent('Shipping fee');
        expect(
          screen.getByTestId('cart-content__shipping-price-ShippingFee')
        ).toHaveTextContent('100');
        // Handling fee 1
        expect(
          screen.getByTestId('cart-content__fee-name-fee1')
        ).toHaveTextContent('directpayment:DirectPay');
        expect(
          screen.getByTestId('cart-content__fee-price-fee1')
        ).toHaveTextContent('50');
        // Handling fee 2
        expect(
          screen.getByTestId('cart-content__fee-name-InstallationFee')
        ).toHaveTextContent('Installation fee');
        expect(
          screen.getByTestId('cart-content__fee-price-InstallationFee')
        ).toHaveTextContent('200');
        // Tax 1
        expect(
          screen.getByTestId('cart-content__tax-name-tax1')
        ).toHaveTextContent('Tax 1 description');
        expect(
          screen.getByTestId('cart-content__tax-price-tax1')
        ).toHaveTextContent('10');
        // Tax 2
        expect(
          screen.getByTestId('cart-content__tax-name-tax2')
        ).toHaveTextContent('Tax 2 description');
        expect(
          screen.getByTestId('cart-content__tax-price-tax2')
        ).toHaveTextContent('20');
      });

      test('should not render VAT when showPricesIncludingVat is true', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);

        renderWithContext(
          <CartContent rows={cart.rows} totalVat={cart.totalVat} />,
          cart,
          true
        );

        expect(
          screen.queryByTestId('cart-content__vat')
        ).not.toBeInTheDocument();
      });

      test('should render VAT when showPricesIncludingVat is false and render correct value of VAT', () => {
        const cart: Cart = generateCartLineItemData(1, 10, 2, true);

        renderWithContext(
          <CartContent rows={cart.rows} totalVat={cart.totalVat} />,
          cart,
          false
        );

        expect(screen.getByTestId('cart-content__vat')).toHaveTextContent('0');
      });

      test('should render price of shipping fee, fee, tax including VAT when showPricesIncludingVat is true', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(<CartContent rows={cart.rows} />, cart, true);

        expect(
          screen.getByTestId('cart-content__shipping-price-shipping1')
        ).toHaveTextContent('10');
        expect(
          screen.getByTestId('cart-content__fee-price-fee1')
        ).toHaveTextContent('50');
        expect(
          screen.getByTestId('cart-content__tax-price-tax1')
        ).toHaveTextContent('10');
      });

      test('should render price of shipping fee, fee excluding VAT when showPricesIncludingVat is false', () => {
        const cart: Cart = generateCartLineItemData(1, 1, 0);
        cart.rows = [...cart.rows, ...mockFeeRows];

        renderWithContext(<CartContent rows={cart.rows} />, cart, false);

        expect(
          screen.getByTestId('cart-content__shipping-price-shipping1')
        ).toHaveTextContent('8');
        expect(
          screen.getByTestId('cart-content__fee-price-fee1')
        ).toHaveTextContent('40');
        expect(
          screen.getByTestId('cart-content__tax-price-tax1')
        ).toHaveTextContent('8');
      });
    });
  });
});
