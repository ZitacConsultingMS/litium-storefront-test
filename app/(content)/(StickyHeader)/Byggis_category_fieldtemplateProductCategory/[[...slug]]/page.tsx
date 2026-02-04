import { gql } from '@apollo/client';
import ProductSearchResult from 'components/search/zitac/ProductSearchResult';
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

const SortCriteria: SearchSortItemInput[] = [
  {
    field: 'popular',
    name: 'productsearchresult.sortcriteria.popular',
  },
  {
    field: 'manual',
    name: 'productsearchresult.sortcriteria.manual',
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
  return sortBy !== 'manual';
};

/**
 * Renders a category page.
 * @param params the route param which contains the `slug`. For example:
 * /man/tops => { params: { slug: ['man', 'tops'] } }
 * @param searchParams an object contains the query parameter. For example:
 * { Size: [ 'M', 'S' ], Price: '300-600' }
 * @returns
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const website = await getWebsite();
  const { content, productSearch } = await getContent({
    params,
    id: resolvedSearchParams.id,
    searchParams: resolvedSearchParams,
    filters: website.filters,
    includeChildren: allowChildCategories(resolvedSearchParams),
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
      return SortCriteria.filter((item) => item.field !== 'manual');
    }
    return SortCriteria;
  })();

  return (
    <ProductSearchResult
      heading={content.name}
      description={content.description}
      breadcrumbs={breadcrumbs}
      products={productSearch}
      totalCount={productSearch.totalCount}
      showLoadMore={true}
      sticky={true}
      categoryId={content.id}
      subCategories={content.children.nodes}
      sorts={sorts}
    />
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
  return await queryServer({
    query: GET_CONTENT,
    url: params.slug?.join('/'),
    variables: {
      query: productParams,
      facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
      sorts: SearchSortItemInput.fromSearchParams(searchParams),
      first: PaginationOptions.PageSize,
    },
  });
}

const GET_CONTENT = gql`
  query GetByggis_category_fieldtemplateProductCategory(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
    content {
      ... on Byggis_category_fieldtemplateProductCategory {
        ...Metadata
        name
        id
        description
        children {
          nodes {
            name
            url
            id
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
`;
