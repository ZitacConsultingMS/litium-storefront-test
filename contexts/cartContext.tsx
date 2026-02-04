'use client';
import { Cart } from 'models/cart';
import { createContext, useState } from 'react';
import { get as getCart } from 'services/cartService.client';

export const EmptyCart: Cart = {
  discountInfos: [],
  grandTotal: 0,
  rows: [],
  productCount: 0,
  discountCodes: [],
  totalVat: 0,
  showPricesIncludingVat: true,
  currency: {
    code: 'SEK',
    symbol: '',
    symbolPosition: '',
    minorUnits: 2,
  },
};

type CartType = {
  cart: Cart;
  setCart: (cart: Cart) => void;
  refreshCart: () => Promise<Cart>;
  hasCartChanged: boolean;
  setHasCartChanged: (value: boolean) => void;
};

export const CartContext = createContext<CartType>({
  cart: EmptyCart,
  setCart: (_) => {},
  refreshCart: async () => EmptyCart,
  hasCartChanged: false,
  setHasCartChanged: (_) => {},
});

export default function CartContextProvider({
  value,
  children,
}: {
  value: Cart;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<Cart>(value);
  const [hasCartChanged, setHasCartChanged] = useState(false);

  const refreshCart = async (): Promise<Cart> => {
    try {
      const updatedCart = await getCart();
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, refreshCart, hasCartChanged, setHasCartChanged }}
    >
      {children}
    </CartContext.Provider>
  );
}
