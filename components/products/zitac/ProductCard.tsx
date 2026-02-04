'use client';
import { gql } from '@apollo/client';
import clsx from 'clsx';
import Link from 'components/Link';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
import { Button } from 'components/elements/zitac/Button';
import BuyButton from 'components/zitac/BuyButton';
import MiniFavouriteButton from 'components/zitac/favourites/MiniFavouriteButton';
import { WebsiteContext } from 'contexts/websiteContext';
import { useCustomArticleDetails } from 'hooks/useCustomArticleDetails';
import { useStoreSelection } from 'hooks/useStoreSelection';
import { useTranslations } from 'hooks/useTranslations';
import { ProductItem } from 'models/(zitac)/products';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { getAbsoluteImageUrl } from 'services/imageService';
import { getFirstValidImage } from 'utils/imageUtils';
import { imageConfiguration } from 'utils/responsive';
import ArtikelmedaljerTags from './Artikelmedaljer';
import PriorityPriceDisplay from './PriorityPriceDisplay';

interface ProductCardProps extends ProductItem {
  /**
   * When true, the image of this ProductCard will be considered high priority and preload.
   */
  priority?: boolean;
  showBuyButton?: boolean;
  isVertical?: boolean;
  inStock?: boolean;
  isHelloRetail?: boolean;
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
    inStock,
    stockStatus,
    mediumImages,
    articleNumber,
    isVariant,
    fieldGroups,
    artikelmedaljerFieldGroups,
    showBuyButton = true,
    isHelloRetail = false,
    isVertical = false,
    memberPrice,
    campaignPrice,
    onClick,
  } = props;
  const website = useContext(WebsiteContext);
  const firstValidImage = getFirstValidImage(mediumImages || []);
  const imageSource = firstValidImage
    ? isHelloRetail
      ? firstValidImage.url // Use URL directly for HelloRetail images
      : getAbsoluteImageUrl(firstValidImage, website.imageServerUrl)
    : null;
  const t = useTranslations();

  // Custom API for article details (only for non-HelloRetail products)
  const { getPriceByPriorityWithKey } = useCustomArticleDetails(articleNumber);

  // Get priority-based price (respects: SB > SD > SC > K1)
  const priorityPrice = getPriceByPriorityWithKey();

  // Store selection logic
  const { selectedStore, storeStockData, loadingStoreStock } =
    useStoreSelection(articleNumber);

  const dimension = {
    width: 300, // Default width
    height: 300, // Default height
    ...imageConfiguration.productList,
  };

  const isB2B = website.zsThemeID === 'af';
  let [isLogged, setIsLogged] = useState(false);
  let hideBuyButtonB2B = false;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await queryClient({
          query: GET_CURRENT_USER,
        });
        if (currentUser?.me?.person) {
          setIsLogged(true);
        }
      } catch {
        setIsLogged(false);
      }
    };
    fetchUser();
  });

  if (isB2B && !isLogged) {
    hideBuyButtonB2B = true;
  }

  /**
   * Note: Image tag has Translate3d style to makes some devices use GPU for
   * rendering, results in higher frame per second and smoother rendering
   * when scrolling.
   */
  return (
    <div
      data-testid="product-card"
      className="product-card flex h-full flex-col"
    >
      <div className="relative">
        <Link
          href={url || '#'}
          data-testid="product-card__url"
          onClick={onClick}
        >
          <div className="flex aspect-square items-center justify-center rounded-xl bg-white">
            {imageSource ? (
              <Image
                priority={props.priority}
                src={imageSource}
                alt={name ?? ''}
                width={dimension.width || 300}
                height={dimension.height || 300}
                sizes={dimension.sizes}
                data-testid="product-card__image"
                className="aspect-square object-contain p-6"
                unoptimized={isHelloRetail} // Disable optimization for HelloRetail images
              />
            ) : (
              <Text
                className="italic"
                data-testid="product-card__missing-image"
              >
                {t('productcard.missingimage')}
              </Text>
            )}
          </div>
        </Link>

        <ArtikelmedaljerTags fieldGroups={artikelmedaljerFieldGroups} />

        <MiniFavouriteButton
          articleNumber={articleNumber}
          className="absolute bottom-2 right-2 flex h-fit items-center justify-center rounded-md bg-white p-1 drop-shadow-sm"
        />
      </div>

      <div className="my-4 flex flex-1 flex-col justify-between text-sm">
        <div className="mx-4">
          <Text className="text-dark-gray">Art. nr {articleNumber}</Text>
          <Link href={url || '#'} onClick={onClick}>
            <Text
              className="overflow-hidden text-xl"
              data-testid="product-card__name"
              title={name ?? ''}
            >
              {name}
            </Text>
            {!isVertical && fields?.bullets && (
              <HtmlText
                className="texteditor-block mx-1 my-2 min-w-full"
                innerHTML={fields.bullets}
                data-testid="text__editor"
              ></HtmlText>
            )}
            {/* Always show original stock status */}
            {!isVertical &&
              inStock &&
              !isB2B &&
              (isHelloRetail ? (
                // HelloRetail products
                <Text className="mt-6 text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                  {t('zs.inStock')} {t('zs.stockCount')}
                </Text>
              ) : stockStatus.inStockQuantity > 50 ? (
                <Text className="mt-6 text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                  {t('zs.inStock')} 50+ {t('zs.stockCount')}
                </Text>
              ) : (
                <Text className="mt-6 text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                  {t('zs.inStock')} {stockStatus.inStockQuantity}{' '}
                  {t('zs.stockCount')}
                </Text>
              ))}
            {!isVertical && !inStock && !isB2B && (
              <Text className="mt-6 text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-red before:align-middle before:content-['']">
                {t('zs.outOfStock')} {t('zs.stockCount')}
              </Text>
            )}

            {/* Show store-specific stock status if store is selected */}
            {!isVertical && selectedStore && storeStockData && !isB2B && (
              <div className="mt-2">
                {storeStockData.mustContactStore ? (
                  <Text className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-yellow-500 before:align-middle before:content-['']">
                    Kontakta butik i {selectedStore.name}
                  </Text>
                ) : storeStockData.quantity === 0 ? (
                  <Text className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-red before:align-middle before:content-['']">
                    Ej i lager i {selectedStore.name}
                  </Text>
                ) : storeStockData.quantity >= 5 ? (
                  <Text className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                    Fler än 5 i lager i {selectedStore.name}
                  </Text>
                ) : (
                  <Text className="text-dark-gray before:mr-2 before:inline-block before:h-[7px] before:w-[7px] before:rounded-[50%] before:bg-light-green before:align-middle before:content-['']">
                    Färre än 5 i lager i {selectedStore.name}
                  </Text>
                )}
              </div>
            )}
            {!isVertical && selectedStore && loadingStoreStock && (
              <div className="mt-2">
                <Text className="text-sm text-gray-500">Hämtar lager...</Text>
              </div>
            )}
          </Link>
        </div>
        <div
          className={clsx(
            'mx-2',
            isVertical
              ? 'mt-4 flex flex-col gap-3'
              : 'mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:align-baseline'
          )}
        >
          <div className="mt-2">
            <PriorityPriceDisplay
              priorityPrice={priorityPrice}
              regularPrice={price}
              size="small"
              showLabel={true}
              dataTestId="product-card__price"
              isVertical={isVertical}
              memberPrice={memberPrice}
              campaignPrice={campaignPrice}
              showOnlyMedlemspris={true}
            />
          </div>
          {showBuyButton &&
            !hideBuyButtonB2B &&
            (isVariant ? (
              <BuyButton
                // label={t('productcard.button.add')}
                label={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                }
                // successLabel={t('productcard.button.add.success')}
                //checkmark, zs.check
                successLabel="✓"
                articleNumber={articleNumber}
                className={
                  isVertical
                    ? 'buy-button flex w-full items-center justify-center bg-light-green px-[0.85rem!important] py-[0.5rem!important] text-dark-green'
                    : 'buy-button flex w-full items-center justify-center bg-light-green px-[0.85rem!important] py-[0.5rem!important] text-dark-green sm:w-auto'
                }
              ></BuyButton>
            ) : (
              <>
                <Button
                  className={
                    isVertical
                      ? 'w-full px-[1rem!important] py-[0.5rem!important]'
                      : 'w-full px-[1rem!important] py-[0.5rem!important] sm:w-auto'
                  }
                >
                  <Link
                    href={url || '#'}
                    rel="nofollow"
                    onClick={onClick}
                    data-testid="product-card__show-button"
                  >
                    {t('productcard.button.show')}
                  </Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      person {
        id
      }
    }
  }
`;
