'use client';
import { useEffect, useState } from 'react';
import {
  getStockBalance,
  StockBalance,
} from 'services/zitac/stockbalanceService';

interface StoreData {
  id: string;
  name: string;
}

export function useStoreSelection(articleNumber?: string) {
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [storeStockData, setStoreStockData] = useState<StockBalance | null>(
    null
  );
  const [loadingStoreStock, setLoadingStoreStock] = useState(false);

  // Load selected store from localStorage and listen for changes
  useEffect(() => {
    const loadStore = () => {
      const savedStore = localStorage.getItem('selectedStore');
      if (savedStore) {
        try {
          const store = JSON.parse(savedStore);
          setSelectedStore(store);
        } catch (error) {
          console.error('Failed to parse saved store:', error);
        }
      }
    };

    loadStore();

    // Listen for custom events from other components
    const handleStoreSelectionChange = (e: CustomEvent) => {
      if (e.detail?.selectedStore) {
        setSelectedStore(e.detail.selectedStore);
      }
    };

    window.addEventListener(
      'storeSelectionChanged',
      handleStoreSelectionChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'storeSelectionChanged',
        handleStoreSelectionChange as EventListener
      );
    };
  }, []);

  // Fetch stock data for selected store
  useEffect(() => {
    if (!selectedStore || !articleNumber) return;

    const fetchStoreStock = async () => {
      try {
        setLoadingStoreStock(true);
        const stockData = await getStockBalance(articleNumber);
        const storeStock = stockData.find(
          (s: StockBalance) => s.id === selectedStore.id
        );
        setStoreStockData(storeStock || null);
      } catch (error) {
        console.error('Failed to fetch store stock:', error);
        setStoreStockData(null);
      } finally {
        setLoadingStoreStock(false);
      }
    };

    fetchStoreStock();
  }, [selectedStore, articleNumber]);

  return {
    selectedStore,
    storeStockData,
    loadingStoreStock,
  };
}
