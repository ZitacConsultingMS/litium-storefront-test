'use client';
import { createContext, useEffect, useState } from 'react';

type FavouriteContextType = {
  favourites: string[];
  toggleFavourite: (articleNumber: string) => void;
  isFavourite: (articleNumber: string) => boolean;
};

export const FavouriteContext = createContext<FavouriteContextType>({
  favourites: [],
  toggleFavourite: () => {},
  isFavourite: () => false,
});

export default function FavouriteContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hämta från localStorage vid första render
  useEffect(() => {
    try {
      const storedFavourites = localStorage.getItem('favourites');
      if (storedFavourites) {
        const parsed = JSON.parse(storedFavourites);
        // Handle migration from old format (array of objects) to new format (array of strings)
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'object' && parsed[0].articleNumber) {
            // Old format: migrate to new format
            setFavourites(parsed.map((fav: any) => fav.articleNumber));
          } else {
            // New format: array of strings
            setFavourites(parsed);
          }
        } else if (Array.isArray(parsed)) {
          // Empty array - new format
          setFavourites(parsed);
        }
      }
    } catch (error) {
      console.error('Kunde inte läsa från localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Spara till localStorage när favourites uppdateras
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites, isLoading]);

  const toggleFavourite = (articleNumber: string) => {
    setFavourites((prevFavourites) => {
      const isAlreadyFavourite = prevFavourites.includes(articleNumber);

      if (isAlreadyFavourite) {
        return prevFavourites.filter((fav) => fav !== articleNumber);
      } else {
        return [...prevFavourites, articleNumber];
      }
    });
  };

  const isFavourite = (articleNumber: string) => {
    return favourites.includes(articleNumber);
  };

  // Visa inget innan localStorage har laddats
  if (isLoading) return null;

  return (
    <FavouriteContext.Provider
      value={{ favourites, toggleFavourite, isFavourite }}
    >
      {children}
    </FavouriteContext.Provider>
  );
}
