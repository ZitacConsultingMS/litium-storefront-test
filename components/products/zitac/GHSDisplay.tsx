'use client';
import { Text } from 'components/elements/Text';
import { WebsiteContext } from 'contexts/websiteContext';
import Image from 'next/image';
import { useContext } from 'react';

interface TextFieldOptions {
  code: string;
  description: string;
  longDescription?: string | null;
  imageUrl?: string | null;
}

interface GHSDisplayProps {
  ghsCodes: TextFieldOptions[];
}

/**
 * Displays GHS codes with their images and descriptions in a flex layout
 * @param ghsCodes Array of GHS code objects with code, description, and imageUrl
 */
function GHSDisplay({ ghsCodes }: GHSDisplayProps) {
  const website = useContext(WebsiteContext);

  if (!ghsCodes || ghsCodes.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 mt-6 min-w-full">
      <div className="flex flex-wrap gap-6">
        {ghsCodes.map((ghsCode, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {ghsCode.imageUrl && (
              <div className="mb-2">
                <Image
                  src={new URL(ghsCode.imageUrl, website.imageServerUrl).href}
                  alt={ghsCode.description}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            )}
            {/*
            <Text className="font-medium text-sm">{ghsCode.code}</Text>
            */}
            <Text className="text-sm text-dark-gray">{ghsCode.description}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GHSDisplay;
