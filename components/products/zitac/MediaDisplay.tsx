'use client';
import { Text } from 'components/elements/Text';

interface MediaItem {
  url: string;
  title: string;
  description: string | null | undefined;
  linkUrl: string | null | undefined;
}

interface MediaDisplayProps {
  mediaUrls: MediaItem[];
}

/**
 * Helper function to convert YouTube URL to embed URL
 */
const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

/**
 * Displays media URLs (YouTube videos, documents, etc.) in a responsive grid layout
 * @param mediaUrls Array of media objects with URL, title, and type information
 */
function MediaDisplay({ mediaUrls }: MediaDisplayProps) {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 mt-6 min-w-full">
      <div className="grid gap-4 md:grid-cols-2">
        {mediaUrls.map((media, index) => (
          <div key={index} className="space-y-1">
            <p className="font-semibold">{media.title}</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-sm">
              <iframe
                src={getYouTubeEmbedUrl(media.url)}
                title={media.title}
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {media.description && (
              <Text className="text-sm">{media.description}</Text>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaDisplay;
