'use client';
import { Text } from 'components/elements/Text';
import { useTranslations } from 'hooks/useTranslations';

type Props = {
  orderReferens: string;
  erReferens: string;
  onOrderReferensChange: (value: string) => void;
  onErReferensChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

/**
 * B2B order reference fields: Orderreferens and Er referens.
 * Used on checkout page (required) and optionally in wizard when not provided by page.
 */
export default function B2BReferenceFields({
  orderReferens,
  erReferens,
  onOrderReferensChange,
  onErReferensChange,
  required = false,
  className = 'mb-6 grid gap-4',
}: Props) {
  const t = useTranslations();
  const requiredMark = required ? <span className="text-red-600">*</span> : null;
  return (
    <div className={className}>
      <label className="flex flex-col gap-1">
        <Text className="text-sm font-medium">
          {t('checkoutwizard.b2b.orderreferens') || 'Orderreferens'} {requiredMark}
        </Text>
        <input
          type="text"
          value={orderReferens}
          onChange={(e) => onOrderReferensChange(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
          data-testid="checkout-wizard__order-referens"
          required={required}
          aria-required={required}
        />
      </label>
      <label className="flex flex-col gap-1">
        <Text className="text-sm font-medium">
          {t('checkoutwizard.b2b.erreferens') || 'Er referens'} {requiredMark}
        </Text>
        <input
          type="text"
          value={erReferens}
          onChange={(e) => onErReferensChange(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
          data-testid="checkout-wizard__er-referens"
          required={required}
          aria-required={required}
        />
      </label>
    </div>
  );
}
