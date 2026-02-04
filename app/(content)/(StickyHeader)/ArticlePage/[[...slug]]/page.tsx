import { gql } from '@apollo/client';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading1 } from 'components/elements/Heading';
import { HtmlText } from 'components/elements/HtmlText';
import { Text } from 'components/elements/Text';
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
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const content = await getContent({ params });
  const { name, parents, fields, blocks } = content as ArticlePage;
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
        <>
          {fields?.showNavigation && (
            <SideNavigation
              name={topPageName}
              url={topPageUrl}
              rootUrl={currentUrl}
              parents={parents}
              childrenPages={children}
              showLogoutButton={false}
            />
          )}
        </>

        <MainContent
          navigationButtonVisibility={fields?.showNavigation}
          breadcrumbs={breadcrumbs}
        >
          <>
            <BlockContainer
              priority
              blocks={blocks.content}
              className="mt-4 [&>div]:w-full"
            ></BlockContainer>
            <div className="container mx-auto">
              {fields?.title && (
                <Heading1 className="mb-9 mt-7" data-testid="article__title">
                  {fields?.title}
                </Heading1>
              )}
              {fields?.introduction && (
                <Text
                  className="mb-10 text-lg"
                  data-testid="article__introduction"
                >
                  {fields?.introduction}
                </Text>
              )}
              {fields?.editor && (
                <HtmlText
                  className="min-w-full"
                  innerHTML={fields?.editor}
                  data-testid="article__editor"
                ></HtmlText>
              )}
            </div>
          </>
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
        ...Metadata
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
  query GetArticlePage {
    content {
      ... on IPageItem {
        url
        name
        id
        parents(reverse: true) {
          nodes {
            ... on IPageItem {
              name
              url
              id
            }
          }
        }
      }
      ... on ArticlePage {
        ...Metadata
        fields {
          title
          editor
          introduction
          showNavigation
        }
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
`;

interface ArticlePage extends ContentItem {
  name: string;
  parents: PageItemsConnection;
  children: PageItemsConnection;
  fields: ArticlePageFieldContainer;
  blocks: ArticlePageBlockContainer;
}

interface ArticlePageFieldContainer {
  editor: string;
  introduction: string;
  title: string;
  showNavigation: boolean;
}

interface ArticlePageBlockContainer {
  top: Block[];
  content: Block[];
}
