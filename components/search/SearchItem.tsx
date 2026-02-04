import { Text } from 'components/elements/Text';
import Link from 'components/Link';

const SearchItem = ({
  name,
  description,
  linkLabel,
  url,
  onClick,
}: {
  name: string;
  description: string;
  linkLabel: string;
  url: string;
  onClick?: () => void;
}) => {
  return (
    <Link href={url} onClick={onClick} data-testid="searchitem__url">
      <div className="mb-10 text-sm">
        <Text
          className="my-1 font-bold text-primary"
          data-testid="searchitem__name"
        >
          {name}
        </Text>
        {description && (
          <Text
            className="my-1 lg:w-[900px]"
            data-testid="searchitem__description"
          >
            {description}
          </Text>
        )}
        <Text
          className="my-1 text-hyperlink"
          data-testid="searchitem__linkLabel"
        >
          {linkLabel}
        </Text>
      </div>
    </Link>
  );
};
export default SearchItem;
