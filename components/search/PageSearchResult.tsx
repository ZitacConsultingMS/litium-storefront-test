'use client';
import { gql } from '@apollo/client';
import { Button } from 'components/elements/Button';
import { useTranslations } from 'hooks/useTranslations';
import { PageItemsConnection } from 'models/page';
import { PageSearchQueryInput } from 'models/pageSearchQueryInput';
import { SearchParams } from 'models/searchParams';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { queryClient } from 'services/dataService.client';
import { PaginationOptions } from 'utils/constants';
import SearchItem from './SearchItem';

interface PageSearchResultProps {
  items: PageItemsConnection;
  onItemClick?: () => void;
}

/**
 * Represents the Page search result component
 * @param items page search result to render
 * @param onItemClick an action on click an item.
 * @returns
 */
function PageSearchResult(props: PageSearchResultProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([...props.items.nodes]);
  const [hasNextPage, setHasNextPage] = useState(
    props.items.pageInfo.hasNextPage
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setItems([...props.items.nodes]);
    setHasNextPage(props.items.pageInfo.hasNextPage);
  }, [props, searchParams]);

  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    const param = SearchParams.fromReadonlyURLSearchParams(searchParams);
    const pageParam = new PageSearchQueryInput(param['q']);
    const itemIncomming = (
      await queryClient({
        query: LOAD_MORE,
        variables: {
          query: {
            ...pageParam,
          },
          first: PaginationOptions.PageSize,
          after: String(items.length),
        },
      })
    ).pageSearch;
    setItems([...items, ...itemIncomming.nodes]);
    setHasNextPage(itemIncomming.pageInfo.hasNextPage);
    setIsLoading(false);
  }, [searchParams, items]);
  const t = useTranslations();

  return (
    <div>
      {items.map((node) => {
        return (
          <SearchItem
            key={node.url}
            url={node.url}
            name={node.name}
            description={node?.fields?.introduction}
            linkLabel={`${
              typeof window !== 'undefined' && window.location.origin
            }${node.url}`}
            onClick={props.onItemClick}
          />
        );
      })}
      {hasNextPage && (
        <div className="mx-5 mt-5 text-center">
          <Button
            className="p-2 text-xl sm:w-80"
            fluid={true}
            rounded={true}
            disabled={isLoading}
            onClick={() => {
              handleLoadMore();
            }}
            data-testid="searchitems__loadMore"
          >
            {isLoading
              ? t('pagesearchresult.button.loading')
              : t('pagesearchresult.button.loadmore')}
          </Button>
        </div>
      )}
    </div>
  );
}

const LOAD_MORE = gql`
  query SearchPage($query: PageSearchQueryInput!, $first: Int, $after: String) {
    pageSearch(query: $query, first: $first, after: $after) {
      ...PageSearchResult
    }
  }
`;

export default PageSearchResult;
