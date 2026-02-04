'use client';
import { Text } from 'components/elements/Text';
import { Fragment } from 'react';
import FavouriteLineItem from './FavouriteLineItem';

/**
 * Renders cart's content.
 * @param showDiscountCode a flag to show/hide cart discount code
 * @param showShippingFee a flag to show/hide shipping fee
 * @param showPaymentFee a flag to show/hide payment fee
 * @param rows a list of order row
 * @param totalDiscounts a total discounts
 * @param updatable a flag to indicate that the item count can be updated
 * @param onClose an event occurs when clicking the keep shopping button
 */
function FavouritesContent({
  favourites = [],
  onClose = () => {},
}: {
  favourites: string[]; // Array of articleNumbers
  onClose?: () => void;
}) {
  return (
    <Fragment>
      {favourites.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-y-8">
          <Text>Inga favoriter ännu</Text>
        </div>
      ) : (
        favourites.map((articleNumber) => (
          <FavouriteLineItem key={articleNumber} articleNumber={articleNumber} />
        ))
      )}
    </Fragment>
  );
}

export default FavouritesContent;
