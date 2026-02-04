import { gql } from '@apollo/client';
import { Metadata, MetadateLinkItem } from 'models/metadata';
import type { Metadata as NextMetadata } from 'next';
import type { Icon, Icons } from 'next/dist/lib/metadata/types/metadata-types';
import 'server-only';
import { queryServer } from 'services/dataService.server';
import { getHost } from 'utils/headers';

/**
 * Fetches and generates NextMetadata object for an Url.
 * @param url a page Url to fetch Metadata from.
 * @param headers a request header object to get the requesting host information. GraphQL server needs this
 * information to determine the website's channel. `cookie` value if available in `headers` will be added
 * to the GQL request.
 * @returns a NextMetadata.
 */
export async function createMetadataFromUrl(
  url: string
): Promise<NextMetadata> {
  const metadata: Metadata = (
    await queryServer({
      query: GET_METADATA,
      url,
    })
  ).content.metadata;
  return await createMetadata(metadata);
}

export async function createMetadata(
  metadata: Metadata
): Promise<NextMetadata> {
  const nextMetadata: NextMetadata = {
    metadataBase: new URL(await getHost()),
    title: metadata.title,
    description: metadata.tags?.find((x) => x.name == 'description')?.content,
    robots: metadata.tags?.find((x) => x.name == 'robots')?.content,
    openGraph: buildOpengraph(metadata),
    icons: buildIcons(metadata),
    alternates: {
      canonical: metadata.links?.find(
        (x) => x.attributes?.find((z) => z.name == 'rel')?.value === 'canonical'
      )?.href,
    },
  };

  return nextMetadata;
}

function buildIcons(metadata: Metadata): Icons {
  return {
    icon: metadata.links
      ?.filter(
        (x) => x.attributes?.find((z) => z.name == 'rel')?.value === 'icon'
      )
      .map(buildItem),
    shortcut: metadata.links
      ?.filter(
        (x) =>
          x.attributes?.find((z) => z.name == 'rel')?.value == 'shortcut icon'
      )
      .map(buildItem),
    apple: metadata.links
      ?.filter(
        (x) =>
          x.attributes?.find((z) => z.name == 'rel')?.value ==
          'apple-touch-icon'
      )
      .map(buildItem),
  };

  function buildItem(item: MetadateLinkItem): Icon {
    return {
      url: item.href,
      sizes: item.attributes.find((x) => x.name == 'sizes')?.value,
      type: item.attributes.find((x) => x.name == 'type')?.value,
    };
  }
}

function buildOpengraph(metadata: Metadata): any {
  const openGraphImages: any[] = [];
  let ogImage: any | null = null;
  const openGraph: any = {
    images: openGraphImages,
  };

  const ogTags = metadata.tags?.filter((x) => x.name.startsWith('og:'));

  if (!ogTags) {
    return openGraph;
  }

  ogTags.forEach((item) => {
    const name = item.name.substring(3 /* length of `og:` */);
    if (name.startsWith('image')) {
      const localName = name
        .substring(6 /* length of `image:` */)
        ?.replace('secure_url', 'secureUrl');
      if (localName) {
        if (!ogImage) {
          return;
        }
        ogImage[localName] = item.content;
      } else {
        ogImage = {
          url: item.content,
        };
        openGraphImages.push(ogImage);
      }
    } else {
      openGraph[name] = item.content;
    }
  });
  return openGraph;
}

const GET_METADATA = gql`
  query GetMetadata {
    content {
      ...Metadata
      ...Id
    }
  }
`;
