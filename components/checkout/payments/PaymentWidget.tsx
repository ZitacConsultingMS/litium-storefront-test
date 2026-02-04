'use client';
import { OrderRow } from 'models/order';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { extractScripts } from 'services/dataService.client';

/**
 * Renders a payment widget based on the input `responseString` which is returned by a payment provider.
 * @param responseString an HTML snippet.
 * @param rows a list of OrderRow. The component does not use this param, but we need it in order for the
 * component to re-render when Cart content is changed.
 * @param onLoad callback when widget is loaded
 */
const PaymentWidget = memo(function PaymentWidget({
  responseString,
  rows,
  onLoad,
}: {
  responseString: string;
  rows?: OrderRow[];
  onLoad?: () => void;
}) {
  rows = rows ?? [];

  const WidgetCheckout = dynamic(
    () => import('./CheckoutWidget').then((mod) => mod.default),
    { ssr: false }
  );
  const { scripts, scriptFiles, html } = extractScripts(responseString);
  const id = 'payment-widget';

  return (
    <WidgetCheckout
      scripts={scripts}
      scriptFiles={scriptFiles}
      html={html}
      id={id}
      onLoad={onLoad}
    />
  );
});

export default PaymentWidget;
