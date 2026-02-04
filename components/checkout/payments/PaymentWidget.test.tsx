import { render, screen } from '@testing-library/react';
import { OrderRow } from 'models/order';
import PaymentWidget from './PaymentWidget';

// Mock the dynamic import for CheckoutWidget
jest.mock('next/dynamic', () => {
  return jest.fn(() => {
    const MockCheckoutWidget = ({ html, id, onLoad }: any) => (
      <div data-testid={`checkout-widget-${id}`}>
        <div
          data-testid="widget-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
    return MockCheckoutWidget;
  });
});

// Mock the extractScripts service
jest.mock('services/dataService.client', () => ({
  extractScripts: jest.fn((responseString: string) => ({
    scripts: ['console.log("test script");'],
    scriptFiles: ['https://example.com/script.js'],
    html: responseString,
  })),
}));

describe('PaymentWidget', () => {
  const mockRows: OrderRow[] = [
    {
      rowId: '1',
      articleNumber: 'test-article',
      quantity: 1,
      totalIncludingVat: 100,
      discountInfos: [],
      rowType: 'product',
    },
  ];

  test('should render CheckoutWidget with correct props', () => {
    const responseString = '<div>Payment Form</div>';

    render(<PaymentWidget responseString={responseString} rows={mockRows} />);

    const widgetElement = screen.getByTestId('checkout-widget-payment-widget');
    const contentElement = screen.getByTestId('widget-content');

    expect(widgetElement).toBeDefined();
    expect(widgetElement).not.toBeNull();
    expect(contentElement.innerHTML).toBe('<div>Payment Form</div>');
  });

  test('should work with onLoad callback', () => {
    const responseString = '<div>Payment Form</div>';
    const mockOnLoad = jest.fn();

    render(
      <PaymentWidget
        responseString={responseString}
        rows={mockRows}
        onLoad={mockOnLoad}
      />
    );

    const widgetElement = screen.getByTestId('checkout-widget-payment-widget');
    const contentElement = screen.getByTestId('widget-content');

    expect(widgetElement).toBeDefined();
    expect(widgetElement).not.toBeNull();
    expect(contentElement.innerHTML).toBe('<div>Payment Form</div>');
  });

  test('should work without rows prop', () => {
    const responseString = '<div>Payment Form</div>';

    render(<PaymentWidget responseString={responseString} />);

    const widgetElement = screen.getByTestId('checkout-widget-payment-widget');
    const contentElement = screen.getByTestId('widget-content');

    expect(widgetElement).toBeDefined();
    expect(widgetElement).not.toBeNull();
    expect(contentElement.innerHTML).toBe('<div>Payment Form</div>');
  });

  test('should work without optional props', () => {
    const responseString = '<div>Payment Form</div>';

    render(<PaymentWidget responseString={responseString} />);

    const widgetElement = screen.getByTestId('checkout-widget-payment-widget');
    const contentElement = screen.getByTestId('widget-content');

    expect(widgetElement).toBeDefined();
    expect(widgetElement).not.toBeNull();
    expect(contentElement.innerHTML).toBe('<div>Payment Form</div>');
  });

  test('should call extractScripts with responseString', () => {
    const responseString = '<div>Payment Form</div>';
    const { extractScripts } = require('services/dataService.client');

    render(<PaymentWidget responseString={responseString} rows={mockRows} />);

    expect(extractScripts).toHaveBeenCalledWith(responseString);
  });
});
