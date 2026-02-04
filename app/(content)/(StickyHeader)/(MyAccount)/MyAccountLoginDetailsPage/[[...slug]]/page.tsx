import { gql } from '@apollo/client';
import LoginDetails from 'components/LoginDetails';
import BlockContainer from 'components/blocks/BlockContainer';
import { Heading2 } from 'components/elements/Heading';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import { LoginDetailsPage } from 'models/loginDetails';
import { NavigationLink } from 'models/navigation';
import { Metadata } from 'next';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { createMetadata } from 'services/metadataService.server';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const { content, me } = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  const { name, parents, blocks } = content as LoginDetailsPage;
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
    return [...content.parents.nodes, currentPage];
  })();

  return (
    <Fragment>
      <BlockContainer
        priority
        blocks={blocks.main}
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
          <Heading2 className="mt-14">{name}</Heading2>
          <LoginDetails email={me.person.fields._email ?? ''}></LoginDetails>
        </MainContent>
      </SideNavigationLayout>
    </Fragment>
  );
}

export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata> {
  const params = await props.params;
  const { content } = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  return createMetadata(content.metadata);
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

async function getContent({ params }: { params: any }) {
  return await queryServer({
    query: GET_CONTENT,
    url: params.slug?.join('/') ?? '/',
  });
}

const GET_CONTENT = gql`
  query GetMyAccountLoginDetailsPageContent {
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
      ... on MyAccountLoginDetailsPage {
        blocks {
          main {
            ...AllBlockTypes
          }
        }
      }
    }
    me {
      person {
        id
        ... on B2BPersonTemplatePerson {
          fields {
            _email
          }
        }
        ... on B2CPersonTemplatePerson {
          fields {
            _email
          }
        }
      }
    }
  }
`;
