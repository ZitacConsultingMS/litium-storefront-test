import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import { Block } from 'models/block';
import { ContentItem } from 'models/content';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import { Metadata } from 'next';
import { ALL_BLOCK_TYPES_FRAGMENT } from 'operations/fragments/blocks/allBlockTypes';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const content = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  const { name, parents, blocks } = content as MyAccountPage;
  const {
    name: topPageName,
    url: topPageUrl,
    children,
  } = await getChildren(
    parents.nodes.length > 1 ? parents.nodes[1]?.url : currentUrl
  );

  const breadcrumbs = (() => {
    const currentPage: NavigationLink = {
      name: name,
      selected: true,
      url: '',
    };
    return [...parents.nodes, currentPage];
  })();

  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={blocks.top}
        className="mb-4"
      ></BlockContainer>
      <SideNavigationLayout>
        <SideNavigation
          name={topPageName}
          url={topPageUrl}
          rootUrl={currentUrl}
          parents={parents}
          childrenPages={children}
        />
        <MainContent breadcrumbs={breadcrumbs}>
          <BlockContainer
            priority
            blocks={blocks.content}
            className="mt-4 [&>div]:w-full"
          ></BlockContainer>
        </MainContent>
      </SideNavigationLayout>
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const content = await getContent({ params });
  return createMetadata(content.metadata);
}

async function getContent({ params }: { params: any }) {
  return (
    await queryServer({
      query: GET_CONTENT,
      url: params.slug?.join('/') ?? '/',
    })
  ).content;
}

async function getChildren(url: string) {
  return (
    await queryServer({
      query: GET_CHILDREN,
      url: url,
    })
  ).content;
}
const GET_CHILDREN = gql`
  query GetChildren {
    content {
      ... on IPageItem {
        id
        name
        url
        children {
          nodes {
            ... on IPageItem {
              id
              name
              url
              children {
                nodes {
                  ... on IPageItem {
                    id
                    name
                    url
                    children {
                      nodes {
                        ... on IPageItem {
                          id
                          name
                          url
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_CONTENT = gql`
  query GetMyAccountDashboardPageContent {
    content {
      ... on IPageItem {
        ...Metadata
        id
        name
        url
        parents(reverse: true) {
          nodes {
            ... on IPageItem {
              id
              name
              url
            }
          }
        }
      }
      ... on MyAccountDashboardPage {
        ...Metadata
        blocks {
          top {
            ...AllBlockTypes
          }
          content {
            ...AllBlockTypes
          }
        }
      }
    }
  }

  ${ALL_BLOCK_TYPES_FRAGMENT}
`;

interface MyAccountPage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  blocks: MyAccountPageBlockContainer;
}

interface MyAccountPageBlockContainer {
  top: Block[];
  content: Block[];
}
