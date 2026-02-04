import { render, screen } from '@testing-library/react';
import BannerBlock, { BannerField, BannerType } from './BannerBlock';

const mockBannerData = (maxItem: number) => {
  const banners: BannerType[] = [];
  for (let i = 0; i < maxItem; i++) {
    banners.push({
      linkText: `Banner text ${i}`,
      actionText: `Action text ${i}`,
      blockImagePointer: {
        item: {
          url: `/images/example ${i}`,
          dimension: {
            width: 500,
            height: 200,
          },
        },
      },
    });
  }
  return banners;
};

describe('Blocks Banner Type Component', () => {
  test('should not render banner if not available', () => {
    const fields: BannerField = {
      banners: mockBannerData(0),
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryByTestId('block-banner')).not.toBeInTheDocument();
  });

  test('should not render banner if banner does not have image', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: 'Banner text 0',
          actionText: 'Action text 0',
          bannerLinkToCategory: [
            {
              item: {
                url: '/foo',
              } as any,
            },
          ],
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryByTestId('block-banner')).not.toBeInTheDocument();
  });

  test('should render information of Banner correctly', () => {
    const fields: BannerField = {
      banners: mockBannerData(1),
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.getByTestId('block-banner__link-text')).toHaveTextContent(
      'Banner text 0'
    );
    expect(screen.getByTestId('block-banner__action-text')).toHaveTextContent(
      'Action text 0'
    );
    expect(screen.queryAllByTestId('block-banner__item').length).toBe(1);
  });

  test('should render 2 banners on row correctly', () => {
    const fields: BannerField = {
      banners: mockBannerData(2),
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryAllByTestId('block-banner__item').length).toBe(2);
    expect(screen.getByTestId('block-banner')).toHaveClass('lg:grid-cols-2');
  });

  test('should render 3 banners on row correctly', () => {
    const fields: BannerField = {
      banners: mockBannerData(3),
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryAllByTestId('block-banner__item').length).toBe(3);
    expect(screen.getByTestId('block-banner')).toHaveClass('lg:grid-cols-3');
  });

  test('should render max 4 banners per row correctly', () => {
    const fields: BannerField = {
      banners: mockBannerData(6),
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryAllByTestId('block-banner__item').length).toBe(6);
    expect(screen.getByTestId('block-banner')).toHaveClass('lg:grid-cols-4');
  });

  test('should not render text if text is empty', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(
      screen.queryByTestId('block-banner__link-text')
    ).not.toBeInTheDocument();
  });

  test('should not render action text if action text is empty', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
        },
      ],
      _name: 'Data Test',
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(
      screen.queryByTestId('block-banner__action-text')
    ).not.toBeInTheDocument();
  });

  test('should render category link if available', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
          bannerLinkToCategory: [
            {
              item: {
                url: '/foo',
              } as any,
            },
          ],
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryByTestId('block-banner__link-href')).toHaveAttribute(
      'href',
      '/foo'
    );
  });

  test('should render page link if available', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
          bannerLinkToPage: [
            {
              item: {
                url: '/bar',
              } as any,
            },
          ],
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryByTestId('block-banner__link-href')).toHaveAttribute(
      'href',
      '/bar'
    );
  });

  test('should render product link if available', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
          bannerLinkToProduct: [
            {
              item: {
                url: '/barbar',
              } as any,
            },
          ],
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.queryByTestId('block-banner__link-href')).toHaveAttribute(
      'href',
      '/barbar'
    );
  });

  test('should not render link if not available', () => {
    const fields: BannerField = {
      banners: [
        {
          linkText: '',
          actionText: '',
          blockImagePointer: {
            item: {
              url: `/images/example 0`,
              dimension: {
                width: 500,
                height: 200,
              },
            },
          },
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(
      screen.queryByTestId('block-banner__link-href')
    ).not.toBeInTheDocument();
  });

  test('should render empty alt if action text and link text are empty', () => {
    const fields: BannerField = {
      banners: [
        {
          actionText: '',
          linkText: '',
          blockImagePointer: {
            item: {
              url: `/img-0`,
              dimension: {
                width: 420,
                height: 600,
              },
            },
          },
        },
      ],
    };

    render(<BannerBlock fields={fields} __typename="foo" systemId="foo" />);
    expect(screen.getByTestId('block-banner__image')).toHaveAttribute(
      'alt',
      ''
    );
  });
});
