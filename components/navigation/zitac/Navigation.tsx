import { Block } from 'models/block';
import { Fragment } from 'react';
import PrimaryNavigationLinkBlock from '../../blocks/PrimaryNavigationLinkBlock';
import SecondaryNavigationLinkBlock from '../../blocks/SecondaryNavigationLinkBlock';
import HoverableNavigationBackdrop from '../zitac/HoverableNavigationBackdrop';
import SidebarMenu from '../zitac/SidebarMenu';
import {
  NavigationCloseButton,
  NavigationMenuButton,
} from './NavigationButton';

/**
 * Renders a hoverable navigation, which is visible in desktops.
 * @param blocks primary navigation's blocks.
 * @returns
 */
export function HoverableNavigation({ blocks }: { blocks: Block[] }) {
  const primaryNavigationLink = blocks.filter(
    (block) => block.__typename === 'PrimaryNavigationLinkBlock'
  );
  return (
    <Fragment>
      <nav className="peer z-20 max-w-full pl-3" aria-label="Navigation">
        <ul
          role="menu"
          className="hoverable-navigation flex max-w-full list-none flex-nowrap items-center gap-2 overflow-x-auto py-6 text-sm lg:gap-4"
          data-testid="hoverable-navigation"
        >
          {primaryNavigationLink?.map((block: any) => (
            <PrimaryNavigationLinkBlock
              {...block}
              desktop
              key={`${block.systemId}-desktop`}
            />
          ))}
        </ul>
      </nav>
      {/* Backdrop */}
      <HoverableNavigationBackdrop></HoverableNavigationBackdrop>
    </Fragment>
  );
}

/**
 * Renders a slide navigation, which is visible in mobiles.
 * @param blocks primary navigation's blocks.
 * @returns
 */
export function SlideNavigation({ blocks }: { blocks: Block[] }) {
  const primaryNavigationLink = blocks.filter(
    (block) => block.__typename === 'PrimaryNavigationLinkBlock'
  );
  const secondaryNavigationLink = blocks.filter(
    (block) => block.__typename === 'SecondaryNavigationLinkBlock'
  );
  return (
    <Fragment>
      <NavigationMenuButton />
      <SidebarMenu className="bg-body-background">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <></>
          <span className="text-2xl font-semibold">Meny</span>
          <NavigationCloseButton />
        </div>
        <div className="h-full list-none items-center overflow-y-auto">
          <ul
            role="menu"
            data-testid="slide-navigation__primary-navigation-link"
          >
            {primaryNavigationLink?.map((block: any) => (
              <PrimaryNavigationLinkBlock {...block} key={block.systemId} />
            ))}
          </ul>
          <ul
            className="mt-10"
            data-testid="slide-navigation__secondary-navigation-link"
          >
            {secondaryNavigationLink?.map((block: any) => (
              <SecondaryNavigationLinkBlock {...block} key={block.systemId} />
            ))}
          </ul>
        </div>
      </SidebarMenu>
    </Fragment>
  );
}
