'use client';
import { useContext, useEffect } from 'react';
import { FavouriteContext } from './FavouriteContext';

/**
 * Exposes favourite functions to window object for HelloRetail integration
 */
export default function HelloRetailFavourites() {
  const favouriteContext = useContext(FavouriteContext);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose current favourites state
      (window as any).getCurrentFavourites = (): any => {
        return favouriteContext.favourites;
      };

      // Expose toggle favourite function
      (window as any).toggleFavourite = (
        articleNumber: string
      ): { success: boolean; favourites?: any; error?: string } => {
        try {
          if (!articleNumber || typeof articleNumber !== 'string') {
            return {
              success: false,
              error: 'Invalid article number.',
            };
          }

          favouriteContext.toggleFavourite(articleNumber);

          return {
            success: true,
            favourites: favouriteContext.favourites,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          };
        }
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).toggleFavourite;
        delete (window as any).getCurrentFavourites;
      }
    };
  }, [favouriteContext]);

  return null;
}

