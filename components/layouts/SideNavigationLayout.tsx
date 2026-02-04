import { signOutUser } from 'app/actions/users/signOutUser';
import clsx from 'clsx';
import Link from 'components/Link';
import TreeComponent from 'components/Tree';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import LogoutIcon from 'components/icons/logout';
import { translate } from 'hooks/useTranslations';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import { get } from 'services/websiteService.server';
import { Token } from 'utils/constants';
import Breadcrumb from '../Breadcrumb';
import { Heading2 } from '../elements/Heading';
import { Input } from '../elements/Input';
import GripLines from '../icons/grip-lines';
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
        'transition-all duration-200',
        'mobile:[&:has(input[name=toggleMobile]:checked)]:w-0 mobile:[&:has(input[name=toggleMobile]:checked)]:overflow-hidden',
        'md:[&:has(input[name=toggleTablet]:checked)]:px-0',
        'md:[&:has(input[name=toggleTablet]:checked)]:w-0',
        'md:[&:has(input[name=toggleTablet]:checked)]:overflow-hidden',
        'w-full md:w-72 md:px-4 print:hidden'
      )}
      data-testid="side-menu"
    >
      <div className="mb-9 flex items-center justify-between">
        <Link href={url}>
          <Heading2 className="my-0 text-sm" data-testid="side-menu__title">
            {name}
          </Heading2>
        </Link>
        <Input
          className="peer/mobile hidden"
          type="radio"
          name="toggleMobile"
          id="toggleAside"
          defaultChecked
        />
        <label
          className="block cursor-pointer whitespace-nowrap md:hidden"
          htmlFor="toggleAside"
          data-testid="side-menu__toggle-mobile"
        >
          <GripLines
            className="h-7 w-10 flex-shrink-0 rounded bg-hover"
            fill="#666666"
          />
        </label>
        <Input
          className="peer/tablet hidden"
          type="radio"
          name="toggleTablet"
          id="toggleAsideTablet"
        />
        <label
          className="hidden cursor-pointer whitespace-nowrap md:block md:peer-checked/tablet:hidden"
          htmlFor="toggleAsideTablet"
          data-testid="side-menu__toggle-tablet"
        >
          <GripLines
            className="h-7 w-10 flex-shrink-0 rounded bg-hover"
            fill="#666666"
          />
        </label>
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
      <TreeComponent
        defaultExpanded={expandedNodes}
        data={data}
        activeUrl={rootUrl}
      />
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
            <LogoutIcon />
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
            <Input
              className="peer/mobile hidden"
              type="radio"
              name="toggleMobile"
              id="toggleMyAccount"
            />
            <label
              className="cursor-pointer whitespace-nowrap md:mr-4 md:hidden mobile:peer-checked/mobile:hidden"
              htmlFor="toggleMyAccount"
              data-testid="article__toggle-mobile"
            >
              <GripLines
                className="h-7 w-10 flex-shrink-0 rounded bg-hover"
                fill="#666666"
              />
            </label>
            <Input
              className="peer/tablet hidden"
              type="radio"
              name="toggleTablet"
              id="toggleMyAccountTablet"
              defaultChecked
            />
            <label
              className="hidden cursor-pointer whitespace-nowrap peer-checked/tablet:hidden md:mr-4 md:block"
              htmlFor="toggleMyAccountTablet"
              data-testid="article__toggle-tablet"
            >
              <GripLines
                className="h-7 w-10 flex-shrink-0 rounded bg-hover"
                fill="#666666"
              />
            </label>
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
