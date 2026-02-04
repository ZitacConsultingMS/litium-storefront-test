import clsx from 'clsx';

/**
 * Renders a backdrop
 * @param className a className to style the backdrop
 * @param opacity a property sets the opacity for the backdrop
 */
function Backdrop({
  className = '',
  opacity = 'normal',
  ...props
}: {
  className?: string;
  opacity?: 'light' | 'normal' | 'dark';
}) {
  const opacityList = {
    light: 'opacity-30',
    normal: 'opacity-50',
    dark: 'opacity-80',
  };
  return (
    <div
      className={clsx(
        'fixed inset-0 bg-secondary',
        opacityList[opacity],
        className
      )}
      {...props}
    ></div>
  );
}

export default Backdrop;
