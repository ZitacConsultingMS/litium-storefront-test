import clsx from 'clsx';

/**
 * Renders a backdrop
 * @param className a className to style the backdrop
 * @param opacity a property sets the opacity for the backdrop
 */
function ZsBackdrop({
  className = '',
  opacity = 'normal',
  onClick,
  ...props
}: {
  className?: string;
  opacity?: 'light' | 'normal' | 'dark';
  onClick?: (event: React.MouseEvent) => void;
}) {
  const opacityList = {
    light: 'opacity-30',
    normal: 'opacity-50',
    dark: 'opacity-80',
  };
  return (
    <div
      className={clsx(
        'fixed inset-0 z-40 bg-secondary',
        opacityList[opacity],
        className
      )}
      onClick={onClick}
      {...props}
    ></div>
  );
}

export default ZsBackdrop;
