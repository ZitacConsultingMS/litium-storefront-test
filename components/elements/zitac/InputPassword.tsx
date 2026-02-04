'use client';
import clsx from 'clsx';
import HiddenEye from 'components/icons/hidden-eye';
import ViewEye from 'components/icons/view-eye';
import { useTranslations } from 'hooks/useTranslations';
import React, { useState } from 'react';
import { Button } from './Button';
import { InputText, InputTextProps } from './Input';

/**
 * Renders an input element with type "password"
 * @param value a default value of an input password element
 * @param onChange event occurs when the value of an input password is changed
 * @param placeholder a label display by a placeholder
 * @param id an unique id of the input
 * @param className a customize class name
 */
export const InputPassword = React.forwardRef<HTMLInputElement, InputTextProps>(
  (
    { value = '', onChange, placeholder = '', id, className = '', ...props },
    ref
  ) => {
    const [showPlainText, setShowPlainText] = useState(false);
    const t = useTranslations();

    return (
      <div className="relative">
        <InputText
          className={clsx('relative', className)}
          onChange={onChange}
          value={value}
          type={showPlainText ? 'text' : 'password'}
          id={id}
          ref={ref}
          placeholder={placeholder}
          {...props}
        />
        {showPlainText && (
          <Button
            type="button"
            className="absolute right-3 top-[50%] -translate-y-2/4 !border-0 !bg-transparent p-0 text-primary"
            onClick={() => setShowPlainText(false)}
            aria-label={t('login.hidepassword')}
          >
            <ViewEye className="inline-block h-6 w-8" />
          </Button>
        )}
        {!showPlainText && (
          <Button
            type="button"
            className="absolute right-3 top-[50%] -translate-y-2/4 !border-0 !bg-transparent p-0 text-primary"
            onClick={() => setShowPlainText(true)}
            aria-label={t('login.showpassword')}
          >
            <HiddenEye className="inline-block h-7 w-9" />
          </Button>
        )}
      </div>
    );
  }
);

InputPassword.displayName = 'InputPassword';
