import clsx from 'clsx';
import Link from 'components/Link';
import { Text } from 'components/elements/Text';
import { NavigationLink } from 'models/navigation';
import CaretDown from './icons/caret-down';

/**
 * Renders a page hierarchy.
 * @param breadcrumbs an array of navigation links.
 * @param className optional custom css class name
 * @returns
 */
const Breadcrumb = ({
  breadcrumbs,
  className,
}: {
  breadcrumbs: NavigationLink[];
  className?: string;
}) => {
  return (
    <nav className={clsx('mb-5', className)} aria-label="Breadcrumb">
      <ul className="hidden text-xs md:flex">
        {breadcrumbs &&
          breadcrumbs.map(({ url, name, selected }) => {
            return (
              <li
                className="after:mx-2 after:content-['/'] last:after:content-none"
                key={url}
              >
                {selected ? (
                  <Text
                    className="cursor-default"
                    data-testid="breadcrumb-desktop"
                  >
                    {name}
                  </Text>
                ) : (
                  <Link
                    href={url}
                    className="cursor-pointer"
                    data-testid="breadcrumb-desktop"
                  >
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
      <ul className="text-xs md:hidden">
        <li className="flex items-center">
          <CaretDown className="mr-1 h-2 w-3 flex-shrink-0 rotate-90 stroke-secondary-2 stroke-[20px]" />
          <Link
            href={breadcrumbs[Math.max(breadcrumbs.length - 2, 0)].url}
            className="cursor-pointer"
            data-testid="breadcrumb-mobile"
          >
            {breadcrumbs[Math.max(breadcrumbs.length - 2, 0)].name}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Breadcrumb;
