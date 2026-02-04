'use client';

import { trackHelloRetailCart } from 'app/actions/trackHelloRetailCart';
import { CartContext } from 'contexts/cartContext';
import { useContext, useEffect, useRef } from 'react';
import { buildHelloRetailCartPayload } from 'utils/helloRetailCartTracking';

interface HelloRetailCartTrackerProps {
  cartUrl?: string;
  email?: string;
}

/**
 * Tracks cart changes with Hello Retail using the REST API
 * Automatically tracks whenever the cart changes (add/remove/update items)
 * Fires on: initial page load and every cart modification
 */
export default function HelloRetailCartTracker({
  cartUrl,
  email,
}: HelloRetailCartTrackerProps) {
  const cartContext = useContext(CartContext);
  const previousCartRef = useRef<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Skip if cart hasn't actually changed
    const cartKey = JSON.stringify({
      productCount: cartContext.cart?.productCount,
      grandTotal: cartContext.cart?.grandTotal,
      rows: cartContext.cart?.rows?.map(r => ({
        articleNumber: r.articleNumber,
        quantity: r.quantity,
      })),
    });

    if (cartKey === previousCartRef.current) {
      return;
    }

    previousCartRef.current = cartKey;

    // Debounce rapid changes (e.g., quantity updates) to avoid excessive API calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const payload = buildHelloRetailCartPayload(cartContext.cart, { cartUrl, email });
      trackHelloRetailCart(payload).catch((error) => {
        console.error('Error tracking cart with Hello Retail:', error);
      });
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cartContext.cart, cartUrl, email]);

  return null;
}

