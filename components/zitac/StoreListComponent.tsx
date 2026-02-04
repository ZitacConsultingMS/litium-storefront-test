'use client';
import { useTranslations } from 'hooks/useTranslations';
import { useState } from 'react';

export default function StoreListComponent({ stores }: { stores: any[] }) {
  const t = useTranslations();

  const [search, setSearch] = useState('');
  const filteredStores = stores.filter((store) => {
    const target =
      `${store.locationDescriptor} ${store.address?.street} ${store.address?.zip} ${store.address?.city}`.toLowerCase();
    return target.includes(search.toLowerCase());
  });

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('zs.StoreListSearch')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="af:focus:ring-af-orange w-full touch-manipulation rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-seasea-blue"
        />
      </div>

      <div className="max-h-[300px] space-y-2 overflow-y-scroll sm:max-h-[400px] lg:max-h-[700px]">
        {filteredStores.length > 0 ? (
          filteredStores.map((store: any) => (
            <div
              key={store.storeId}
              className="cursor-pointer touch-manipulation rounded-md border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('select-store', {
                    detail: {
                      lat: store.location.lat,
                      lng: store.location.lon,
                      name: store.locationDescriptor,
                      street: store.address.street,
                      zip: store.address.zip,
                      city: store.address.city,
                      id: store.storeId,
                    },
                  });
                  window.dispatchEvent(event);
                }
              }}
            >
              <p className="text-xl">{store.locationDescriptor}</p>
              <p className="text-gray-600">{store.address?.street}</p>
              <span className="flex gap-1 text-gray-600">
                <p>{store.address?.zip}</p>
                <p>{store.address?.city}</p>
              </span>
            </div>
          ))
        ) : (
          <p>{t('zs.StoreListSearchNone')}</p>
        )}
      </div>
    </>
  );
}
