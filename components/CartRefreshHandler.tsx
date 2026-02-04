'use client';
import { CartContext } from 'contexts/cartContext';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect } from 'react';

/**
 * Component to handle cart refresh when authentication changes
 * Should be included in the layout to monitor for refresh flags
 */
export default function CartRefreshHandler() {
  const searchParams = useSearchParams();
  const { refreshCart } = useContext(CartContext);

  useEffect(() => {
    const shouldRefreshCart = searchParams.get('refreshCart');

    if (shouldRefreshCart === 'true') {
      // Refresh cart after authentication change
      refreshCart().catch((error) => {
        console.error(
          'Failed to refresh cart after authentication change:',
          error
        );
      });

      // Clean up the URL parameter
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('refreshCart');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, refreshCart]);

  return null;
}
