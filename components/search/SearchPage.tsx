'use client';
import { SearchContentType } from 'models/search';
import { SearchParams } from 'models/searchParams';
import SearchSortItemInput, {
  SearchSortOrder,
} from 'models/searchSortInputItem';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildUrl } from 'services/urlService';
import SearchInput from './SearchInput';
import SearchResult from './SearchResult';

const SortCriteria: SearchSortItemInput[] = [
  {
    field: 'score',
    order: SearchSortOrder.DESCENDING,
    name: 'productsearchresult.sortcriteria.score.descending',
  },
  {
    field: 'popular',
    order: SearchSortOrder.ASCENDING,
    name: 'productsearchresult.sortcriteria.popular',
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
 * Represents the search result page.
 * @param result the initial search result to display
 * @returns
 */
function SearchPage({ result }: { result?: SearchContentType }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const hasFilter =
    !!searchParams.get('q') &&
    Object.keys(SearchParams.fromReadonlyURLSearchParams(searchParams)).length >
      2;
  useEffect(() => {
    const textFromUrl = searchParams.get('q') || '';
    setText(textFromUrl);

    const tabIndexFromUrl = Number(searchParams.get('tab_index')) || 0;
    setActiveTab(tabIndexFromUrl);
  }, [searchParams]);

  return (
    <div className="container mx-auto min-h-[550px] px-5">
      <SearchInput
        id="searchPageInput"
        value={text}
        onChange={(value) => setText(value)}
        onEnterKeyDown={() =>
          router.push(
            buildUrl(
              pathname,
              searchParams,
              {
                q: text,
                tab_index: activeTab,
              },
              true
            )
          )
        }
      />
      <SearchResult
        result={result}
        hasFilter={hasFilter}
        sorts={SortCriteria}
      />
    </div>
  );
}

export default SearchPage;
