'use client';
import clsx from 'clsx';
import { Input } from 'components/elements/Input';
import CircleXMark from 'components/icons/circle-xmark';
import Magnifier from 'components/icons/zitac/magnifier';
import { useTranslations } from 'hooks/useTranslations';
import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterKeyDown?: () => void;
}

/**
 * Represents the search input text.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onChange, value, onEnterKeyDown: enterChange }, ref) => {
    const t = useTranslations();
    const handleKeyEnter = (event: any) => {
      if (event.key === 'Enter') {
        enterChange && enterChange();
      }
    };
    return (
      <div className="relative my-auto flex w-full items-center bg-transparent xl:w-96">
        <Magnifier className="absolute h-5 w-5 text-dark-gray" />
        <Input
          className="w-full text-ellipsis bg-transparent px-8 text-base text-dark-gray placeholder-dark-gray focus:border-0 focus:shadow-none focus:outline-none"
          placeholder={t('searchinput.placeholder')}
          autoComplete="off"
          value={value}
          onChange={(event: any) => {
            onChange(event.target.value);
          }}
          onKeyDown={handleKeyEnter}
          ref={ref}
          data-testid="search__input"
        />
        <CircleXMark
          className={clsx(
            'absolute right-0 h-5 w-5',
            value ? 'block' : 'hidden',
            'text-dark-gray'
          )}
          onClick={() => onChange('')}
          data-testid="search__clear"
        ></CircleXMark>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
export default SearchInput;
