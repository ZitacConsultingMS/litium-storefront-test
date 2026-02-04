'use client';
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
} from '@vis.gl/react-google-maps';
import { Button } from 'components/elements/zitac/Button';
import { useTranslations } from 'hooks/useTranslations';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function MapComponent({
  apiKey,
  stores,
}: {
  apiKey: string;
  stores: any[];
}) {
  const t = useTranslations();
  const mapRef = useRef<any>(null);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSelected(e.detail);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: e.detail.lat, lng: e.detail.lng });
      }
    };
    window.addEventListener('select-store', handler as EventListener);
    return () => {
      window.removeEventListener('select-store', handler as EventListener);
    };
  }, []);
  return (
    <>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '400px' }}
          className="h-[400px] sm:h-[500px] lg:h-[700px]"
          defaultCenter={{ lat: 63, lng: 17 }}
          defaultZoom={5}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          clickableIcons={true}
        >
          {stores.map((store: any) => (
            <Marker
              key={store.storeId}
              position={{
                lat: store.location.lat,
                lng: store.location.lon,
              }}
              title={store.locationDescriptor}
              onClick={() =>
                setSelected({
                  lat: store.location.lat,
                  lng: store.location.lon,
                  name: store.locationDescriptor,
                  street: store.address.street,
                  zip: store.address.zip,
                  city: store.address.city,
                  id: store.storeId,
                })
              }
            />
          ))}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
              className="p-2"
            >
              <div className="min-w-[200px] sm:min-w-[250px]">
                <p className="text-lg font-medium sm:text-xl">
                  {selected.name}
                </p>
                <p className="text-sm text-gray-600 sm:text-base">
                  {selected.street}
                </p>
                <span className="mb-4 flex gap-1 text-sm text-gray-600 sm:text-base">
                  <p>{selected.zip}</p>
                  <p>{selected.city}</p>
                </span>
                <Link href={`/butiker/${selected.id}`}>
                  <Button className="w-full touch-manipulation p-3 text-sm sm:text-base">
                    {t('zs.StoreListSearchInfoWindow')}
                  </Button>
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </>
  );
}
