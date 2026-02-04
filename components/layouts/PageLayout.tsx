import { gql } from '@apollo/client';
import { Fragment } from 'react';
import { queryServer } from 'services/dataService.server';
import Footer from './zitac/Footer';
import Header from './zitac/Header';
import TopBar from './zitac/TopBar';
// import Footer from './Footer';
// import Header from './Header';

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
  const { primaryNavigation, footer, zsTopBar } =
    content.channel.website.blocks;
  return (
    <Fragment>
      <TopBar blocks={zsTopBar} />
      <Header
        blocks={primaryNavigation}
        sticky={stickyHeader}
        showLogo={showLogo}
        showNavigation={showNavigation}
      />
      <main
        id="main-content"
        className="mx-auto min-h-[500px] px-5 py-8 md:container md:py-14"
      >
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
                    ...ZsTextEditorBlock
                    ...ZsFooterNavigationLinksBlock
                  }
                }
              }
              zsTopBar {
                ... on ZsTopBarBlock {
                  systemId
                  fields {
                    zsTextEditor
                    zsUSP {
                      blockText
                    }
                  }
                }
                ... on ZsTopMenuBlock {
                  systemId
                  fields {
                    zsLinks {
                      navigationLink {
                        text
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
  fragment ZsFooterNavigationLinksBlock on ZsFooterNavigationLinksBlock {
    systemId
    fields {
      navigationLinksHeader {
        ...Link
      }
      zsFooterNavigationLinks {
        navigationLink {
          ...Link
        }
      }
    }
  }
  fragment ZsTextEditorBlock on ZsTextEditorBlock {
    systemId
    fields {
      zsTextEditor
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
