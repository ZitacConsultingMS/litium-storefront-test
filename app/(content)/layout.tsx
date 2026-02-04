import CartRefreshHandler from 'components/CartRefreshHandler';
import AuthRefreshHandler from 'components/zitac/AuthRefreshHandler';
import HelloRetailAddToCart from 'components/zitac/HelloRetailAddToCart';
import HelloRetailCartTracker from 'components/zitac/HelloRetailCartTracker';
import HelloRetailUserInit from 'components/zitac/HelloRetailUserInit';
import FavouriteContextProvider from 'components/zitac/favourites/FavouriteContext';
import HelloRetailFavourites from 'components/zitac/favourites/HelloRetailFavourites';
import NavigationHistoryContextProvider from 'contexts/NavigationHistoryContext';
import CartContextProvider from 'contexts/cartContext';
import WebsiteContextProvider from 'contexts/websiteContext';
import { get as getCart } from 'services/cartService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { getIsB2B } from 'utils/isB2B';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const website = await getWebsite();
  const isB2B = getIsB2B(website);
  const cart = await getCart();

  return (
    <CartContextProvider value={cart}>
      <FavouriteContextProvider>
        <WebsiteContextProvider value={website}>
          <NavigationHistoryContextProvider>
            {!isB2B && (
              <>
                <HelloRetailUserInit />
                <HelloRetailAddToCart />
                <HelloRetailFavourites />
                <HelloRetailCartTracker />
              </>
            )}
            <CartRefreshHandler />
            <AuthRefreshHandler />
            {children}
          </NavigationHistoryContextProvider>
        </WebsiteContextProvider>
      </FavouriteContextProvider>
    </CartContextProvider>
  );
}
