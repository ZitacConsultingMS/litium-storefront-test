'use client';
import { useTranslations } from 'hooks/useTranslations';

export function Heading1({
  children,
  className = '',
  translationKey = '',
  ...props
}: HeadingProps) {
  const t = useTranslations();
  return (
    <h1 className={className} {...props}>
      {translationKey ? t(translationKey) : children}
    </h1>
  );
}

export function Heading2({
  children,
  className = '',
  translationKey = '',
  ...props
}: HeadingProps) {
  const t = useTranslations();
  return (
    <h2 className={className} {...props}>
      {translationKey ? t(translationKey) : children}
    </h2>
  );
}

export function Heading3({
  children,
  className = '',
  translationKey = '',
  ...props
}: HeadingProps) {
  const t = useTranslations();
  return (
    <h3 className={className} {...props}>
      {translationKey ? t(translationKey) : children}
    </h3>
  );
}

/**
 * A heading props
 * @param children child elements.
 * @param translationKey provide a key to translate and print out text. The children will be ignored if translationKey has value.
 */
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  translationKey?: string;
}
