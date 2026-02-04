'use client';
import { Fragment } from 'react';
import FavouriteButton from './FavouriteButton';

interface AddFavouriteButtonProps {
  label: string;
  className?: string;
  articleNumber: string;
  iconSize?: string;
}

/**
 * AddFavouriteButton – hanterar att lägga till en produkt i favoriter utan animation.
 */
const AddFavouriteButton = ({
  label = '',
  className = '',
  iconSize = 'size-8',
  ...props
}: AddFavouriteButtonProps) => {
  return (
    <Fragment>
      <FavouriteButton
        iconSize={iconSize}
        className={className}
        data-testid="favourite-button"
        {...props}
      />
    </Fragment>
  );
};

export default AddFavouriteButton;
