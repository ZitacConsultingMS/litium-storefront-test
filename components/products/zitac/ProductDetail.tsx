'use client';
import Link from 'components/Link';
import StockStatus from 'components/StockStatus';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
import Check from 'components/icons/zitac/check';
import Truck from 'components/icons/zitac/truck';
import BrandLink from 'components/zitac/BrandLink';
import Breadcrumb from 'components/zitac/Breadcrumb';
import BuyButton from 'components/zitac/BuyButton';
import ImageGallery from 'components/zitac/ImageGallery';
import StockBalanceView from 'components/zitac/StockBalanceCustom';
import { WebsiteContext } from 'contexts/websiteContext';
import { useCustomArticleDetails } from 'hooks/useCustomArticleDetails';
import { useTranslations } from 'hooks/useTranslations';
import { ProductItem } from 'models/(zitac)/products';
import { NavigationLink } from 'models/navigation';
import Image from 'next/image';
import { Fragment, useContext, useState } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { buildServerUrl } from 'services/urlService';
import { getDescriptionShort } from 'utils/productFieldUtils';
import AddFavouriteButton from '../../zitac/favourites/AddFavouriteButton';
import VariantsDropDown from '../VariantsDropDown';
import BrandLogotype from './BrandLogotype';
import HelloRetailHorizontalProductList from './HelloRetailHorizontalProductList';
import HelloRetailVerticalProductList from './HelloRetailVerticalProductList';
import HorizontalProductList from './HorizontalProductList';
import PriorityPriceDisplay from './PriorityPriceDisplay';
import ProductDetailAccordions from './ProductDetailAccordions';
import ProductSpecifications from './ProductSpecifications';

interface ProductDetailProps extends ProductItem {
  showArticleNumber?: boolean;
  showDescription?: boolean;
  showAddToCartButton?: boolean;
  showPrice?: boolean;
  variants?: any;
  helloRetailProducts?: any[];
  helloRetailTitle?: string;
  helloRetailHorizontalRecoms?: { products: any[]; title?: string }[];
}

/**
 * Renders a product's information.
 * @param props a product object.
 */
function ProductDetail(props: ProductDetailProps) {
  const {
    name,
    fields,
    price,
    thumbnailImages,
    stockStatus,
    largeImages,
    smallImages,
    articleNumber,
    parent,
    rawData,
    relationships,
    fieldGroups,
    parents,
    variants: variantList,
    helloRetailProducts,
    helloRetailTitle,
    helloRetailHorizontalRecoms,
    __typename,
    memberPrice,
    campaignPrice,
  } = props;

  const breadcrumbName = `${name}`;
  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: breadcrumbName,
      selected: true,
      url: '',
    };
    return [...(parents?.nodes || []), currentPage];
  })();

  const t = useTranslations();
  const website = useContext(WebsiteContext);

  // const variants = rawData?.variants || [];
  // //const VariantList  = rawData;

  /* product tags / artikelmedaljer */
  const artikelmedaljer = fieldGroups?.find(
    (group) => group.fieldGroupId === 'Artikelmedaljer'
  );
  const productTags =
    ((artikelmedaljer?.fields?.[0] as any)
      ?.productTagsProductFieldValues as any[]) || [];

  /* helper function to render relationship lists */
  const renderRelationshipList = (
    relationshipKey: keyof typeof relationships
  ) => {
    const relationship = relationships?.[relationshipKey];
    if (relationship?.items?.nodes && relationship.items.nodes.length > 0) {
      return (
        <HorizontalProductList
          key={relationshipKey}
          items={relationship.items.nodes}
          title={relationship.name}
          className="mt-20 xl:px-5"
        />
      );
    }
    return null;
  };

  /* test custom article details, fetched trough custom api*/
  const {
    articleDetails,
    articleLoading,
    articleError,
    getPriceByPriorityWithKey,
    getLowestPrice,
  } = useCustomArticleDetails(articleNumber);

  // Helper function to get brand name from API data
  const getBrandNameFromApi = (): string | null => {
    if (
      !articleDetails?.fieldsWithTextOptions?.brandImage ||
      articleDetails.fieldsWithTextOptions.brandImage.length === 0
    ) {
      return null;
    }

    const brandImage = articleDetails.fieldsWithTextOptions.brandImage[0];
    return brandImage.description || null;
  };

  // Helper function to get brand link URL from API data
  const getBrandLinkFromApi = (): string | null => {
    if (
      !articleDetails?.fieldsWithTextOptions?.brandImage ||
      articleDetails.fieldsWithTextOptions.brandImage.length === 0
    ) {
      return null;
    }

    const brandImage = articleDetails.fieldsWithTextOptions.brandImage[0];
    return brandImage.linkUrl || null;
  };

  const brandName = getBrandNameFromApi();
  const brandLink = getBrandLinkFromApi();

  // Helper function to get media URLs from API data
  const getMediaUrlsFromApi = () => {
    if (!articleDetails?.fieldsWithTextOptions?.mediaurl_link) {
      return [];
    }

    return articleDetails.fieldsWithTextOptions.mediaurl_link.map((item) => ({
      url: item.code, // The actual media URL
      title: item.description, // Human-readable title
      description: item.longDescription, // Additional details
      linkUrl: item.linkUrl, // Additional link URL
    }));
  };

  const mediaUrls = getMediaUrlsFromApi();

  // Get lowest price from custom API
  const customLowestPrice = getLowestPrice();

  // Get priority-based price
  const priorityPrice = getPriceByPriorityWithKey();

  // Extract document files from API
  const documentFiles = (
    articleDetails?.fieldsWithTextOptions?.product_documents || []
  )
    .filter((doc) => doc.linkUrl)
    .map((doc) => {
      const url = buildServerUrl(
        doc.linkUrl!,
        website.imageServerUrl || undefined
      );
      return url
        ? { url, filename: doc.description, alt: doc.description }
        : null;
    })
    .filter((doc): doc is NonNullable<typeof doc> => doc !== null);

  /*
  const currentColor = fields.articleColor ? fields.articleColor[0].name : null;
  const currentSize = fields.articleSize ? fields.articleSize[0].name : null;
  const currentWeight = fields.articleWeightKg ? fields.articleWeightKg : null;
  */

  /*
  const colors = Array.from(
    new Set(
      variants
        .filter((item: any) => item.fields.articleColor)
        .map((item: any) => item.fields.articleColor[0].name)
        .sort()
    )
  );

  const sizes = Array.from(
    new Set(
      variants
        .filter((item: any) => item.fields.articleSize)
        .map((item: any) => item.fields.articleSize[0].name)
        .sort()
    )
  );

  const weight = Array.from(
    new Set(
      variants
        .filter((item: any) => item.fields.articleWeightKg)
        .map((item: any) => item.fields.articleWeightKg)
        .sort()
    )
  );

  const getVariant = (size: any, color: any) => {
    return variants.find((item) => {
      const itemColor = item.fields.articleColor
        ? item.fields.articleColor[0].name
        : null;
      const itemSize = item.fields.articleSize
        ? item.fields.articleSize[0].name
        : null;
      return itemColor === color && itemSize === size;
    });
  };

  const getVariantUrl = (size: any, color: any) => {
    let variant = getVariant(size, color);
    if (!variant) {
      // get the first matched value for the selected color if the variant doesn't match any color or size
      if (color !== currentColor) {
        variant = variants.find((item) =>
          item.fields.articleColor
            ? item.fields.articleColor[0].name === color
            : false
        );
      }
      // get the first matched value for the selected size if the variant doesn't match any color or size
      if (size !== currentSize) {
        variant = variants.find((item) =>
          item.fields.articleSize
            ? item.fields.articleSize[0].name === size
            : false
        );
      }
    }
    return variant?.url;
  };

  const getVariantWeight = (weight: any) => {
    return variants.find((item) => {
      const itemWeight = item.fields.articleWeightKg
        ? item.fields.articleWeightKg
        : null;
      return itemWeight === weight;
    });
  };

  const getVariantWeightUrl = (weight: any) => {
    let variant = getVariantWeight(weight);
    if (!variant) {
      if (weight !== currentWeight) {
        variant = variants.find((item) =>
          item.fields.articleWeightKg
            ? item.fields.articleWeightKg === weight
            : false
        );
      }
    }
    return variant?.url;
  };
  */

  const getFieldValue = (field: any) => {
    // Field options
    if (!isEmpty(field.textOptionFieldValues)) {
      return field.textOptionFieldValues
        .map((item: any) => item.name)
        .join('; ');
    }
    // Field value
    if (!isEmpty(field.stringValue)) {
      return <HtmlText innerHTML={field.stringValue} />;
    }
    // Media file
    if (!isEmpty(field.pointerMediaFileValue)) {
      return (
        <Link
          href={field.pointerMediaFileValue.item?.url}
          target="_blank"
          title={
            field.pointerMediaFileValue.item?.alt ||
            field.pointerMediaFileValue.item?.filename
          }
          data-testid="product-detail__field-file"
        >
          {field.pointerMediaFileValue.item?.filename}
        </Link>
      );
    }
    // Field link
    if (!isEmpty(field.linkFieldValue)) {
      return (
        <Link
          href={field.linkFieldValue.url}
          target="_blank"
          title={field.linkFieldValue.text}
          data-testid="product-detail__field-link"
        >
          {field.linkFieldValue.text}
        </Link>
      );
    }

    //Field image
    if (!isEmpty(field.pointerMediaImageValue)) {
      return (
        <Image
          src={getAbsoluteImageUrl(
            field.pointerMediaImageValue.item,
            website.imageServerUrl
          )}
          alt={field.pointerMediaImageValue.item?.filename}
          width={field.pointerMediaImageValue.item?.dimension?.width}
          height={field.pointerMediaImageValue.item?.dimension?.height}
          data-testid={'product-detail__field-image'}
        ></Image>
      );
    }

    if (!isEmpty(field.booleanValue))
      return t(`productdetail.field.boolean.${field.booleanValue}`);

    if (!isEmpty(field.longValue)) return field.longValue;

    if (!isEmpty(field.intValue)) return field.intValue;

    if (!isEmpty(field.intOptionFieldValues))
      return field.intOptionFieldValues
        .map((item: any) => item.name)
        .join('; ');

    if (!isEmpty(field.decimalValue)) return field.decimalValue;

    if (!isEmpty(field.dateTimeValue)) return field.dateTimeValue;
  };

  const getFieldKey = (field: any) => {
    return field.field || field.name;
  };

  // Get description_short from fieldGroups
  const allFieldGroups = (props as any).allFieldGroups;
  const descriptionShort = getDescriptionShort(fieldGroups, allFieldGroups);

  /* Paxa Button + Modal */
  const [isModalOpen, setModalOpen] = useState(false);
  const openPaxaModal = () => setModalOpen(true);
  const closePaxaModal = () => setModalOpen(false);

  return (
    <Fragment>
      <Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>
      <div className="mb-10 flex flex-col justify-center gap-6 lg:flex-row lg:gap-10 xl:gap-10">
        <div className="basis-5/12 lg:max-w-[50%] xl:max-w-none xl:basis-5/12">
          {thumbnailImages && largeImages && (
            <ImageGallery
              thumbnailImages={thumbnailImages}
              largeImages={largeImages}
              alternativeText={name ?? ''}
              fieldGroups={fieldGroups}
            />
          )}
          {/* Brand Logotype */}
          <div className="hidden lg:block">
            <BrandLogotype articleNumber={articleNumber} />
          </div>
        </div>
        <div
          className={`w-full basis-5/12 lg:w-80 ${
            helloRetailProducts && helloRetailProducts.length > 0
              ? 'lg:basis-7/12 xl:basis-5/12'
              : 'lg:basis-7/12 xl:basis-7/12'
          }`}
        >
          <div className="flex items-start justify-between gap-12 lg:gap-6">
            <Heading1
              className="mb-2 text-3xl"
              data-testid="product-detail__name"
            >
              {descriptionShort || (name ?? '')}
            </Heading1>

            <AddFavouriteButton
              label={'productdetail.button.add'}
              articleNumber={articleNumber}
            />
          </div>

          <Text className="text-dark-gray">Art. nr {articleNumber}</Text>
          {brandName && (
            <BrandLink
              linkUrl={brandLink}
              className="inline-block border-b border-border text-dark-gray hover:opacity-80"
            >
              {brandName}
            </BrandLink>
          )}
          {/*fields.articleSupplierArtNr && (
            <Text className="mb-4 inline-block text-dark-gray">
              / {t('zs.supplierArtNr')} {fields.articleSupplierArtNr}
            </Text>
          )
          */}
          {fields?.bullets ? (
            <HtmlText
              className="texteditor-block mb-12 mt-6 min-w-full"
              innerHTML={fields.bullets}
              data-testid="text__editor"
            ></HtmlText>
          ) : (
            <div className="mb-12 mt-6"></div>
          )}
          <div>
            <PriorityPriceDisplay
              priorityPrice={priorityPrice}
              regularPrice={price}
              size="large"
              memberPrice={memberPrice}
              campaignPrice={campaignPrice}
              isLoading={articleLoading}
              customLowestPrice={customLowestPrice}
            />
          </div>

          {/* if there are multiple variants, show the variant dropdown */}
          {variantList?.nodes?.length && variantList.nodes.length > 1 && (
            <div className="w-full">
              <VariantsDropDown variants={variantList.nodes} />
            </div>
          )}

          <div className="mt-6">
            <div className="">
              <BuyButton
                className="buy-button bg-light-green text-dark-green"
                label={'productdetail.button.add'}
                successLabel={'productdetail.button.add.success'}
                fluid={true}
                articleNumber={articleNumber}
                disabled={false}
              ></BuyButton>
            </div>
            {/*           
            <div className="basis-1/2">
              <PaxaButton
                stockStatus={stockStatus.inStockQuantity}
                onClick={openPaxaModal}
              ></PaxaButton>
            </div>
            {isModalOpen && <PaxaModal onClose={closePaxaModal} />}
            */}
          </div>
          <ul className="mt-10 list-none pl-1">
            {t('zs.productUSP1') && (
              <li className="my-2 flex gap-2">
                <Check />
                <Text>{t('zs.productUSP1')}</Text>
              </li>
            )}
            {t('zs.productUSP2') && (
              <li className="my-2 flex gap-2">
                <Check />
                <Text>{t('zs.productUSP2')}</Text>
              </li>
            )}
            {t('zs.productUSP3') && (
              <li className="my-2 flex gap-2">
                <Check />
                <Text>{t('zs.productUSP3')}</Text>
              </li>
            )}
            {t('zs.productUSP4') && (
              <li className="my-2 flex gap-2">
                <Check />
                <Text>{t('zs.productUSP4')}</Text>
              </li>
            )}
          </ul>

          <div className="stockStatus mt-12 rounded-xl border-[1px] border-border p-6">
            <div className="onlineStock flex gap-4 text-dark-gray">
              <Truck />
              <div>
                <Text className="text-dark-gray">{t('zs.onlineStock')}</Text>
                {(() => {
                  if (stockStatus.inStockQuantity > 50) {
                    return (
                      <span className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                        <Text className="inline-block pr-1">50+</Text>
                        <StockStatus
                          className="inline-block lowercase"
                          inStockQuantity={stockStatus.inStockQuantity}
                          data-testid="product-detail__status"
                        />
                      </span>
                    );
                  } else if (
                    stockStatus.inStockQuantity < 50 &&
                    stockStatus.inStockQuantity > 0
                  ) {
                    return (
                      <span className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                        <Text className="inline-block pr-1">
                          {stockStatus.inStockQuantity}
                        </Text>
                        <StockStatus
                          className="inline-block lowercase"
                          inStockQuantity={stockStatus.inStockQuantity}
                          data-testid="product-detail__status"
                        />
                      </span>
                    );
                  } else {
                    return (
                      <StockStatus
                        className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-red before:align-middle before:content-['']"
                        inStockQuantity={stockStatus.inStockQuantity}
                        data-testid="product-detail__status"
                      />
                    );
                  }
                })()}
              </div>
            </div>

            <hr className="my-4 border-border" />
            <StockBalanceView articleId={articleNumber} onlyInStock={false} />
          </div>
        </div>

        {/* HelloRetail recommendations */}
        {helloRetailProducts && helloRetailProducts.length > 0 && (
          <div className="hidden overflow-hidden rounded xl:block xl:basis-2/12">
            <HelloRetailVerticalProductList
              items={helloRetailProducts}
              title={helloRetailTitle}
            />
          </div>
        )}
      </div>

      {/* HelloRetail recommendations - show below main content on smaller screens */}
      {helloRetailProducts && helloRetailProducts.length > 0 && (
        <div className="mb-10 block xl:hidden">
          <HelloRetailHorizontalProductList
            items={helloRetailProducts}
            title={helloRetailTitle}
          />
        </div>
      )}

      {/* {variantList?.nodes?.length && variantList.nodes.length > 0 && (
        <div className="w-full overflow-x-auto">
          <VariantsTable variants={variantList.nodes} />
        </div>
      )} */}

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 xl:gap-8">
        <div className="w-full lg:w-2/3">
          <ProductDetailAccordions
            fields={fields}
            articleDetails={articleDetails || undefined}
            documentFiles={documentFiles}
            mediaUrls={mediaUrls}
            articleNumber={articleNumber || ''}
            name={name || ''}
            descriptionShort={descriptionShort || null}
            website={{ imageServerUrl: website.imageServerUrl || '' }}
            brandTitle={getBrandNameFromApi() || undefined}
          />
        </div>
        <div className="mt-8 w-full lg:mt-0 lg:w-1/3">
          <ProductSpecifications
            articleDetails={articleDetails || null}
            articleLoading={articleLoading}
            allFieldGroups={(props as any).allFieldGroups}
          />
        </div>
      </div>
      {renderRelationshipList('similarProducts')}
      {renderRelationshipList('spareparts')}
      {renderRelationshipList('accessories')}
      {helloRetailHorizontalRecoms
        ?.filter((recom) => recom.products && recom.products.length > 0)
        .slice(0, 2)
        .map((recom, index) => (
          <HelloRetailHorizontalProductList
            key={index}
            items={recom.products}
            title={recom.title}
            className="mt-20 xl:px-5"
          />
        ))}
    </Fragment>
  );
}

export default ProductDetail;

function isEmpty(value: any) {
  return (
    // null or undefined
    value == null ||
    // has length and it's zero
    (value.hasOwnProperty('length') && value.length === 0) ||
    // is an Object and has no keys
    (value.constructor === Object && Object.keys(value).length === 0)
  );
}
