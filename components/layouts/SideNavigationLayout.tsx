import { signOutUser } from 'app/actions/users/signOutUser';
import clsx from 'clsx';
import Link from 'components/Link';
import TreeComponent from 'components/Tree';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import { NavigationToggleButton } from 'components/navigation/NavigationToggleButton';
import { translate } from 'hooks/useTranslations';
import { LogOut } from 'lucide-react';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import { get } from 'services/websiteService.server';
import { Token } from 'utils/constants';
import Breadcrumb from '../Breadcrumb';
import { Heading2 } from '../elements/Heading';
/**
 * Represents a layout with side navigation on the left and main content.
 * Example:
 *  <SideNavigationLayout>
      <SideNavigation>
        <div>Content 1</div>
      </SideNavigation>
      <MainContent>
        <div>Content 2</div>
      </MainContent>
    </SideNavigationLayout>
 */

export const SideNavigationLayout = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <div className="container mx-auto flex px-5">{children}</div>;
};

const SideContent = ({
  name,
  url,
  children,
}: {
  name: string;
  url: string;
  children: React.ReactNode;
}) => {
  return (
    <aside
      className={clsx(
        'navigation-side-menu',
        'transition-all duration-200',
        'mobile:[&:has(input[name=toggleMobile]:checked)]:w-0',
        'mobile:[&:has(input[name=toggleMobile]:checked)]:overflow-hidden',
        'md:[&:has(input[name=toggleTablet]:checked)]:px-0',
        'md:[&:has(input[name=toggleTablet]:checked)]:w-0',
        'md:[&:has(input[name=toggleTablet]:checked)]:overflow-hidden',
        'w-full md:w-72 md:px-4 print:hidden'
      )}
      data-testid="side-menu"
      role="navigation"
    >
      <div className="mb-9 flex items-center justify-between">
        <Link href={url} data-testid="side-menu__title">
          <Heading2 className="my-0 text-sm">{name}</Heading2>
        </Link>
        <NavigationToggleButton
          id="toggleAside"
          name="toggleMobile"
          defaultChecked
          classNameInput="peer/mobile hidden"
          classNameLabel="block cursor-pointer whitespace-nowrap md:hidden"
          testId="side-menu__toggle-mobile"
          targetToggleButtonId="toggleMyAccount"
        />
        <NavigationToggleButton
          id="toggleAsideTablet"
          name="toggleTablet"
          classNameInput="peer/tablet hidden"
          classNameLabel="hidden cursor-pointer whitespace-nowrap md:block md:peer-checked/tablet:hidden"
          testId="side-menu__toggle-tablet"
          targetToggleButtonId="toggleMyAccountTablet"
        />
      </div>
      {children}
    </aside>
  );
};
export const SideNavigation = async ({
  name,
  url,
  parents,
  childrenPages,
  rootUrl,
  showLogoutButton = true,
}: {
  name: string;
  url: string;
  parents: PageItemsConnection;
  childrenPages: PageItemsConnection;
  rootUrl: string;
  showLogoutButton?: boolean;
}) => {
  const token = (await cookies()).get(Token.Name)?.value;
  const websites = await get();
  const expandedNodes = [
    ...parents.nodes.slice(2).map((item) => item.url),
    rootUrl,
  ];
  const data = childrenPages?.nodes?.filter(
    (item: any) => item.__typename !== 'MyAccountOrderPage'
  );

  return (
    <SideContent name={name} url={url}>
      <nav>
        <TreeComponent
          defaultExpanded={expandedNodes}
          data={data}
          activeUrl={rootUrl}
        />
      </nav>
      {token && showLogoutButton && (
        <form action={signOutUser}>
          <Button
            rounded={false}
            type="submit"
            title={translate('logout.title', websites.texts)}
            className="ml-[30px] mt-7 flex items-center gap-3 border-none bg-transparent p-0 text-sm text-primary hover:bg-transparent"
            data-testid="logout__button"
          >
            <Text inline={true} data-testid="logout__title">
              {translate('logout.title', websites.texts)}
            </Text>
            <LogOut />
          </Button>
        </form>
      )}
    </SideContent>
  );
};

export const MainContent = ({
  navigationButtonVisibility = true,
  breadcrumbs,
  children,
}: {
  navigationButtonVisibility?: boolean;
  breadcrumbs?: NavigationLink[];
  children: React.ReactNode;
}) => {
  return (
    <article
      className={clsx(
        'flex-1',
        'block mobile:[&:has(input[name=toggleMobile]:checked)]:hidden'
      )}
      data-testid="article"
    >
      <div
        className={clsx(
          'flex items-center print:hidden',
          navigationButtonVisibility &&
            'flex-row-reverse justify-between md:flex-row md:justify-normal'
        )}
        data-testid="article__toggle-container"
      >
        {navigationButtonVisibility && (
          <Fragment>
            <NavigationToggleButton
              id="toggleMyAccount"
              name="toggleMobile"
              classNameInput="peer/mobile hidden"
              classNameLabel="cursor-pointer whitespace-nowrap md:mr-4 md:hidden mobile:peer-checked/mobile:hidden"
              testId="article__toggle-mobile"
              targetToggleButtonId="toggleAside"
            />
            <NavigationToggleButton
              id="toggleMyAccountTablet"
              name="toggleTablet"
              defaultChecked
              classNameInput="peer/tablet hidden"
              classNameLabel="hidden cursor-pointer whitespace-nowrap peer-checked/tablet:hidden md:mr-4 md:block"
              testId="article__toggle-tablet"
              targetToggleButtonId="toggleAsideTablet"
            />
          </Fragment>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb
            className={clsx(
              '!mb-0',
              'peer-checked/tablet:flex peer-checked/tablet:h-7 peer-checked/tablet:items-center'
            )}
            breadcrumbs={breadcrumbs}
          ></Breadcrumb>
        )}
      </div>
      {children}
    </article>
  );
};
