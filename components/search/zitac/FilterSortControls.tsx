'use client';

import { SortResultItem } from 'models/filter';
import SearchSortItemInput from 'models/searchSortInputItem';
import { useState } from 'react';
import FacetedSearchSidebar from './FacetedSearchSidebar';
import FilterButton from './FilterButton';
import SortDropdown from './SortDropdown';

interface FilterSortControlsProps {
  showFilter?: boolean;
  sorts?: SearchSortItemInput[];
  selectedOption?: (options: SortResultItem[]) => SortResultItem;
  onSortCriteriaChange: (option: SortResultItem) => void;
  selectedFilterCount: number;
  facets: any[];
  subCategories?: any[];
  onFacetedChange: (value: string, groupId: string) => void;
  clearFilter: () => void;
  className?: string;
}

export default function FilterSortControls({
  showFilter = true,
  sorts,
  selectedOption,
  onSortCriteriaChange,
  selectedFilterCount,
  facets,
  subCategories,
  onFacetedChange,
  clearFilter,
  className = '',
}: FilterSortControlsProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Filter Button and Sort Dropdown - Centered */}
      <div
        className={`my-10 flex items-center justify-center gap-4 ${className}`}
      >
        {showFilter && (
          <FilterButton
            selectedFilterCount={selectedFilterCount}
            onClick={() => setIsSidebarOpen(true)}
          />
        )}
        {sorts && sorts.length > 0 && (
          <SortDropdown
            sorts={sorts}
            selectedOption={selectedOption}
            onSortCriteriaChange={onSortCriteriaChange}
          />
        )}
      </div>

      {/* Sidebar */}
      {showFilter && (
        <FacetedSearchSidebar
          facets={facets}
          subCategories={subCategories}
          selectedFilterCount={selectedFilterCount}
          onFacetedChange={onFacetedChange}
          clearFilter={clearFilter}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
