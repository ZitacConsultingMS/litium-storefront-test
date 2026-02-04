import { Metadata } from 'next';
import { createMetadataFromUrl } from 'services/metadataService.server';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return children;
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  return await createMetadataFromUrl(params.slug?.join('/'));
}
