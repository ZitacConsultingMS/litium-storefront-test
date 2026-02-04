import { useTranslations } from 'hooks/useTranslations';
import Sidebar from './Sidebar';
import { Button, SecondaryButon } from './elements/Button';
import { Heading3 } from './elements/Heading';

/**
 * Renders a confirmation dialog
 * @param title a dialog title
 * @param message a dialog message
 * @param onSubmit a function to accept confirmation
 * @param onCancel a position to cancel confirmation
 * @param btnCancelTitle a button cancel title
 * @param btnOkTitle a button Ok title
 */
export default function ConfirmationDialog({
  visible,
  title,
  message,
  onAccept,
  onCancel,
  btnCancelTitle = 'confirmation.button.no',
  btnOkTitle = 'confirmation.button.yes',
}: {
  visible: boolean;
  title: string;
  message?: string;
  onAccept?: () => void;
  onCancel: () => void;
  btnCancelTitle?: string;
  btnOkTitle?: string;
}) {
  const t = useTranslations();
  return (
    <Sidebar
      visible={visible}
      fullscreen={true}
      className="flex items-center justify-center bg-transparent transition-none"
      onClose={onCancel}
      data-testid="confirmation-dialog__container"
    >
      <div className="flex max-h-72 w-96 max-w-96 flex-col items-center justify-center gap-7 rounded-2xl border-secondary-2 bg-white px-5 py-14">
        <Heading3
          className="my-0 text-lg font-bold"
          translationKey={title}
          data-testid="confirmation-dialog__title"
        />
        {message && (
          <div
            className="text-center text-sm"
            data-testid="confirmation-dialog__message"
          >
            {t(message)}
          </div>
        )}
        <div className="action-btn flex justify-between gap-3">
          <SecondaryButon
            onClick={onCancel}
            className="w-24 p-1 text-sm"
            rounded
            data-testid="confirmation-dialog__cancel-button"
          >
            {t(btnCancelTitle)}
          </SecondaryButon>
          {!!onAccept && (
            <Button
              onClick={onAccept}
              className="w-24 p-1 text-sm"
              rounded
              data-testid="confirmation-dialog__ok-button"
            >
              {t(btnOkTitle)}
            </Button>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
