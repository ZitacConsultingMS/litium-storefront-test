'use client';
import { Text } from 'components/elements/Text';
import MapPin from 'components/icons/zitac/map-pin';
import { useStoreSelection } from 'hooks/useStoreSelection';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getStockBalance } from 'services/zitac/stockbalanceService';
import SidebarMiniCart from './SidebarMiniCart';

function StoreSelector() {
  const [stores, setStores] = useState<any[]>([]);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Use store selection hook for selectedStore state
  const { selectedStore } = useStoreSelection();

  const onClose = useCallback(
    () => setShowStoreSelector(false),
    [setShowStoreSelector]
  );

  // Filter stores based on search
  const filteredStores = stores.filter((store) => {
    const target = store.name.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Use articleId=1 to get all available stores
        const data = await getStockBalance(1);
        const sortedStores = data.sort((a, b) =>
          a.name.localeCompare(b.name, 'sv-SE')
        );
        setStores(sortedStores);
      } catch (error) {
        console.error('Failed to fetch stores from API:', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreSelect = (store: any) => {
    const storeData = {
      id: store.id,
      name: store.name,
    };
    localStorage.setItem('selectedStore', JSON.stringify(storeData));

    window.dispatchEvent(
      new CustomEvent('storeSelectionChanged', {
        detail: { selectedStore: storeData },
      })
    );

    onClose();
  };

  return (
    <>
      <div className="relative" onClick={() => setShowStoreSelector(true)}>
        <button className="flex gap-1 rounded-md bg-medium-gray p-2 py-1 text-dark-gray transition-colors hover:opacity-80 md:px-3 md:py-2">
          <MapPin />
          <p className="hidden text-sm md:block">
            {selectedStore ? selectedStore.name : 'Välj butik'}
          </p>
        </button>
      </div>

      <SidebarMiniCart
        visible={showStoreSelector}
        onClose={onClose}
        className="z-40 !mt-0 flex h-full flex-col overflow-auto bg-body-background sm:w-[400px]"
        data-testid="store-selector__sidebar"
        fullscreen={false}
        blockScroll={true}
      >
        <div className="mb-4 mt-10 text-center">
          <Text inline={true} className="text-lg sm:text-2xl">
            Välj butik
          </Text>
        </div>

        {/* Show on Map Link */}
        <div className="mb-4">
          <Link
            href="/butiker"
            className="af:text-af-orange flex items-center justify-end gap-1 text-sm italic text-seasea-blue decoration-1 underline-offset-4 transition-colors hover:underline hover:opacity-90"
            onClick={onClose}
          >
            <span>Visa på karta</span>
            <MapPin className="h-4 w-4" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Sök butik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="af:focus:ring-af-orange w-full touch-manipulation rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-seasea-blue"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500">
              <p>Laddar butiker...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Kunde inte hämta butiksinformation</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Inga butiker hittades</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store)}
                  className={`w-full touch-manipulation rounded-md border p-3 text-left transition-colors hover:bg-gray-50 ${
                    selectedStore?.id === store.id
                      ? 'af:border-af-orange af:text-af-orange border-seasea-blue bg-gray-100 text-seasea-blue hover:opacity-80'
                      : 'border-gray-200 text-dark-gray hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg">{store.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SidebarMiniCart>
    </>
  );
}

export default StoreSelector;
