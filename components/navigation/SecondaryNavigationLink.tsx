'use client';
import Link from 'components/Link';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import { useContext } from 'react';

export default function SecondaryNavigationLink(props: {
  url: string;
  text: string;
}) {
  const setVisible = useContext(PrimaryNavigationContext).setVisible;
  const close = () => setVisible(false);
  return (
    <Link
      href={props.url}
      onClick={close}
      data-testid="secondary-navigation-link__link"
    >
      {props.text}
    </Link>
  );
}
