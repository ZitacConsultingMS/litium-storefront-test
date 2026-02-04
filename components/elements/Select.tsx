import clsx from 'clsx';

export function Select({
  id,
  className = '',
  children,
  ...props
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      className={clsx('border border-secondary-2 p-2', className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Option({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props}>{children}</option>;
}
