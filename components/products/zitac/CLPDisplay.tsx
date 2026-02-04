'use client';
import { Text } from 'components/elements/Text';

interface TextFieldOptions {
  code: string;
  description: string;
  longDescription?: string | null;
  imageUrl?: string | null;
}

interface CLPDisplayProps {
  clpCodes: TextFieldOptions[];
}

/**
 * Displays CLP codes as a bullet point list
 * @param clpCodes Array of CLP code objects with code and description
 */
function CLPDisplay({ clpCodes }: CLPDisplayProps) {
  if (!clpCodes || clpCodes.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 mt-6 min-w-full">
      <ul className="space-y-2 list-disc list-outside">
        {clpCodes.map((clpCode, index) => (
          <li key={index} className="text-sm">
            <Text>
              {clpCode.description}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CLPDisplay;
