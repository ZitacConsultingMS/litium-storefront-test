import { Accordion, AccordionPanel } from 'components/Accordion';
import BuyButton from 'components/BuyButton';
import ImageGallery from 'components/ImageGallery';
import Link from 'components/Link';
import StockStatus from 'components/StockStatus';
import { Button } from 'components/elements/Button';
import { Heading1 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import HorizontalProductList from 'components/products/HorizontalProductList';
import { translate } from 'hooks/useTranslations';
import { ProductItem } from 'models/products';
import { Fragment } from 'react';
import { get } from 'services/websiteService.server';
import { FieldValues } from './FieldValues';
import ProductPrice from './ProductPrice';
import VariantsTable from './VariantsTable';

interface ProductDetailProps extends ProductItem {
  showArticleNumber?: boolean;
  showDescription?: boolean;
  showAddToCartButton?: boolean;
  showPrice?: boolean;
  variants?: any;
}
/**
 * Renders a product's information.
 * @param props a product object.
 */
export default async function ProductDetail(props: ProductDetailProps) {
  const {
    name,
    fields,
    price,
    thumbnailImages,
    stockStatus,
    largeImages,
    articleNumber,
    parent,
    rawData,
    relationships,
    fieldGroups,
    description,
    variants: variantList,
    showAddToCartButton = true,
    showPrice = true,
    showArticleNumber = false,
    showDescription = false,
  } = props;
  const website = await get();
  const variants = rawData?.variants || [];
  const currentColor = fields?.color ? fields.color[0].name : null;
  const currentSize = fields?.size ? fields.size[0].name : null;

  const colors = Array.from(
    new Set(
      variants
        .filter((item: any) => item.fields.color)
        .map((item: any) => item.fields.color[0].name)
        .sort()
    )
  );

  const sizes = Array.from(
    new Set(
      variants
        .filter((item: any) => item.fields.size)
        .map((item: any) => item.fields.size[0].name)
        .sort()
    )
  );

  const getVariant = (size: any, color: any) => {
    return variants.find((item) => {
      const itemColor = item.fields.color ? item.fields.color[0].name : null;
      const itemSize = item.fields.size ? item.fields.size[0].name : null;
      return itemColor === color && itemSize === size;
    });
  };

  const getVariantUrl = (size: any, color: any) => {
    let variant = getVariant(size, color);
    if (!variant) {
      // get the first matched value for the selected color if the variant doesn't match any color or size
      if (color !== currentColor) {
        variant = variants.find((item) =>
          item.fields.color ? item.fields.color[0].name === color : false
        );
      }
      // get the first matched value for the selected size if the variant doesn't match any color or size
      if (size !== currentSize) {
        variant = variants.find((item) =>
          item.fields.size ? item.fields.size[0].name === size : false
        );
      }
    }
    return variant?.url;
  };

  return (
    <div className="container mx-auto px-5">
      <div className="my-4 text-center">
        <Link
          className="text-xs text-secondary-2"
          href={parent.url}
          data-testid="product-detail__category"
        >
          {parent.name}
        </Link>
      </div>
      <div className="mb-8 flex flex-col justify-center md:mb-11 lg:flex-row">
        <div className="lg:mr-4">
          {thumbnailImages && largeImages && (
            <ImageGallery
              thumbnailImages={thumbnailImages}
              largeImages={largeImages}
              alternativeText={name ?? ''}
            />
          )}
        </div>
        <div className="w-full lg:w-80">
          <Heading1
            className="mb-6 mt-0 text-xl"
            data-testid="product-detail__name"
          >
            {name ?? ''}
          </Heading1>
          {showArticleNumber && (
            <Text className="-mt-1 mb-5 text-sm font-bold">
              {articleNumber}
            </Text>
          )}
          {showDescription && <Text className="text-sm">{description}</Text>}
          {colors.length > 0 && (
            <div className="mb-6">
              <Text className="mb-2 text-sm">
                {translate('productdetail.color', website.texts)}
              </Text>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <Button
                    className="h-12 min-w-[60px]"
                    key={`color__${color}-${index}`}
                    type="link"
                    title={color}
                    url={getVariantUrl(currentSize, color)}
                    rounded={true}
                    active={color === currentColor}
                    disabled={!getVariant(currentSize, color)}
                    data-testid="product-detail__color"
                  ></Button>
                ))}
              </div>
            </div>
          )}
          {sizes.length > 0 && (
            <div className="mb-6">
              <Text className="mb-2 text-sm">
                {translate('productdetail.size', website.texts)}
              </Text>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <Button
                    className="h-12 min-w-[60px]"
                    key={`size__${size}-${index}`}
                    type="link"
                    title={size}
                    url={getVariantUrl(size, currentColor)}
                    rounded={true}
                    active={size === currentSize}
                    disabled={!getVariant(size, currentColor)}
                    data-testid="product-detail__size"
                  ></Button>
                ))}
              </div>
            </div>
          )}
          {showPrice && (
            <div className="mb-3.5 flex justify-between text-sm">
              <StockStatus
                className="uppercase"
                inStockQuantity={stockStatus.inStockQuantity}
                data-testid="product-detail__status"
              />
              <ProductPrice price={price} />
            </div>
          )}
          {showAddToCartButton && (
            <BuyButton
              label={'productdetail.button.add'}
              successLabel={'productdetail.button.add.success'}
              fluid={true}
              articleNumber={articleNumber}
              disabled={stockStatus.inStockQuantity == 0}
            ></BuyButton>
          )}
        </div>
      </div>
      {variantList?.nodes?.length && variantList.nodes.length > 0 && (
        <div className="w-full overflow-x-auto">
          <VariantsTable variants={variantList.nodes} />
        </div>
      )}
      <Accordion
        classCssHeader="[&>p]:text-h2 [&>p]:pl-5 [&>svg]:mr-5 -mx-5 lg:-mr-10 xl:ml-0 xl:-mr-5"
        classCssContent="-mx-5 px-5 lg:-mr-10 xl:ml-0 xl:-mr-5"
        classCssIcon="text-h2 h-5 w-5"
        className="container mx-auto"
      >
        {fieldGroups &&
          fieldGroups.map((group) => {
            const { fieldGroupId, name, fields } = group;
            return (
              <AccordionPanel
                key={name || fieldGroupId}
                header={name || fieldGroupId}
              >
                <Fragment>
                  {fields
                    ?.filter((field) => field.field)
                    .map((field, index) => {
                      return (
                        <Fragment key={`${getFieldKey(field)}-${index}`}>
                          <Text
                            className="mb-1 mt-2 font-bold"
                            data-testid="product-detail__field-name"
                          >
                            {field.name}
                          </Text>
                          <div
                            className="mb-7 last-of-type:mb-0"
                            data-testid="product-detail__field-value"
                          >
                            <FieldValues {...field} />
                          </div>
                        </Fragment>
                      );
                    })}
                </Fragment>
              </AccordionPanel>
            );
          })}
      </Accordion>
      <HorizontalProductList
        items={relationships?.similarProducts?.items?.nodes}
        title={relationships?.similarProducts?.name}
        className="xl:px-5"
      />
      <HorizontalProductList
        items={relationships?.accessory?.items?.nodes}
        title={relationships?.accessory?.name}
        className="xl:px-5"
      />
    </div>
  );
}

function getFieldKey(field: any) {
  return field.field || field.name;
}
