import { Text } from 'components/elements/Text';

/**
 * Represents a server-side component to display a formatted date based on the input datetime and culture.
 * @param date an input datetime value to format.
 * @param className optional custom css class name.
 * @param culture the culture code used for date formatting.
 * @returns
 */
function FormattedDateServerComponent({
  date,
  className = '',
  culture,
  ...props
}: {
  date?: Date;
  className?: string;
  culture: string;
}) {
  return (
    <Text className={className} {...props}>
      {format(date, culture)}
    </Text>
  );
}

function format(date?: Date, cultureCode?: string): string {
  if (typeof date === 'undefined') {
    return '';
  }
  const formatter = new Intl.DateTimeFormat(cultureCode, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatter.format(date);
}

export default FormattedDateServerComponent;
