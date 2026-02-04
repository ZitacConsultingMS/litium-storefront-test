'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'components/elements/Button';
import InputField from 'components/form/InputField';
import CircleCheckMark from 'components/icons/circle-check-mark';
import Tag from 'components/Tag';
import { CartContext } from 'contexts/cartContext';
import { useTranslations } from 'hooks/useTranslations';
import { Fragment, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  addDiscountCodes,
  removeDiscountCodes,
} from 'services/cartService.client';
import * as yup from 'yup';

/**
 * Renders discount code of checkout page.
 */
function CheckoutDiscountCodes() {
  const t = useTranslations();
  const [showInput, setShowInput] = useState(false);
  const cartContext = useContext(CartContext);
  const { discountCodes } = cartContext.cart;
  const { handleSubmit, control, getValues, setValue, setError } = useForm({
    resolver: yupResolver(
      yup.object({
        code: yup.string().required('Required'),
      })
    ),
    defaultValues: { code: '' },
    reValidateMode: 'onSubmit',
  });

  const handleAddCode = async () => {
    try {
      const cart = await addDiscountCodes([getValues('code')]);
      cartContext.setCart(cart);
      cartContext.setHasCartChanged(true);
      setValue('code', '');
    } catch (errors: any) {
      if (errors?.length)
        setError('code', { type: 'custom', message: errors[0].message });
      else {
        setError('code', {
          type: 'custom',
          message: errors.networkError?.result?.errors[0]?.message,
        });
      }
    }
  };

  const handleRemoveCode = async (code: string) => {
    const cart = await removeDiscountCodes([code]);
    cartContext.setCart(cart);
    cartContext.setHasCartChanged(true);
  };

  return (
    <Fragment>
      <Button
        className="mb-2 mt-4 cursor-pointer !border-0 !bg-transparent p-0 text-sm text-hyperlink"
        onClick={() => setShowInput(!showInput)}
        data-testid="checkout__discount-code--show-input"
        tabIndex={0}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setShowInput(!showInput);
          }
        }}
      >
        {t('checkoutdiscountcodes.adddiscountcode')}
      </Button>
      {showInput && (
        <form
          className="mb-3 flex"
          onSubmit={handleSubmit(handleAddCode)}
          data-testid="checkout__discount-code"
        >
          <div className="mr-3.5 grow">
            <InputField
              control={control}
              name="code"
              placeholder={t('checkoutdiscountcodes.entercode')}
              data-testid="checkout__discount-code--input"
            ></InputField>
          </div>
          <Button
            className="h-16 w-28 p-0 px-5 lg:w-auto"
            rounded={true}
            onClick={handleSubmit(handleAddCode)}
            data-testid="checkout__discount-code--apply-button"
          >
            {t('checkoutdiscountcodes.button.apply')}
          </Button>
        </form>
      )}
      {!!discountCodes.length && (
        <div className="flex flex-col">
          {discountCodes.map((item) => {
            return (
              <Tag
                key={item}
                text={item}
                onRemove={handleRemoveCode}
                icon={
                  <CircleCheckMark className="mr-2 h-4 w-4"></CircleCheckMark>
                }
              ></Tag>
            );
          })}
        </div>
      )}
    </Fragment>
  );
}

export default CheckoutDiscountCodes;
