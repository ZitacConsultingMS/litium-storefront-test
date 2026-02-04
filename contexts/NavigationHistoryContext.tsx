'use client';
import { SearchParams } from 'models/searchParams';
import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';

type NavigationHistoryType = {
  history: string[];
  setHistory: (history: string[]) => void;
};

export const NavigationHistoryContext = createContext<NavigationHistoryType>({
  history: [],
  setHistory: (_) => {},
});

/**
 * Represents a context provider which holds navigation history.
 */
export default function NavigationHistoryContextProvider({
  value,
  children,
}: {
  value?: string[];
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<string[]>(value ?? []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const url = `${pathname}${SearchParams.fromReadonlyURLSearchParams(searchParams)}`;
    setHistory((history) => [...history, url]);
  }, [pathname, searchParams]);
  return (
    <NavigationHistoryContext.Provider value={{ history, setHistory }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}
