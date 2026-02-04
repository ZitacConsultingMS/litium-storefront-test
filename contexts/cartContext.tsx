'use client';
import { Cart } from 'models/cart';
import { createContext, useState } from 'react';

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
  hasCartChanged: boolean;
  setHasCartChanged: (value: boolean) => void;
};

export const CartContext = createContext<CartType>({
  cart: EmptyCart,
  setCart: (_) => {},
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

  return (
    <CartContext.Provider
      value={{ cart, setCart, hasCartChanged, setHasCartChanged }}
    >
      {children}
    </CartContext.Provider>
  );
}
