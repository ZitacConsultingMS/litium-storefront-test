import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Block } from 'models/block';
import { ContentItem } from 'models/content';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const content = await getContent({ params });
  const { block } = content as GlobalBlockPreview;
  const blocks: Block[] = [block!];

  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={blocks}
        className="mb-4"
      ></BlockContainer>
    </Fragment>
  );
}

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/') ?? '/',
    })
  ).content;
}

const GET_CONTENT = gql`
  query GetGlobalBlockPreview {
    content {
      ... on GlobalBlockPreview {
        block {
          ...AllBlockTypes
        }
      }
    }
  }
`;

interface GlobalBlockPreview {
  page?: ContentItem;
  block?: Block;
}
