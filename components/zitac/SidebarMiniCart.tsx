'use client';
import clsx from 'clsx';
import { useBodyScroll } from 'hooks/useBodyScroll';
import useIsAtTop from 'hooks/useIsAtTop';
import { Fragment, useEffect, useRef } from 'react';
import ZsBackdrop from './Backdrop';

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

  const isAtTop = useIsAtTop();

  return (
    <Fragment>
      {visible && backdrop && (
        <ZsBackdrop
          className={clsx(position === 'top' ? 'top-48' : '')}
          data-testid="sidebar__backdrop"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        />
      )}
      <div
        className={clsx(
          'fixed z-30 h-screen p-5 transition-all',
          getPosition(),
          className,
          fullscreen ? 'w-full' : 'w-3/4',
          isAtTop ? 'mt-4 pt-5 md:mt-5' : '-mt-6 pt-6 md:-mt-6'
        )}
        ref={sidebarRef}
        {...props}
      >
        {children}
      </div>
    </Fragment>
  );
}

export default Sidebar;
