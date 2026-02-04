'use client';
import clsx from 'clsx';
import { useTranslations } from 'hooks/useTranslations';
import { Eye, EyeOff } from 'lucide-react';
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
 * @param autocomplete a value for the autocomplete attribute
 */
export const InputPassword = React.forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      value = '',
      onChange,
      placeholder = '',
      id,
      className = '',
      autocomplete,
      ...props
    },
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
          autocomplete={autocomplete}
          {...props}
        />
        {showPlainText && (
          <Button
            type="button"
            className="absolute right-3 top-[50%] -translate-y-2/4 !border-0 !bg-transparent p-0 text-primary"
            onClick={() => setShowPlainText(false)}
            aria-label={t('login.hidepassword')}
          >
            <Eye className="inline-block h-8 w-8 text-[#c0c0c0]" />
          </Button>
        )}
        {!showPlainText && (
          <Button
            type="button"
            className="absolute right-3 top-[50%] -translate-y-2/4 !border-0 !bg-transparent p-0 text-primary"
            onClick={() => setShowPlainText(true)}
            aria-label={t('login.showpassword')}
          >
            <EyeOff className="inline-block h-8 w-8 text-[#c0c0c0]" />
          </Button>
        )}
      </div>
    );
  }
);

InputPassword.displayName = 'InputPassword';
