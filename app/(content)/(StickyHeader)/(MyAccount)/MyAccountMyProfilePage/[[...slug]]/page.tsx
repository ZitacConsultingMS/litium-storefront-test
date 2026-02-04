import { gql } from '@apollo/client';
import ProfileForm from 'components/ProfileForm';
import BlockContainer from 'components/blocks/BlockContainer';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from 'components/layouts/SideNavigationLayout';
import { MyProfilePage } from 'models/myProfile';
import { NavigationLink } from 'models/navigation';
import { Metadata } from 'next';

import { Heading2 } from 'components/elements/Heading';
import { ALL_BLOCK_TYPES_FRAGMENT } from 'operations/fragments/blocks/allBlockTypes';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import { filterSupportedField } from 'services/formService';
import { createMetadata } from 'services/metadataService.server';
import withAuthorizedCheck from '../../withAuthorizedCheck';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const currentUrl = `/${params.slug?.join('/')}` || '/';
  const { content, me } = await withAuthorizedCheck(
    async () => await getContent({ params })
  );
  const { name, parents, blocks } = content as MyProfilePage;
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
          <Heading2 className="mt-10">{name}</Heading2>
          <ProfileForm value={filterSupportedField(me.person.fieldGroups)} />
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

async function getContent({ params }: { params: any }) {
  return await queryServer({
    query: GET_CONTENT,
    url: params.slug?.join('/') ?? '/',
  });
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
  query GetMyAccountMyProfilePageContent {
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
      ... on MyAccountMyProfilePage {
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
          fieldGroups {
            fieldGroupId
            name
            fields {
              __typename
              ...FieldValues
              fieldMetadata {
                ...FieldMetadatas
              }
            }
          }
        }
        ... on B2CPersonTemplatePerson {
          fieldGroups {
            fieldGroupId
            name
            fields {
              __typename
              ...FieldValues
              fieldMetadata {
                ...FieldMetadatas
              }
            }
          }
        }
      }
    }
  }

  ${ALL_BLOCK_TYPES_FRAGMENT}
`;
