import clsx from 'clsx';

export function Select({
  className = '',
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx('rounded-md border border-border p-2', className)}
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
