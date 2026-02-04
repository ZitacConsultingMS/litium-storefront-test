
import BannerBlock from 'components/blocks/BannerBlock';
import BrandBlock from 'components/blocks/BrandBlock';
import FooterColumnBlock from 'components/blocks/FooterColumnBlock';
import NavigationLinksBlock from 'components/blocks/NavigationLinksBlock';
import PrimaryNavigationBannerBlock from 'components/blocks/PrimaryNavigationBannerBlock';
import PrimaryNavigationCategoriesBlock from 'components/blocks/PrimaryNavigationCategoriesBlock';
import PrimaryNavigationColumnBlock from 'components/blocks/PrimaryNavigationColumnBlock';
import PrimaryNavigationLinkBlock from 'components/blocks/PrimaryNavigationLinkBlock';
import ProductBlock from 'components/blocks/ProductBlock';
import ProductsAndBannerBlock from 'components/blocks/ProductsAndBannerBlock';
import ProductsBlock from 'components/blocks/ProductsBlock';
import SecondaryNavigationLinkBlock from 'components/blocks/SecondaryNavigationLinkBlock';
import SliderBlock from 'components/blocks/SliderBlock';
import VideoBlock from 'components/blocks/VideoBlock';
import ZsAFListBlock from 'components/blocks/ZsAFListBlock';
import ZsBannerBlock from 'components/blocks/ZsBannerBlock';
import ZsFAQBlock from 'components/blocks/ZsFAQBlock';
import ZsFooterNavigationLinksBlock from 'components/blocks/ZsFooterNavigationLinksBlock';
import ZsHTMLBlock from 'components/blocks/ZsHTMLBlock';
import ZsHelloRetailRecommendationsBlock from 'components/blocks/ZsHelloRetailRecommendationsBlock';
import ZsImageBlock from 'components/blocks/ZsImageBlock';
import ZsJotformBlock from 'components/blocks/ZsJotformBlock';
import ZsLayoutFourColumnsBlock from 'components/blocks/ZsLayoutFourColumnsBlock';
import ZsLayoutFullWidthBlock from 'components/blocks/ZsLayoutFullWidthBlock';
import ZsLayoutThreeColumnsBlock from 'components/blocks/ZsLayoutThreeColumnsBlock';
import ZsLayoutTwoColumnsBlock from 'components/blocks/ZsLayoutTwoColumnsBlock';
import ZsNewsletterBlock from 'components/blocks/ZsNewsletterBlock';
import ZsPrimaryNavigationLinkBlock from 'components/blocks/ZsPrimaryNavigationLinkBlock';
import ZsStoreInformationBlock from 'components/blocks/ZsStoreInformationBlock';
import ZsStoreListBlock from 'components/blocks/ZsStoreListBlock';
import ZsTextEditorBlock from 'components/blocks/ZsTextEditorBlock';
import ZsTopBarBlock from 'components/blocks/ZsTopBarBlock';
import ZsTopMenuBlock from 'components/blocks/ZsTopMenuBlock';

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
  [typename: string]: (props: any) => React.JSX.Element | Promise<React.JSX.Element>;
} = {
  BannerBlock,
  BrandBlock,
  FooterColumnBlock,
  NavigationLinksBlock,
  PrimaryNavigationBannerBlock,
  PrimaryNavigationCategoriesBlock,
  PrimaryNavigationColumnBlock,
  PrimaryNavigationLinkBlock,
  ProductBlock,
  ProductsAndBannerBlock,
  ProductsBlock,
  SecondaryNavigationLinkBlock,
  SliderBlock,
  VideoBlock,
  ZsAFListBlock,
  ZsBannerBlock,
  ZsFAQBlock,
  ZsFooterNavigationLinksBlock,
  ZsHTMLBlock,
  ZsHelloRetailRecommendationsBlock,
  ZsImageBlock,
  ZsJotformBlock,
  ZsLayoutFourColumnsBlock,
  ZsLayoutFullWidthBlock,
  ZsLayoutThreeColumnsBlock,
  ZsLayoutTwoColumnsBlock,
  ZsNewsletterBlock,
  ZsPrimaryNavigationLinkBlock,
  ZsStoreInformationBlock,
  ZsStoreListBlock,
  ZsTextEditorBlock,
  ZsTopBarBlock,
  ZsTopMenuBlock,
};
