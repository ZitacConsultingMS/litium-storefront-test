import clsx from 'clsx';
import { Text } from 'components/elements/Text';

function CurrencyServerComponent({
  price,
  strikethrough = false,
  className = '',
  currency,
  culture,
  ...props
}: {
  price?: number;
  strikethrough?: boolean;
  className?: string;
  currency: {
    minorUnits: number;
    symbolPosition: string;
    symbol: string;
    code: string;
  };
  culture: string;
}) {
  const { minorUnits, symbolPosition, symbol, code } = currency;
  return (
    <Text
      className={clsx(strikethrough && 'line-through', className)}
      {...props}
    >
      {format(price, culture, minorUnits, code, symbol, symbolPosition)}
    </Text>
  );
}

function format(
  price?: number,
  cultureCode?: string,
  minorUnits: number = 2,
  currencyCode?: string,
  symbol?: string,
  symbolPosition: string = ''
): string {
  if (typeof price === 'undefined') {
    return '';
  }
  const formatter = new Intl.NumberFormat(cultureCode, {
    style: 'decimal',
    maximumFractionDigits: minorUnits,
    minimumFractionDigits: minorUnits,
  });
  const formattedNumber = applySymbolPosition(
    formatter.format(price),
    symbolPosition,
    symbol || currencyCode
  );
  return formattedNumber;
}

function applySymbolPosition(
  formattedNumber: string,
  position: string,
  symbol?: string
): string {
  if (!symbol || !position) {
    return formattedNumber;
  }

  switch (position) {
    case 'LEFT':
      return `${symbol}${formattedNumber}`;
    case 'LEFT_WITH_PADDING':
      return `${symbol} ${formattedNumber}`;
    case 'RIGHT':
      return `${formattedNumber}${symbol}`;
    case 'RIGHT_WITH_PADDING':
      return `${formattedNumber} ${symbol}`;
    default:
      return `${formattedNumber} ${symbol}`;
  }
}

export default CurrencyServerComponent;
