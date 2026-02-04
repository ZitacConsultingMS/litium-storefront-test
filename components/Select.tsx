'use client';
import clsx from 'clsx';
import { useTranslations } from 'hooks/useTranslations';
import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { Checkbox } from './elements/Checkbox';
import CaretDown from './icons/caret-down';
import Close from './icons/close';

/**
 * Renders a dropdown field.
 * @param value the initial value of dropdown. Allowed data types are any primitive type (string, number, boolean) or even an object. If "multiSelect" is set to true, value can be an array containing multiple values of any type.
 * @param onChange a callback after selected option
 * @param options the option list of dropdown. In combination with `textSelector` and `idSelector` to define the display and value of each item.
 * @param placeholder a short hint that describes the expected value of an dropdown field
 * @param textSelector a function to get display text from dropdown item
 * @param idSelector a function to get id from dropdown item
 * @param multiSelect specifies whether the Select supports multiple selections. Defaults to false.
 * @param className to custom style the dropdown
 */

function Select({
  value,
  onChange,
  options = [],
  placeholder = '',
  idSelector = (option: any) => option,
  textSelector = (option: any) => option,
  multiSelect = false,
  className = '',
  disabled = false,
  ...props
}: {
  value: any | any[];
  onChange: (value: any) => void;
  options?: any[];
  placeholder: string;
  idSelector?: (option: any) => string;
  textSelector?: (option: any) => string;
  multiSelect?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [indexFocus, setIndexFocus] = useState(-2);
  const initValue = formatToArray(value);
  const t = useTranslations();

  useLayoutEffect(() => {
    const listNode = dropdownRef.current;
    const itemNode = listNode?.querySelectorAll('label')[indexFocus + 1];
    itemNode?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [indexFocus]);

  const onBlur = useCallback(() => {
    if (visible) {
      setVisible(false);
    }
  }, [visible]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    if (visible) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [visible, disabled]);

  const onKeyDown = (event: any, onChange: any) => {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!visible) {
        setVisible(true);
      } else {
        setIndexFocus((prev) => Math.min(options?.length - 1, prev + 1));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIndexFocus((prev) => Math.max(-1, prev - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!visible) {
        setVisible(true);
        setIndexFocus(-1);
        return;
      }
      if (multiSelect) {
        if (isChecked(options[indexFocus])) {
          onChange([...filterOutItem(options[indexFocus])]);
        } else {
          onChange([...initValue, options[indexFocus]]);
        }
      } else {
        if (indexFocus === -1) {
          onChange([]);
        } else {
          onChange([options[indexFocus]]);
        }
        onBlur();
      }
    } else if (event.key === 'Tab') {
      setIndexFocus(-2);
      onBlur();
    }
  };

  const filterOutItem = (itemToRemove: any) => {
    return initValue.filter(
      (item: any) => idSelector(item) !== idSelector(itemToRemove)
    );
  };

  const isChecked = (itemToCheck: any) => {
    return initValue.some(
      (item: any) => idSelector(item) === idSelector(itemToCheck)
    );
  };

  const dropdownWrapperRef = useClickOutside<HTMLDivElement>(onBlur);

  return (
    <div
      ref={dropdownWrapperRef}
      className={clsx(
        'relative',
        disabled && 'cursor-default bg-disabled-background',
        !disabled && 'cursor-pointer'
      )}
      role="combobox"
      aria-label={t('commons.select')}
      aria-haspopup="listbox"
      aria-expanded={visible}
      aria-controls="select-dropdown-list"
      onKeyDown={(event) => onKeyDown(event, onChange)}
      onClick={toggleDropdown}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {/* Render value */}
      <div
        className={clsx(
          'relative flex min-h-16 w-full flex-wrap items-center justify-end rounded border',
          disabled && 'border-disabled-border',
          !disabled && 'border-tertiary',
          className
        )}
      >
        <div
          className={clsx(
            'absolute left-3 cursor-pointer text-tertiary',
            initValue.length === 0 && 'top-[50%] -translate-y-2/4',
            initValue.length > 0 && 'top-2 text-sm'
          )}
        >
          {placeholder}
        </div>
        {multiSelect && initValue.length > 0 && (
          <div className="flex flex-1 flex-wrap items-center px-2 pb-2 pt-7">
            {initValue.map((item: any, index: any) => (
              <div
                key={index}
                className={clsx(
                  'm-1 flex items-center rounded bg-tertiary',
                  disabled && 'text-tertiary'
                )}
              >
                <div className="px-1">{textSelector(item)}</div>
                {!disabled && (
                  <div
                    className="min-h-[24px] min-w-[24px] px-2 py-2"
                    role="button"
                    tabIndex={0}
                    aria-label={`${t('commons.remove')} ${textSelector(item)}`}
                    onClick={(event) => {
                      if (disabled) return;
                      event.stopPropagation();
                      event.preventDefault();
                      onChange([...filterOutItem(item)]);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onChange([...filterOutItem(item)]);
                      }
                    }}
                  >
                    <Close className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!multiSelect && initValue.length > 0 && (
          <div
            className={clsx(
              'flex flex-1 flex-wrap items-center px-3 pb-2 pt-7',
              disabled && 'text-tertiary'
            )}
          >
            {textSelector(initValue[0])}
          </div>
        )}
        <div className="pl-2.5 pr-10">
          <CaretDown
            className={clsx('h-5 w-5 font-bold', disabled && 'opacity-30')}
          />
        </div>
      </div>
      {/* Render options */}
      <div
        id="select-dropdown-list"
        className={clsx(
          'absolute z-10 max-h-40 w-full scale-y-0 overflow-y-auto rounded border bg-primary text-sm opacity-0 shadow transition-opacity duration-200 ease-in',
          visible && 'scale-y-100 opacity-100'
        )}
        ref={dropdownRef}
        role={multiSelect ? 'group' : 'listbox'}
        data-testid="select-field__items"
      >
        {multiSelect &&
          options?.map((option, index) => (
            <Checkbox
              id={`select-${idSelector(option)}-checkbox`}
              className={clsx(
                'w-full cursor-pointer rounded p-3 text-primary outline-none hover:bg-secondary-3',
                indexFocus === index && 'bg-secondary-3'
              )}
              checked={isChecked(option)}
              key={idSelector(option)}
              onChange={() => {
                if (isChecked(option)) {
                  onChange([...filterOutItem(option)]);
                } else {
                  onChange([...initValue, option]);
                }
              }}
            >
              <span className="pl-2" data-testid="multi-select-field__item">
                {textSelector(option)}
              </span>
            </Checkbox>
          ))}
        {!multiSelect && (
          <Fragment>
            <div
              className={clsx(
                'w-full cursor-pointer rounded p-3 text-primary outline-none hover:bg-secondary-3',
                indexFocus === -1 && 'bg-secondary-3'
              )}
              role="option"
              tabIndex={-1}
              aria-selected={initValue.length === 0}
              key="none"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onChange([]);
                onBlur();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange([]);
                  onBlur();
                }
              }}
            >
              <span className="pl-2" data-testid="single-select-field__item">
                {t('form.select.none.value')}
              </span>
            </div>
            {options?.map((option, index) => (
              <div
                className={clsx(
                  'w-full cursor-pointer rounded p-3 text-primary outline-none hover:bg-secondary-3',
                  indexFocus === index && 'bg-secondary-3'
                )}
                role="option"
                tabIndex={-1}
                aria-selected={
                  initValue.length > 0 &&
                  idSelector(initValue[0]) === idSelector(option)
                }
                key={idSelector(option)}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onChange([option]);
                  onBlur();
                }}
                onKeyDown={() => {}}
              >
                <span className="pl-2" data-testid="single-select-field__item">
                  {textSelector(option)}
                </span>
              </div>
            ))}
          </Fragment>
        )}
      </div>
    </div>
  );
}

export default Select;

function formatToArray(value: any) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
}
