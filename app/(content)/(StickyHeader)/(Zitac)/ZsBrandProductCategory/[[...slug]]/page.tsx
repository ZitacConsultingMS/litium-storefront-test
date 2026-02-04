import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
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
import { getBrandInfoFromImageUrl } from 'services/zitac/customBrandService';
import { PaginationOptions } from 'utils/constants';

const CATEGORY_IMAGE_FRAGMENT = gql`
  fragment CategoryImage on IImageItem {
    url
  }
`;

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

  // brand information from category image
  const imageUrl = content.images?.[0]?.url || null;
  const { brandHeadLine, brandDescription, brandImageUrl } =
    await getBrandInfoFromImageUrl(imageUrl, content.name, content.description);

  // Extract brand name from headline for filtering purposes
  const brandName = brandHeadLine || content.name;

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
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="container mx-auto px-5">
        {content.children.nodes.length > 0 && (
          <SubCategory subCategories={content.children.nodes} />
        )}
      </div>
      <ProductSearchWithControls
        heading={brandHeadLine}
        description={brandDescription}
        breadcrumbs={breadcrumbs}
        showFilter={true}
        products={productSearch}
        totalCount={productSearch.totalCount}
        showLoadMore={true}
        sticky={false}
        categoryId={content.id}
        subCategories={content.children.nodes}
        sorts={sorts}
        hiddenFacetFields={['brandName']}
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
  query GetZsBrandProductCategory(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
  ) {
    content {
      ... on ZsBrandProductCategory {
        ...Metadata
        name
        id
        description
        images {
          ...CategoryImage
        }
        blocks {
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
