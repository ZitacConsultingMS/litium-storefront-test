'use client';
import clsx from 'clsx';
import { useStoreSelection } from 'hooks/useStoreSelection';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StockBalance,
  getStockBalance,
} from 'services/zitac/stockbalanceService';

type Props = {
  articleId: string | number;
  onlyInStock?: boolean;
  placeholder?: string;
};

const StockBalanceView: React.FC<Props> = ({
  articleId,
  onlyInStock = false,
  placeholder = 'Visa lager',
}) => {
  const [stocks, setStocks] = useState<StockBalance[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [highlight, setHighlight] = useState<number>(-1);

  // Use store selection hook
  const { selectedStore } = useStoreSelection(articleId.toString());

  // Update selectedId when selectedStore changes
  useEffect(() => {
    if (selectedStore) {
      setSelectedId(selectedStore.id);
    }
  }, [selectedStore]);

  // Fetch stock balances
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockBalance(articleId);
        if (cancelled) return;

        const filteredData = onlyInStock
          ? data.filter((s) => s.quantity > 0)
          : data;
        setStocks(filteredData);

        // Restore saved selection if present and valid, but only if we don't already have one
        const savedStore = localStorage.getItem('selectedStore');
        if (savedStore && !selectedId) {
          try {
            const store = JSON.parse(savedStore);
            const storeExists = filteredData.some((s) => s.id === store.id);
            if (storeExists) {
              setSelectedId(store.id);
            }
          } catch (error) {
            console.error('Failed to parse saved store:', error);
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [articleId, onlyInStock, selectedId]);

  // Sort options by name (sv-SE)
  const options = useMemo(
    () => [...stocks].sort((a, b) => a.name.localeCompare(b.name, 'sv-SE')),
    [stocks]
  );

  const selected = useMemo(
    () => stocks.find((s) => s.id === selectedId) ?? null,
    [stocks, selectedId]
  );

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Reset highlight when menu closes
  useEffect(() => {
    if (!open) setHighlight(-1);
  }, [open]);

  // Update localStorage + broadcast when selection changes
  const handleStoreChange = (storeId: string) => {
    setSelectedId(storeId);

    const sel = stocks.find((s) => s.id === storeId);
    if (sel) {
      const storeData = { id: sel.id, name: sel.name };
      localStorage.setItem('selectedStore', JSON.stringify(storeData));
      window.dispatchEvent(
        new CustomEvent('storeSelectionChanged', {
          detail: { selectedStore: storeData },
        })
      );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = highlight >= 0 ? highlight : 0;
      const o = options[idx];
      if (o) {
        handleStoreChange(o.id);
        setOpen(false);
      }
    }
  };

  const getQtyBadgeClass = (o: StockBalance | null | undefined) => {
    if (!o) return 'bg-gray-100 text-gray-700';
    if (o.mustContactStore) return 'bg-yellow-100 text-yellow-700';
    if (o.quantity === 0) return 'bg-gray-100 text-gray-700';
    if (o.quantity >= 5) return 'bg-emerald-100 text-emerald-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getBadgeText = (o: StockBalance | null | undefined) => {
    if (!o) return '';
    if (o.mustContactStore) return 'Kontakta butik';
    if (o.quantity === 0) return 'Ej i lager';
    if (o.quantity >= 5) return 'fler än 5 i lager';
    return 'färre än 5 i lager';
  };

  if (loading) return <p className="text-sm text-gray-500">Hämtar lager…</p>;
  if (error) return <p className="text-red-600 text-sm">Error: {error}</p>;
  if (!stocks.length)
    return (
      <p className="text-sm text-gray-500">
        Ingen lager information tillgänglig.
      </p>
    );

  return (
    <div
      className="relative mt-5 w-full"
      ref={dropdownRef}
      onKeyDown={onKeyDown}
    >
      {/* Trigger (replaces native select) */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-transparent p-3 text-left text-sm text-dark-gray shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="truncate font-medium">
            {selected ? selected.name : placeholder}
          </div>

          {selected && (
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-sm font-semibold',
                getQtyBadgeClass(selected)
              )}
            >
              {getBadgeText(selected)}
            </span>
          )}
        </div>

        <svg
          className={clsx(
            'ml-2 h-5 w-5 shrink-0 transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0'
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow focus:outline-none"
        >
          {!selected && (
            <li
              className="cursor-pointer rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
              onClick={() => {
                handleStoreChange('');
                setOpen(false);
              }}
            >
              {placeholder}
            </li>
          )}

          {options.map((o, idx) => {
            const isActive = o.id === selectedId;
            const isHighlighted = idx === highlight;
            return (
              <li
                key={o.id}
                role="option"
                aria-selected={isActive}
                className={clsx(
                  'flex cursor-pointer items-center justify-between gap-3 rounded px-3 py-2',
                  isHighlighted && 'bg-gray-50',
                  isActive && 'bg-gray-100'
                )}
                onMouseEnter={() => setHighlight(idx)}
                onMouseLeave={() => setHighlight(-1)}
                onClick={() => {
                  handleStoreChange(o.id);
                  setOpen(false);
                }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-dark-gray">
                    {o.name}
                  </div>
                </div>
                <span
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-semibold',
                    getQtyBadgeClass(o)
                  )}
                >
                  {getBadgeText(o)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* {selected && (
        <div className="mt-2 flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <div className="text-sm font-medium text-dark-gray">
              {selected.name}
            </div>
          </div>
          <span
            className={clsx(
              'rounded-full px-3 py-1 text-sm font-semibold',
              qtyBadgeClass
            )}
          >
            {badgeText(selected)}
          </span>
        </div>
      )} */}
    </div>
  );
};
export default StockBalanceView;
