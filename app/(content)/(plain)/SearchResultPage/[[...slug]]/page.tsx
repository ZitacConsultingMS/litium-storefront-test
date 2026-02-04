import { gql } from '@apollo/client';
import SearchPage from 'components/search/SearchPage';
import { CategorySearchQueryInput } from 'models/categorySearchQueryInput';
import { PageSearchQueryInput } from 'models/pageSearchQueryInput';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { SearchFacetItemInput } from 'models/searchFacetItemInput';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import { Metadata } from 'next';
import { queryServer } from 'services/dataService.server';
import { createMetadataFromUrl } from 'services/metadataService.server';
import { get as getWebsite } from 'services/websiteService.server';
import { PaginationOptions } from 'utils/constants';

export default async function Page(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const website = await getWebsite();
  const productParams = new ProductSearchQueryInput({
    text: searchParams['q'],
  });
  const pageParams = new PageSearchQueryInput(searchParams['q']);
  const categoryParams = new CategorySearchQueryInput(searchParams['q']);
  const facets = SearchFacetItemInput.fromSearchParams(
    searchParams,
    website.filters
  );
  const sorts = [
    ...SearchSortItemInput.fromSearchParams(searchParams),
    ...SearchSortItemInput.defaultProductSorting,
  ];
  const result =
    'q' in searchParams && !!searchParams['q']
      ? await search(productParams, categoryParams, pageParams, facets, sorts)
      : null;
  return <SearchPage result={result} />;
}

export async function generateMetadata(props: {
  params: Promise<any>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await props.params;
  return await createMetadataFromUrl(params.slug?.join('/'));
}

async function search(
  productParams: ProductSearchQueryInput,
  categoryParams: CategorySearchQueryInput,
  pageParams: PageSearchQueryInput,
  facets: SearchFacetItemInput[],
  sorts: SearchSortItemInput
) {
  return await queryServer({
    query: SEARCH,
    variables: {
      productQuery: { ...productParams },
      categoryQuery: { ...categoryParams },
      pageQuery: { ...pageParams },
      facets,
      sorts,
      first: PaginationOptions.PageSize,
      after: '0',
    },
  });
}

const SEARCH = gql`
  query Search(
    $productQuery: ProductSearchQueryInput!
    $categoryQuery: CategorySearchQueryInput!
    $pageQuery: PageSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $sorts: [SearchSortItemInput!]
    $first: Int
    $after: String
  ) {
    productSearch(
      query: $productQuery
      facets: $facets
      sortBy: $sorts
      first: $first
      after: $after
    ) {
      ...ProductSearchResult
    }

    pageSearch(query: $pageQuery, first: $first, after: $after) {
      ...PageSearchResult
    }

    categorySearch(query: $categoryQuery, first: $first, after: $after) {
      ...CategorySearchResult
    }
  }
`;
