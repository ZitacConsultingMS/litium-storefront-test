'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'components/elements/Button';
import DropdownField from 'components/form/DropdownField';
import InputField from 'components/form/InputField';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import { useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

/**
 * Renders an address form of checkout page.
 * @param value an object to contain address value
 * @param onSubmit event occurs when address form is submitted.
 */
function AddressForm({
  value,
  onSubmit,
}: {
  value?: OrderAddress;
  onSubmit: (data: any) => void;
}) {
  interface AddressFormData {
    organizationName?: string;
    firstName: string;
    lastName: string;
    address1: string;
    zipCode: string;
    city: string;
    country: string;
    email: string;
    phoneNumber: string;
  }

  const schemaAddress: yup.ObjectSchema<AddressFormData> = yup.object({
    organizationName: yup.string().optional(),
    firstName: yup.string().required(() => t('form.required')),
    lastName: yup.string().required(() => t('form.required')),
    address1: yup.string().required(() => t('form.required')),
    zipCode: yup.string().required(() => t('form.required')),
    city: yup.string().required(() => t('form.required')),
    country: yup.string().required(() => t('form.required')),
    email: yup
      .string()
      .email(() => t('form.email.not.valid'))
      .required(() => t('form.required')),
    phoneNumber: yup.string().required(() => t('form.required')),
  });

  const { handleSubmit, control } = useForm<AddressFormData>({
    resolver: yupResolver(schemaAddress),
    defaultValues: useMemo(() => {
      return {
        firstName: value?.firstName ?? '',
        lastName: value?.lastName ?? '',
        address1: value?.address1 ?? '',
        zipCode: value?.zipCode ?? '',
        city: value?.city ?? '',
        country: value?.country ?? '',
        organizationName: value?.organizationName ?? '',
        email: value?.email ?? '',
        phoneNumber: value?.phoneNumber ?? '',
      };
    }, [value]),
  });
  const countries = useContext(WebsiteContext).countries;
  const t = useTranslations();

  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <InputField
        control={control}
        name="firstName"
        placeholder={t('addressform.firstname')}
        data-testid="address-form__first-name"
      />
      <InputField
        control={control}
        name="lastName"
        placeholder={t('addressform.lastname')}
        data-testid="address-form__last-name"
      />
      <InputField
        control={control}
        name="address1"
        placeholder={t('addressform.address')}
        data-testid="address-form__address"
      />
      <InputField
        control={control}
        name="zipCode"
        placeholder={t('addressform.zip')}
        data-testid="address-form__zipcode"
      />
      <InputField
        control={control}
        name="city"
        placeholder={t('addressform.city')}
        data-testid="address-form__city"
      />
      <DropdownField
        control={control}
        name="country"
        dataTestId="address-form__country"
        placeholder={t('addressform.country')}
        items={countries}
      />
      <InputField
        control={control}
        name="organizationName"
        placeholder={t('addressform.organizationname')}
        data-testid="address-form__organization-name"
      />
      <InputField
        control={control}
        name="email"
        placeholder={t('addressform.email')}
        type="email"
        data-testid="address-form__email"
      />
      <InputField
        control={control}
        name="phoneNumber"
        placeholder={t('addressform.phone')}
        data-testid="address-form__phone-number"
      />
      <Button
        type="submit"
        rounded={true}
        className="p-2"
        data-testid="address-form__submit"
      >
        {t('addressform.button.continue')}
      </Button>
    </form>
  );
}

export default AddressForm;
