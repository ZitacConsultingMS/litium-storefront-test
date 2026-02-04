import { gql } from '@apollo/client';
import Breadcrumb from 'components/Breadcrumb';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import SubCategory from 'components/productSearch/SubCategory';
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
      return SortCriteria.filter((item) => item.field !== 'manual');
    }
    return SortCriteria;
  })();

  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={content.blocks.top}
        className="mb-4"
      ></BlockContainer>
      <div className="container mx-auto px-5">
        <Breadcrumb breadcrumbs={breadcrumbs}></Breadcrumb>
        <Heading1 className="mb-5">{content.name}</Heading1>
        {!!content.children?.nodes && content.children.nodes.length > 0 && (
          <SubCategory subCategories={content.children.nodes} />
        )}
        <ProductSearchResult
          products={productSearch}
          totalCount={productSearch.totalCount}
          showLoadMore={true}
          sticky={true}
          categoryId={content.id}
          sorts={sorts}
        />
      </div>
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const website = await getWebsite();
  const { content } = await getContent({
    params,
    id: searchParams.id,
    searchParams,
    filters: website.filters,
    includeChildren: allowChildCategories(searchParams),
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
      sorts: [
        ...SearchSortItemInput.fromSearchParams(searchParams),
        ...SearchSortItemInput.defaultProductSorting,
      ],
      first: PaginationOptions.PageSize,
    },
  });
}

const GET_CONTENT = gql`
  query GetCategoryProductCategory(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
    content {
      ... on CategoryProductCategory {
        ...Metadata
        name
        id
        blocks {
          top {
            ...AllBlockTypes
          }
        }
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
