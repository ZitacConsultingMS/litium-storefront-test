'use client';

import { Input } from 'components/elements/Input';
import { useTranslations } from 'hooks/useTranslations';
import { Equal } from 'lucide-react';
import { Fragment, KeyboardEvent } from 'react';

interface NavigationToggleButtonProps {
  id: string;
  name: string;
  defaultChecked?: boolean;
  classNameInput?: string;
  classNameLabel?: string;
  testId?: string;
  targetToggleButtonId?: string;
}

export const NavigationToggleButton = ({
  id,
  name,
  defaultChecked,
  classNameInput,
  classNameLabel,
  testId,
  targetToggleButtonId,
}: NavigationToggleButtonProps) => {
  const t = useTranslations();
  const handleKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const targetElement = document.getElementById(id) as HTMLInputElement;
      if (targetElement) {
        targetElement.checked = !targetElement.checked;
      }
      if (targetToggleButtonId) {
        const targetElement = document.getElementById(
          targetToggleButtonId
        ) as HTMLElement;
        if (targetElement) {
          // If the target is an input element, find its associated label
          if (targetElement.tagName === 'INPUT') {
            const label = document.querySelector(
              `label[for="${targetToggleButtonId}"]`
            ) as HTMLElement;
            if (label) {
              label.focus();
            } else {
              targetElement.focus();
            }
          } else {
            targetElement.focus();
          }
        }
      }
    }
  };

  return (
    <Fragment>
      <Input
        id={id}
        name={name}
        type="radio"
        className={classNameInput}
        defaultChecked={defaultChecked}
      />
      <label
        htmlFor={id}
        tabIndex={0}
        className={classNameLabel}
        aria-label={t('commons.togglesidemenu')}
        onKeyDown={handleKeyDown}
        data-testid={testId}
      >
        <Equal className="h-7 w-10 flex-shrink-0 rounded bg-hover text-[#666]" />
      </label>
    </Fragment>
  );
};
