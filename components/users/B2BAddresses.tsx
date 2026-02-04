import updateOrganizationAddress from 'app/actions/updateOrganizationAddress';
import Link from 'components/Link';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import AddressForm from 'components/users/AddressForm';
import DeleteAddressButton from 'components/users/DeleteOrganizationAddressButton';
import { translate } from 'hooks/useTranslations';
import { CustomerAddress } from 'models/address';
import { Fragment } from 'react';
import { getOrganizationAddresses } from 'services/organizationService.server';
import { get } from 'services/websiteService.server';
import { localeSensitiveCompare } from 'utils/string';
const VIEW = {
  ADD: 'add',
  EDIT: 'edit',
};

export default async function B2BAddresses(props: {
  searchParams: Promise<any>;
}) {
  const websites = await get();
  const { countries, texts } = websites;
  function getCountryName(code: string) {
    return countries.find((country) => country.code === code)?.name;
  }
  const searchParams = await props.searchParams;
  switch (searchParams.view) {
    case VIEW.ADD:
      return (
        <Fragment>
          <Heading2 data-testid="my-account-address-b2b__title">
            {translate('customeraddress.addaddress.title', texts)}
          </Heading2>
          <AddressForm
            onSubmit={updateOrganizationAddress}
            showCancelBtn={true}
          />
        </Fragment>
      );
    case VIEW.EDIT: {
      const currentUser = await getOrganizationAddresses();
      const addresses =
        currentUser.me?.selectedOrganization?.organization.addresses;
      const addressId = searchParams.addressId;
      const addressData: CustomerAddress = addresses.filter(
        (address: CustomerAddress) => address.id === addressId
      )[0];
      return (
        <Fragment>
          <Heading2 data-testid="my-account-address-b2b__title">
            {translate('customeraddress.editaddress.title', texts)}
          </Heading2>
          <AddressForm
            value={addressData}
            onSubmit={updateOrganizationAddress}
            showCancelBtn={true}
          />
        </Fragment>
      );
    }
    default: {
      const currentUser = await getOrganizationAddresses();
      const addresses: CustomerAddress[] =
        currentUser.me?.selectedOrganization?.organization.addresses;
      const userRoleOperations =
        currentUser.me?.selectedOrganization?.roleOperations;
      const hasManageAddressesRole = userRoleOperations?.some(
        (operation: any) => operation.roleOperationId === '_manageAddresses'
      );
      const locale = websites.culture.code;
      const sortedAddress = addresses
        ?.map((value) => ({
          ...value,
          combinedAddress: [
            value?.address1,
            value?.zipCode,
            value?.city,
            getCountryName(value?.country || ''),
          ]
            .filter((v) => v)
            .join(', '),
        }))
        .sort((a, b) => {
          return localeSensitiveCompare(
            a.combinedAddress,
            b.combinedAddress,
            locale
          );
        });
      return (
        <Fragment>
          <Heading2 data-testid="my-account-address-b2b__title">
            {translate('customeraddress.b2b.title', texts)}
          </Heading2>
          {hasManageAddressesRole && (
            <Link
              href={{ query: { view: 'add' } }}
              data-testid="my-account-address-b2b__add-button"
              className="button inline-block rounded p-1 px-10"
            >
              {translate('customeraddress.button.add', texts)}
            </Link>
          )}
          {sortedAddress?.length > 0 && (
            <div
              className="mt-3 grid w-full grid-flow-row gap-3 xl:w-3/4"
              data-testid="my-account-address-b2b__address-list"
            >
              {sortedAddress.map((value, index) => (
                <div
                  className="flex items-center justify-between rounded border py-3 pl-7 pr-10 align-middle"
                  key={index}
                  data-testid="my-account-address-b2b__address-row"
                >
                  <Text
                    data-testid="my-account-address-b2b__address-info"
                    className="p-2"
                  >
                    {value.combinedAddress}
                  </Text>
                  {hasManageAddressesRole && (
                    <div className="action-button grid grid-flow-col gap-3">
                      <Link
                        href={{ query: { view: 'edit', addressId: value.id } }}
                        data-testid="my-account-address-b2b__edit-button"
                        className="button inline-block border-0 bg-transparent p-2 text-hyperlink hover:bg-transparent"
                      >
                        {translate('customeraddress.button.edit', texts)}
                      </Link>
                      <DeleteAddressButton id={value.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Fragment>
      );
    }
  }
}
