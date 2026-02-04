import { gql } from '@apollo/client';
import { PRODUCTS_BLOCK_FRAGMENT } from './product';
import { ZS_BANNER_BLOCK_FRAGMENT } from './zsBanner';
import { ZS_FAQ_BLOCK_FRAGMENT } from './zsFaq';
import { ZS_HELLORETAIL_RECOMMENDATIONS_BLOCK_FRAGMENT } from './zsHelloRetailRecommendations';
import { ZS_HTML_BLOCK_FRAGMENT } from './zsHtml';
import { ZS_IMAGE_BLOCK_FRAGMENT } from './zsImage';
import { ZS_JOTFORM_BLOCK_FRAGMENT } from './zsJotform';
import { ZS_LAYOUT_FOURCOLUMNS_BLOCK_FRAGMENT } from './zsLayoutFourColumns';
import { ZS_LAYOUT_FULLWIDTH_BLOCK_FRAGMENT } from './zsLayoutFullWidth';
import { ZS_LAYOUT_THREECOLUMNS_BLOCK_FRAGMENT } from './zsLayoutThreeColumns';
import { ZS_LAYOUT_TWOCOLUMNS_BLOCK_FRAGMENT } from './zsLayoutTwoColumns';
import { ZS_STOREINFORMATION_BLOCK_FRAGMENT } from './zsStoreInformation';
import { ZS_TEXTEDITOR_BLOCK_FRAGMENT } from './zsTexteditor';
import { ZS_TOPBAR_BLOCK_FRAGMENT } from './zsTopbar';
import { ZS_TOPMENU_BLOCK_FRAGMENT } from './zsTopMenu';


export const ALL_BLOCK_TYPES_FRAGMENT = gql`
  fragment AllBlockTypes on IBlock {
    __typename
    ... on IBlockItem {
      systemId
    }

    ...BannerBlock
    ...ProductsBlock
    ...ZsHTMLBlock
    ...ZsImageBlock
    ...ZsTextEditorBlock
    ...ZsFAQBlock
    ...ZsLayoutFullWidthBlock
    ...ZsLayoutTwoColumnsBlock
    ...ZsLayoutThreeColumnsBlock
    ...ZsLayoutFourColumnsBlock
    ...ZsBannerBlock
    ...ZsTopBarBlock
    ...ZsTopMenuBlock
    ...ZsStoreInformationBlock
    ...ZsHelloRetailRecommendationsBlock
    ...ZsJotformBlock
  }

  ${PRODUCTS_BLOCK_FRAGMENT}
  ${ZS_HTML_BLOCK_FRAGMENT}
  ${ZS_IMAGE_BLOCK_FRAGMENT}
  ${ZS_TEXTEDITOR_BLOCK_FRAGMENT}
  ${ZS_FAQ_BLOCK_FRAGMENT}
  ${ZS_LAYOUT_FULLWIDTH_BLOCK_FRAGMENT}
  ${ZS_LAYOUT_TWOCOLUMNS_BLOCK_FRAGMENT}
  ${ZS_LAYOUT_THREECOLUMNS_BLOCK_FRAGMENT}
  ${ZS_LAYOUT_FOURCOLUMNS_BLOCK_FRAGMENT}
  ${ZS_BANNER_BLOCK_FRAGMENT}
  ${ZS_TOPBAR_BLOCK_FRAGMENT}
  ${ZS_TOPMENU_BLOCK_FRAGMENT}
  ${ZS_STOREINFORMATION_BLOCK_FRAGMENT}
  ${ZS_HELLORETAIL_RECOMMENDATIONS_BLOCK_FRAGMENT}
  ${ZS_JOTFORM_BLOCK_FRAGMENT}
`;
