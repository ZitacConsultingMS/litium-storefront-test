'use client';
import ConfirmationDialog from 'components/ConfirmationDialog';
import { Button } from 'components/elements/Button';
import { useTranslations } from 'hooks/useTranslations';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { deleteOrganizationAddress } from 'services/organizationService.client';

/** Render a delete organization address button to show a confirmation dialog on clicked,
 * then it calls service to delete an organization's address if the confirmation is accepted
 * @param id an identifying number of the organization's address
 */
export default function DeleteOrganizationAddressButton({
  id,
}: {
  id: string;
}) {
  const t = useTranslations();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const onCancel = () => {
    setShowConfirmation(false);
  };
  const router = useRouter();
  const onAccept = async () => {
    await deleteOrganizationAddress(id);
    setShowConfirmation(false);
    router.refresh();
  };

  return (
    <Fragment>
      <Button
        className="border-0 bg-transparent p-2 text-hyperlink hover:bg-transparent"
        onClick={() => setShowConfirmation(true)}
        data-testid="delete-address-button"
      >
        {t('customeraddress.button.delete')}
      </Button>

      <ConfirmationDialog
        visible={showConfirmation}
        title="customeraddress.confirmation.title"
        onCancel={onCancel}
        onAccept={onAccept}
        btnCancelTitle="customeraddress.button.cancel"
        btnOkTitle="customeraddress.button.delete"
      />
    </Fragment>
  );
}
