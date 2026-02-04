import { gql } from '@apollo/client';
import Breadcrumb from 'components/Breadcrumb';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import ProductSearchResult from 'components/search/ProductSearchResult';
import { NavigationLink } from 'models/navigation';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchFacetItemInput } from 'models/searchFacetItemInput';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput, {
  SearchSortOrder,
} from 'models/searchSortInputItem';
import { Metadata } from 'next';
import { Fragment } from 'react';
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
/**
 * Renders a product list page.
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
  const content = await getContent({
    params,
  });
  const productListId =
    content.fields?.productList && content.fields?.productList.length > 0
      ? content.fields.productList[0]?.id
      : '';
  let products;
  if (productListId) {
    products = await getProducts({
      params,
      searchParams,
      filters: website.filters,
      productListId,
    });
  }

  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: content.name,
      selected: true,
      url: '',
    };
    return [...content.parents?.nodes, currentPage];
  })();
  const sorts = SortCriteria;

  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={content.blocks.main}
        className="mb-4"
      ></BlockContainer>
      <div className="container mx-auto px-5">
        <Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>
        {content.name && <Heading1 className="mb-5">{content.name}</Heading1>}
        {productListId && products?.totalCount > 0 && (
          <ProductSearchResult
            products={products}
            totalCount={products?.totalCount}
            showLoadMore={true}
            sticky={true}
            sorts={sorts}
            productListId={productListId}
          />
        )}
      </div>
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const content = await getContent({
    params,
  });
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

async function getProducts({
  params,
  searchParams,
  filters,
  productListId,
}: {
  params: any;
  searchParams: SearchParams;
  filters: { field: string }[];
  productListId: string;
}) {
  const productParams = new ProductSearchQueryInput({
    includeChildren: false,
    productListId,
  });

  return (
    await queryServer({
      query: GET_PRODUCT_SEARCH,
      url: params.slug?.join('/'),
      variables: {
        query: productParams,
        facets: SearchFacetItemInput.fromSearchParams(searchParams, filters),
        sorts: [
          ...SearchSortItemInput.fromSearchParams(searchParams),
          ...SearchSortItemInput.defaultProductSorting,
        ],
        first: PaginationOptions.PageSize,
      },
    })
  ).productSearch;
}

const GET_CONTENT = gql`
  query GetProductListPage {
    content {
      ... on ProductListPage {
        ...Metadata
        id
        name
        blocks {
          main {
            ...AllBlockTypes
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
        fields {
          productList {
            id
          }
        }
      }
    }
  }
`;

const GET_PRODUCT_SEARCH = gql`
  query GetProductSearch(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
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
