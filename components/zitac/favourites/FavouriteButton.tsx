import clsx from 'clsx';
import React, { useContext } from 'react';
import Heart from '../../icons/zitac/heart';
import { FavouriteContext } from './FavouriteContext';

interface FavouriteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  articleNumber: string;
  iconSize?: string;
}

/**
 * FavouriteButton – fungerar som en knapp men med ett hjärta istället för vanlig text.
 */
const FavouriteButton = React.forwardRef<
  HTMLButtonElement,
  FavouriteButtonProps
>(
  (
    {
      className = '',
      articleNumber,
      iconSize = 'size-7',
      ...props
    },
    ref
  ) => {
    const { isFavourite, toggleFavourite } = useContext(FavouriteContext);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation(); // Prevent unwanted parent click events
      toggleFavourite(articleNumber);
    };

    return (
      <button
        type="button"
        className={clsx(
          'cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-110',
          className
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <Heart
          className={`${iconSize} ${isFavourite(articleNumber) ? 'fill-dark-green' : 'fill-none'} stroke-dark-green`}
        />
      </button>
    );
  }
);

FavouriteButton.displayName = 'FavouriteButton';

export default FavouriteButton;
