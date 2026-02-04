'use client';
import BuyButton from 'components/BuyButton';
import Link from 'components/Link';
import { Text } from 'components/elements/Text';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { ProductItem } from 'models/products';
import Image from 'next/image';
import { useContext } from 'react';
import { getAbsoluteImageUrl } from 'services/imageService';
import { imageConfiguration } from 'utils/responsive';
import ProductPrice from './ProductPrice';

interface ProductCardProps extends ProductItem {
  /**
   * When true, the image of this ProductCard will be considered high priority and preload.
   */
  priority?: boolean;
  showBuyButton?: boolean;
  onClick?: () => void;
}

/**
 * Renders an item in a product list.
 * @param props a product object.
 */
function ProductCard(props: ProductCardProps) {
  const {
    name,
    fields,
    price,
    url = '',
    mediumImages,
    articleNumber,
    isVariant,
    showBuyButton = false,
    onClick,
  } = props;
  const website = useContext(WebsiteContext);
  const firstImage =
    mediumImages && mediumImages.length > 0 ? mediumImages[0] : null;
  const imageSource = getAbsoluteImageUrl(firstImage, website.imageServerUrl),
    dimension = {
      width: firstImage?.dimension.width,
      height: firstImage?.dimension.height,
      ...imageConfiguration.productList,
    };
  const t = useTranslations();

  /**
   * Note: Image tag has Translate3d style to makes some devices use GPU for
   * rendering, results in higher frame per second and smoother rendering
   * when scrolling.
   */
  return (
    <div data-testid="product-card">
      <Link
        href={url || '#'}
        data-testid="product-card__url"
        onClick={onClick}
        aria-label={name ?? ''}
      >
        {imageSource ? (
          <Image
            priority={props.priority}
            src={imageSource}
            alt={name ?? ''}
            width={dimension.width}
            height={dimension.height}
            sizes={dimension.sizes}
            style={{ transform: 'translate3d(0, 0, 0)' }}
            data-testid="product-card__image"
          />
        ) : (
          <Text data-testid="product-card__missing-image">
            {t('productcard.missingimage')}
          </Text>
        )}
      </Link>
      <div className="my-2 text-sm lg:my-1">
        <Link href={url || '#'} onClick={onClick}>
          <Text
            className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap"
            data-testid="product-card__name"
            title={name ?? ''}
          >
            {name}
          </Text>
          {fields?.brand && (
            <Text
              className="mt-1 text-tertiary"
              data-testid="product-card__brand"
            >
              {fields.brand[0].name}
            </Text>
          )}
        </Link>
        <ProductPrice price={price} className="mt-2" />
      </div>
      {showBuyButton &&
        (isVariant ? (
          <BuyButton
            label={t('productcard.button.add')}
            successLabel={t('productcard.button.add.success')}
            articleNumber={articleNumber}
            className="w-3/4 p-2 lg:w-4/6"
          ></BuyButton>
        ) : (
          <Link
            className="inline-block bg-secondary px-4 py-2 text-white hover:bg-neutral-600"
            href={url || '#'}
            rel="nofollow"
            onClick={onClick}
            data-testid="product-card__show-button"
          >
            {t('productcard.button.show')}
          </Link>
        ))}
    </div>
  );
}

export default ProductCard;
