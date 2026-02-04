import { gql } from '@apollo/client';

export const CATEGORY_SEARCH_RESULT_FRAGMENT = gql`
  fragment CategorySearchResult on CategorySearchConnection {
    totalCount
    pageInfo {
      hasNextPage
    }
    nodes {
      name
      url
      id
      description
      ... on CategoryProductCategory {
        fields {
          _seoDescription
        }
      }
    }
  }
`;

export const PAGE_SEARCH_RESULT_FRAGMENT = gql`
  fragment PageSearchResult on PageSearchConnection {
    totalCount
    pageInfo {
      hasNextPage
    }
    nodes {
      name
      url
      id
      ... on ArticlePage {
        fields {
          introduction
        }
      }
    }
  }
`;

export const PRODUCT_SEARCH_RESULT_FRAGMENT = gql`
  fragment ProductSearchResult on ProductSearchConnection {
    facets {
      field
      name
      ... on DistinctFacet {
        items {
          name
          count
          selected
          value
        }
      }
      ... on RangeFacet {
        items {
          min
          max
          selectedMin
          selectedMax
          selected
        }
      }
    }
    totalCount
    pageInfo {
      hasNextPage
    }
    nodes {
      ...ProductCard
    }
  }
`;
