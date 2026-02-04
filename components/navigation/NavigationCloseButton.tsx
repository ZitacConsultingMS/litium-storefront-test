'use client';
import { Button } from 'components/elements/Button';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
import { useContext } from 'react';
import Close from '../icons/close';

/**
 * Represents a client component for rendering navigation close button, which is used in mobile.
 * @returns
 */
export default function NavigationCloseButton() {
  const setVisible = useContext(PrimaryNavigationContext).setVisible;
  const close = () => setVisible(false);
  const t = useTranslations();

  return (
    <Button
      aria-label={t('commons.closenavigationmenu')}
      onClick={close}
      data-testid="slide-navigation__close-btn"
      className="!border-0 !bg-transparent p-0 text-primary"
    >
      <Close />
    </Button>
  );
}
