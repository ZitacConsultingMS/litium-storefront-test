import clsx from 'clsx';
import Link from 'components/Link';
import Favourites from 'components/zitac/favourites/Favourites';
import StoreSelector from 'components/zitac/StoreSelector';
import PrimaryNavigationProvider from 'contexts/primaryNavigationContext';
import { translate } from 'hooks/useTranslations';
import { Block } from 'models/block';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { getAbsoluteImageUrl } from 'services/imageService';
import { get as getCurrentUser } from 'services/userService.server';
import { get as getWebsite } from 'services/websiteService.server';
import 'styles/zitac/header.scss';
import { Token } from 'utils/constants';
import MiniCart from '../../cart/zitac/MiniCart';
import {
  HoverableNavigation,
  SlideNavigation,
} from '../../navigation/zitac/Navigation';
import QuickSearch from '../../quickSearch/zitac/QuickSearch';
import Profile from '../../zitac/Profile';

const Header = async ({
  blocks,
  sticky = true,
  showLogo = true,
  showNavigation = true,
}: {
  blocks: Block[];
  sticky?: boolean;
  showLogo?: boolean;
  showNavigation?: boolean;
}) => {
  const website = await getWebsite();
  const isB2B = website.zsThemeID === 'af';
  let isLogged = false;
  let customerId: string | undefined;
  let customerName: string | undefined;

  // Only try to get user if there's a token
  const cookieStore = await cookies();
  const token = cookieStore.get(Token.Name)?.value;

  if (token) {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser?.person) {
        isLogged = true;
        // Use customerNumber if available
        customerId = currentUser.person.customerNumber;
        if (customerId) {
          customerId = customerId.replace('PERS', '');
        }

        const firstName = currentUser.person.fields?._firstName;
        //const lastName = currentUser.person.fields?._lastName;
        customerName = firstName;
      }
    } catch {
      isLogged = false;
    }
  }

  return (
    <>
      <header
        className={clsx(
          'relative z-20 bg-body-background',
          '[&:has(nav[role="navigation"]):hover]:sticky [&:has(nav[role="navigation"]):hover]:top-0',
          sticky && 'sticky top-0'
        )}
      >
        <div className="mx-5 md:container md:mx-auto xl:px-5">
          <div
            className={clsx(
              'navbar flex items-end gap-2 pt-2 sm:pt-5',
              'xl:border-b',
              !showNavigation && 'border-b'
            )}
          >
            <div className="nav-row z-30 my-auto flex-shrink-0 pb-3 lg:pb-4">
              {showLogo && website.logoTypeMain && (
                <Link
                  href={website.homePageUrl || '/'}
                  aria-label={translate('commons.gotohomepage', website.texts)}
                >
                  <Image
                    src={getAbsoluteImageUrl(
                      website.logoTypeMain,
                      website.imageServerUrl
                    )}
                    alt="Litium Accelerator"
                    height={173}
                    width={173}
                    className="w-[50px] sm:w-[70px] xl:w-[120px]"
                  />
                </Link>
              )}
            </div>
            <div className="nav-row min-w-0 flex-1">
              <PrimaryNavigationProvider>
                {showNavigation && (
                  <div className="search-bar relative ml-3 flex items-center justify-end border-b border-border px-0 py-4 xl:justify-between">
                    <div className="hidden flex-1 xl:block">
                      <QuickSearch
                        searchResultPageUrl={website.searchResultPageUrl}
                        zsThemeID={website.zsThemeID}
                      />
                    </div>
                    <div className="mx-2 flex flex-shrink-0 justify-end lg:items-center">
                      <div>
                        {isLogged && isB2B ? (
                          <div className="rounded-md bg-medium-gray p-2 py-1 text-dark-gray md:px-3 md:py-2">
                            <p className="hidden text-sm uppercase md:block">
                              {customerName}
                              {customerName && customerId && (
                                <span className="px-1.5">/</span>
                              )}
                              {customerId}
                            </p>
                          </div>
                        ) : (
                          <StoreSelector />
                        )}
                      </div>
                      <div className="mx-2">
                        <Favourites checkoutPageUrl={website.checkoutPageUrl} />
                      </div>
                      <div className="relative">
                        {isLogged && !isB2B && (
                          <span className="absolute right-[1px] top-[15px] block h-2.5 w-2.5 rounded-xl bg-light-green"></span>
                        )}
                        <Profile myPagesPageUrl={website.myPagesPageUrl} />
                      </div>
                      <div className="mx-2">
                        <MiniCart checkoutPageUrl={website.checkoutPageUrl} />
                      </div>
                      <div className="block h-6 w-6 cursor-pointer xl:hidden">
                        <SlideNavigation blocks={blocks} />
                      </div>
                    </div>
                  </div>
                )}
                {showNavigation && (
                  <div className="menu-bar hidden xl:flex">
                    <HoverableNavigation blocks={blocks} />
                  </div>
                )}
              </PrimaryNavigationProvider>
            </div>
          </div>
        </div>
      </header>
      {showNavigation && (
        <div className="mx-5 block border-b border-border pb-3 pt-2 md:container md:mx-auto md:px-5 xl:hidden">
          <QuickSearch
            searchResultPageUrl={website.searchResultPageUrl}
            zsThemeID={website.zsThemeID}
          />
        </div>
      )}
    </>
  );
};

export default Header;
