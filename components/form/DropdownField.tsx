import clsx from 'clsx';
import CaretDown from 'components/icons/caret-down';
import { useClickOutside } from 'hooks/useClickOutside';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import ErrorText from './ErrorText';

/**
 * Renders a form dropdown field.
 * @param control an object contains methods for registering components into React Hook Form
 * @param placeholder a short hint that describes the expected value of an dropdown field
 * @param textSelector a function to get display text from dropdown item
 * @param idSelector a function to get id from dropdown item
 * @param items a dropdown list
 * @param name an unique name of dropdown field
 * @param dataTestId a unique test id of dropdown field
 */

export default function DropdownField({
  control,
  name = '',
  placeholder = '',
  items = [],
  idSelector = (option: any) => option?.code,
  textSelector = (option: any) => option?.name,
  dataTestId = '',
}: {
  control: any;
  name: string;
  placeholder: string;
  items?: any[];
  idSelector?: (option: any) => string;
  textSelector?: (option: any) => string;
  dataTestId?: string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const [selectItemClassName, setSelectItemClassName] = useState('');
  const [visible, setVisible] = useState(false);
  const getOptionName = (id: string) => {
    const foundOpt = items?.find((opt) => {
      return idSelector(opt).toLowerCase() === id.toLowerCase();
    });
    return foundOpt && textSelector(foundOpt);
  };
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onKeyDown = (event: any, onEnter: any) => {
    if (items) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newIndex = Math.min(items?.length - 1, selectedIndex + 1);
        setSelectedIndex(newIndex);
        onEnter(idSelector(items[newIndex]));
        setSelectItemClassName('snap-end');
        scrollIntoView();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newIndex = Math.max(0, selectedIndex - 1);
        setSelectedIndex(newIndex);
        onEnter(idSelector(items[newIndex]));
        setSelectItemClassName('snap-start');
        scrollIntoView();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (visible) {
          onEnter(idSelector(items[selectedIndex]));
          onBlur();
        } else {
          onClick();
        }
      } else if (event.key === 'Tab') {
        onBlur();
      }
    }
  };
  const onBlur = useCallback(() => {
    if (visible) {
      setVisible(false);
      toggleRef?.current?.blur();
    }
  }, [visible]);

  const onClick = () => {
    if (!visible) {
      setVisible(true);
      toggleRef.current?.focus();
    } else {
      onBlur();
    }
  };

  const scrollIntoView = () => {
    const selected = dropdownRef.current?.querySelector('.selected');

    if (selected) {
      selected.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  const dropdownWrapperRef = useClickOutside<HTMLDivElement>(onBlur);

  useEffect(() => {
    const currentSelectedIndex = Math.max(
      items?.findIndex(
        (opt) => idSelector(opt) === control._formValues[name]
      ) ?? 0,
      0
    );
    setSelectedIndex(currentSelectedIndex);
  }, [control._formValues, idSelector, items, name]);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Fragment>
          <div
            ref={dropdownWrapperRef}
            className={clsx(
              'relative flex h-16 w-full flex-auto rounded border border-tertiary',
              error && '!border-error'
            )}
            role="combobox"
            aria-expanded={visible}
            aria-haspopup="listbox"
            aria-label={placeholder}
            aria-controls={`dropdown-list-${name}`}
            tabIndex={0}
            onKeyDown={(event) => {
              onKeyDown(event, onChange);
            }}
            onClick={onClick}
          >
            {/* Render value */}
            <div
              ref={toggleRef}
              className="min-h-[24px] w-full min-w-[24px] cursor-pointer px-3 py-2 pb-0 pt-4 focus:outline-none"
              data-testid="dropdown-field__toggle"
            >
              {value && (
                <div
                  className="absolute bottom-2 left-3 right-14 cursor-pointer truncate"
                  data-testid="dropdown-field__name"
                >
                  {getOptionName(value)}
                </div>
              )}
              <input
                type="hidden"
                data-testid={dataTestId}
                value={value}
                name={name}
              />
              <div
                id={`dropdown-label-${name}`}
                className={clsx(
                  'absolute left-3 cursor-pointer text-tertiary',
                  !value && 'top-[50%] -translate-y-2/4',
                  value && 'top-2 text-sm'
                )}
              >
                {placeholder}
              </div>
              <CaretDown className="absolute right-8 top-[50%] h-5 w-5 -translate-y-2/4 font-bold" />
            </div>
            {/* Render options */}
            <div
              ref={dropdownRef}
              role="listbox"
              id={`dropdown-list-${name}`}
              className={clsx(
                'absolute left-0 top-16 z-10 max-h-52 w-full scale-y-0 overflow-x-auto rounded border bg-primary px-3 pb-6 pt-4 text-sm opacity-0 shadow transition-opacity duration-200 ease-in',
                visible && 'scale-y-100 snap-y scroll-p-5 opacity-100'
              )}
              data-testid="dropdown-field__list"
            >
              {items?.map((option, index) => (
                <div
                  key={idSelector(option)}
                  role="option"
                  aria-selected={selectedIndex === index}
                  tabIndex={-1}
                  className={clsx(
                    'w-full cursor-pointer py-1 text-primary outline-none',
                    selectedIndex === index && `selected ${selectItemClassName}`
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    onChange(idSelector(option));
                    setSelectedIndex(index);
                    onBlur();
                  }}
                  onKeyDown={() => {}}
                >
                  <span
                    className={clsx(
                      'rounded px-2 py-1 group-hover:bg-secondary-3',
                      selectedIndex === index && 'bg-secondary-3'
                    )}
                    data-testid="dropdown-field__item"
                  >
                    {textSelector(option)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {error && <ErrorText errors={error} className="py-1" />}
        </Fragment>
      )}
    />
  );
}
