'use client';
import clsx from 'clsx';
import Backdrop from 'components/Backdrop';
import { useBodyScroll } from 'hooks/useBodyScroll';
import useIsAtTop from 'hooks/useIsAtTop';
import { Fragment, useEffect, useRef, useState } from 'react';
import useOnClickOutside from 'hooks/useOnClickOutside';

function Sidebar({
  visible,
  children,
  onClose = () => {},
  position = 'right',
  className = '',
  fullscreen = false,
  blockScroll = true,
  backdrop = true,
  ...props
}: {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  fullscreen?: boolean;
  blockScroll?: boolean;
  backdrop?: boolean;
}) {
  const sidebarRef = useRef(null!);
  const [blockBodyScroll, allowBodyScroll] = useBodyScroll();
  useOnClickOutside(sidebarRef, onClose);

  useEffect(() => {
    if (visible && blockScroll) blockBodyScroll();
    else allowBodyScroll();
  }, [visible, blockScroll, blockBodyScroll, allowBodyScroll]);

  const getPosition = () => {
    switch (position) {
      case 'left':
      case 'right':
        return clsx(
          'top-0',
          visible && `${position}-0 opacity-100 scale-x-100`,
          !visible && `-${position}-full opacity-0 scale-x-0`
        );
      case 'bottom':
        return clsx(
          'inset-y-full transform opacity-0',
          visible && '!-inset-y-0 opacity-100'
        );
      default:
        return clsx(
          'right-0',
          visible && `${position}-full opacity-100 scale-y-100`,
          !visible && `-${position}-full opacity-0 scale-y-0`
        );
    }
  };

  const [navHeight, setNavHeight] = useState(0);
  const isAtTop = useIsAtTop();

  useEffect(() => {
    // Function to update nav height dynamically
    const updateNavHeight = () => {
      const navElement = document.querySelector('nav');
      if (navElement) {
        setNavHeight(navElement.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    return () => {
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  return (
    <Fragment>
      {visible && backdrop && (
        <Backdrop
          className={clsx(position === 'top' ? 'top-56' : '', 'z-30')}
          data-testid="sidebar__backdrop"
        />
      )}
      <div
        className={clsx(
          'fixed z-30 h-screen p-5 transition-all',
          getPosition(),
          className,
          fullscreen ? 'w-full' : 'w-3/4',
          isAtTop
            ? 'mt-40 pt-5 sm:mt-[7.5rem] md:mt-[9.8rem] lg:mt-[9.6rem] xl:mt-[7.8rem]'
            : 'mt-18 sm:mt-18 pt-5'
        )}
        style={{ top: `${navHeight}px` }}
        ref={sidebarRef}
        {...props}
      >
        {children}
      </div>
    </Fragment>
  );
}

export default Sidebar;
