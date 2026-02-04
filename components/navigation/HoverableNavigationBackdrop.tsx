'use client';
import clsx from 'clsx';
import Backdrop from 'components/Backdrop';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { Fragment, useContext } from 'react';

/**
 * Represents a client component for rendering a backdrop when hovering a navigation on desktop.
 * @returns
 */
export default function HoverableNavigationBackdrop() {
  const { visible, isFocused } = useContext(PrimaryNavigationContext);

  return (
    <Fragment>
      {/* Backdrop */}
      {visible && (
        <Backdrop
          className={clsx(
            'top-20 z-10 scale-0 delay-300 peer-hover:scale-100',
            isFocused ? 'peer-focus-within:scale-100' : 'peer-hover:scale-100'
          )}
          data-testid="hoverable-navigation__backdrop"
        ></Backdrop>
      )}
    </Fragment>
  );
}
