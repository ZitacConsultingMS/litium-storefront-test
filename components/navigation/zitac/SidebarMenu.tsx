'use client';
import Sidebar from 'components/Sidebar';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import React, { useContext, useEffect, useState } from 'react';

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
  const { visible, setVisible } = useContext(PrimaryNavigationContext);
  const [isDesktop, setDesktop] = useState(window.innerWidth > 1279);
  const updateMedia = () => {
    setDesktop(window.innerWidth > 1279);
  };

  useEffect(() => {
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  });
  const close = () => {
    setTimeout(() => {
      setVisible(false);
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
      blockScroll={isDesktop ? false : true}
    >
      {children}
    </Sidebar>
  );
}
