'use client';
import clsx from 'clsx';
import Link from 'components/Link';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
import { LinkFieldDefinition } from 'models/navigation';
import React, { useContext } from 'react';

/**
 * Represents a hoverable menu which is used in primary navigation for Desktop.
 * @param props
 * @returns
 */
export default function HoverableMenu(props: {
  navigationLink: LinkFieldDefinition;
  hasChildren: boolean;
  children: React.JSX.Element | React.JSX.Element[] | undefined;
  menuId?: string;
}) {
  const {
    visible,
    setVisible,
    isFocused,
    setIsFocused,
    activeMenuId,
    setActiveMenuId,
  } = useContext(PrimaryNavigationContext);
  const t = useTranslations();
  const { text, url } = props.navigationLink;
  const menuId = props.menuId || text;
  const onMouseEnter = () => {
    setTimeout(() => {
      if (props.hasChildren) {
        setVisible(true);
        setActiveMenuId(menuId);
      } else {
        setVisible(false);
        setActiveMenuId(null);
      }
      setIsFocused(false);
    }, 300);
  };

  const onFocus = () => {
    if (props.hasChildren) {
      setVisible(true);
      setActiveMenuId(menuId);
      setIsFocused(true);
    } else {
      setVisible(false);
      setActiveMenuId(null);
      setIsFocused(false);
    }
  };

  const close = () => {
    setVisible(false);
    setIsFocused(false);
    setActiveMenuId(null);
  };

  const onBlur = (e: React.FocusEvent | React.MouseEvent) => {
    // Only close if the newly focused element is not a child of the current target
    const target = e.relatedTarget as Node | null;
    const current = e.currentTarget as Node;

    if (target && !current.contains(target)) {
      close();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  return (
    <li
      className={clsx(
        'group relative px-3',
        isFocused
          ? 'focus-within:after:absolute focus-within:after:-bottom-0.5 focus-within:after:left-3 focus-within:after:right-3 focus-within:after:h-0.5 focus-within:after:bg-secondary focus-within:after:content-[""]'
          : 'hover:after:absolute hover:after:-bottom-0.5 hover:after:left-3 hover:after:right-3 hover:after:h-0.5 hover:after:bg-secondary hover:after:content-[""]'
      )}
      data-testid="primary-navigation-link"
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      role="menuitem"
    >
      {url && (
        <Link
          href={url}
          onClick={close}
          data-testid="primary-navigation-link__link"
          aria-haspopup={props.hasChildren ? 'dialog' : undefined}
          aria-expanded={
            activeMenuId === menuId && props.hasChildren && visible
          }
          aria-controls={
            activeMenuId === menuId && props.hasChildren && visible
              ? `dropdown-menu-${menuId}`
              : undefined
          }
        >
          {text}
        </Link>
      )}
      {!url && text}
      {props.hasChildren && visible && (
        <div
          id={`dropdown-menu-${menuId}`}
          className={clsx(
            'fixed left-0 top-20 w-screen origin-top scale-y-0 bg-primary opacity-0 transition delay-300 duration-200',
            isFocused
              ? 'group-focus-within:scale-y-100 group-focus-within:opacity-100'
              : 'group-hover:scale-y-100 group-hover:opacity-100'
          )}
        >
          <div
            className="container mx-auto flex"
            data-testid="primary-navigation-link__children"
          >
            {props.children}
          </div>
        </div>
      )}
    </li>
  );
}
