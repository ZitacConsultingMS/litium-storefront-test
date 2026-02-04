import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import SubCategory from 'components/productSearch/zitac/SubCategory';
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

const CATEGORY_IMAGE_FRAGMENT = gql`
  fragment CategoryImage on IImageItem {
    url
  }
`;

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

const allowChildCategories = (searchParams: SearchParams) => {
  const sortBy = searchParams['sort_by'];
  // For Sweden_webb_categoryProductCategory, default to manual sorting (exclude children)
  // Only include children when explicitly sorting by something other than manual
  return sortBy !== 'manual' && sortBy !== undefined;
};

/**
 * Renders a category page.
 * @param params the route param which contains the `slug`. For example:
 * /man/tops => { params: { slug: ['man', 'tops'] } }
 * @param searchParams an object contains the query parameter. For example:
 * { Size: [ 'M', 'S' ], Price: '300-600' }
 * @returns
 */
export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const website = await getWebsite();
  const { content, productSearch } = await getContent({
    params,
    id: searchParams.id,
    searchParams,
    filters: website.filters,
    includeChildren: allowChildCategories(searchParams),
  });

  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: content.name,
      selected: true,
      url: '',
    };
    return [...content.parents.nodes, currentPage];
  })();
  const sorts = (() => {
    if (content.children.nodes.length > 0) {
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
  })();

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      {content.blocks.topContainer && (
        <BlockContainer
          priority
          blocks={content.blocks.topContainer}
          className="mb-10"
        ></BlockContainer>
      )}
      {(!content.blocks.topContainer ||
        content.blocks.topContainer.length === 0) && (
        <Heading1 className="mb-5">{content.name}</Heading1>
      )}
      <div className="container mx-auto px-5">
        {content.children.nodes.length > 0 && (
          <SubCategory
            subCategories={content.children.nodes}
            layout="vertical"
          />
        )}
      </div>
      <ProductSearchWithControls
        description={
          content.blocks.topContainer && content.blocks.topContainer.length > 0
            ? ''
            : content.description
        }
        showFilter={true}
        products={productSearch}
        totalCount={productSearch.totalCount}
        showLoadMore={true}
        sticky={true}
        categoryId={content.id}
        subCategories={content.children.nodes}
        sorts={sorts}
        belowControls={
          content.blocks.betweenContainer ? (
            <BlockContainer
              priority
              blocks={content.blocks.betweenContainer}
              className="my-10"
            ></BlockContainer>
          ) : null
        }
      />
      {content.blocks.bottomContainer && (
        <BlockContainer
          priority
          blocks={content.blocks.bottomContainer}
          className="mt-12"
        ></BlockContainer>
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
  const resolvedSearchParams = await searchParams;
  const website = await getWebsite();
  const { content } = await getContent({
    params,
    id: resolvedSearchParams.id,
    searchParams: resolvedSearchParams,
    filters: website.filters,
    includeChildren: allowChildCategories(resolvedSearchParams),
  });
  return createMetadata(content.metadata);
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
  const productParams = new ProductSearchQueryInput({
    categoryId: id,
    includeChildren,
  });

  const userSorts = SearchSortItemInput.fromSearchParams(searchParams);
  // For Sweden_webb_categoryProductCategory, default to manual sorting only when no user sorts are present
  const defaultSorts =
    userSorts.length === 0 ? [{ field: '#manual', order: 'ASCENDING' }] : [];

  const result = await queryServer({
    query: GET_CONTENT,
    url: params.slug?.join('/'),
    variables: {
      query: productParams,
      facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
      sorts: [...userSorts, ...defaultSorts],
      first: PaginationOptions.PageSize,
    },
  });

  // If no products found with manual sorting, try with children included
  if (
    result.productSearch?.totalCount === 0 &&
    defaultSorts.length > 0 &&
    !includeChildren
  ) {
    const fallbackParams = new ProductSearchQueryInput({
      categoryId: id,
      includeChildren: true,
    });

    const fallbackResult = await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/'),
      variables: {
        query: fallbackParams,
        facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
        sorts: userSorts, // No manual sorting when including children
        first: PaginationOptions.PageSize,
      },
    });

    if (fallbackResult.productSearch?.totalCount > 0) {
      return fallbackResult;
    }
  }

  return result;
}

const GET_CONTENT = gql`
  query GetSweden_webb_categoryProductCategory(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
    content {
      ... on Sweden_webb_categoryProductCategory {
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
          betweenContainer {
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
