'use client';
import { CartContext } from 'contexts/cartContext';
import { useContext, useEffect } from 'react';
import { add } from 'services/cartService.client';

/**
 * Exposes addToCart function to window object for HelloRetail integration
 */
export default function HelloRetailAddToCart() {
  const cartContext = useContext(CartContext);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose current cart state
      (window as any).getCurrentCart = (): any => {
        return cartContext.cart;
      };
      (window as any).addToCart = async (
        articleNumber: string,
        quantity: number = 1
      ): Promise<{ success: boolean; cart?: any; error?: string }> => {
        try {
          if (!articleNumber || typeof articleNumber !== 'string') {
            return {
              success: false,
              error: 'Invalid article number.',
            };
          }

          if (quantity && (typeof quantity !== 'number' || quantity <= 0)) {
            return {
              success: false,
              error: 'Invalid quantity. Must be a positive number.',
            };
          }

          const cart = await add(articleNumber, quantity);
          cartContext.setCart(cart);

          return {
            success: true,
            cart: cart,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          };
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).addToCart;
        delete (window as any).getCurrentCart;
      }
    };
  }, [cartContext]);

  return null;
}
