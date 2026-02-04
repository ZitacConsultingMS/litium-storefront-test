'use client';

import { Button } from 'components/elements/zitac/Button';
import { Heading2 } from 'components/elements/Heading';
import { Text } from 'components/elements/Text';
import { useTranslations } from 'hooks/useTranslations';

export default function CheckoutBlockedB2B({
  homePageUrl,
}: {
  homePageUrl: string | null;
}) {
  const t = useTranslations();

  const title =
    t('checkoutwizard.b2b.blocked.title') || 'Unable to complete purchase';
  const message =
    t('checkoutwizard.b2b.blocked') ||
    'Your organization is not allowed to place orders at this time. Please contact support.';
  const backLabel =
    t('commons.backtohomepage') || 'Back to homepage';

  return (
    <div
      data-testid="blocked-b2b"
      className="min-h-[200px] py-4"
      role="alert"
      aria-live="polite"
    >
      <Heading2 className="mb-5 text-2xl text-inherit">{title}</Heading2>
      <Text className="mb-5 text-base text-inherit">{message}</Text>
      <Button
        type="link"
        url={homePageUrl || '/'}
        className="button rounded px-9"
        title={backLabel}
      />
    </div>
  );
}
