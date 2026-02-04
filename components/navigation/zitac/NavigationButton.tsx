'use client';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useContext } from 'react';
import Close from '../../icons/zitac/close';
import HamburgerMenu from '../../icons/zitac/menu';

export default function NavigationButton() {
  const { visible } = useContext(PrimaryNavigationContext);

  return <>{visible ? <NavigationCloseButton /> : <NavigationMenuButton />}</>;
}

/**
 * Represents a client component for rendering a button to open primary navigation.
 * The component is used in mobile.
 * @returns
 */
export function NavigationMenuButton() {
  const setVisible = useContext(PrimaryNavigationContext).setVisible;
  const open = () => setVisible(true);
  return (
    <HamburgerMenu
      alt="Primary Navigation"
      onClick={open}
      data-testid="slide-navigation__hamburger-menu"
    />
  );
}

/**
 * Represents a client component for rendering navigation close button, which is used in mobile.
 * @returns
 */
export function NavigationCloseButton() {
  const setVisible = useContext(PrimaryNavigationContext).setVisible;
  const close = () => setVisible(false);
  return (
    <Close
      alt="close"
      onClick={close}
      data-testid="slide-navigation__close-btn"
    />
  );
}
