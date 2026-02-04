'use client';
import HelloRetailHorizontalProductList from 'components/products/zitac/HelloRetailHorizontalProductList';
import { useEffect, useRef, useState } from 'react';
import { HelloRetailProduct } from 'services/zitac/helloretail/loadRecoms';

interface HelloRetailCheckoutRecommendationsProps {
  recomBoxId?: string;
  title?: string;
  slidesPerViewBreakpoints?: {
    320?: number;
    768?: number;
    1024?: number;
    1280?: number;
    default?: number;
  };
}

export default function HelloRetailCheckoutRecommendations({
  recomBoxId,
  title,
  slidesPerViewBreakpoints,
}: HelloRetailCheckoutRecommendationsProps) {
  const [products, setProducts] = useState<HelloRetailProduct[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!recomBoxId || hasLoadedRef.current) return;
    const boxId = recomBoxId; // TypeScript type narrowing

    async function loadRecommendations() {
      hasLoadedRef.current = true;
      try {
        const response = await fetch(`/api/helloretail/recommendations?recomBoxId=${encodeURIComponent(boxId)}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('[HelloRetail] Error loading recommendations:', error);
        hasLoadedRef.current = false; // Allow retry on error
      }
    }

    loadRecommendations();
  }, [recomBoxId]);

  if (products.length === 0) {
    return null;
  }

  return (
    <HelloRetailHorizontalProductList
      items={products}
      title={title}
      slidesPerViewBreakpoints={slidesPerViewBreakpoints}
    />
  );
}

