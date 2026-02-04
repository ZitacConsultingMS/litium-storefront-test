import { render, screen, waitFor } from '@testing-library/react';
import { useTranslations } from 'hooks/useTranslations';
import { NavigationLink } from 'models/navigation';
import { PageItemsConnection } from 'models/page';
import {
  MainContent,
  SideNavigation,
  SideNavigationLayout,
} from './SideNavigationLayout';

const mockCookies = jest.fn();
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => mockCookies(name),
  }),
}));
const mockRedirect = jest.fn();
jest.mock('next/navigation', () => ({
  redirect: (url: URL) => mockRedirect(url),
}));
jest.mock('services/dataService.server', () => ({
  queryServer: jest.fn(),
}));
jest.mock('app/actions/users/signOutUser', () => ({
  signOutUser: jest.fn(),
}));
jest.mock('hooks/useTranslations', () => ({
  useTranslations: jest.fn(),
}));
describe('Side Navigation Layout', () => {
  const tMock = jest.fn((key) => key);
  beforeEach(() => {
    (useTranslations as jest.Mock).mockReturnValue(tMock);

    mockCookies.mockClear();
  });
  test('should be able to render side menu and main content', () => {
    const data = {
      parents: {
        nodes: [
          {
            name: 'parent',
            url: '/parent',
          },
        ],
      } as PageItemsConnection,
      children: {
        nodes: [
          {
            name: 'child',
            url: '/child',
          },
        ],
      } as PageItemsConnection,
      blocks: { blockContainer: [] },
    };

    render(
      <SideNavigationLayout>
        <SideNavigation
          name=""
          url="/"
          rootUrl="/"
          parents={data.parents}
          childrenPages={data.children}
        ></SideNavigation>
        <MainContent>
          <div data-testid="main-content">Main content</div>
        </MainContent>
      </SideNavigationLayout>
    );
    waitFor(() => {
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
      expect(screen.queryAllByTestId('tree-item__link')).toHaveLength(1);
      expect(screen.queryAllByTestId('tree-item__link')[0]).toHaveTextContent(
        'child'
      );
      expect(screen.getByTestId('article')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toHaveTextContent(
        'Main content'
      );
      expect(screen.queryAllByTestId('breadcrumb-desktop').length).toBe(0);
    });
  });
  describe('Side Navigation', () => {
    beforeEach(() => {
      mockCookies.mockReturnValue({ value: 'foo' });
    });
    test('should be able to render side menu and main content', () => {
      const data = {
        parents: {
          nodes: [
            {
              name: 'parent',
              url: '/parent',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            {
              name: 'child',
              url: '/child',
            },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };

      render(
        <SideNavigationLayout>
          <SideNavigation
            name=""
            url="/"
            rootUrl="/"
            parents={data.parents}
            childrenPages={data.children}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );
      waitFor(() => {
        expect(screen.getByTestId('side-menu')).toBeInTheDocument();
        expect(screen.queryAllByTestId('tree-item__link')).toHaveLength(1);
        expect(screen.queryAllByTestId('tree-item__link')[0]).toHaveTextContent(
          'child'
        );
        expect(screen.getByTestId('article')).toBeInTheDocument();
        expect(screen.getByTestId('main-content')).toHaveTextContent(
          'Main content'
        );
        expect(screen.queryAllByTestId('breadcrumb-desktop').length).toBe(0);
      });
    });
    test('should render correct side menu data', () => {
      const data = {
        parents: {
          nodes: [
            {
              name: 'parent',
              url: '/parent',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            { name: 'Child 1', url: '/child-link1' },
            { name: 'Child 2', url: '/child-link2' },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };
      render(
        <SideNavigationLayout>
          <SideNavigation
            name="foo"
            url="/"
            rootUrl="/"
            parents={data.parents}
            childrenPages={data.children}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );
      waitFor(() => {
        expect(screen.getByTestId('side-menu__title')).toHaveTextContent('foo');
        expect(screen.queryAllByTestId('tree-item__link')).toHaveLength(2);
        expect(screen.queryAllByTestId('tree-item__link')[0]).toHaveTextContent(
          'Child 1'
        );
        expect(screen.queryAllByTestId('tree-item__link')[0]).toHaveAttribute(
          'href',
          '/child-link1'
        );
        expect(screen.queryAllByTestId('tree-item__link')[1]).toHaveTextContent(
          'Child 2'
        );
        expect(screen.queryAllByTestId('tree-item__link')[1]).toHaveAttribute(
          'href',
          '/child-link2'
        );
      });
    });

    test('should expand links correctly when entering a page', () => {
      const data = {
        parents: {
          nodes: [
            { name: 'Home page', url: '/' },
            {
              name: 'Example page',
              url: '/example-page',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            {
              name: 'Children 1',
              url: '/example-page/children1',
              children: {
                nodes: [
                  {
                    name: 'Child of children 1',
                    url: '/example-page/children1/child-of-children-1',
                  },
                ],
              },
            },
            {
              name: 'Children 2',
              url: '/example-page/children2',
              children: {
                nodes: [
                  {
                    name: 'Child of children 2',
                    url: '/example-page/children2/child-of-children-2',
                  },
                ],
              },
            },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };
      render(
        <SideNavigationLayout>
          <SideNavigation
            name="Example page"
            url="/example-page"
            rootUrl="/example-page/children1"
            parents={data.parents}
            childrenPages={data.children}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );

      waitFor(() => {
        expect(
          screen.queryAllByTestId('tree-item')[0].getAttribute('aria-expanded')
        ).toEqual('true');
        expect(
          screen.queryAllByTestId('tree-item')[1].getAttribute('aria-expanded')
        ).toEqual(null);
        expect(
          screen.queryAllByTestId('tree-item')[2].getAttribute('aria-expanded')
        ).toEqual('false');
      });
    });

    test('should render an active link if entering an url', () => {
      const data = {
        parents: {
          nodes: [
            { name: 'Home page', url: '/' },
            {
              name: 'Example page',
              url: '/example-page',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            {
              name: 'Children 1',
              url: '/example-page/children1',
              children: {
                nodes: [
                  {
                    name: 'Child of children 1',
                    url: '/example-page/children1/child-of-children-1',
                  },
                ],
              },
            },
            {
              name: 'Children 2',
              url: '/example-page/children2',
              children: {
                nodes: [
                  {
                    name: 'Child of children 2',
                    url: '/example-page/children2/child-of-children-2',
                  },
                ],
              },
            },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };
      render(
        <SideNavigationLayout>
          <SideNavigation
            name="Example page"
            url="/example-page"
            rootUrl="/example-page/children1"
            parents={data.parents}
            childrenPages={data.children}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );
      waitFor(() => {
        expect(screen.queryAllByTestId('tree-item__link')[0]).toHaveClass(
          'font-bold'
        );
        expect(screen.queryAllByTestId('tree-item__link')[1]).toHaveClass(
          'font-normal'
        );
      });
    });

    test('should show the logout button by default if the user is logged in', () => {
      const data = {
        parents: {
          nodes: [
            {
              name: 'parent',
              url: '/parent',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            { name: 'Child 1', url: '/child-link1' },
            { name: 'Child 2', url: '/child-link2' },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };
      mockCookies.mockReturnValue({ value: 'foo' });
      render(
        <SideNavigationLayout>
          <SideNavigation
            name="Example page"
            url="/example-page"
            rootUrl="/example-page/children1"
            parents={data.parents}
            childrenPages={data.children}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );
      waitFor(() => {
        expect(screen.getByTestId('logout__button')).toBeInTheDocument();
      });
    });

    test('should not show the logout button if showLogoutButton is false', () => {
      const data = {
        parents: {
          nodes: [
            {
              name: 'parent',
              url: '/parent',
            },
          ],
        } as PageItemsConnection,
        children: {
          nodes: [
            { name: 'Child 1', url: '/child-link1' },
            { name: 'Child 2', url: '/child-link2' },
          ],
        } as PageItemsConnection,
        blocks: { blockContainer: [] },
      };
      render(
        <SideNavigationLayout>
          <SideNavigation
            name="Example page"
            url="/example-page"
            rootUrl="/example-page/children1"
            parents={data.parents}
            childrenPages={data.children}
            showLogoutButton={false}
          ></SideNavigation>
          <MainContent>
            <div data-testid="main-content">Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );
      waitFor(() =>
        expect(screen.queryByTestId('logout__button')).not.toBeInTheDocument()
      );
    });
  });

  describe('Main content', () => {
    test('should render correct breadcumb data', () => {
      const breadcrumbs: NavigationLink[] = [
        {
          name: 'Home page',
          url: '/',
          selected: false,
        },
        {
          name: 'Article',
          url: '/article',
          selected: true,
        },
      ];

      render(
        <SideNavigationLayout>
          <MainContent breadcrumbs={breadcrumbs}>
            <div>Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );

      expect(screen.queryAllByTestId('breadcrumb-desktop')).toHaveLength(2);
      expect(screen.queryAllByTestId('breadcrumb-mobile')).toHaveLength(1);
      expect(
        screen.queryAllByTestId('breadcrumb-desktop')[0].textContent
      ).toEqual('Home page');
      expect(
        screen.queryAllByTestId('breadcrumb-desktop')[1].textContent
      ).toEqual('Article');
      expect(
        screen.queryAllByTestId('breadcrumb-mobile')[0].textContent
      ).toEqual('Home page');
    });

    test('should not render breadcrumb if not available', () => {
      render(
        <SideNavigationLayout>
          <MainContent>
            <div>Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );

      expect(screen.queryAllByTestId('breadcrumb-desktop')).toHaveLength(0);
      expect(screen.queryAllByTestId('breadcrumb-mobile')).toHaveLength(0);
    });

    test('should show navigation button if navigationButtonVisibility is true', () => {
      render(
        <SideNavigationLayout>
          <MainContent>
            <div>Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );

      expect(
        screen.queryByTestId('article__toggle-mobile')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('article__toggle-tablet')
      ).toBeInTheDocument();
    });

    test('should not show navigation button if navigationButtonVisibility is false', () => {
      render(
        <SideNavigationLayout>
          <MainContent navigationButtonVisibility={false}>
            <div>Main content</div>
          </MainContent>
        </SideNavigationLayout>
      );

      expect(
        screen.queryByTestId('article__toggle-mobile')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('article__toggle-tablet')
      ).not.toBeInTheDocument();
    });
  });
});
