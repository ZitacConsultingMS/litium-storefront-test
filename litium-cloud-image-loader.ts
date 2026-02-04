'use client';

export default function litiumCloudImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number | undefined;
}) {
  const url = new URL(src, 'https://localhost');
  url.searchParams.set('io', 'yes');
  url.searchParams.set('auto', 'webp');
  url.searchParams.set('width', width.toString());
  url.searchParams.set('quality', (quality || 75).toString());

  const resultUrl = `${url.pathname}${url.search}`;
  return resultUrl;
}
