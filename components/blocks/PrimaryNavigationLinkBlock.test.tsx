import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrimaryNavigationProvider from 'contexts/primaryNavigationContext';
import PrimaryNavigationLinkBlock from './PrimaryNavigationLinkBlock';

jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));

describe('Primary Navigation Link Block', () => {
  describe('Desktop', () => {
    test('should render the correct mega menu name', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationLinkBlock
          {...block}
          desktop
        ></PrimaryNavigationLinkBlock>
      );
      expect(screen.getByTestId('primary-navigation-link')).toHaveTextContent(
        'First menu'
      );
    });

    test('should render menu title without href', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationLinkBlock
          {...block}
          desktop
        ></PrimaryNavigationLinkBlock>
      );
      expect(
        screen.getByTestId('primary-navigation-link')?.querySelector('a')
      ).not.toBeInTheDocument();
    });

    test('should render menu title with href', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
            url: '/foo',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationLinkBlock
          {...block}
          desktop
        ></PrimaryNavigationLinkBlock>
      );
      expect(
        screen.getByTestId('primary-navigation-link__link')
      ).toHaveAttribute('href', '/foo');
    });

    test('should not render menu link if navigation link is null', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: null,
        } as any,
      };
      render(
        <PrimaryNavigationProvider value={true}>
          <PrimaryNavigationLinkBlock
            {...block}
            desktop
          ></PrimaryNavigationLinkBlock>
        </PrimaryNavigationProvider>
      );

      expect(screen.getByTestId('primary-navigation-link')).toHaveTextContent(
        ''
      );
    });

    test('should not render column when there is no children', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationProvider value={true}>
          <PrimaryNavigationLinkBlock
            {...block}
            desktop
          ></PrimaryNavigationLinkBlock>
        </PrimaryNavigationProvider>
      );
      expect(
        screen.queryByTestId('primary-navigation-link__children')
      ).not.toBeInTheDocument();
    });

    test('should render the correct number of column in mega menu', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo2',
            fields: {
              _name: 'Second column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationProvider value={true}>
          <PrimaryNavigationLinkBlock
            {...block}
            desktop
          ></PrimaryNavigationLinkBlock>
        </PrimaryNavigationProvider>
      );
      const children = await waitFor(() =>
        screen.getByTestId('primary-navigation-link__children')
      );
      expect(children?.querySelectorAll('section')).toHaveLength(2);
    });
  });

  describe('Mobile', () => {
    test('should render the correct menu name when there is no children', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
            url: '/first-menu',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      expect(screen.getByTestId('primary-navigation-link')).toHaveTextContent(
        'First menu'
      );
    });

    test('should render the correct menu name when value of children is undefined', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
            url: '/first-menu',
          },
        },
        children: undefined,
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      expect(screen.getByTestId('primary-navigation-link')).toHaveTextContent(
        'First menu'
      );
    });

    test('should not render menu link if navigation link is null', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: null,
        } as any,
      };
      render(
        <PrimaryNavigationProvider value={true}>
          <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
        </PrimaryNavigationProvider>
      );

      expect(screen.getByTestId('primary-navigation-link')).toHaveTextContent(
        ''
      );
    });

    test('should not render caret-next when there is no children', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      expect(
        screen.queryByTestId('primary-navigation-link__caret-next')
      ).toBeNull();
    });

    test('should render caret-next when having children', () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      expect(
        screen.queryByTestId('primary-navigation-link__caret-next')
      ).toBeInTheDocument();
    });

    test('should render sub-menu when clicking caret-next button', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo2',
            fields: {
              _name: 'Second column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      await userEvent.click(
        screen.getByTestId('primary-navigation-link__caret-next')
      );
      expect(
        screen.queryByTestId('primary-navigation-link__sub-menu')
      ).toBeInTheDocument();
    });

    test('should render the correct sub menu name with link', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
            url: '/first-menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      await userEvent.click(
        screen.getByTestId('primary-navigation-link__caret-next')
      );
      expect(
        screen.getByTestId('primary-navigation-link__sub-menu--url')
      ).toHaveTextContent('First menu');
      expect(
        screen.getByTestId('primary-navigation-link__sub-menu--url')
      ).toHaveAttribute('href', '/first-menu');
    });

    test('should render the correct number of row in sub menu', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo2',
            fields: {
              _name: 'Second column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      await userEvent.click(
        screen.getByTestId('primary-navigation-link__caret-next')
      );
      expect(
        screen
          .queryByTestId('primary-navigation-link__children')
          ?.querySelectorAll('section')
      ).toHaveLength(2);
    });

    test('should not render sub-menu when clicking caret-back button', async () => {
      const block = {
        __typename: 'PrimaryNavigationLinkBlock',
        systemId: 'foo',
        fields: {
          navigationLink: {
            text: 'First menu',
          },
        },
        children: [
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo1',
            fields: {
              _name: 'First column',
            },
            children: [],
          },
          {
            __typename: 'PrimaryNavigationColumnBlock',
            systemId: 'foo2',
            fields: {
              _name: 'Second column',
            },
            children: [],
          },
        ],
      };
      render(
        <PrimaryNavigationLinkBlock {...block}></PrimaryNavigationLinkBlock>
      );
      await userEvent.click(
        screen.getByTestId('primary-navigation-link__caret-next')
      );
      await userEvent.click(
        screen.getByTestId('primary-navigation-link__caret-back')
      );
      expect(
        screen.queryByTestId('primary-navigation-link__sub-menu')
      ).toHaveClass('-top-full');
    });
  });
});
