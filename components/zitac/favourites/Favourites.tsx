'use client';
import { Text } from 'components/elements/Text';
import Heart from 'components/icons/zitac/heart';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useCallback, useContext, useState } from 'react';
import SidebarMiniCart from '../SidebarMiniCart';
import { FavouriteContext } from './FavouriteContext';
import FavouritesContent from './FavouritesContent';

/**
 * Renders a mini cart's information.
 */
function Favourites({ checkoutPageUrl }: { checkoutPageUrl: string }) {
  const [showFavourites, setShowFavourites] = useState(false);
  const onClose = useCallback(() => setShowFavourites(false), []);
  const { favourites } = useContext(FavouriteContext); //

  const t = useTranslations();

  return (
    <Fragment>
      {/* Hjärtikon som öppnar favoriter */}
      <div className="relative" onClick={() => setShowFavourites(true)}>
        <Heart
          data-testid="mini-favourites__heart"
          className={'size-6 fill-none stroke-black'}
        />
        {favourites.length > 0 ? <Badge count={favourites.length} /> : ''}
      </div>

      {/* Sidebar med favoriter */}
      <SidebarMiniCart
        visible={showFavourites}
        onClose={onClose}
        className="z-40 !mt-0 flex h-full flex-col overflow-auto bg-body-background sm:w-[400px]"
        data-testid="mini-favourites__sidebar"
        fullscreen={false}
        blockScroll={true}
      >
        {/* Header */}
        <div className="mt-10 text-center">
          <Text inline={true} className="text-lg sm:text-2xl">
            {t('favourites.title')}
          </Text>
        </div>

        {/* Body */}
        <div className="my-5 flex-1">
          <FavouritesContent favourites={favourites} onClose={onClose} />
        </div>
      </SidebarMiniCart>
    </Fragment>
  );
}

/**
 * Badge som visar antalet favoriter.
 */
const Badge = ({ count }: { count: number }) => (
  <Text
    inline={true}
    className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-secondary"
    data-testid="mini-favourites__count"
  >
    {count}
  </Text>
);

export default Favourites;
