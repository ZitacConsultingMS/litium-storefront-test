'use client';
import { Fragment, useContext } from 'react';
import FavouriteButton from './FavouriteButton';
import { FavouriteContext } from './FavouriteContext';

interface MiniFavouriteButtonProps {
  label?: string;
  className?: string;
  articleNumber: string;
  iconSize?: string;
}

const MiniFavouriteButton = ({
  iconSize = 'size-6',
  className = '',
  ...props
}: MiniFavouriteButtonProps) => {
  const { toggleFavourite } = useContext(FavouriteContext);

  return (
    <Fragment>
      <FavouriteButton
        iconSize={iconSize}
        className={`${className}`}
        data-testid="mini-favourite-button"
        {...props}
      />
    </Fragment>
  );
};

export default MiniFavouriteButton;
