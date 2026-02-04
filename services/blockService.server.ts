import BannerBlock from 'components/blocks/BannerBlock';
import FooterColumnBlock from 'components/blocks/FooterColumnBlock';
import NavigationLinksBlock from 'components/blocks/NavigationLinksBlock';
import PrimaryNavigationBannerBlock from 'components/blocks/PrimaryNavigationBannerBlock';
import PrimaryNavigationCategoriesBlock from 'components/blocks/PrimaryNavigationCategoriesBlock';
import PrimaryNavigationColumnBlock from 'components/blocks/PrimaryNavigationColumnBlock';
import PrimaryNavigationLinkBlock from 'components/blocks/PrimaryNavigationLinkBlock';
import ProductsAndBannerBlock from 'components/blocks/ProductsAndBannerBlock';
import ProductsBlock from 'components/blocks/ProductsBlock';
import React from 'react';
import 'server-only';

/**
 * Gets a Block component by its type.
 * @param typename Component's type name, for example: BannerBlock.
 * @returns a Block component.
 */
export function getComponent(
  typename: string
): (props: any) => React.JSX.Element | Promise<React.JSX.Element> {
  return Components[typename];
}

const Components: {
  [typename: string]: (
    props: any
  ) => React.JSX.Element | Promise<React.JSX.Element>;
} = {
  BannerBlock,
  FooterColumnBlock,
  NavigationLinksBlock,
  PrimaryNavigationBannerBlock,
  PrimaryNavigationColumnBlock,
  PrimaryNavigationCategoriesBlock,
  PrimaryNavigationLinkBlock,
  ProductsBlock,
  ProductsAndBannerBlock,
};
