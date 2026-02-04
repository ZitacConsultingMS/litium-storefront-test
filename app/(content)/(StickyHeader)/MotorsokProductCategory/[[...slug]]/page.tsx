import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import CascadingCategoryDropdowns from 'components/products/zitac/CascadingCategoryDropdowns';
import ProductSearchWithControls from 'components/search/zitac/ProductSearchWithControls';
import Breadcrumb from 'components/zitac/Breadcrumb';
import { NavigationLink } from 'models/navigation';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchFacetItemInput } from 'models/searchFacetItemInput';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput, {
  SearchSortOrder,
} from 'models/searchSortInputItem';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { PaginationOptions } from 'utils/constants';
import { getCategorySegments, isLevel1Category } from 'utils/motorsok';

const SortCriteria: SearchSortItemInput[] = [
  {
    field: 'manual',
    name: 'productsearchresult.sortcriteria.manual',
    selected: true,
  },
  {
    field: 'popular',
    name: 'productsearchresult.sortcriteria.popular',
  },
  {
    field: 'price',
    order: SearchSortOrder.ASCENDING,
    name: 'productsearchresult.sortcriteria.price.ascending',
  },
  {
    field: 'price',
    order: SearchSortOrder.DESCENDING,
    name: 'productsearchresult.sortcriteria.price.descending',
  },
  {
    field: '_name',
    order: SearchSortOrder.ASCENDING,
    name: 'productsearchresult.sortcriteria.name.ascending',
  },
  {
    field: '_name',
    order: SearchSortOrder.DESCENDING,
    name: 'productsearchresult.sortcriteria.name.descending',
  },
];

const CATEGORY_IMAGE_FRAGMENT = gql`
  fragment CategoryImage on IImageItem {
    url
  }
`;

const GET_MAIN_CATEGORY = gql`
  query GetMainMotorsokProductCategory {
    content {
      ... on MotorsokProductCategory {
        ...Metadata
        name
        id
        description
        blocks {
          topContainer {
            ...AllBlockTypes
          }
          bottomContainer {
            ...AllBlockTypes
          }
        }
        children {
          nodes {
            name
            url
            id
            images {
              ...CategoryImage
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
      }
    }
  }
  ${CATEGORY_IMAGE_FRAGMENT}
`;

const GET_CONTENT_WITH_PRODUCTS = gql`
  query GetMotorsokProductCategoryWithProducts(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
    content {
      ... on MotorsokProductCategory {
        ...Metadata
        name
        id
        description
        blocks {
          topContainer {
            ...AllBlockTypes
          }
          bottomContainer {
            ...AllBlockTypes
          }
        }
        children {
          nodes {
            name
            url
            id
            images {
              ...CategoryImage
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
      }
    }
    productSearch(
      query: $query
      facets: $facets
      sortBy: $sorts
      first: $first
    ) {
      ...ProductSearchResult
    }
  }
  ${CATEGORY_IMAGE_FRAGMENT}
`;

const allowChildCategories = (searchParams: SearchParams) => {
  const sortBy = searchParams['sort_by'];
  return sortBy !== 'manual' && sortBy !== undefined;
};

export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const website = await getWebsite();

  const { content: currentCategoryContent } = await getCurrentCategoryContent({
    params,
  });
  // Always fetch Motorsök category to get brands for dropdowns
  const { content: motorsokCategory } = await getMotorsokCategory();

  const slugArray = params.slug || [];
  const categorySegments = getCategorySegments(slugArray);
  const shouldShowProducts = categorySegments.length >= 3;

  // Fetch products at level 3 and beyond
  let productSearch: any = null;
  let categoryId: string | undefined;

  if (shouldShowProducts) {
    const result = await getContent({
      params,
      id: '',
      searchParams,
      filters: website.filters,
      includeChildren: allowChildCategories(searchParams),
    });
    productSearch = result.productSearch;
    categoryId = result.content?.id;
  }

  // Filter level 1 categories (brands) for dropdowns
  const allChildren = motorsokCategory.children?.nodes || [];
  const level1CategoriesForDropdowns = allChildren.filter(isLevel1Category);

  const breadcrumbs = [
    ...currentCategoryContent.parents.nodes,
    {
      name: currentCategoryContent.name,
      selected: true,
      url: '',
    } as NavigationLink,
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <CascadingCategoryDropdowns
        level1Categories={level1CategoriesForDropdowns}
      />

      {currentCategoryContent.blocks.topContainer && (
        <BlockContainer
          priority
          blocks={currentCategoryContent.blocks.topContainer}
          className="mb-10"
        />
      )}
      {(!currentCategoryContent.blocks.topContainer ||
        currentCategoryContent.blocks.topContainer.length === 0) && (
        <Heading1 className="mb-5">{currentCategoryContent.name}</Heading1>
      )}

      {shouldShowProducts && productSearch && (
        <ProductSearchWithControls
          showFilter={true}
          products={productSearch}
          totalCount={productSearch.totalCount}
          showLoadMore={true}
          sticky={true}
          categoryId={categoryId}
          subCategories={currentCategoryContent.children?.nodes || []}
          sorts={(() => {
            if (currentCategoryContent.children?.nodes.length > 0) {
              const filteredSorts = SortCriteria.filter(
                (item) => item.field !== 'manual'
              );
              // Mark the first available option as selected when manual is not available
              if (filteredSorts.length > 0) {
                filteredSorts[0].selected = true;
              }
              return filteredSorts;
            }
            return SortCriteria;
          })()}
          groupByCategory={shouldShowProducts}
          belowControls={
            currentCategoryContent.blocks.betweenContainer ? (
              <BlockContainer
                priority
                blocks={currentCategoryContent.blocks.betweenContainer}
                className="my-10"
              />
            ) : null
          }
        />
      )}

      {currentCategoryContent.blocks.bottomContainer && (
        <BlockContainer
          priority
          blocks={currentCategoryContent.blocks.bottomContainer}
          className="mt-12"
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { content } = await getCurrentCategoryContent({ params });
  return createMetadata(content.metadata);
}

/**
 * Fetches the Motorsök category directly to get its children for the dropdowns.
 */
async function getMotorsokCategory() {
  const result = await queryServer({
    query: GET_MAIN_CATEGORY,
    url: '/motorsok',
    variables: {},
    fetchPolicy: 'no-cache',
  });
  return result;
}

async function getCurrentCategoryContent({ params }: { params: any }) {
  const currentUrl = params.slug?.join('/') || '';
  const result = await queryServer({
    query: GET_MAIN_CATEGORY,
    url: currentUrl,
    variables: {},
  });
  return result;
}

async function getContent({
  params,
  id,
  searchParams,
  filters,
  includeChildren,
}: {
  params: any;
  id: string;
  searchParams: SearchParams;
  filters: { field: string }[];
  includeChildren: boolean;
}) {
  const contentResult = await queryServer({
    query: GET_MAIN_CATEGORY,
    url: params.slug?.join('/'),
    variables: {},
  });

  const categoryId = contentResult?.content?.id || id;
  if (!categoryId) {
    throw new Error('Category ID not found');
  }

  const productParams = new ProductSearchQueryInput({
    categoryId,
    includeChildren,
  });

  const userSorts = SearchSortItemInput.fromSearchParams(searchParams);
  const defaultSorts =
    userSorts.length === 0 ? [{ field: '#manual', order: 'ASCENDING' }] : [];

  const result = await queryServer({
    query: GET_CONTENT_WITH_PRODUCTS,
    url: params.slug?.join('/'),
    variables: {
      query: productParams,
      facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
      sorts: [...userSorts, ...defaultSorts],
      first: PaginationOptions.PageSize,
    },
  });

  // Fallback: Try with children if no products found
  if (
    result.productSearch?.totalCount === 0 &&
    defaultSorts.length > 0 &&
    !includeChildren
  ) {
    const fallbackParams = new ProductSearchQueryInput({
      categoryId,
      includeChildren: true,
    });

    const fallbackResult = await queryServer({
      query: GET_CONTENT_WITH_PRODUCTS,
      url: params.slug?.join('/'),
      variables: {
        query: fallbackParams,
        facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
        sorts: userSorts,
        first: PaginationOptions.PageSize,
      },
    });

    if (fallbackResult.productSearch?.totalCount > 0) {
      return fallbackResult;
    }
  }

  return result;
}
