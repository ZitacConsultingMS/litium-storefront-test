import { gql } from '@apollo/client';
import ProductDetail from 'components/products/ProductDetail';
import { ProductWithVariantsListProduct } from 'models/products';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const content = (await getContent({
    params,
  })) as ProductWithVariantsListProduct;

  return (
    <ProductDetail
      {...content}
      showAddToCartButton={false}
      showPrice={false}
      showArticleNumber={true}
      showDescription={true}
    />
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/'),
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetProductWithVariantsList {
    content {
      ...Metadata
      ...Product
      ... on ProductWithVariantsListProduct {
        parent {
          ... on ICategoryItem {
            name
            url
            id
          }
        }
        relationships {
          similarProducts {
            name
            items {
              nodes {
                ...ProductCard
                ...Id
              }
            }
          }
          accessory {
            name
            items {
              nodes {
                ...ProductCard
                ...Id
              }
            }
          }
        }
        fieldGroups {
          fieldGroupId
          name
          fields {
            ...FieldValues
          }
        }
        variants {
          nodes {
            images(max: { height: 80, width: 56 }) {
              filename
              url
              alt
            }
            articleNumber
            stockStatus {
              inStockQuantity
            }
            price {
              unitPriceIncludingVat
              unitPriceExcludingVat
            }
            displayFieldGroups(
              filter: { id: { value: "variantFieldColumns", operator: "eq" } }
            ) {
              fieldGroupId
              fields {
                ...FieldValues
              }
            }
          }
        }
      }
    }
  }
`;
