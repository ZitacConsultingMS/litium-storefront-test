'use client';
import { gql } from '@apollo/client';
import Currency from 'components/Currency';
import { Text } from 'components/elements/Text';
import Link from 'components/Link';
import { WebsiteContext } from 'contexts/websiteContext';
import { useCustomArticleDetails } from 'hooks/useCustomArticleDetails';
import { useTranslations } from 'hooks/useTranslations';
import { ProductItem } from 'models/(zitac)/products';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import Image from 'next/image';
import { IMAGE_FRAGMENT } from 'operations/fragments/image';
import { PRODUCT_CARD_FRAGMENT } from 'operations/fragments/products/(zitac)/productCard';
import { Fragment, useContext, useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { getAbsoluteImageUrl } from 'services/imageService';
import { FavouriteContext } from './FavouriteContext';

const GET_PRODUCT_BY_ARTICLE = gql`
  ${PRODUCT_CARD_FRAGMENT}
  ${IMAGE_FRAGMENT}
  query GetProductByArticle($productQuery: ProductSearchQueryInput!) {
    productSearch(query: $productQuery, first: 5) {
      nodes {
        ...ProductCard
        thumbnailImages: images(max: { height: 200, width: 200 }) {
          ...Image
        }
        ... on AllAttributesInListProduct {
          smallImages: images(max: { height: 200, width: 200 }) {
            ...Image
          }
        }
      }
    }
  }
`;

/**
 * Renders a line item in the favourites list.
 * @param articleNumber the article number of the favourite product.
 */
function FavouriteLineItem({
  articleNumber,
  asterisk = false,
  updatable = true,
}: {
  articleNumber: string;
  asterisk?: boolean;
  updatable?: boolean;
}) {
  const { toggleFavourite } = useContext(FavouriteContext);
  const website = useContext(WebsiteContext);
  const t = useTranslations();
  const { articleDetails } = useCustomArticleDetails(articleNumber);
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productParams = new ProductSearchQueryInput({
          text: articleNumber,
        });
        const data = await queryClient({
          query: GET_PRODUCT_BY_ARTICLE,
          variables: {
            productQuery: { ...productParams },
          },
        });
        const foundProduct = data?.productSearch?.nodes?.find(
          (p: ProductItem) => p.articleNumber === articleNumber
        );
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (articleNumber) {
      fetchProduct();
    }
  }, [articleNumber]);

  if (!articleNumber) {
    return <Fragment></Fragment>;
  }

  // Get product data - prefer GraphQL product data, fallback to custom article details
  const name = product?.name || articleDetails?.name || articleNumber;
  const price =
    product?.price?.unitPriceIncludingVat ||
    (articleDetails?.priceList
      ? Number(articleDetails.priceList.LagstaPris30Dag?.[0]?.price || 0)
      : 0);
  const url = (product?.url && product.url.trim()) || '';
  const image =
    product?.smallImages?.[0] ||
    product?.thumbnailImages?.[0] ||
    product?.mediumImages?.[0];

  return (
    <div className="my-2" data-testid={articleNumber}>
      <div className="ml-2 flex-1">
        <div className="mb-2 flex justify-between">
          <div className="w-44">
            {url ? (
              <Link
                href={url}
                className="truncate text-sm text-primary hover:underline"
                title={name}
                data-testid={`${articleNumber}__name`}
              >
                {name}
              </Link>
            ) : (
              <Text
                className="truncate text-sm text-primary"
                title={name}
                data-testid={`${articleNumber}__name`}
              >
                {name}
              </Text>
            )}
            <Text
              className="truncate text-[10px] text-tertiary"
              title={articleNumber}
              data-testid={`${articleNumber}__article-number`}
            >
              Art. nr {articleNumber}
            </Text>
          </div>
          {price > 0 && (
            <Currency
              className="text-xs"
              price={price}
              data-testid={`${articleNumber}__price`}
            />
          )}
        </div>
      </div>
      <div className="flex justify-between border-b pb-4">
        {image && (
          <div className="h-20 w-20 flex-none rounded-md bg-white p-2">
            <Image
              src={getAbsoluteImageUrl(image, website.imageServerUrl)}
              alt={`img-${articleNumber}`}
              width={image?.dimension?.width || 80}
              height={image?.dimension?.height || 80}
              className="mx-auto"
            />
          </div>
        )}
        {updatable && (
          <div className="items-center justify-between pb-5 text-right">
            <div
              className="mt-1 cursor-pointer text-[10px] text-tertiary"
              onClick={() => toggleFavourite(articleNumber)}
              data-testid={`${articleNumber}__remove-btn`}
            >
              {t('cartlineitem.button.remove')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavouriteLineItem;
