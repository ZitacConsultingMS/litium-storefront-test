'use client';

import { Text } from 'components/elements/Text';
import { Button } from 'components/elements/zitac/Button';
import { useTranslations } from 'hooks/useTranslations';

interface FilterButtonProps {
  selectedFilterCount: number;
  onClick: () => void;
  className?: string;
}

export default function FilterButton({
  selectedFilterCount,
  onClick,
  className = '',
}: FilterButtonProps) {
  const t = useTranslations();

  return (
    <Button
      onClick={onClick}
      className={`animate-pulse-subtle af:bg-af-orange flex items-center gap-2 !rounded bg-seasea-blue text-white hover:brightness-90 ${className}`}
      data-testid="faceted-search__open-button"
      style={{
        animation:
          'float 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite, float-shadow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }}
    >
      <Text>
        {t('productsearchresult.filter.title')}
        {selectedFilterCount > 0 && ` (${selectedFilterCount})`}
      </Text>
    </Button>
  );
}
