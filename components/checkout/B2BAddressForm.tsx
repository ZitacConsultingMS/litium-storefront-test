'use client';
import { gql } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'components/elements/Button';
import DropdownField from 'components/form/DropdownField';
import ErrorText from 'components/form/ErrorText';
import InputField from 'components/form/InputField';
import { WebsiteContext } from 'contexts/websiteContext';
import { useTranslations } from 'hooks/useTranslations';
import { OrderAddress } from 'models/address';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { queryClient } from 'services/dataService.client';
import * as yup from 'yup';

/**
 * Renders an address form for B2B person of checkout page.
 * @param value an object to contain address value
 * @param onSubmit event occurs when address form is submitted.
 * @param isBillingAddress whether the address is for billing or shipping
 */
function B2BAddressForm({
  value,
  onSubmit,
  isBillingAddress = false,
}: {
  value?: OrderAddress;
  onSubmit: (data: any) => void;
  isBillingAddress?: boolean;
}) {
  const t = useTranslations();
  const countries = useContext(WebsiteContext).countries;
  const [organizationName, setOrganizationName] = useState<string>('');
  const [organizationAddresses, setOrganizationAddresses] = useState<any[]>([]);
  const [rawOrganizationAddresses, setRawOrganizationAddresses] = useState<
    any[]
  >([]);
  const [generateError, setGenerateError] = useState<string>('');

  const isInitialized = useRef(false);
  const previousIdAddress = useRef<string>('');

  interface B2BAddressFormData {
    idAddress: string;
    firstName: string;
    lastName: string;
    address1: string;
    zipCode: string;
    city: string;
    country: string;
    email: string;
    phoneNumber: string;
    organizationName: string;
  }
  const schemaB2BAddress: yup.ObjectSchema<B2BAddressFormData> = yup.object({
    idAddress: yup.string().required(() => t('form.idAddress.required')),
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
    organizationName: yup.string().required(() => t('form.required')),
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<B2BAddressFormData>({
    resolver: yupResolver(schemaB2BAddress),
    defaultValues: useMemo(() => {
      const defaultValues = {
        idAddress: value?.idAddress ?? '',
        firstName: value?.firstName ?? '',
        lastName: value?.lastName ?? '',
        address1: value?.address1 ?? '',
        zipCode: value?.zipCode ?? '',
        city: value?.city ?? '',
        country: value?.country ?? '',
        email: value?.email ?? '',
        phoneNumber: value?.phoneNumber ?? '',
        organizationName: value?.organizationName ?? '',
      };
      previousIdAddress.current = defaultValues.idAddress;
      return defaultValues;
    }, [value]),
  });
  const watchIdAddress = watch('idAddress');

  useEffect(() => {
    const initializeOrganizationData = async () => {
      try {
        const { fields, addresses } = await getSelectedOrganization();
        setOrganizationName(fields?._nameInvariantCulture || '');
        setRawOrganizationAddresses(addresses || []);
        const finalAddresses = [
          ...formatOrganizationAddress(addresses, countries).sort((a, b) =>
            a.address.localeCompare(b.address)
          ),
          { id: 'other', address: 'addressform.other.address' },
        ];
        setOrganizationAddresses(finalAddresses);
        if (finalAddresses.length === 1 && !value?.idAddress) {
          setValue('idAddress', 'other');
          previousIdAddress.current = 'other';
        }
      } catch (error) {
        setGenerateError('addressform.error.initializing.organization.data');
        setRawOrganizationAddresses([]);
        setOrganizationAddresses([
          { id: 'other', address: 'addressform.other.address' },
        ]);
        setOrganizationName('');
      }
      isInitialized.current = true;
    };
    initializeOrganizationData();
  }, [countries, setValue, value?.idAddress]);

  useEffect(() => {
    if (!isInitialized.current || !watchIdAddress) {
      return;
    }

    const isChangingToOther =
      watchIdAddress === 'other' && previousIdAddress.current !== 'other';

    if (isChangingToOther) {
      setValue('address1', '');
      setValue('zipCode', '');
      setValue('city', '');
      setValue('country', '');
      setValue('organizationName', '');
    } else if (watchIdAddress !== 'other') {
      const selectedAddress = rawOrganizationAddresses.find(
        (address) => address.id === watchIdAddress
      );
      if (selectedAddress) {
        setValue('address1', selectedAddress.address1 || '');
        setValue('zipCode', selectedAddress.zipCode || '');
        setValue('city', selectedAddress.city || '');
        setValue('country', selectedAddress.country || '');
        setValue('organizationName', organizationName || '');
        clearErrors();
      }
    }
    previousIdAddress.current = watchIdAddress;
    setGenerateError('');
  }, [
    watchIdAddress,
    rawOrganizationAddresses,
    setValue,
    organizationName,
    clearErrors,
  ]);

  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="font-bold">
        {isBillingAddress
          ? t('addressform.billingaddress')
          : t('addressform.shippingaddress')}
      </div>
      <DropdownField
        control={control}
        idSelector={(option) => option.id}
        textSelector={(option) => t(option.address)}
        name="idAddress"
        placeholder={t('addressform.selectaddress')}
        items={organizationAddresses}
        dataTestId="address-form__select-address"
      />
      {generateError && (
        <ErrorText
          errors={[{ message: t(generateError) }]}
          className="text-red-500"
        />
      )}
      {!!watchIdAddress &&
        watchIdAddress !== 'other' &&
        showRequiredFieldsError(errors, t) && (
          <ErrorText
            errors={[
              { message: showRequiredFieldsError(errors, t) ?? undefined },
            ]}
            className="text-red-500"
          />
        )}
      {watchIdAddress !== 'other' && (
        <div className="font-bold" data-testid="address-form__contact-person">
          {t('addressform.contactperson')}
        </div>
      )}
      {watchIdAddress === 'other' && (
        <>
          <InputField
            control={control}
            name="organizationName"
            placeholder={t('addressform.organizationname')}
            data-testid="address-form__organization-name"
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
            placeholder={t('addressform.country')}
            items={countries}
            dataTestId="address-form__country"
          />
        </>
      )}
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
        name="email"
        type="email"
        placeholder={t('addressform.email')}
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

const getSelectedOrganization = async function () {
  const result = await queryClient({
    query: GET_SELECTED_ORGANIZATION,
    url: '/',
    fetchPolicy: 'network-only',
  });
  return result?.me?.selectedOrganization?.organization;
};

const GET_SELECTED_ORGANIZATION = gql`
  query GetSelectedOrganization {
    me {
      person {
        id
      }
      selectedOrganization {
        organization {
          ... on OrganizationTemplateOrganization {
            fields {
              _nameInvariantCulture
            }
          }
          id
          addresses {
            careOf
            address1
            houseNumber
            houseExtension
            address2
            zipCode
            city
            state
            country
            id
          }
        }
      }
    }
  }
`;

const formatOrganizationAddress = (addresses: any[], countries: any[]) => {
  return addresses.map((address) => {
    const parts = [];
    if (address.careOf) {
      parts.push(`${address.careOf}`);
    }
    const group2Parts = [];
    if (address.address1) group2Parts.push(address.address1);
    if (address.houseNumber) group2Parts.push(address.houseNumber);
    if (address.houseExtension) group2Parts.push(address.houseExtension);
    if (group2Parts.length > 0) {
      parts.push(group2Parts.join(' '));
    }
    if (address.address2) {
      parts.push(address.address2);
    }
    const group4Parts = [];
    if (address.zipCode) group4Parts.push(address.zipCode);
    if (address.city) group4Parts.push(address.city);
    if (group4Parts.length > 0) {
      parts.push(group4Parts.join(' '));
    }
    if (address.state) {
      parts.push(address.state);
    }
    if (address.country) {
      parts.push(getCountryName(address.country, countries));
    }
    return {
      id: address.id,
      address: parts.join(', '),
    };
  });
};

const getCountryName = (code: string, countries: any[]) => {
  return countries.find((country) => country.code === code)?.name || code;
};

const showRequiredFieldsError = (errors: any, t: (key: string) => string) => {
  const fieldLabels = {
    address1: t('addressform.address'),
    zipCode: t('addressform.zip'),
    city: t('addressform.city'),
    country: t('addressform.country'),
  };

  const errorFields = Object.keys(fieldLabels).filter((field) => errors[field]);

  return errorFields.length > 0
    ? `${t('form.required.fields')}: ${errorFields.map((field) => fieldLabels[field as keyof typeof fieldLabels]).join(', ')}`
    : null;
};

export default B2BAddressForm;
