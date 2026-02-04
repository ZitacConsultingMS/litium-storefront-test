'use client';
import { gql } from '@apollo/client';
import { Button } from 'components/elements/Button';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
import { ProductSearchConnection } from 'models/products';
import { SearchFacetItemInput } from 'models/searchFacetItemInput';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput from 'models/searchSortInputItem';
import { useSearchParams } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { PaginationOptions } from 'utils/constants';
import ProductCard from './ProductCard';

interface ProductListProps extends ProductSearchConnection {
  showLoadMoreButton?: boolean;
  showBuyButton?: boolean;
  onClick?: () => void;
  pageSize?: number;
  categoryId?: string;
  productListId?: string;
}

/**
 * Renders a product list.
 * @param props a product list input.
 */
function ProductList(props: ProductListProps) {
  const {
    showBuyButton = false,
    showLoadMoreButton = true,
    onClick,
    pageSize = PaginationOptions.PageSize,
    categoryId,
    productListId,
  } = props;
  const filters = useContext(WebsiteContext).filters;
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([...props.nodes]);
  const [hasNextPage, setHasNextPage] = useState(props.pageInfo.hasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setProducts([...props.nodes]);
    setHasNextPage(props.pageInfo.hasNextPage);
  }, [props, searchParams]);

  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    const param = SearchParams.fromReadonlyURLSearchParams(searchParams);
    const productParam = new ProductSearchQueryInput({
      text: param['q'],
      categoryId,
      includeChildren: true,
      productListId,
    });
    const productIncomming = (
      await queryClient({
        query: LOAD_NEXT_PAGE,
        variables: {
          query: { ...productParam },
          facets: SearchFacetItemInput.fromReadonlyURLSearchParams(
            searchParams,
            filters
          ),
          first: pageSize,
          after: String(products.length),
          sorts: [
            ...SearchSortItemInput.fromSearchParams(param),
            ...SearchSortItemInput.defaultProductSorting,
          ],
        },
      })
    ).productSearch;
    setProducts([...products, ...productIncomming.nodes]);
    setHasNextPage(productIncomming.pageInfo.hasNextPage);
    setIsLoading(false);
  }, [products, searchParams, pageSize, categoryId, filters, productListId]);

  return (
    <div className="max-sm:-mx-5">
      <div className="max-sm:[&+div>a]:px-5 max-sm:[&>div>div]:px-5 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {products.map((item, index) => (
          <ProductCard
            priority={index < 4}
            {...item}
            key={item.articleNumber}
            showBuyButton={showBuyButton}
            onClick={onClick}
          />
        ))}
      </div>
      {showLoadMoreButton && hasNextPage && (
        <div className="mx-5 mt-5 text-center">
          <Button
            className="p-2 text-xl sm:w-80"
            fluid={true}
            rounded={true}
            disabled={isLoading}
            onClick={() => {
              handleLoadMore();
            }}
            data-testid="product-list__load-more"
          >
            {isLoading
              ? t('productlist.button.loading')
              : t('productlist.button.loadmore')}
          </Button>
        </div>
      )}
    </div>
  );
}

const LOAD_NEXT_PAGE = gql`
  query GetProductSearch(
    $query: ProductSearchQueryInput!
    $facets: [SearchFacetItemInput!]
    $first: Int
    $after: String
    $sorts: [SearchSortItemInput!]
  ) {
    productSearch(
      query: $query
      facets: $facets
      first: $first
      after: $after
      sortBy: $sorts
    ) {
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

export default ProductList;
