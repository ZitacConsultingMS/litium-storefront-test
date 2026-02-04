'use client';
import { gql } from '@apollo/client';
import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { ProductSearchConnection } from 'models/(zitac)/products';
import { ProductSearchQueryInput } from 'models/productSearchQueryInput';
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
  searchResultPage?: boolean;
}

/**
 * Renders a product list.
 * @param props a product list input.
 */
function ProductList(props: ProductListProps) {
  const {
    showBuyButton = true,
    showLoadMoreButton = true,
    onClick,
    pageSize = PaginationOptions.PageSize,
    categoryId,
    productListId,
    searchResultPage = false,
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
    const userSorts = SearchSortItemInput.fromSearchParams(param);
    const defaultSorts = categoryId && userSorts.length === 0 
      ? SearchSortItemInput.defaultProductSorting 
      : [];
    const sorts = [...userSorts, ...defaultSorts];
    
    const sortBy = param['sort_by'];
    const hasManualInSorts = sorts.some(sort => sort.field === '#manual' || sort.field === 'manual');
    let finalSorts = sorts;
    let includeChildren = !hasManualInSorts && sortBy !== 'manual';
    
    // If products are loaded and manual sort is from defaults, initial query likely used fallback
    // (includeChildren: true, no manual sort), so match that
    if (products.length > 0 && hasManualInSorts && sortBy !== 'manual' && defaultSorts.length > 0) {
      finalSorts = userSorts;
      includeChildren = true;
    }
    
    const productParam = new ProductSearchQueryInput({
      text: param['q'],
      categoryId,
      includeChildren,
      productListId,
    });
    try {
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
            sorts: finalSorts.length > 0 ? finalSorts : undefined,
          },
        })
      ).productSearch;
      
      const existingArticleNumbers = new Set(
        products.map((p) => p.articleNumber)
      );
      const newProducts = productIncomming.nodes.filter(
        (product: any) => !existingArticleNumbers.has(product.articleNumber)
      );

      setProducts([...products, ...newProducts]);
      setHasNextPage(productIncomming.pageInfo.hasNextPage);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [products, searchParams, pageSize, categoryId, filters, productListId]);

  return (
    <div className="max-sm:-mx-5">
      <div
        className={clsx(
          'max-sm:[&+div>a]:px-5 max-sm:[&>div>div]:px-5 grid grid-cols-2 gap-4',
          searchResultPage
            ? 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5'
            : 'md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        )}
      >
        {products.map((item, index) => (
          <ProductCard
            priority={index < 4}
            {...item}
            key={item.articleNumber}
            showBuyButton={true}
            onClick={onClick}
          />
        ))}
      </div>
      {showLoadMoreButton && hasNextPage && (
        <div className="mx-5 mt-14 text-center">
          <Button
            className="load-more text-lg"
            fluid={true}
            rounded={true}
            disabled={isLoading}
            onClick={handleLoadMore}
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
