import clsx from 'clsx';
import Link from 'components/Link';
import PrimaryNavigationProvider from 'contexts/primaryNavigationContext';
import { translate } from 'hooks/useTranslations';
import { Block } from 'models/block';
import Image from 'next/image';
import { getAbsoluteImageUrl } from 'services/imageService';
import { get as getWebsite } from 'services/websiteService.server';
import Profile from '../Profile';
import MiniCart from '../cart/MiniCart';
import { HoverableNavigation, SlideNavigation } from '../navigation/Navigation';
import QuickSearch from '../quickSearch/QuickSearch';

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
  return (
    <header
      className={clsx(
        'z-20 h-20 bg-primary print:hidden',
        '[&:has(nav[role="navigation"]):hover]:sticky [&:has(nav[role="navigation"]):hover]:top-0',
        sticky && 'sticky top-0'
      )}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-5">
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
              height={60}
              width={244}
            />
          </Link>
        )}
        <PrimaryNavigationProvider>
          {showNavigation && (
            <div className="flex touchable:hidden">
              <HoverableNavigation blocks={blocks} />
            </div>
          )}
          {showNavigation && (
            <div className="flex p-2 pr-0">
              <div className="touchable:hidden">
                <Profile myPagesPageUrl={website.myPagesPageUrl} />
              </div>
              <div className="relative mx-2 flex items-center">
                <QuickSearch
                  searchResultPageUrl={website.searchResultPageUrl}
                />
              </div>
              <div className="mx-2">
                <MiniCart checkoutPageUrl={website.checkoutPageUrl} />
              </div>
              <div className="mx-2 mr-0 hidden touchable:block">
                <SlideNavigation blocks={blocks} />
              </div>
            </div>
          )}
        </PrimaryNavigationProvider>
      </div>
    </header>
  );
};

export default Header;
