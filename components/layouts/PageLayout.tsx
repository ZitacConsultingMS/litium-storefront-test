import { gql } from '@apollo/client';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import Footer from './Footer';
import Header from './Header';

async function PageLayout({
  stickyHeader = false,
  showLogo = true,
  showNavigation = true,
  children,
}: {
  stickyHeader?: boolean;
  showLogo?: boolean;
  showNavigation?: boolean;
  children: React.ReactNode;
}) {
  const content = await getContent();
  const { primaryNavigation, footer } = content.channel.website.blocks;
  return (
    <Fragment>
      <Header
        blocks={primaryNavigation}
        sticky={stickyHeader}
        showLogo={showLogo}
        showNavigation={showNavigation}
      />
      <main id="main-content" className="mx-auto min-h-[500px]">
        {children}
      </main>
      <Footer blocks={footer} />
    </Fragment>
  );
}

async function getContent() {
  return await queryServer({
    query: GET_CONTENT,
  });
}

const GET_CONTENT = gql`
  query GetPrimaryNavigationContent {
    channel {
      ... on DefaultChannelFieldTemplateChannel {
        id
        website {
          ... on AcceleratorWebsiteWebsite {
            id
            blocks {
              primaryNavigation {
                ... on PrimaryNavigationLinkBlock {
                  systemId
                  fields {
                    navigationLink {
                      ...Link
                    }
                  }
                  children {
                    ... on PrimaryNavigationColumnBlock {
                      systemId
                      children {
                        ...NavigationLinksBlock
                        ...NavigationCategoryBlock
                        ...NavigationBannerBlock
                      }
                    }
                  }
                }
                ... on SecondaryNavigationLinkBlock {
                  systemId
                  fields {
                    navigationLink {
                      ...Link
                    }
                  }
                }
              }
              footer {
                ... on FooterColumnBlock {
                  systemId
                  children {
                    ...NavigationLinksBlock
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fragment Link on LinkFieldDefinition {
    url
    text
  }

  fragment NavigationLinksBlock on NavigationLinksBlock {
    systemId
    fields {
      navigationLinksHeader {
        ...Link
      }
      navigationLinks {
        navigationLink {
          ...Link
        }
      }
    }
  }

  fragment NavigationCategoryBlock on PrimaryNavigationCategoriesBlock {
    systemId
    fields {
      categoryLink {
        item {
          id
          url
          name
          children {
            nodes {
              name
              url
              id
            }
          }
        }
      }
    }
  }

  fragment NavigationBannerBlock on PrimaryNavigationBannerBlock {
    systemId
    fields {
      navigationLink {
        ...Link
      }
      blockImagePointer {
        item(max: { height: 350, width: 350 }) {
          ...Image
        }
      }
    }
  }
`;

export default PageLayout;
