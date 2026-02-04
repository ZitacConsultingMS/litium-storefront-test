'use client';
import clsx from 'clsx';
import { Button } from 'components/elements/Button';
import useOnClickOutside from 'hooks/useOnClickOutside';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useEffect, useRef, useState } from 'react';

interface SortDropdownButtonProps {
  className?: string;
  options: any[];
  onChange: (option: any) => void;
  textSelector: (option?: any) => string | null;
  selectedOptionSelector?: (options: any[]) => any;
  heading?: string;
}

export default function SortDropdownButton({
  className,
  options,
  onChange,
  textSelector,
  heading = '',
  selectedOptionSelector,
}: SortDropdownButtonProps) {
  const [visible, setVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null!);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState('left-0');
  const dropdownWidth = 256;
  const gap = 15;

  const handlePosition = () => {
    // Handle position of dropdown on desktop mode
    const btnPos = btnRef.current?.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    if ((btnPos?.left || 0) + dropdownWidth + gap <= screenWidth) {
      setPosition('left-0');
    } else {
      setPosition('right-0');
    }
  };

  const handleToggleDropdown = () => {
    if (!visible) {
      handlePosition();
    }
    setVisible(!visible);
  };

  useOnClickOutside(dropdownRef, (event: any) => {
    if (visible && !btnRef.current?.contains(event.target)) {
      setVisible(!visible);
    }
  });

  useEffect(() => {
    window.addEventListener('resize', handlePosition);
    return () => window.removeEventListener('resize', handlePosition);
  }, []);

  const t = useTranslations();

  if (!options.length) {
    return <Fragment></Fragment>;
  }

  return (
    <div className={clsx(className, 'relative')}>
      <Button
        onClick={handleToggleDropdown}
        rounded={true}
        className="af:bg-af-bluegreen flex items-center gap-2 rounded bg-[#46506b] px-4 py-2 text-white hover:brightness-90"
        data-testid="sort-dropdown__button"
        ref={btnRef}
      >
        {t('productsearchresult.sort.title')}
      </Button>
      <div ref={dropdownRef}>
        <div
          className={clsx(
            'absolute z-20 w-64 scale-y-0 rounded border border-solid bg-primary p-3 opacity-0 shadow transition-opacity duration-200 ease-in',
            visible && 'top-12 scale-y-100 opacity-100',
            position
          )}
          data-testid="sort-dropdown__option--container"
        >
          <ListOptions
            options={options}
            onItemClick={(option) => {
              setVisible(!visible);
              onChange(option);
            }}
            textSelector={textSelector}
            selectedOptionSelector={selectedOptionSelector || (() => null)}
            testId="sort-dropdown__option"
          />
        </div>
      </div>
    </div>
  );
}

const ListOptions = ({
  options,
  textSelector,
  onItemClick,
  selectedOptionSelector,
  testId,
}: {
  options: any[];
  textSelector: (option?: any) => string | null;
  onItemClick: (option: any) => void;
  selectedOptionSelector: (options: any[]) => any;
  testId: string;
}) => {
  const t = useTranslations();
  return (
    <Fragment>
      {options.map((option) => (
        <div
          key={`sort-dropdown-${textSelector(option)}}`}
          data-testid={testId}
          className="group cursor-pointer py-2"
          onClick={() => {
            onItemClick(option);
          }}
        >
          <span
            className={clsx(
              'rounded px-2 py-1',
              selectedOptionSelector(options) === option &&
                'underline decoration-1 underline-offset-2'
            )}
          >
            {t(textSelector(option) || '')}
          </span>
        </div>
      ))}
    </Fragment>
  );
};
