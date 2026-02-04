import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryNavigationProvider from 'contexts/primaryNavigationContext';
import { HoverableNavigation, SlideNavigation } from './Navigation';

describe('Navigation', () => {
  describe('HoverableNavigation', () => {
    test('should not render menu item if there is no block', () => {
      const blocks: any = [];
      render(<HoverableNavigation blocks={blocks}></HoverableNavigation>);
      expect(
        screen.getByTestId('hoverable-navigation')?.querySelectorAll('li')
      ).toHaveLength(0);
    });

    test('should render the correct number of blocks with PrimaryNavigationLinkBlock type', () => {
      const blocks: any = [
        {
          systemId: '1',
          fields: {
            navigationLink: {
              text: 'First menu',
            },
          },
          children: [],
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '2',
          fields: {
            navigationLink: {
              text: 'Second menu',
            },
          },
          children: [],
          __typename: 'PrimaryNavigationLinkBlock',
        },
      ];
      render(<HoverableNavigation blocks={blocks}></HoverableNavigation>);
      expect(
        screen.getByTestId('hoverable-navigation')?.querySelectorAll('li')
      ).toHaveLength(2);
    });

    test('should show submenu and backdrop on hovering menu', async () => {
      const blocks: any = [
        {
          __typename: 'PrimaryNavigationLinkBlock',
          systemId: '1',
          fields: {
            navigationLink: {
              text: 'First menu',
            },
          },
          children: [
            {
              systemId: '2',
              fields: {
                navigationLinksHeader: {
                  text: 'Submenu',
                },
                navigationLinks: [],
              },
            },
          ],
        },
      ];
      render(
        <PrimaryNavigationProvider>
          <HoverableNavigation blocks={blocks}></HoverableNavigation>
        </PrimaryNavigationProvider>
      );
      const hoverableNavigationMenu = screen
        .getByTestId('hoverable-navigation')
        ?.querySelectorAll('li')[0];
      await userEvent.hover(hoverableNavigationMenu);
      await waitFor(() => {
        expect(
          hoverableNavigationMenu.querySelector('div')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('hoverable-navigation__backdrop')
        ).toBeInTheDocument();
      });
    });

    test('should not render blocks with SecondaryNavigationBlockLink type in desktop', () => {
      const blocks: any = [
        {
          systemId: '1',
          fields: {
            navigationLink: {
              text: 'First menu',
            },
          },
          children: [],
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '2',
          fields: {
            navigationLink: {
              text: 'Second menu',
            },
          },
          children: [],
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '3',
          fields: {
            navigationLink: {
              text: 'Third menu',
            },
          },
          children: [],
          __typename: 'SecondaryNavigationLinkBlock',
        },
      ];
      render(<HoverableNavigation blocks={blocks}></HoverableNavigation>);
      expect(
        screen.getByTestId('hoverable-navigation')?.querySelectorAll('li')
      ).toHaveLength(2);
      expect(
        screen.getByTestId('hoverable-navigation')?.querySelectorAll('li')[0]
      ).toHaveTextContent('First menu');
      expect(
        screen.getByTestId('hoverable-navigation')?.querySelectorAll('li')[1]
      ).toHaveTextContent('Second menu');
    });
  });

  describe('SlideNavigation', () => {
    test('should render the correct number of row in slide menu', async () => {
      const blocks: any = [
        {
          systemId: '1',
          fields: {
            navigationLink: {
              url: '/woman',
              text: 'Woman',
            },
          },
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '2',
          fields: {
            navigationLink: {
              url: '/collections',
              text: 'Campaigns',
            },
          },
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '3',
          fields: {
            navigationLink: {
              url: '/blocks',
              text: 'No child menu',
            },
          },
          __typename: 'PrimaryNavigationLinkBlock',
        },
        {
          systemId: '4',
          fields: {
            navigationLink: {
              url: '/man',
              text: 'Man',
            },
          },
          __typename: 'SecondaryNavigationLinkBlock',
        },
        {
          systemId: '5',
          fields: {
            navigationLink: {
              url: '/yoga',
              text: 'Yoga',
            },
          },
          __typename: 'SecondaryNavigationLinkBlock',
        },
      ];
      render(<SlideNavigation blocks={blocks}></SlideNavigation>);
      await userEvent.click(
        screen.getByTestId('slide-navigation__hamburger-menu')
      );
      expect(
        screen
          .queryByTestId('slide-navigation__primary-navigation-link')
          ?.querySelectorAll('li')
      ).toHaveLength(3);
      expect(
        screen
          .queryByTestId('slide-navigation__secondary-navigation-link')
          ?.querySelectorAll('li')
      ).toHaveLength(2);
    });

    test('should render slide menu when clicking hamburger menu', async () => {
      const blocks: any = [
        {
          systemId: '1',
          fields: {
            navigationLink: {
              url: '/woman',
              text: 'Woman',
            },
          },
          __typename: 'SecondaryNavigationLinkBlock',
        },
      ];
      render(<SlideNavigation blocks={blocks}></SlideNavigation>);
      await userEvent.click(
        screen.getByTestId('slide-navigation__hamburger-menu')
      );
      expect(screen.queryByTestId('slide-navigation')).toBeInTheDocument();
    });

    test('should not render slide menu when clicking close button', async () => {
      const blocks: any = [
        {
          systemId: '1',
          fields: {
            navigationLink: {
              url: '/woman',
              text: 'Woman',
            },
          },
          __typename: 'SecondaryNavigationLinkBlock',
        },
      ];
      render(<SlideNavigation blocks={blocks}></SlideNavigation>);
      await userEvent.click(
        screen.getByTestId('slide-navigation__hamburger-menu')
      );
      await userEvent.click(screen.getByTestId('slide-navigation__close-btn'));
      expect(screen.queryByTestId('slide-navigation')).toHaveClass('-top-full');
    });
  });
});
