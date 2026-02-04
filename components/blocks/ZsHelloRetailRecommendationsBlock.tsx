import { gql } from '@apollo/client';
import HelloRetailHorizontalProductList from 'components/products/zitac/HelloRetailHorizontalProductList';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { queryServer } from 'services/dataService.server';
import { getHelloRetailRecommendations } from 'services/zitac/helloretail/loadRecoms';
import { HeaderKeys } from 'utils/constants';
import { getHelloRetailTrackingId } from 'utils/helloRetailTracking';
import { getIsB2B } from 'utils/isB2B';
import { LoadingFallback } from './ZsLoadingFallback';

interface ZsHelloRetailRecommendationsFields extends ContentFieldType {
  title: string;
  zsHelloRetailRecomBoxId: string;
}

interface ZsHelloRetailRecommendationsBlockProps extends Block {
  fields: ZsHelloRetailRecommendationsFields;
}

/**
 * Gets the category hierarchy from the current page using GraphQL.
 * Returns hierarchies in the format: [["Båtel"], ["Batterier"]]
 * where each category in the breadcrumb path is its own hierarchy entry.
 */
async function getCategoryHierarchyFromPage(): Promise<string[][]> {
  try {
    const headersList = await headers();
    const currentUrl = headersList.get(HeaderKeys.OriginalUrl) || '/';

    const result = await queryServer({
      query: GET_CATEGORY_HIERARCHY,
      url: currentUrl,
    });

    const content = result.content;
    if (!content) {
      return [];
    }

    const allNodes = [];

    if (content.parents?.nodes) {
      allNodes.push(...content.parents.nodes);
    }
    if (content.name) {
      allNodes.push({ name: content.name });
    }

    // Filter out navigation items and only keep actual product categories
    const navigationItems = ['Startsida', 'Home', 'Produkter'];
    const categoryNames = allNodes
      .filter((node: any) => node.name && !navigationItems.includes(node.name))
      .map((node: any) => node.name);

    // hierarchies as an array of arrays per level, e.g. [["Båtel"], ["Batterier"]]
    // Each category in the path becomes its own hierarchy entry
    const hierarchies = categoryNames.map((name: string) => [name]);

    return hierarchies;
  } catch (error) {
    console.error('Error getting category hierarchy:', error);
    return [];
  }
}

async function HelloRetailRecommendationsContent({
  recomBoxId,
  title,
}: {
  recomBoxId: string;
  title: string;
}) {
  try {
    const trackingUserId = await getHelloRetailTrackingId();
    const hierarchies = await getCategoryHierarchyFromPage();

    // Build request with context containing hierarchies for category pages
    // Format: { context: { hierarchies: [["Båtel"], ["Batterier"]] } }
    const request = {
      key: recomBoxId,
      context: hierarchies.length > 0 ? { hierarchies } : undefined,
    };

    const response = await getHelloRetailRecommendations(
      [request],
      trackingUserId
    );
    const products = response.responses?.[0]?.products || [];

    // Check if we have products - even if success is false, we might still have products
    if (products.length === 0) {
      return <></>;
    }

    return (
      <HelloRetailHorizontalProductList
        items={products}
        title={title}
        className="container mx-auto mt-7 px-5"
      />
    );
  } catch (error) {
    console.error('Error loading HelloRetail recommendations:', error);
    return <></>;
  }
}

export default async function ZsHelloRetailRecommendationsBlock({
  fields: { title, zsHelloRetailRecomBoxId },
}: ZsHelloRetailRecommendationsBlockProps) {
  if (!zsHelloRetailRecomBoxId) {
    return <></>;
  }

  // Get website to check if this is B2B
  const { get: getWebsite } = await import('services/websiteService.server');
  const website = await getWebsite();
  const isB2B = getIsB2B({ zsThemeID: website.zsThemeID });

  // Disable HelloRetail recommendation boxes on B2B sites
  if (isB2B) {
    return <></>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HelloRetailRecommendationsContent
        recomBoxId={zsHelloRetailRecomBoxId}
        title={title}
      />
    </Suspense>
  );
}

const GET_CATEGORY_HIERARCHY = gql`
  query GetCategoryHierarchy {
    content {
      ... on ICategoryItem {
        name
        parents(reverse: true) {
          nodes {
            ... on ICategoryItem {
              name
            }
            ... on IPageItem {
              name
            }
          }
        }
      }
      ... on IPageItem {
        name
        parents(reverse: true) {
          nodes {
            ... on ICategoryItem {
              name
            }
            ... on IPageItem {
              name
            }
          }
        }
      }
    }
  }
`;
