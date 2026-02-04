'use client';

import { useTranslations } from 'hooks/useTranslations';
import { SortResultItem } from 'models/filter';
import SearchSortItemInput from 'models/searchSortInputItem';
import SortDropdownButton from './SortDropdownButton';

interface SortDropdownProps {
  sorts?: SearchSortItemInput[];
  selectedOption?: (options: SortResultItem[]) => SortResultItem;
  onSortCriteriaChange: (option: SortResultItem) => void;
  className?: string;
}

export default function SortDropdown({
  sorts,
  selectedOption,
  onSortCriteriaChange,
  className,
}: SortDropdownProps) {
  const t = useTranslations();

  const getTextSelector = (option: SortResultItem) => {
    return t(option.name);
  };

  if (!sorts || sorts.length === 0) {
    return null;
  }

  // Convert SearchSortItemInput to SortResultItem format
  const convertedSorts: SortResultItem[] = sorts.map((sort) => ({
    field: sort.field || '',
    order: sort.order || '',
    name: sort.name || '',
    selected: sort.selected || false,
    ...sort,
  }));

  return (
    <SortDropdownButton
      heading={'productsearchresult.sort.title'}
      options={convertedSorts}
      onChange={onSortCriteriaChange}
      textSelector={getTextSelector}
      selectedOptionSelector={selectedOption}
      className={className}
    />
  );
}
