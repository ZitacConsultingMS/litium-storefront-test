import { Heading3 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { Accordion, AccordionPanel } from 'components/zitac/Accordion';
import BrandLink from 'components/zitac/BrandLink';
import TrustpilotProduct from 'components/zitac/TrustpilotProduct';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useEffect, useState } from 'react';
import {
  BrandInfo,
  getBrandInfoFromImageUrl,
} from 'services/zitac/customBrandService';
import BrandLogotype from './BrandLogotype';
import CLPDisplay from './CLPDisplay';
import DocumentsList from './DocumentsList';
import GHSDisplay from './GHSDisplay';
import MediaDisplay from './MediaDisplay';
import SubstanceDisplay from './SubstanceDisplay';

interface ProductAccordionContentProps {
  fields?: {
    description?: string;
    technicalSpecifications?: string;
  };
  articleDetails?: {
    fields?: Record<string, unknown | null>;
    fieldsWithTextOptions?: {
      ghs_code?: Array<any>;
      clp_code?: Array<any>;
      substance?: Array<any>;
      brandImage?: Array<{
        imageUrl?: string;
        description?: string;
        longDescription?: string;
        linkUrl?: string;
      }>;
    };
  };
  documentFiles: Array<{ url?: string; filename?: string; alt?: string }>;
  mediaUrls?: Array<{
    url: string;
    title: string;
    description: string | null | undefined;
    linkUrl: string | null | undefined;
  }>;
  articleNumber: string;
  name: string;
  descriptionShort?: string | null;
  website: {
    imageServerUrl: string;
  };
  brandTitle?: string; // Brand title from BrandProductSearchResult
  hideReviews?: boolean;
}

export default function ProductAccordionContent({
  fields,
  articleDetails,
  documentFiles,
  mediaUrls,
  articleNumber,
  name,
  descriptionShort,
  website,
  brandTitle,
  hideReviews,
}: ProductAccordionContentProps) {
  const t = useTranslations();

  // brand information from REST API (same as BrandProductSearchResult)
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);

  useEffect(() => {
    const fetchBrandInfo = async () => {
      if (articleDetails?.fieldsWithTextOptions?.brandImage?.[0]?.imageUrl) {
        try {
          const brandData = await getBrandInfoFromImageUrl(
            articleDetails.fieldsWithTextOptions.brandImage[0].imageUrl,
            articleDetails.fieldsWithTextOptions.brandImage[0].description ||
              name,
            ''
          );
          setBrandInfo(brandData);
        } catch (error) {
          console.error('Failed to fetch brand info:', error);
        }
      }
    };

    fetchBrandInfo();
  }, [articleDetails, name]);

  // Helper function to check if any custom API data exists
  const hasCustomApiData = () => {
    const { fieldsWithTextOptions } = articleDetails || {};
    return (
      (fieldsWithTextOptions?.ghs_code &&
        fieldsWithTextOptions.ghs_code.length > 0) ||
      (fieldsWithTextOptions?.clp_code &&
        fieldsWithTextOptions.clp_code.length > 0) ||
      (fieldsWithTextOptions?.substance &&
        fieldsWithTextOptions.substance.length > 0)
    );
  };

  // Create an array of accordion panels and filter out falsy values
  const accordionPanels = [
    fields?.description && (
      <AccordionPanel key={1} header={t('zs.product.accordion.description')}>
        <Fragment>
          <Heading3 className="mb-4 text-2xl">
            {descriptionShort || name}
          </Heading3>
          <HtmlText
            className="texteditor-block mb-12 mt-6 min-w-full"
            innerHTML={fields.description}
            data-testid="text__editor"
          />
        </Fragment>
      </AccordionPanel>
    ),
    fields?.technicalSpecifications && (
      <AccordionPanel key={2} header={t('zs.product.accordion.technical')}>
        <HtmlText
          className="texteditor-block mb-12 mt-6 min-w-full"
          innerHTML={fields.technicalSpecifications}
          data-testid="text__editor"
        />
      </AccordionPanel>
    ),
    (() => {
      const hasContent =
        (articleDetails?.fieldsWithTextOptions?.ghs_code?.length || 0) > 0 ||
        (articleDetails?.fieldsWithTextOptions?.clp_code?.length || 0) > 0 ||
        (articleDetails?.fieldsWithTextOptions?.substance?.length || 0) > 0;

      return hasContent ? (
        <AccordionPanel key={3} header={t('zs.product.accordion.contains')}>
          <>
            {articleDetails?.fieldsWithTextOptions?.ghs_code &&
              articleDetails.fieldsWithTextOptions.ghs_code.length > 0 && (
                <GHSDisplay
                  ghsCodes={articleDetails.fieldsWithTextOptions.ghs_code}
                />
              )}
            {articleDetails?.fieldsWithTextOptions?.clp_code &&
              articleDetails.fieldsWithTextOptions.clp_code.length > 0 && (
                <CLPDisplay
                  clpCodes={articleDetails.fieldsWithTextOptions.clp_code}
                />
              )}
            {articleDetails?.fieldsWithTextOptions?.substance &&
              articleDetails.fieldsWithTextOptions.substance.length > 0 && (
                <SubstanceDisplay
                  substance={articleDetails.fieldsWithTextOptions.substance}
                />
              )}
          </>
        </AccordionPanel>
      ) : null;
    })(),
    articleDetails?.fieldsWithTextOptions?.brandImage &&
      articleDetails.fieldsWithTextOptions.brandImage.length > 0 && (
        <AccordionPanel key={4} header={t('zs.product.accordion.brand')}>
          <div className="mb-12 mt-6 min-w-full">
            <BrandLogotype
              articleNumber={articleNumber}
              className="mb-4 flex justify-start"
              size="large"
            />
            <div className="mb-4">
              <BrandLink
                linkUrl={
                  articleDetails.fieldsWithTextOptions.brandImage[0].linkUrl
                }
                className="text-lg font-semibold transition-opacity hover:opacity-80"
              >
                {brandInfo?.brandHeadLine ||
                  brandTitle ||
                  articleDetails.fieldsWithTextOptions.brandImage[0]
                    .description}
              </BrandLink>
            </div>
            {brandInfo?.brandDescription && (
              <HtmlText
                className="texteditor-block"
                innerHTML={brandInfo.brandDescription}
                data-testid="brand-description-html"
              />
            )}
          </div>
        </AccordionPanel>
      ),
    mediaUrls && mediaUrls.length > 0 && (
      <AccordionPanel
        key={5}
        header={t('zs.product.accordion.media') || 'Media'}
      >
        <MediaDisplay mediaUrls={mediaUrls} />
      </AccordionPanel>
    ),
    documentFiles.length > 0 && (
      <AccordionPanel key={6} header={t('zs.product.accordion.documents')}>
        <DocumentsList documents={documentFiles} />
      </AccordionPanel>
    ),
    !hideReviews && (
      <AccordionPanel key={7} header={t('zs.product.accordion.reviews')}>
        <TrustpilotProduct articleNumber={articleNumber} name={name} />
      </AccordionPanel>
    ),
  ].filter((panel): panel is React.ReactElement => Boolean(panel));

  return (
    <Accordion
      classCssHeader="[&>p]:text-h2 [&>p]:pl-5 [&>svg]:mr-5 -mx-5 lg:-mr-10 xl:ml-0 xl:-mr-5"
      classCssContent="-mx-5 px-5 lg:-mr-10 xl:ml-0 xl:-mr-5"
      classCssIcon="text-h2 h-5 w-5"
    >
      {accordionPanels}
    </Accordion>
  );
}
