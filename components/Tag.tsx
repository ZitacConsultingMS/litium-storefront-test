import { Text } from 'components/elements/Text';
import { X } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from './elements/Button';
/**
 * Renders a tag.
 * @param text a tag's name.
 * @param icon a customizable icon
 * @param onRemove a function to remove tag.
 */
function Tag({
  text,
  icon,
  onRemove,
}: {
  text: string;
  icon?: React.ReactNode;
  onRemove: (text: string) => void;
}) {
  if (!text) return <Fragment></Fragment>;
  return (
    <Fragment>
      <div
        className="text-tertiary-2 mb-2.5 flex w-fit items-center rounded-3xl bg-secondary-3 px-3 py-1 font-medium last:mb-0"
        key={text}
      >
        <Text className="mr-3" data-testid="tag">
          {text}
        </Text>
        {icon}
        <Button
          type="button"
          onClick={() => onRemove(text)}
          aria-label={`Remove ${text}`}
          data-testid="tag__remove"
          className="ml-1 inline-flex items-center justify-center !border-0 !bg-transparent p-0 text-primary"
        >
          <X className="h-6 w-6 cursor-pointer" />
        </Button>
      </div>
    </Fragment>
  );
}

export default Tag;
