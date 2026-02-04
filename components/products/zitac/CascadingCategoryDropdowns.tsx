'use client';

import ArrowDown from 'components/icons/zitac/arrow-down';
import Engine from 'components/icons/zitac/engine';
import { CategoryItem } from 'models/category';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPathSegments,
  isLevel1Category,
  matchesPath,
  normalizeUrlPath,
} from 'utils/motorsok';

interface CascadingCategoryDropdownsProps {
  level1Categories: CategoryItem[];
}

interface CategoryOption {
  id: string;
  name: string;
  url?: string;
}

interface LevelState {
  categories: CategoryOption[];
  selected: CategoryOption | null;
  loading: boolean;
}

/**
 * Finds a category in an array that matches the current path.
 */
function findMatchingCategory(
  categories: CategoryOption[],
  currentPath: string,
  pathSegments: string[],
  targetLevel: number
): CategoryOption | null {
  return (
    categories.find(
      (cat) =>
        cat.url && matchesPath(cat.url, currentPath, pathSegments, targetLevel)
    ) || null
  );
}

function findLevel1Category(
  categories: CategoryItem[],
  currentPath: string,
  pathSegments: string[]
): CategoryItem | null {
  if (pathSegments.length < 2) return null;
  return (
    categories.find((cat) => {
      if (!cat.url) return false;
      const catPath = normalizeUrlPath(cat.url);
      return pathSegments.length === 2
        ? currentPath === catPath
        : currentPath.startsWith(catPath + '/');
    }) || null
  );
}

export default function CascadingCategoryDropdowns({
  level1Categories,
}: CascadingCategoryDropdownsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const validLevel1Categories = useMemo(() => {
    return level1Categories.filter(isLevel1Category);
  }, [level1Categories]);

  const [level1Selected, setLevel1Selected] = useState<CategoryOption | null>(
    null
  );
  const [level2, setLevel2] = useState<LevelState>({
    categories: [],
    selected: null,
    loading: false,
  });
  const [level3, setLevel3] = useState<LevelState>({
    categories: [],
    selected: null,
    loading: false,
  });
  const [level4, setLevel4] = useState<LevelState>({
    categories: [],
    selected: null,
    loading: false,
  });
  const [level5, setLevel5] = useState<LevelState>({
    categories: [],
    selected: null,
    loading: false,
  });
  const [categoryCache, setCategoryCache] = useState<
    Map<string, CategoryOption[]>
  >(new Map());

  const fetchCategoryChildren = useCallback(
    async (
      categoryId: string,
      categoryUrl: string | undefined,
      setCategories: (categories: CategoryOption[]) => void,
      setSelected: (selected: CategoryOption | null) => void,
      setLoading: (loading: boolean) => void,
      targetLevel: number
    ) => {
      const cacheKey = `${categoryId}-${categoryUrl || ''}`;

      if (categoryCache.has(cacheKey)) {
        const cached = categoryCache.get(cacheKey)!;
        setCategories(cached);
        const currentPath = normalizeUrlPath(pathname);
        const found = findMatchingCategory(
          cached,
          currentPath,
          getPathSegments(pathname),
          targetLevel
        );
        setSelected(found);
        return found;
      }

      setLoading(true);
      try {
        const urlParam = categoryUrl
          ? `?url=${encodeURIComponent(categoryUrl)}`
          : '';
        const response = await fetch(
          `/api/category/${categoryId}/children${urlParam}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch categories');
        }
        const data = await response.json();
        const children = data.children || [];

        setCategoryCache((prev) => new Map(prev).set(cacheKey, children));
        setCategories(children);

        const currentPath = normalizeUrlPath(pathname);
        const found = findMatchingCategory(
          children,
          currentPath,
          getPathSegments(pathname),
          targetLevel
        );
        setSelected(found);
        return found;
      } catch (error) {
        console.error(`Error fetching level ${targetLevel} categories:`, error);
        setCategories([]);
        setSelected(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [pathname, categoryCache]
  );

  const fetchLevel5Categories = useCallback(
    async (categoryId: string, categoryUrl?: string) => {
      await fetchCategoryChildren(
        categoryId,
        categoryUrl,
        (categories) => setLevel5((prev) => ({ ...prev, categories })),
        (selected) => setLevel5((prev) => ({ ...prev, selected })),
        (loading) => setLevel5((prev) => ({ ...prev, loading })),
        5
      );
    },
    [fetchCategoryChildren]
  );

  const fetchLevel4Categories = useCallback(
    async (categoryId: string, categoryUrl?: string, skipLevel5 = false) => {
      const found = await fetchCategoryChildren(
        categoryId,
        categoryUrl,
        (categories) => setLevel4((prev) => ({ ...prev, categories })),
        (selected) => setLevel4((prev) => ({ ...prev, selected })),
        (loading) => setLevel4((prev) => ({ ...prev, loading })),
        4
      );
      if (!skipLevel5) {
        if (found) {
          fetchLevel5Categories(found.id, found.url);
        } else {
          setLevel5({ categories: [], selected: null, loading: false });
        }
      }
    },
    [fetchCategoryChildren, fetchLevel5Categories]
  );

  const fetchLevel3Categories = useCallback(
    async (categoryId: string, categoryUrl?: string, skipLevel4 = false) => {
      const found = await fetchCategoryChildren(
        categoryId,
        categoryUrl,
        (categories) => setLevel3((prev) => ({ ...prev, categories })),
        (selected) => setLevel3((prev) => ({ ...prev, selected })),
        (loading) => setLevel3((prev) => ({ ...prev, loading })),
        3
      );
      if (!skipLevel4) {
        if (found) {
          fetchLevel4Categories(found.id, found.url);
        } else {
          setLevel4({ categories: [], selected: null, loading: false });
        }
      }
    },
    [fetchCategoryChildren, fetchLevel4Categories]
  );

  const fetchLevel2Categories = useCallback(
    async (categoryId: string, categoryUrl?: string, skipLevel3 = false) => {
      const found = await fetchCategoryChildren(
        categoryId,
        categoryUrl,
        (categories) => setLevel2((prev) => ({ ...prev, categories })),
        (selected) => setLevel2((prev) => ({ ...prev, selected })),
        (loading) => setLevel2((prev) => ({ ...prev, loading })),
        2
      );
      if (!skipLevel3) {
        if (found) {
          fetchLevel3Categories(found.id, found.url);
        } else {
          setLevel3({ categories: [], selected: null, loading: false });
        }
      }
    },
    [fetchCategoryChildren, fetchLevel3Categories]
  );

  useEffect(() => {
    if (validLevel1Categories.length === 0) return;

    const currentPath = normalizeUrlPath(pathname);
    const pathSegments = getPathSegments(pathname);

    if (pathSegments.length >= 2) {
      const found = findLevel1Category(
        validLevel1Categories,
        currentPath,
        pathSegments
      );

      if (found) {
        const newLevel1 = { id: found.id, name: found.name, url: found.url };
        const needsUpdate = !level1Selected || level1Selected.id !== found.id;

        if (needsUpdate) {
          setLevel1Selected(newLevel1);
          fetchLevel2Categories(found.id, found.url, pathSegments.length === 2);
          return;
        }

        if (level2.categories.length === 0 && !level2.loading) {
          fetchLevel2Categories(
            level1Selected.id,
            level1Selected.url,
            pathSegments.length === 2
          );
        } else if (level2.categories.length > 0) {
          const level2Found = findMatchingCategory(
            level2.categories,
            currentPath,
            pathSegments,
            2
          );
          if (level2Found && level2Found.id !== level2.selected?.id) {
            setLevel2((prev) => ({ ...prev, selected: level2Found }));
            fetchLevel3Categories(level2Found.id, level2Found.url);
          } else if (!level2Found && level2.selected) {
            setLevel2((prev) => ({ ...prev, selected: null }));
            setLevel3({ categories: [], selected: null, loading: false });
          }
        }

        if (pathSegments.length >= 3 && level3.categories.length > 0) {
          const level3Found = findMatchingCategory(
            level3.categories,
            currentPath,
            pathSegments,
            3
          );
          if (level3Found && level3Found.id !== level3.selected?.id) {
            setLevel3((prev) => ({ ...prev, selected: level3Found }));
            fetchLevel4Categories(level3Found.id, level3Found.url);
          } else if (!level3Found && level3.selected) {
            setLevel3((prev) => ({ ...prev, selected: null }));
            setLevel4({ categories: [], selected: null, loading: false });
          }
        }

        if (pathSegments.length >= 4 && level4.categories.length > 0) {
          const level4Found = findMatchingCategory(
            level4.categories,
            currentPath,
            pathSegments,
            4
          );
          if (level4Found && level4Found.id !== level4.selected?.id) {
            setLevel4((prev) => ({ ...prev, selected: level4Found }));
            fetchLevel5Categories(level4Found.id, level4Found.url);
          } else if (!level4Found && level4.selected) {
            setLevel4((prev) => ({ ...prev, selected: null }));
            setLevel5({ categories: [], selected: null, loading: false });
          }
        }

        if (pathSegments.length >= 5 && level5.categories.length > 0) {
          const level5Found = findMatchingCategory(
            level5.categories,
            currentPath,
            pathSegments,
            5
          );
          if (level5Found && level5Found.id !== level5.selected?.id) {
            setLevel5((prev) => ({ ...prev, selected: level5Found }));
          }
        }
      }
    }
  }, [
    pathname,
    validLevel1Categories,
    level1Selected,
    level2,
    level3,
    level4,
    level5,
    fetchLevel2Categories,
    fetchLevel3Categories,
    fetchLevel4Categories,
    fetchLevel5Categories,
  ]);

  const handleLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === '') {
      setLevel1Selected(null);
      setLevel2({ categories: [], selected: null, loading: false });
      setLevel3({ categories: [], selected: null, loading: false });
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      return;
    }
    const option = displayCategories.find((cat) => cat.id === selectedId);
    if (option) {
      const categoryOption: CategoryOption = {
        id: option.id,
        name: option.name,
        url: option.url,
      };
      setLevel1Selected(categoryOption);
      setLevel2({ categories: [], selected: null, loading: false });
      setLevel3({ categories: [], selected: null, loading: false });
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      if (categoryOption.url)
        router.push(categoryOption.url, { scroll: false });
      fetchLevel2Categories(categoryOption.id, categoryOption.url, true);
    }
  };

  const handleLevel2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === '') {
      setLevel2((prev) => ({ ...prev, selected: null }));
      setLevel3({ categories: [], selected: null, loading: false });
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      return;
    }
    const option = level2.categories.find((cat) => cat.id === selectedId);
    if (option) {
      setLevel2((prev) => ({ ...prev, selected: option }));
      setLevel3({ categories: [], selected: null, loading: false });
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      if (option.url) router.push(option.url, { scroll: false });
      const currentPathSegments = getPathSegments(pathname);
      fetchLevel3Categories(
        option.id,
        option.url,
        currentPathSegments.length === 3
      );
    }
  };

  const handleLevel3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === '') {
      setLevel3((prev) => ({ ...prev, selected: null }));
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      return;
    }
    const option = level3.categories.find((cat) => cat.id === selectedId);
    if (option) {
      setLevel3((prev) => ({ ...prev, selected: option }));
      setLevel4({ categories: [], selected: null, loading: false });
      setLevel5({ categories: [], selected: null, loading: false });
      if (option.url) router.push(option.url, { scroll: false });
      fetchLevel4Categories(option.id, option.url);
    }
  };

  const handleLevel4Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === '') {
      setLevel4((prev) => ({ ...prev, selected: null }));
      setLevel5({ categories: [], selected: null, loading: false });
      return;
    }
    const option = level4.categories.find((cat) => cat.id === selectedId);
    if (option) {
      setLevel4((prev) => ({ ...prev, selected: option }));
      setLevel5({ categories: [], selected: null, loading: false });
      if (option.url) router.push(option.url, { scroll: false });
      fetchLevel5Categories(option.id, option.url);
    }
  };

  const handleLevel5Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId || selectedId === '') {
      setLevel5((prev) => ({ ...prev, selected: null }));
      return;
    }
    const option = level5.categories.find((cat) => cat.id === selectedId);
    if (option) {
      setLevel5((prev) => ({ ...prev, selected: option }));
      if (option.url) router.push(option.url, { scroll: false });
    }
  };

  const displayCategories =
    validLevel1Categories.length > 0 ? validLevel1Categories : level1Categories;

  const renderSelect = (
    options: CategoryOption[],
    selected: CategoryOption | null,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    isLoading: boolean,
    isDisabled: boolean,
    placeholder: string
  ) => {
    return (
      <div className="relative">
        <select
          value={selected?.id || ''}
          onChange={onChange}
          disabled={isDisabled || isLoading}
          className={`w-full cursor-pointer appearance-none rounded border border-gray-300 px-4 py-2.5 pr-10 disabled:cursor-not-allowed disabled:opacity-50 ${
            isLoading ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {isLoading ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <ArrowDown />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto mb-10">
      <div className="af:border-af-orange w-full rounded border border-seasea-blue">
        <span className="text-m af:bg-af-orange flex w-full items-center gap-x-2 bg-seasea-blue px-4 py-4 text-white lg:text-base">
          <div className="h-6 w-6">
            <Engine />
          </div>
          Hitta rätt produkter till din båtmotor
        </span>
        <div className="relative p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative flex-[0.7]">
              {renderSelect(
                displayCategories.map((cat) => ({
                  id: cat.id,
                  name: cat.name,
                  url: cat.url,
                })),
                level1Selected,
                handleLevel1Change,
                false,
                displayCategories.length === 0,
                'Välj fabrikat'
              )}
            </div>

            <div className="relative flex-[0.7]">
              {renderSelect(
                level2.categories,
                level2.selected,
                handleLevel2Change,
                level2.loading,
                !level1Selected,
                'Välj motor'
              )}
            </div>

            <div className="relative flex-1">
              {renderSelect(
                level3.categories,
                level3.selected,
                handleLevel3Change,
                level3.loading,
                !level2.selected,
                'Välj modell'
              )}
            </div>

            <div className="relative flex-1">
              {renderSelect(
                level4.categories,
                level4.selected,
                handleLevel4Change,
                level4.loading,
                !level3.selected ||
                  (!level4.loading && level4.categories.length === 0),
                'Välj typ'
              )}
            </div>

            <div className="relative flex-1">
              {renderSelect(
                level5.categories,
                level5.selected,
                handleLevel5Change,
                level5.loading,
                !level4.selected ||
                  (!level5.loading && level5.categories.length === 0),
                'Välj variant'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
