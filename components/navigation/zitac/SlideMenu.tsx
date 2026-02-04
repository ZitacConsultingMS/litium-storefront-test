'use client';
import { Button } from 'components/elements/Button';
import { Text } from 'components/elements/Text';
import ChevronLeft from 'components/icons/zitac/chevron-left';
import ChevronRight from 'components/icons/zitac/chevron-right';
import Close from 'components/icons/zitac/close';
import Link from 'components/Link';
import Sidebar from 'components/Sidebar';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useTranslations } from 'hooks/useTranslations';
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
}) {
  const { text, url } = props.navigationLink;
  const [subMenuVisible, setSubMenuVisible] = useState(false);
  const { visible, setVisible } = useContext(PrimaryNavigationContext);
  const close = () => setVisible(false);
  const openSubMenu = () => setSubMenuVisible(true);
  const closeSubMenu = () => setSubMenuVisible(false);
  const t = useTranslations();

  return (
    <li
      className="border-b border-gray-200 py-4 last:border-b-0"
      data-testid="primary-navigation-link"
      role="menuitem"
      aria-haspopup={props.hasChildren}
      aria-expanded={subMenuVisible && visible}
      aria-controls={props.hasChildren ? 'dropdown-menu' : undefined}
      aria-label={text}
    >
      {!props.hasChildren && url && (
        <Link href={url} className="text-xl font-normal" onClick={close}>
          {text}
        </Link>
      )}
      {props.hasChildren && (
        <Button
          className="flex w-full items-center justify-between !border-0 !bg-transparent !p-0 text-primary"
          onClick={openSubMenu}
          aria-haspopup="menu"
          aria-expanded={subMenuVisible && visible}
          aria-label={`${t('commons.open')} ${text}`}
        >
          <Text className="text-xl font-normal">{text}</Text>
          <ChevronRight data-testid="primary-navigation-link__caret-next"></ChevronRight>
        </Button>
      )}
      {props.hasChildren && (
        <Sidebar
          visible={subMenuVisible && visible}
          onClose={closeSubMenu}
          data-testid="primary-navigation-link__sub-menu"
          position="top"
          fullscreen={true}
          className="sub-menu"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <Button
              className="inline-flex !border-0 !bg-transparent !p-1"
              onClick={closeSubMenu}
              aria-label={t('commons.back')}
              data-testid="primary-navigation-link__caret-back"
            >
              <ChevronLeft data-testid="primary-navigation-link__caret-next"></ChevronLeft>
            </Button>
            {url && (
              <Link
                href={url}
                className="text-2xl font-semibold"
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
              className="!border-0 !bg-transparent !p-1 text-primary"
              onClick={() => {
                closeSubMenu();
                close();
              }}
              aria-label={t('commons.close')}
            >
              <Close />
            </Button>
          </div>
          <div
            data-testid="primary-navigation-link__children"
            className="sub-menu_children h-full overflow-y-auto"
          >
            {props.children}
          </div>
        </Sidebar>
      )}
    </li>
  );
}
/*
<CaretDown
alt="Back"
className="inline-block h-6 w-6 rotate-90"
onClick={closeSubMenu}
data-testid="primary-navigation-link__caret-back"
></CaretDown>
*/
