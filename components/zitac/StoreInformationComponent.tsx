'use client';
import { LoadingFallback } from 'components/blocks/ZsLoadingFallback';
import Email from 'components/icons/zitac/email';
import Phone from 'components/icons/zitac/phone';
import { useTranslations } from 'hooks/useTranslations';
import { Suspense } from 'react';
import StoreMap from './StoreMap';
import StoreOpeningHours from './StoreOpeningHours';
import StoreSpecialOpeningHours from './StoreSpecialOpeningHours';

type Props = {
  store: any;
  googleMapsApiKey: string;
  name?: string;
};

function StoreInformationComponent({ store, googleMapsApiKey, name }: Props) {
  const t = useTranslations();

  const openHours = store?.openHours;
  const specialOpenHours = store?.specialOpenHours;
  const temporarilyClosedUntil = store?.temporarilyClosedUntil;
  const placeId = store?.network?.google?.placeId;

  const formatClosedUntilDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${day}/${month}, ${year}`;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1>{name}</h1>
        <p>{store?.longDescription}</p>
      </div>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-8">
          {temporarilyClosedUntil && (
            <div className="border-l-4 border-af-orange bg-[#FFF8E4] p-3 rounded-sm">
              <p className="font-medium">
                {t('zs.StoreInformationTemporarilyClosed')}
              </p>
              <p className="text-sm mt-1">
                {t('zs.StoreInformationReopensOn')} {formatClosedUntilDate(temporarilyClosedUntil)}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <h2>{t('zs.StoreInformationOpeningHours')}</h2>
            {openHours ? (
              <div className={temporarilyClosedUntil ? 'opacity-60' : ''}>
                <StoreOpeningHours openHours={openHours} />
              </div>
            ) : (
              <p>{t('zs.StoreInformationNoOpeningHours')}</p>
            )}
          </div>
          {specialOpenHours && (
            <div className="space-y-2">
              <h2>{t('zs.StoreInformationSpecialOpeningHours') || 'Särskilda öppettider'}</h2>
              <StoreSpecialOpeningHours specialOpenHours={specialOpenHours} />
            </div>
          )}
          <div>
            <h2>{t('zs.StoreInformationContactUs')}</h2>
            <p>{store?.name}</p>
            <p>{store?.address?.street}</p>
            <span className="flex gap-1">
              <p>{store?.address?.zip}</p>
              <p>{store?.address?.city}</p>
            </span>
            <div className="mt-3">
              {store?.contact?.email && (
                <span className="flex items-center gap-1">
                  <Email />
                  <p>{store?.contact?.email}</p>
                </span>
              )}
              {store?.contact?.phone && (
                <span className="flex items-center gap-1">
                  <Phone />
                  <p>{store?.contact?.phone}</p>
                </span>
              )}
            </div>
          </div>
        </div>
        {placeId && (
          <div className="mb-6 space-y-1">
            <h2>{t('zs.StoreInformationNavText')}</h2>
            <Suspense fallback={<LoadingFallback />}>
              <StoreMap apiKey={googleMapsApiKey} placeId={placeId} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreInformationComponent;
