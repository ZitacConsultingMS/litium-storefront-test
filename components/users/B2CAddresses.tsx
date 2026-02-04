import updateUserAddress from 'app/actions/users/updateUserAddress';
import { Heading2 } from 'components/elements/Heading';
import AddressForm from 'components/users/AddressForm';
import { translate } from 'hooks/useTranslations';
import { Fragment } from 'react';
import { getUserAddresses } from 'services/userService.server';
import { get } from 'services/websiteService.server';

export default async function B2CAddresses() {
  const currentUser = await getUserAddresses();
  const addresses = currentUser.me.person.addresses;
  const texts = (await get()).texts;

  return (
    <Fragment>
      <Heading2 data-testid="my-account-address-b2c__title">
        {translate('customeraddress.b2c.title', texts)}
      </Heading2>
      <AddressForm
        value={addresses[0]}
        onSubmit={updateUserAddress}
        shouldRedirect={false}
      />
    </Fragment>
  );
}
