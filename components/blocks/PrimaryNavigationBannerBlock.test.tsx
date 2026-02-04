import { fireEvent, render, screen } from '@testing-library/react';
import { PrimaryNavigationContext } from 'contexts/primaryNavigationContext';
import PrimaryNavigationBannerBlock from './PrimaryNavigationBannerBlock';

describe('PrimaryNavigationBannerBlock', () => {
  test('should render correct link value', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
        url: '/foo',
      },
      blockImagePointer: {},
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(screen.queryByTestId('primary-navigation-banner')).toHaveAttribute(
      'href',
      '/foo'
    );
  });

  test('should close menu on banner click', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
        url: '/foo',
      },
      blockImagePointer: {
        item: {
          url: '/foo',
          dimension: {
            width: 420,
            height: 600,
          },
        },
      },
    };
    const setVisible = jest.fn();
    render(
      <PrimaryNavigationContext.Provider value={{ visible: true, setVisible }}>
        <PrimaryNavigationBannerBlock
          fields={fields}
        ></PrimaryNavigationBannerBlock>
      </PrimaryNavigationContext.Provider>
    );
    fireEvent.click(screen.getByTestId('primary-navigation-banner'));
    expect(setVisible.mock.calls).toHaveLength(1);
    expect(setVisible.mock.calls[0][0]).toBe(false);
  });

  test('should not render link if link is not available', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
      },
      blockImagePointer: {},
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner')
    ).not.toBeInTheDocument();
  });

  test('should render correct banner name value if avaialble', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
      },
      blockImagePointer: {},
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner__text')
    ).toHaveTextContent('Banner text');
  });

  test('should not render banner name if not avaialble', () => {
    const fields: any = {
      navigationLink: {
        text: null,
      },
      blockImagePointer: {},
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner__text')
    ).not.toBeInTheDocument();
  });

  test('should render image with correct value', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
      },
      blockImagePointer: {
        item: {
          url: '/foo',
          dimension: {
            width: 420,
            height: 600,
          },
        },
      },
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('alt', 'Banner text image');
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('width', '420');
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('height', '600');
  });

  test('should not render image if not available', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
      },
      blockImagePointer: {},
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).not.toBeInTheDocument();
  });

  test('should not render empty alt if banner name is not available', () => {
    const fields: any = {
      navigationLink: {},
      blockImagePointer: {
        item: {
          url: '/foo',
          dimension: {
            width: 420,
            height: 600,
          },
        },
      },
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('alt', '');
  });

  test('should render image and text even if link is empty', () => {
    const fields: any = {
      navigationLink: {
        text: 'Banner text',
      },
      blockImagePointer: {
        item: {
          url: '/foo',
          dimension: {
            width: 420,
            height: 600,
          },
        },
      },
    };
    render(
      <PrimaryNavigationBannerBlock
        fields={fields}
      ></PrimaryNavigationBannerBlock>
    );
    expect(
      screen.queryByTestId('primary-navigation-banner')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('alt', 'Banner text image');
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('width', '420');
    expect(
      screen.queryByTestId('primary-navigation-banner__image')
    ).toHaveAttribute('height', '600');
    expect(
      screen.queryByTestId('primary-navigation-banner__text')
    ).toHaveTextContent('Banner text');
  });
});
