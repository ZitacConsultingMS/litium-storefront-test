import clsx from 'clsx';
/**
 * Renders a html text component
 * @param className CSS class names.
 * @param innerHTML use for loading HTML content.
 */
export function HtmlText({
  className,
  innerHTML,
  ...props
}: {
  className?: string;
  innerHTML: string;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={clsx(className, 'prose max-w-none')}
      dangerouslySetInnerHTML={{ __html: innerHTML }}
      {...props}
    ></div>
  );
}
