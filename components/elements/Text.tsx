import clsx from 'clsx';

/**
 * Renders a text component
 * @param className CSS class names.
 * @param children child elements.
 * @param inline a flag to indicate an inline text
 */
export function Text({
  inline = false,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return inline ? (
    <span className={className} {...props}>
      {children}
    </span>
  ) : (
    <p className={clsx('m-0', className)} {...props}>
      {children}
    </p>
  );
}
