import clsx from 'clsx';
import Sidebar from 'components/Sidebar';
import { Button } from 'components/elements/Button';
import ArrowDown from 'components/icons/arrow-down';
import Close from 'components/icons/close';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * Represents the Dropdown component to display a list as context menu in desktop and full screen in mobile
 * @param className to custom style the dropdown
 * @param options the option list of dropdown
 * @param onChange a callback after selected option
 * @param textSelector a function to get display text from option
 * @param selectedOptionSelector a function to find selected option from options
 * @param heading a title of dropdown to display in mobile
 * @example
 * <Dropdown
      heading="Sort"
      textSelector={(option) => option.field}
      selectedOptionSelector={(options) => options[0]}
      options={[{field: 'popular', selected: true}, {field: 'recommended', selected: false}]}
      onChange={(option) => {}}
    />
 */

interface DropdownProps {
  className?: string;
  options: any[];
  onChange: (option: any) => void;
  textSelector: (option?: any) => string | null;
  selectedOptionSelector: (options: any[]) => any;
  heading?: string;
}
export default function Dropdown({
  className,
  options,
  onChange,
  textSelector,
  heading = '',
  selectedOptionSelector,
}: DropdownProps) {
  const [visible, setVisible] = useState(false);
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

  const dropdownRef = useClickOutside<HTMLDivElement>(
    (event: MouseEvent | TouchEvent) => {
      if (
        visible &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    }
  );

  useEffect(() => {
    window.addEventListener('resize', handlePosition);
    return () => window.removeEventListener('resize', handlePosition);
  }, []);

  // Closes the dropdown when the user presses the Tab key and focus moves outside the dropdown area.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && visible) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            activeElement !== btnRef.current &&
            !dropdownRef.current?.contains(activeElement)
          ) {
            setVisible(false);
          }
        }, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, dropdownRef]);

  const t = useTranslations();

  if (!options.length) {
    return <Fragment></Fragment>;
  }
  return (
    <div className={clsx(className, 'relative')}>
      <Button
        onClick={handleToggleDropdown}
        rounded={true}
        className="flex items-center gap-1 border-none bg-secondary-3 px-2 py-1 text-sm text-primary hover:bg-tertiary"
        data-testid="dropdown__button"
        ref={btnRef}
      >
        <ArrowDown />
        <div className="first-letter:capitalize">
          {t(textSelector(selectedOptionSelector(options)) || heading)}
        </div>
      </Button>
      <div ref={dropdownRef}>
        <div
          className={clsx(
            'max-lg:hidden absolute z-10 w-64 scale-y-0 rounded border border-solid bg-primary p-3 opacity-0 shadow transition-opacity duration-200 ease-in',
            visible && 'top-10 scale-y-100 opacity-100',
            position
          )}
          data-testid="dropdown__option--desktop-container"
        >
          <ListOptions
            options={options}
            onItemClick={(option) => {
              setVisible(!visible);
              onChange(option);
            }}
            textSelector={textSelector}
            selectedOptionSelector={selectedOptionSelector}
            testId="dropdown__option--desktop"
            tabIndex={visible ? 0 : -1}
          />
        </div>
        <div className="max-lg:visible lg:hidden">
          <Sidebar
            className="left-0 duration-200"
            visible={visible}
            fullscreen={true}
            position="bottom"
            isClickOutside={false}
            onClose={() => setVisible(false)}
          >
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="text-lg" data-testid="dropdown__heading">
                {t(heading)}
              </span>
              <Button
                className="!border-0 !bg-transparent p-0 text-primary"
                aria-label={t('commons.closedropdown')}
                onClick={() => setVisible(false)}
                data-testid="dropdown__close-btn"
              >
                <Close className="h-4 w-4" />
              </Button>
            </div>
            <ListOptions
              options={options}
              onItemClick={(option) => {
                setVisible(!visible);
                onChange(option);
              }}
              textSelector={textSelector}
              selectedOptionSelector={selectedOptionSelector}
              testId="dropdown__option--mobile"
              tabIndex={visible ? 0 : -1}
            />
          </Sidebar>
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
  tabIndex,
}: {
  options: any[];
  textSelector: (option?: any) => string | null;
  onItemClick: (option: any) => void;
  selectedOptionSelector: (options: any[]) => any;
  testId: string;
  tabIndex: number;
}) => {
  const t = useTranslations();
  return (
    <Fragment>
      {options.map((option) => (
        <Button
          key={`dropdown-${textSelector(option)}}`}
          data-testid={testId}
          className="group w-full !border-0 !bg-transparent p-0 py-2 text-left text-primary first-letter:capitalize"
          onClick={() => {
            onItemClick(option);
          }}
          tabIndex={tabIndex}
        >
          <span
            className={clsx(
              'rounded px-2 py-1 group-hover:bg-secondary-3',
              selectedOptionSelector(options) === option && 'bg-secondary-3'
            )}
          >
            {t(textSelector(option) || '')}
          </span>
        </Button>
      ))}
    </Fragment>
  );
};
