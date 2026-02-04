'use client';
import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import { Input } from 'components/elements/Input';
import CircleXMark from 'components/icons/circle-xmark';
import Magnifier from 'components/icons/magnifier';
import { useTranslations } from 'hooks/useTranslations';
import React from 'react';

interface SearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onEnterKeyDown?: () => void;
}

/**
 * Represents the search input text.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onChange, value, onEnterKeyDown: enterChange, id }, ref) => {
    const t = useTranslations();
    const handleKeyEnter = (event: any) => {
      if (event.key === 'Enter') {
        enterChange && enterChange();
      }
    };
    return (
      <div className="relative flex h-11 w-full items-center sm:w-96">
        <Magnifier className="absolute h-6 w-6 text-tertiary" />
        <Input
          id={id || 'searchInput'}
          className="w-full text-ellipsis px-8 text-2xl focus:border-0 focus:shadow-none focus:outline-none"
          placeholder={t('searchinput.placeholder')}
          autoComplete="off"
          value={value}
          onChange={(event: any) => {
            onChange(event.target.value);
          }}
          onKeyDown={handleKeyEnter}
          ref={ref}
          data-testid={`search__input${id ? `-${id}` : ''}`}
        />
        <Button
          className={clsx(
            'absolute right-0 h-5 min-h-[24px] w-5 min-w-[24px] !border-0 !bg-transparent p-0',
            value ? 'block' : 'hidden',
            'text-tertiary'
          )}
          onClick={() => onChange('')}
          data-testid="search__clear"
          aria-label={t('searchinput.clear')}
        >
          <CircleXMark />
        </Button>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
export default SearchInput;
