'use client';
import { Button } from 'components/elements/Button';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
//import { Menu } from 'lucide-react';
import { useContext } from 'react';
import HamburgerMenu from '../icons/zitac/menu';

/**
 * Represents a client component for rendering a button to open primary navigation.
 * The component is used in mobile.
 * @returns
 */
export default function NavigationMenuButton() {
  const { setVisible, setActiveMenuId } = useContext(PrimaryNavigationContext);
  const open = () => {
    setVisible(true);
    // Reset activeMenuId when opening the main menu
    setActiveMenuId(null);
  };
  const t = useTranslations();

  return (
    <Button
      type="button"
      onClick={open}
      aria-label={t('commons.opennavigationmenu')}
      data-testid="slide-navigation__hamburger-menu"
      className="!border-0 !bg-transparent p-0 text-primary"
    >
      <HamburgerMenu />
    </Button>
  );
}
