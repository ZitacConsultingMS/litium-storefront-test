import { gql } from '@apollo/client';
import HorizontalProductList from 'components/products/HorizontalProductList';
import { Block } from 'models/block';
import { ContentFieldType } from 'models/content';
import { TextOption } from 'models/option';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import SearchSortItemInput from 'models/searchSortInputItem';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';

export interface ProductsBlockFields extends ContentFieldType {
  title: string | null;
  numberOfProducts: number | null;
  sorting: TextOption[] | null;
  category: {
    id: string;
  }[];
  productList: {
    id: string;
  }[];
}

interface ProductsBlockProps extends Block {
  fields: ProductsBlockFields;
}

/**
 * A template for ProductsBlock type.
 * @param props a ProductsBlockProps input param.
 * @returns
 */
export default async function ProductsBlock(props: ProductsBlockProps) {
  const { title, category, productList, numberOfProducts, sorting } =
    props.fields;
  if (category.length === 0 && productList.length === 0) {
    return <></>;
  }
  const sorts = sorting ? [new SearchSortItemInput(sorting[0].value)] : [];
  const params = new ProductSearchQueryInput({
    categoryId: category[0]?.id || '',
    includeChildren: sorting && sorting[0].value !== 'manual' ? true : false,
    productListId: category.length === 0 ? productList[0].id : '',
  });

  const products = await getProducts({
    params,
    numberOfProducts: Math.min(numberOfProducts ?? 15, 100),
    sorts,
  });

  return (
    <Fragment>
      {products.nodes?.length > 0 && (
        <HorizontalProductList
          title={title || ''}
          items={products.nodes}
          className="container mx-auto mt-7 px-5"
        ></HorizontalProductList>
      )}
    </Fragment>
  );
}

async function getProducts({
  params,
  numberOfProducts,
  sorts,
}: {
  params: ProductSearchQueryInput;
  numberOfProducts: number;
  sorts: SearchSortItemInput;
}) {
  return (
    await queryServer({
      query: GET_PRODUCT_SEARCH,
      variables: {
        query: params,
        first: numberOfProducts,
        sorts,
      },
    })
  ).productSearch;
}

const GET_PRODUCT_SEARCH = gql`
  query GetProductSearch(
    $query: ProductSearchQueryInput!
    $first: Int
    $sorts: [SearchSortItemInput!]
  ) {
    productSearch(query: $query, first: $first, sortBy: $sorts) {
      totalCount
      pageInfo {
        hasNextPage
      }
      nodes {
        ...ProductCard
      }
    }
  }
`;
