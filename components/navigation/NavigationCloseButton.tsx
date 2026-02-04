'use client';
import { Button } from 'components/elements/Button';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
import { X } from 'lucide-react';
import { useContext } from 'react';

/**
 * Represents a client component for rendering navigation close button, which is used in mobile.
 * @returns
 */
export default function NavigationCloseButton() {
  const { setVisible, setActiveMenuId } = useContext(PrimaryNavigationContext);
  const close = () => {
    setVisible(false);
    setActiveMenuId(null);
  };
  const t = useTranslations();

  return (
    <Button
      aria-label={t('commons.closenavigationmenu')}
      onClick={close}
      data-testid="slide-navigation__close-btn"
      className="!border-0 !bg-transparent p-0 text-primary"
    >
      <X className="h-8 w-8" />
    </Button>
  );
}
