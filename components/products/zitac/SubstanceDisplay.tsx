'use client';
import { Text } from 'components/elements/Text';
import { useTranslations } from 'hooks/useTranslations';

interface TextFieldOptions {
  code: string;
  description: string;
  longDescription?: string | null;
  imageUrl?: string | null;
}

interface SubstanceDisplayProps {
  substance?: TextFieldOptions[] | null;
}

/**
 * Displays substance information as a comma-separated list
 * @param substance Substance field value from GraphQL
 */
function SubstanceDisplay({ substance }: SubstanceDisplayProps) {
  const t = useTranslations();

  if (!substance || substance.length === 0) {
    return null;
  }

  // Extract descriptions from TextFieldOptions objects
  const substances = substance
    .map((s) => s.description)
    .filter((s) => s && s.length > 0);

  if (substances.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 mt-6 min-w-full">
      <Text className="text-sm">
        <span className="font-medium">{t('zs.product.accordion.content.substances')}:</span>{' '}
        {substances.join(', ')}
      </Text>
    </div>
  );
}

export default SubstanceDisplay;
