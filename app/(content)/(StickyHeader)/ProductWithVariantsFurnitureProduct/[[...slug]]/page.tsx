import { gql } from '@apollo/client';
import ProductDetail from 'components/products/ProductDetail';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const content = await getContent({ params });
  return <ProductDetail {...content}></ProductDetail>;
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
  query GetProductWithVariantsFurnitureProduct {
    content {
      ...Metadata
      ...Product
      ... on ProductWithVariantsFurnitureProduct {
        fields {
          color {
            name
          }
        }
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
        rawData {
          variants {
            fields {
              color {
                name
              }
            }
            url
            id
          }
        }
        fieldGroups {
          fieldGroupId
          name
          fields {
            ...FieldValues
          }
        }
      }
    }
  }
`;
