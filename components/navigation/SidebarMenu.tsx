'use client';
import Sidebar from 'components/Sidebar';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
import React, { useContext } from 'react';

/**
 * Represents a client component for rendering a slide navigation side menu, which is used in mobile.
 * @param props
 * @returns
 */
export default function SidebarMenu(props: {
  children: React.JSX.Element | React.JSX.Element[] | undefined;
  className?: string;
}) {
  const { children, className } = props;
  const { visible, setVisible, setActiveMenuId } = useContext(
    PrimaryNavigationContext
  );
  const t = useTranslations();
  const close = () => {
    setTimeout(() => {
      setVisible(false);
      setActiveMenuId(null);
    }, 100);
  };

  return (
    <Sidebar
      visible={visible}
      position="top"
      fullscreen={true}
      className={className}
      data-testid="slide-navigation"
      isClickOutside={false}
      onClose={close}
      ariaLabel={t('commons.navigationmenu')}
    >
      {children}
    </Sidebar>
  );
}
