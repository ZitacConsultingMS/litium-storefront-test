'use client';
import { CartContext } from 'contexts/cartContext';
import { useContext, useEffect, useRef } from 'react';
import { get } from 'services/cartService.client';

export default function ClearCart() {
  const cartContext = useContext(CartContext);
  const initialized = useRef(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!initialized.current) {
        cartContext.setCart(await get());
        initialized.current = true;
      }
    };
    fetchCart();
  }, [cartContext]);
  return <></>;
}
