'use client';
import { Website } from 'models/website';
import { createContext, useState } from 'react';

export const EmptyWebsite: Website = {
  homePageUrl: '',
  myPagesPageUrl: '',
  searchResultPageUrl: '',
  checkoutPageUrl: '',
  receiptPageUrl: '',
  countries: [],
  filters: [],
  imageServerUrl: '',
  notFoundPageUrl: '',
  generalErrorPageUrl: '',
  loginPageUrl: '',
  orderPageUrl: '',
  culture: {
    code: 'sv-SE',
  },
  texts: [],
  logoTypeMain: {
    url: '',
    dimension: {},
  },
  analytics: {
    googleTagManager: '',
  },
  languageCode: 'sv',
};

export const WebsiteContext = createContext<Website>(EmptyWebsite);

export default function WebsiteContextProvider({
  value,
  children,
}: {
  value: Website;
  children: React.ReactNode;
}) {
  const [website, setWebsite] = useState<Website>(value);
  return (
    <WebsiteContext.Provider value={website}>
      {children}
    </WebsiteContext.Provider>
  );
}
