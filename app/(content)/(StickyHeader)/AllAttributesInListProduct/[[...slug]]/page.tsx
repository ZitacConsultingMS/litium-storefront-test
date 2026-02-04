import { gql } from '@apollo/client';
import ProductDetail from 'components/products/zitac/ProductDetail';
import ProductDetailB2B from 'components/products/zitac/ProductDetail.b2b';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import { get } from 'services/websiteService.server';
import {
  getHelloRetailFromContent,
  getHelloRetailHorizontalFromContent,
} from 'services/zitac/helloretail/loadRecoms';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';
import { getIsB2B } from 'utils/isB2B';

export default async function Page({ params }: { params: any }) {
  const content = await getContent({ params });

  // Get website to check if this is B2B
  const website = await get();
  const isB2B = getIsB2B(website);

  let helloRetailProducts: any[] = [];
  let helloRetailTitle: string | undefined;
  let horizontalRecoms: { products: any[]; title?: string }[] = [];

  if (!isB2B) {
    // Get tracking user ID from HelloRetail cookie (or fallback)
    const trackingUserId = await getHelloRetailTrackingId();

    const helloRetailData = await getHelloRetailFromContent(
      content,
      trackingUserId
    );
    helloRetailProducts = helloRetailData.products;
    helloRetailTitle = helloRetailData.title;

    // Extract and fetch horizontal HelloRetail recommendations
    horizontalRecoms = await getHelloRetailHorizontalFromContent(
      content,
      trackingUserId
    );
  }

  const ProductDetailComponent = isB2B ? ProductDetailB2B : ProductDetail;

  return (
    <ProductDetailComponent
      {...content}
      helloRetailProducts={helloRetailProducts}
      helloRetailTitle={helloRetailTitle}
      helloRetailHorizontalRecoms={horizontalRecoms}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  const slug = params;

  return (
    await queryServer({
      query: GET_CONTENT,
      url: slug.slug?.join('/'),
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetAllAttributesInListProduct {
    content {
      ...Metadata
      ...Product
      ... on AllAttributesInListProduct {
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
          accessories {
            name
            items {
              nodes {
                ...ProductCard
                ...Id
              }
            }
          }
          spareparts {
            name
            items {
              nodes {
                ...ProductCard
                ...Id
              }
            }
          }
        }
        parents(reverse: true) {
          nodes {
            ... on ICategoryItem {
              name
              url
              id
            }
            ... on IPageItem {
              name
              url
              id
            }
          }
        }
        rawData {
          variants {
            url
            id
          }
        }
      }
    }
  }
`;
