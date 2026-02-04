'use client';
import Link from 'components/Link';
import Sidebar from 'components/Sidebar';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
import { ChevronDown, X } from 'lucide-react';
import { LinkFieldDefinition } from 'models/navigation';
import React, { useContext, useState } from 'react';

/**
 * Represents a mobile primary navigation.
 * @param props
 * @returns
 */
export default function SlideMenu(props: {
  navigationLink: LinkFieldDefinition;
  hasChildren: boolean;
  children: React.JSX.Element | React.JSX.Element[] | undefined;
  menuId: string;
}) {
  const { text, url } = props.navigationLink;
  const [subMenuVisible, setSubMenuVisible] = useState(false);
  const { visible, setVisible, activeMenuId, setActiveMenuId } = useContext(
    PrimaryNavigationContext
  );
  const close = () => {
    setVisible(false);
    setActiveMenuId(null);
  };
  const openSubMenu = () => {
    setSubMenuVisible(true);
    setActiveMenuId(props.menuId);
  };
  const closeSubMenu = () => {
    setSubMenuVisible(false);
    setActiveMenuId(null);
  };
  const t = useTranslations();

  return (
    <li className="my-5" data-testid="primary-navigation-link" role="menuitem">
      {!props.hasChildren && url && (
        <Link href={url} className="text-2xl font-semibold" onClick={close}>
          {text}
        </Link>
      )}
      {props.hasChildren && (
        <Button
          className="flex w-full justify-between !border-0 !bg-transparent p-0 text-primary"
          onClick={openSubMenu}
          aria-haspopup="menu"
          aria-expanded={
            activeMenuId === props.menuId && subMenuVisible && visible
          }
          aria-controls={
            activeMenuId === props.menuId && subMenuVisible && visible
              ? `slide-dropdown-menu-${props.menuId}`
              : undefined
          }
          aria-label={`${t('commons.open')} ${text}`}
        >
          <Text className="text-2xl font-semibold">{text}</Text>
          <ChevronDown
            className="inline-block h-8 w-8 -rotate-90 text-[#333]"
            data-testid="primary-navigation-link__caret-next"
          ></ChevronDown>
        </Button>
      )}
      {props.hasChildren && (
        <Sidebar
          id={`slide-dropdown-menu-${props.menuId}`}
          ariaLabel={`${t('commons.submenu')} ${text || props.menuId}`}
          visible={activeMenuId === props.menuId && subMenuVisible && visible}
          onClose={closeSubMenu}
          data-testid="primary-navigation-link__sub-menu"
          position="top"
          fullscreen={true}
        >
          <div className="flex items-center justify-between">
            <Button
              className="inline-flex !border-0 !bg-transparent p-1"
              onClick={closeSubMenu}
              aria-label={t('commons.back')}
              data-testid="primary-navigation-link__caret-back"
            >
              <ChevronDown className="inline-block h-8 w-8 rotate-90 text-[#333]" />
            </Button>
            {url && (
              <Link
                href={url}
                className="text-2xl font-semibold underline"
                onClick={() => {
                  closeSubMenu();
                  close();
                }}
                data-testid="primary-navigation-link__sub-menu--url"
              >
                {text}
              </Link>
            )}
            {!url && <Text className="text-2xl font-semibold">{text}</Text>}
            <Button
              className="!border-0 !bg-transparent p-1 text-primary"
              onClick={() => {
                closeSubMenu();
                close();
              }}
              aria-label={t('commons.close')}
            >
              <X className="h-8 w-8" />
            </Button>
          </div>
          <div
            data-testid="primary-navigation-link__children"
            className="h-full overflow-y-auto"
          >
            {props.children}
          </div>
        </Sidebar>
      )}
    </li>
  );
}
